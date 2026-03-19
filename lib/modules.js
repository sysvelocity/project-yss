// YSS_MODULES_V1

import { module4Prompt } from "./prompts/module4.js";

const MODULES = {
  "module-4": {
    slug: "module-4",
    moduleNumber: "Module 4",
    shortLabel: "Module 4",
    title: "Draft Your Customer Issues Addressed Talking Points",
    subtitle:
      "Sales friend, now it's time to get to work. Please provide a Bridge Line + your talking points on Customer Issues Addressed & Outcomes Delivered (Video Module 4). You'll receive detailed feedback to help you refine further.",
    emptyTitle: "Start With Your Bridge Line And Talking Points",
    emptyCopy:
      "Paste your draft below, or ask for help getting started. You can also attach your bridge line and talking points from a document, as source material for a stronger first pass.",
    inputPlaceholder:
      "Paste your bridge line and talking points, or ask for help getting started.",
    prompt: module4Prompt,
    vectorStoreEnvVar: "MODULE_4_VECTOR_STORE_ID"
  }
};

const MODULE_ALIASES = {
  module4: "module-4",
  "4": "module-4",
  default: "module-4"
};

const DEFAULT_MODULE_SLUG = "module-4";

function normalizeSlug(value) {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) {
    return DEFAULT_MODULE_SLUG;
  }

  return MODULE_ALIASES[raw] || raw;
}

export function getDefaultModuleSlug() {
  return DEFAULT_MODULE_SLUG;
}

export function getModuleDefinition(slug) {
  const normalizedSlug = normalizeSlug(slug);
  return MODULES[normalizedSlug] || MODULES[DEFAULT_MODULE_SLUG];
}

export function getPublicModuleConfig(slug) {
  const moduleDef = getModuleDefinition(slug);

  return {
    slug: moduleDef.slug,
    moduleNumber: moduleDef.moduleNumber,
    shortLabel: moduleDef.shortLabel,
    title: moduleDef.title,
    subtitle: moduleDef.subtitle,
    emptyTitle: moduleDef.emptyTitle,
    emptyCopy: moduleDef.emptyCopy,
    inputPlaceholder: moduleDef.inputPlaceholder
  };
}

export function resolveModuleVectorStoreId(slug) {
  const moduleDef = getModuleDefinition(slug);

  if (moduleDef.vectorStoreEnvVar && process.env[moduleDef.vectorStoreEnvVar]) {
    return process.env[moduleDef.vectorStoreEnvVar];
  }

  if (moduleDef.slug === DEFAULT_MODULE_SLUG && process.env.OPENAI_VECTOR_STORE_ID) {
    return process.env.OPENAI_VECTOR_STORE_ID;
  }

  return "";
}
