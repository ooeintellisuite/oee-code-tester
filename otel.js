const { trace, metrics } = require("@opentelemetry/api");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { PinoInstrumentation } = require("@opentelemetry/instrumentation-pino");
const { NodeSDK } = require("@opentelemetry/sdk-node");
// eslint-disable-next-line import/order
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");

// Correct way to define resource attributes
const resourceAttributes = {
  [SemanticResourceAttributes.SERVICE_NAME]: "node-app",
};

// Create Trace & Metric Exporters
const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});
const metricExporter = new OTLPMetricExporter({
  url: "http://localhost:4318/v1/metrics",
});

// Initialize OpenTelemetry SDK with `resourceAttributes`
const sdk = new NodeSDK({
  resourceAttributes, // Correct way to set service name in OpenTelemetry
  traceExporter,
  metricExporter,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PinoInstrumentation(),
  ],
});

// Start OpenTelemetry
sdk.start();

console.log("OpenTelemetry initialized");

// Create a Meter for recording metrics
const meter = metrics.getMeter("node-app");

// Create a Histogram for HTTP request duration
const requestDuration = meter.createHistogram("http_request_duration_seconds", {
  description: "HTTP request duration in seconds",
});

// Example Express server with instrumentation
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  const startTime = Date.now();

  setTimeout(() => {
    const durationInSeconds = (Date.now() - startTime) / 1000;
    requestDuration.record(durationInSeconds, {
      path: req.path,
      status: "success",
    });

    res.send("Hello OpenTelemetry!");
  }, 1000);
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});

// Graceful Shutdown
process.on("SIGTERM", async () => {
  await sdk.shutdown();
  console.log("OpenTelemetry shut down");
  process.exit(0);
});

// Tracing Setup
const tracer = trace.getTracer("node-app");

/**
 * Executes an example function with OpenTelemetry tracing.
 *
 * This function starts a span named "example-operation", sets custom attributes,
 * simulates a delay using `setTimeout`, and then ends the span.
 */
function tracedFunction() {
  const span = tracer.startSpan("example-operation");
  console.log("Span created:", span);
  span.setAttribute("custom.key", "example-value");
  span.setAttribute("user.id", 123);
  console.log("🛠️ Trace ID:", span.spanContext().traceId);
  setTimeout(() => {
    console.log("✅ Traced function executed");
    span.end();
  }, 1000);
  return;
}

tracedFunction();
