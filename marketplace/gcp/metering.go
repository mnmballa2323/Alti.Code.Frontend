package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"time"

	"google.golang.org/api/option"
	servicecontrol "google.golang.org/api/servicecontrol/v1"
)

const (
	ServiceName = "alti-code-studio.mp-api.goog"
	MetricName  = "alti-code-studio.mp-api.goog/ai_tokens_processed_1m"
)

type MeteringEvent struct {
	TokensProcessed float64 `json:"tokens_processed"`
	CustomerID      string  `json:"customer_id"`
}

func main() {
	http.HandleFunc("/meter", handleMetering)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("GCP Metering Integration listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleMetering(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var event MeteringEvent
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		log.Printf("Error decoding payload: %v", err)
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if event.TokensProcessed <= 0 || event.CustomerID == "" {
		http.Error(w, "Invalid payload parameters", http.StatusBadRequest)
		return
	}

	// Calculate 1M token blocks
	quantity := math.Max(1.0, math.Floor(event.TokensProcessed/1000000.0))

	// Authenticate using Google Application Default Credentials (attached to the Cloud Run SA)
	ctx := context.Background()
	svc, err := servicecontrol.NewService(ctx, option.WithScopes(servicecontrol.ServicecontrolScope))
	if err != nil {
		log.Printf("Failed to create Service Control client: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	operationID := fmt.Sprintf("metering-%d-%s", time.Now().UnixNano(), event.CustomerID)
	now := time.Now().Format(time.RFC3339)

	// Construct the report request for the GCP Commerce Service Control API
	req := &servicecontrol.ReportRequest{
		Operations: []*servicecontrol.Operation{
			{
				OperationId:   operationID,
				OperationName: "ReportUsage",
				ConsumerId:    "project:" + event.CustomerID,
				StartTime:     now,
				EndTime:       now,
				MetricValueSets: []*servicecontrol.MetricValueSet{
					{
						MetricName: MetricName,
						MetricValues: []*servicecontrol.MetricValue{
							{
								Int64Value: func() *int64 { v := int64(quantity); return &v }(),
							},
						},
					},
				},
			},
		},
	}

	log.Printf("Reporting %v units to GCP Commerce for customer %s", quantity, event.CustomerID)

	_, err = svc.Services.Report(ServiceName, req).Do()
	if err != nil {
		log.Printf("Failed to report to GCP Service Control: %v", err)
		http.Error(w, "Failed to submit metering", http.StatusBadGateway)
		return
	}

	log.Printf("Successfully metered usage for operation %s", operationID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "operation_id": operationID})
}
