require("./otel");

const fs = require("fs");
const http = require("http"); 
const path = require("path");

const express = require("express");
const pino = require("pino");

// Ensure logs directory exists
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create a rolling log file
const logStream = pino.destination({
  dest: path.join(logDir, "app.log"), // Logs stored in logs/app.log
  append: true,
  sync: false,
});

// Logger that logs to console and Loki
const logger = pino(
  {
    level: "info",
    transport: {
      targets: [
        {
          target: "pino-pretty", // Pretty print for console logs
          options: { colorize: true },
        },
        {
          target: "pino/file", // Log to file
          options: { destination: logStream.fd },
        },
      ],
    },
  }
);

 
const LOKI_URL = "http://localhost:3100/loki/api/v1/push"; 

/**
 * Sends a log entry to Grafana Loki.
 *
 * @param {string} level - The log level (e.g., "info", "error", "warn").
 * @param {string} message - The log message to be recorded.
 * @param {Object} [context={}] - Additional context or metadata for the log.
 */
const sendToLoki = (level, message, context = {}) => {
  const logEntry = JSON.stringify({
    streams: [
      {
        stream: { level, service: "node-app" }, // Labels for Loki
        values: [[`${Date.now()}000000`, JSON.stringify({ message, context })]],
      },
    ],
  });

  const options = {
    hostname: "localhost",
    port: 3100,
    path: "/loki/api/v1/push",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(logEntry),
    },
  };

  const req = http.request(options, (res) => {
    if (res.statusCode !== 204) {
      console.error(`❌ Loki returned status: ${res.statusCode}`);
    }
  });

  req.on("error", (error) => {
    console.error("❌ Failed to send log to Loki:", error);
  });

  req.write(logEntry);
  req.end();
};

// Express Setup
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  logger.info({ msg: "Received request", path: req.path });
  sendToLoki("info", "Received request", { path: req.path }); // Send to Loki
  res.send("Hello OpenTelemetry!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));
