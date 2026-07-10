import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import upload from "./middlewares/upload.js";
import { parseCsvBuffer } from "./utils/csvHelper.js";
import { mapRecordsWithAI } from "./services/geminiService.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

app.post("/api/upload", upload.single("file"), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
    const parsedData = await parseCsvBuffer(req.file.buffer);
    res.status(200).json({
      success: true,
      filename: req.file.originalname,
      count: parsedData.length,
      data: parsedData
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/import", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      res.status(400).json({ success: false, message: "Records must be an array" });
      return;
    }

    const batchSize = 50;
    const allResults: any[] = [];
    const skippedRecords: any[] = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      try {
        const mappedBatch = await mapRecordsWithAI(batch);
        mappedBatch.forEach((lead, idx) => {
          const hasEmail = lead.email && lead.email.trim() !== "";
          const hasPhone = lead.mobile_without_country_code && lead.mobile_without_country_code.trim() !== "";
          if (!hasEmail && !hasPhone) {
            skippedRecords.push({
              row: batch[idx],
              reason: "Lacks both email and mobile number"
            });
          } else {
            allResults.push(lead);
          }
        });
      } catch (err: any) {
        skippedRecords.push(...batch.map((row) => ({
          row,
          reason: err.message || "Failed to process batch"
        })));
      }
    }

    res.status(200).json({
      success: true,
      summary: {
        imported: allResults.length,
        skipped: skippedRecords.length,
        total: records.length
      },
      records: allResults,
      skipped: skippedRecords
    });
  } catch (error) {
    next(error);
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

export default app;
