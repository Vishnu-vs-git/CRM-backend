import express from "express";
import leadRoutes from "./routes/lead.routes";

const app = express();
app.use("/api/v1/leads", leadRoutes);
