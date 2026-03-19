// YSS_MODULES_V1

import { module1Prompt } from "./prompts/module1.js";
import { module4Prompt } from "./prompts/module4.js";

const MODULES = {
  "module-1": {
    slug: "module-1",
    moduleNumber: "Module 1",
    shortLabel: "Module 1",
    title: "A Great Story Changes Everything",
    subtitle:
      "Sales friend, I'm going to test your knowledge with 8 questions on how a great story changes everything, based on Video Module 1.",
    emptyTitle: "Start The Module 1 Quiz",
    emptyCopy:
      "Ask to begin the quiz, or attach your notes for extra context during this session. You'll be guided through 8 open-ended questions, one at a time, with a running score as you go.",
    inputPlaceholder:
      "Say 'start the quiz' or ask a question about Video Module 1.",
    prompt: module1Prompt,
    vectorStoreEnvVar: "MODULE_1_VECTOR_STORE_ID"
  },
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
  module1: "module-1",
  "1": "module-1",
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
