// YSS_MODULES_V1

import { module1Prompt } from "./prompts/module1.js";
import { module4Prompt } from "./prompts/module4.js";
import { module5Prompt } from "./prompts/module5.js";

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
    vectorStoreEnvVar: "MODULE_1_VECTOR_STORE_ID",
    scopeClassifierPrompt:
      "You classify whether a user request is in scope for a Video Module 1 quiz assist. " +
      "Allowed topics are starting or continuing the Module 1 quiz, answering quiz questions, asking for the next quiz question, asking for score-related feedback, asking a question about Video Module 1, and using directly related source material such as attached notes or transcripts about Module 1. " +
      "If the request is unrelated to the Module 1 quiz or Module 1 content, respond BLOCK. If it is related, respond ALLOW. Respond with one word only: ALLOW or BLOCK.",
    scopeErrorMessage:
      "This AI Assist is only for the Video Module 1 quiz, answering quiz questions, discussing A Great Story Changes Everything, and directly related source material."
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
    vectorStoreEnvVar: "MODULE_4_VECTOR_STORE_ID",
    scopeClassifierPrompt:
      "You classify whether a user request is in scope for a very specific AI assist. " +
      "Allowed topics are bridge lines, customer issues addressed, outcomes delivered, and directly related source material such as workshop notes, transcripts, rough drafts, messaging notes, or attached documents used to create or refine those deliverables. " +
      "If the request is unrelated to those tasks, respond BLOCK. If it is related, respond ALLOW. Respond with one word only: ALLOW or BLOCK.",
    scopeErrorMessage:
      "This AI Assist is only for bridge lines, customer issues addressed, outcomes delivered, and directly related source material."
  },
  "module-5": {
    slug: "module-5",
    moduleNumber: "Module 5",
    shortLabel: "Module 5",
    title: "Review & Refine Your Differentiator Talking Points",
    subtitle:
      "Provide your list of true differentiators as per Video Module 5 and receive detailed feedback and suggestions. When you're happy, move on to Video Module 6 and put your sales story to work!",
    emptyTitle: "Start With Your Differentiator Talking Points",
    emptyCopy:
      "Paste your differentiators below, or ask for help getting started. You can also attach notes, rough drafts, or other source material to help sharpen true differentiators for you, your company, and your solution.",
    inputPlaceholder:
      "Paste your differentiation talking points, or ask for help getting started.",
    prompt: module5Prompt,
    vectorStoreEnvVar: "MODULE_5_VECTOR_STORE_ID",
    scopeClassifierPrompt:
      "You classify whether a user request is in scope for a differentiator refinement assist. " +
      "Allowed topics are differentiation talking points, true differentiators, refining why or how a company, solution, or salesperson is genuinely different, and directly related source material such as drafts, workshop notes, transcripts, websites, or attached documents used to create or improve differentiator talking points. " +
      "If the request is unrelated to those tasks, respond BLOCK. If it is related, respond ALLOW. Respond with one word only: ALLOW or BLOCK.",
    scopeErrorMessage:
      "This AI Assist is only for differentiation talking points, true differentiators, and directly related source material."
  }
};

const MODULE_ALIASES = {
  module1: "module-1",
  "1": "module-1",
  module4: "module-4",
  "4": "module-4",
  module5: "module-5",
  "5": "module-5",
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
