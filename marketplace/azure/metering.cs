using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace AltiCodeStudio.Marketplace
{
    public static class AzureMeteringIntegration
    {
        private static readonly HttpClient client = new HttpClient();
        private const string METERING_API_URL = "https://marketplaceapi.microsoft.com/api/usageEvent?api-version=2018-08-31";
        private const string PLAN_ID = "alti-enterprise-data-plane";
        private const string DIMENSION_ID = "ai_tokens_processed_1m";

        [FunctionName("EmitUsageEvent")]
        public static async Task Run(
            [QueueTrigger("alti-metering-queue", Connection = "StorageConnectionString")] string queueMessage,
            ILogger log)
        {
            log.LogInformation($"Processing metering event: {queueMessage}");

            try
            {
                // Parse the internal telemetry event
                var payload = JsonDocument.Parse(queueMessage).RootElement;
                double tokensProcessed = payload.GetProperty("tokens_processed").GetDouble();
                string resourceId = payload.GetProperty("resource_id").GetString();

                // Calculate billable units (1M token blocks)
                double quantity = Math.Max(1.0, Math.Floor(tokensProcessed / 1_000_000.0));

                // Construct the Microsoft Commercial Marketplace Usage Event
                var usageEvent = new
                {
                    resourceId = resourceId,
                    quantity = quantity,
                    dimension = DIMENSION_ID,
                    effectiveStartTime = DateTime.UtcNow.ToString("o"),
                    planId = PLAN_ID
                };

                string jsonPayload = JsonSerializer.Serialize(usageEvent);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                // Retrieve the Managed Identity Token for the Marketplace API
                // In production, this uses DefaultAzureCredential
                string accessToken = Environment.GetEnvironmentVariable("MARKETPLACE_API_TOKEN");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                log.LogInformation($"Emitting {quantity} units to Azure Commercial Metering API for resource {resourceId}");

                // Submit to Azure Marketplace
                HttpResponseMessage response = await client.PostAsync(METERING_API_URL, content);

                if (response.IsSuccessStatusCode)
                {
                    log.LogInformation("Successfully emitted usage event to Azure Marketplace.");
                }
                else
                {
                    string error = await response.Content.ReadAsStringAsync();
                    log.LogError($"Failed to emit usage event. Status: {response.StatusCode}, Error: {error}");
                    throw new Exception("Azure Marketplace API rejected the usage event.");
                }
            }
            catch (Exception ex)
            {
                log.LogError($"Critical failure in Azure Metering Integration: {ex.Message}");
                throw; // Throw to trigger Queue poison message handling (DLQ)
            }
        }
    }
}
