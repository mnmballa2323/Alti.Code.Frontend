const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  traceExporter: new console.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
