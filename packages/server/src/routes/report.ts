import { Router } from "express";
import multer from "multer";
import { extractTextFromPDF, isTextExtractionValid } from "../services/pdfExtractor.js";
import { structureReport } from "../services/claudeClient.js";
import { extractWithVision } from "../services/fallbackExtractor.js";
import { classifyAllBiomarkers } from "../services/biomarkerClassifier.js";
import { mockReportData } from "../services/mockData.js";
import type { APIResponse, CategoryGroup } from "../types/index.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: "No file uploaded",
        errorCode: "NO_FILE",
        message: "Please select a PDF file to upload"
      });
    }

    if (req.file.size === 0) {
      return res.status(400).json({
        error: "Empty file",
        errorCode: "EMPTY_FILE",
        message: "The uploaded file is empty. Please select a valid PDF file"
      });
    }

    const buffer = req.file.buffer;
    let extractionMethod: "text" | "vision_fallback" = "text";
    let reportData;

    const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true";

    if (USE_MOCK_DATA) {
      console.log("Using mock data (TEST MODE)");
      reportData = mockReportData;
    } else {
      try {
        const extractedText = await extractTextFromPDF(buffer);
        
        if (isTextExtractionValid(extractedText)) {
          console.log("Text extraction successful, using text-based processing");
          reportData = await structureReport(extractedText);
        } else {
          console.log("Text extraction quality poor, falling back to vision");
          extractionMethod = "vision_fallback";
          reportData = await extractWithVision(buffer);
        }
      } catch (error) {
        console.log("Text extraction failed, falling back to vision", error);
        extractionMethod = "vision_fallback";
        reportData = await extractWithVision(buffer);
      }
    }

    const classifiedBiomarkers = classifyAllBiomarkers(
      reportData.biomarkers,
      reportData.patient
    );

    const categoryMap = new Map<string, CategoryGroup>();
    
    for (const biomarker of classifiedBiomarkers) {
      if (!categoryMap.has(biomarker.category)) {
        categoryMap.set(biomarker.category, {
          name: biomarker.category,
          biomarkers: [],
        });
      }
      categoryMap.get(biomarker.category)!.biomarkers.push(biomarker);
    }

    const categories = Array.from(categoryMap.values());

    const response: APIResponse = {
      patient: reportData.patient,
      categories,
      metadata: {
        extractionMethod,
        processedAt: new Date().toISOString(),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error processing report:", error);

    if (error instanceof Error) {
      // API quota/rate limit errors
      if (error.message.includes("insufficient_quota") || error.message.includes("rate_limit")) {
        return res.status(429).json({
          error: "API quota exceeded",
          errorCode: "QUOTA_EXCEEDED",
          message: "The AI service quota has been exceeded. Please try again later or contact support",
          details: error.message,
        });
      }

      // Corrupted PDF errors
      if (error.message.includes("PDF") && error.message.includes("corrupt")) {
        return res.status(400).json({
          error: "Corrupted PDF file",
          errorCode: "CORRUPTED_PDF",
          message: "The PDF file appears to be corrupted or invalid. Please try uploading a different file",
          details: error.message,
        });
      }

      // Encrypted/password-protected PDF errors
      if (error.message.includes("password") || error.message.includes("encrypted")) {
        return res.status(400).json({
          error: "Encrypted PDF",
          errorCode: "ENCRYPTED_PDF",
          message: "The PDF file is password-protected. Please upload an unencrypted version",
          details: error.message,
        });
      }

      // Validation/parsing errors
      if (error.message.includes("validation") || error.message.includes("parse")) {
        return res.status(422).json({
          error: "Could not extract valid data from PDF",
          errorCode: "EXTRACTION_FAILED",
          message: "Unable to extract biomarker data from the PDF. Please ensure this is a valid lab report",
          details: error.message,
        });
      }

      // Timeout errors
      if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
        return res.status(504).json({
          error: "Request timeout",
          errorCode: "TIMEOUT",
          message: "The request took too long to process. Please try again",
          details: error.message,
        });
      }

      // Network/service unavailable errors
      if (error.message.includes("network") || error.message.includes("ECONNREFUSED")) {
        return res.status(503).json({
          error: "Service unavailable",
          errorCode: "SERVICE_UNAVAILABLE",
          message: "Unable to connect to the AI service. Please try again in a few moments",
          details: error.message,
        });
      }
    }

    // Generic fallback error
    return res.status(500).json({
      error: "Internal server error",
      errorCode: "INTERNAL_ERROR",
      message: "An unexpected error occurred while processing your report. Please try again",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Multer error handling middleware
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: "File too large",
        errorCode: "FILE_TOO_LARGE",
        message: "The PDF file exceeds the maximum size of 10MB. Please upload a smaller file"
      });
    }
  }
  
  if (error.message === "Only PDF files are allowed") {
    return res.status(400).json({
      error: "Invalid file type",
      errorCode: "INVALID_FILE_TYPE",
      message: "Only PDF files are accepted. Please upload a PDF file"
    });
  }
  
  next(error);
});

export default router;
