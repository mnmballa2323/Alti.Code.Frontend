const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5003;
// const ai = new GoogleGenAI({ project: process.env.GCP_PROJECT, location: process.env.GCP_LOCATION });

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', environment: 'gcp-vertex' });
});

app.post('/api/v1/gcp/invoke', async (req, res) => {
  // Skeleton implementation for Google Vertex inference
  res.status(200).json({ message: 'GCP Vertex inference endpoint reached.' });
});

app.listen(PORT, () => {
  console.log(`GCP Microservice running on port ${PORT}`);
});
