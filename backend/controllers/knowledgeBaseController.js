import fs from "fs";
import pdfParse from "pdf-parse";
import { ingestDocument } from "../utils/knowledgeBase.js";
import logger from "../utils/logger.js";

export const uploadKnowledgeDocument = async (req, res) => {
  const filePath = req.file?.path;
  const originalName = req.file?.originalname;

  try {
    logger.info("Knowledge base upload received", { originalName });

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    logger.debug("Processing uploaded file", {
      name: originalName,
      mimetype: req.file.mimetype,
    });

    let content = "";

    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
    } else if (req.file.mimetype.startsWith("text/")) {
      content = fs.readFileSync(filePath, "utf-8");
    } else {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        error: "Unsupported file type. Only PDF and text files are supported.",
      });
    }

    logger.debug("Extracted content from file", { contentLength: content.length });

    if (!content.trim()) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: "No readable content found in the file." });
    }

    const metadata = {
      id: `kb-${Date.now()}`,
      filename: originalName,
      uploadedBy: req.teacherId || req.studentId || "unknown",
      uploadDate: new Date().toISOString(),
    };

    await ingestDocument(content, metadata);

    logger.info("Document ingested into knowledge base", { filename: originalName });
    return res.status(200).json({
      message: "Document ingested into knowledge base successfully.",
    });
  } catch (error) {
    logger.error("Error uploading knowledge document", { error: error.message });
    return res.status(500).json({
      error: "Failed to upload document to knowledge base.",
      details: error.message,
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.debug("Temporary upload file removed", { filePath });
      } catch (deleteError) {
        logger.warn("Failed to delete temporary upload file", { error: deleteError.message });
      }
    }
  }
};