import dotenv from "dotenv";
import express from "express";
import { prisma } from "./config/prisma";
import { errorHandler } from "./middlewares/error-handler.middleware";
import leadRoutes from "./routes/lead.routes";

const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use("/api/v1/leads", leadRoutes);
app.use(errorHandler);

async function startServer() {
  try {
    await prisma.$connect();

    const tenantCount = await prisma.tenant.count();

    console.log("Database connected successfully");
    console.log(` Tenants in database: ${tenantCount}`);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
