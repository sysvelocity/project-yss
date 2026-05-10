// YSS_VERCEL_UPLOAD_V2

import fs from "node:fs";
import formidable from "formidable";
import OpenAI, { toFile } from "openai";
import mammoth from "mammoth";
import { isAuthorized, rejectUnauthorized } from "../lib/accessControl.js";
import { handleCors } from "../lib/cors.js";

export const config = {
  runtime: "nodejs"
};

const SUPPORTED_TYPES = new Set([
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const MAX_INLINE_ATTACHMENT_CHARS = 120000;

function normalizeExtractedText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

async function extractPdfText(fileBuffer) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    return normalizeExtractedText(result?.text || "");
  } finally {
    await parser.destroy();
  }
}

async function extractAttachmentText(fileBuffer, mimetype) {
  if (mimetype === "text/plain") {
    return normalizeExtractedText(fileBuffer.toString("utf8"));
  }

  if (mimetype === "application/pdf") {
    return extractPdfText(fileBuffer);
  }

  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return normalizeExtractedText(result?.value || "");
  }

  return "";
}

function prepareInlineText(text) {
  const normalized = normalizeExtractedText(text);

  if (!normalized) {
    return {
      text: "",
      truncated: false
    };
  }

  if (normalized.length <= MAX_INLINE_ATTACHMENT_CHARS) {
    return {
      text: normalized,
      truncated: false
    };
  }

  return {
    text: normalized.slice(0, MAX_INLINE_ATTACHMENT_CHARS).trim(),
    truncated: true
  };
}

function parseForm(request) {
  const form = formidable({
    multiples: false,
    maxFiles: 1,
    maxFileSize: 12 * 1024 * 1024
  });

  return new Promise((resolve, reject) => {
    form.parse(request, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ fields, files });
    });
  });
}

async function removeTempFile(filepath) {
  if (!filepath) {
    return;
  }

  try {
    await fs.promises.unlink(filepath);
  } catch (error) {
  }
}

export default async function handler(request, response) {
  if (handleCors(request, response, { methods: "POST, OPTIONS" })) {
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(request)) {
    rejectUnauthorized(response, request);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    response.status(500).json({ error: "Missing OPENAI_API_KEY" });
    return;
  }

  let uploadedTempFile;

  try {
    const { files } = await parseForm(request);
    const rawFile = files.file;
    const file = Array.isArray(rawFile) ? rawFile[0] : rawFile;

    if (!file) {
      response.status(400).json({ error: "A file is required" });
      return;
    }

    uploadedTempFile = file.filepath;

    if (!SUPPORTED_TYPES.has(file.mimetype)) {
      response.status(400).json({
        error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file."
      });
      return;
    }

    const fileBuffer = await fs.promises.readFile(file.filepath);
    let extracted = {
      text: "",
      truncated: false
    };

    try {
      extracted = prepareInlineText(
        await extractAttachmentText(fileBuffer, file.mimetype)
      );
    } catch (extractionError) {
      extracted = {
        text: "",
        truncated: false
      };
    }

    if (extracted.text) {
      response.status(200).json({
        ok: true,
        version: "YSS_VERCEL_UPLOAD_V2",
        fileName: file.originalFilename || "attachment",
        fileId: "",
        vectorStoreId: "",
        extractedText: extracted.text,
        extractedTextChars: extracted.text.length,
        extractedTextTruncated: extracted.truncated,
        extractionMode: "inline_text"
      });
      return;
    }

    const client = new OpenAI({ apiKey });
    const openAiFile = await toFile(fileBuffer, file.originalFilename || "attachment");

    const uploadedFile = await client.files.create({
      file: openAiFile,
      purpose: "assistants"
    });

    const vectorStore = await client.vectorStores.create({
      name: `session-attachment-${Date.now()}`
    });

    await client.vectorStores.files.createAndPoll(vectorStore.id, {
      file_id: uploadedFile.id
    });

    response.status(200).json({
      ok: true,
      version: "YSS_VERCEL_UPLOAD_V2",
      fileName: file.originalFilename || "attachment",
      fileId: uploadedFile.id,
      vectorStoreId: vectorStore.id,
      extractedText: "",
      extractedTextChars: 0,
      extractedTextTruncated: false,
      extractionMode: "file_search"
    });
  } catch (error) {
    response.status(500).json({
      error: error && error.message ? error.message : "Upload failed"
    });
  } finally {
    await removeTempFile(uploadedTempFile);
  }
}
