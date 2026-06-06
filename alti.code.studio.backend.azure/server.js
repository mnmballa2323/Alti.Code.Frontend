const express = require('express');
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5002;
// const client = new OpenAIClient(process.env.AZURE_ENDPOINT, new AzureKeyCredential(process.env.AZURE_API_KEY));

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', environment: 'azure-foundry' });
});

app.post('/api/v1/azure/invoke', async (req, res) => {
  // Skeleton implementation for Azure OpenAI inference
  res.status(200).json({ message: 'Azure Foundry inference endpoint reached.' });
});

app.listen(PORT, () => {
  console.log(`Azure Microservice running on port ${PORT}`);
});
