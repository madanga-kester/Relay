import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { serveStatic, setupVite } from "./vite";
import { getServerClickEvents, getTrackingRecord, recordServerClick, upsertTrackingRecord, type TrackingRegistryRecord } from "./trackingStore";

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.post("/api/tracking/placements", (req, res) => {
    const record = req.body as TrackingRegistryRecord;
    if (!record?.trackingId || !record.campaignId || !record.placementId || !record.destinationUrl) return res.status(400).json({ error: "Invalid tracking record" });
    return res.json({ record: upsertTrackingRecord(record) });
  });
  app.get("/api/tracking/events", (_req, res) => res.json({ events: getServerClickEvents() }));
  app.post("/api/tracking/:trackingId/click", (req, res) => {
    const record = getTrackingRecord(req.params.trackingId);
    if (!record) return res.status(404).json({ error: "tracking_unavailable", message: "This tracking link is no longer available." });
    const event = recordServerClick(record, { ip: req.ip ?? "unknown", userAgent: req.get("user-agent") ?? "unknown", referrer: req.get("referer") ?? "" });
    return res.json({ event: { ...event, visitorKey: undefined }, qualified: event.qualification === "Qualified", destinationUrl: record.destinationUrl, message: event.rejectionReason });
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });