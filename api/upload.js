// YSS_VERCEL_UPLOAD_V1

import fs from "node:fs";
import formidable from "formidable";
import OpenAI, { toFile } from "openai";
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

    const client = new OpenAI({ apiKey });
    const fileBuffer = await fs.promises.readFile(file.filepath);
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
      version: "YSS_VERCEL_UPLOAD_V1",
      fileName: file.originalFilename || "attachment",
      fileId: uploadedFile.id,
      vectorStoreId: vectorStore.id
    });
  } catch (error) {
    response.status(500).json({
      error: error && error.message ? error.message : "Upload failed"
    });
  } finally {
    await removeTempFile(uploadedTempFile);
  }
}
