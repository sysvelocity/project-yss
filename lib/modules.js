// YSS_MODULES_V1

import { module1Prompt } from "./prompts/module1.js";
import { module2Prompt } from "./prompts/module2.js";
import { module3Prompt } from "./prompts/module3.js";
import { module4Prompt } from "./prompts/module4.js";
import { module5Prompt } from "./prompts/module5.js";
import { module1Knowledge } from "./knowledge/module1.js";
import { module2Knowledge } from "./knowledge/module2.js";
import { module4Knowledge } from "./knowledge/module4.js";
import { module5Knowledge } from "./knowledge/module5.js";
import { module6_4_1Knowledge } from "./knowledge/module6.4.1.js";
import { module6_1_1Prompt } from "./prompts/module6.1.1.js";
import { module6_1_2Prompt } from "./prompts/module6.1.2.js";
import { module6_1_3Prompt } from "./prompts/module6.1.3.js";
import { module6_2_1Prompt } from "./prompts/module6.2.1.js";
import { module6_2_2Prompt } from "./prompts/module6.2.2.js";
import { module6_3_1Prompt } from "./prompts/module6.3.1.js";
import { module6_3_2Prompt } from "./prompts/module6.3.2.js";
import { module6_4_1Prompt } from "./prompts/module6.4.1.js";
import { supportChatPrompt } from "./prompts/support.js";
import { supportChatKnowledge } from "./knowledge/support.js";

function buildScopeClassifierPrompt(modulePurpose) {
  return (
    "You decide whether a user input reasonably aligns with the purpose of this module. " +
    `The purpose of this module is: ${modulePurpose}. ` +
    "Be strongly biased toward ALLOW. " +
    "Allow shorthand replies, names, fragments, messy pasted notes, mixed inputs, partial answers, follow-up questions, clarifications, corrections, continuations, restarts, attachment-related requests, and rough working material whenever they could reasonably make sense as part of completing this module. " +
    "Only respond BLOCK if the input clearly does not make sense for this module and is clearly trying to use the app for a different task entirely. " +
    "Respond with one word only: ALLOW or BLOCK."
  );
}

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
    knowledgeText: module1Knowledge,
    vectorStoreEnvVar: "MODULE_1_VECTOR_STORE_ID",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "run the Video Module 1 quiz, discuss A Great Story Changes Everything, evaluate quiz answers, discuss score or progress, and use directly related notes or source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for the Video Module 1 quiz, answering quiz questions, discussing A Great Story Changes Everything, and directly related source material."
  },
  "module-2": {
    slug: "module-2",
    moduleNumber: "Module 2",
    shortLabel: "Module 2",
    title: "Common Sales Story Sins",
    subtitle:
      "Sales friend, I'm going to test your knowledge with 8 questions on Common Sales Story Sins, based on Video Module 2.",
    emptyTitle: "Start The Module 2 Quiz",
    emptyCopy:
      "Ask to begin the quiz, or attach your notes for extra context during this session. You'll be guided through multiple-choice, fill-in-the-blank, and open-ended questions with a running score as you go.",
    inputPlaceholder:
      "Say 'start the quiz' or ask a question about Video Module 2.",
    prompt: module2Prompt,
    knowledgeText: module2Knowledge,
    vectorStoreEnvVar: "MODULE_2_VECTOR_STORE_ID",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "run the Video Module 2 quiz, discuss Common Sales Story Sins, evaluate quiz answers, discuss score or progress, and use directly related notes or source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for the Video Module 2 quiz, answering quiz questions, discussing Common Sales Story Sins, and directly related source material."
  },
  "module-3": {
    slug: "module-3",
    moduleNumber: "Module 3",
    shortLabel: "Module 3",
    title: "Current Story Evaluation Exercise",
    subtitle:
      "Sales friend, let's evaluate your key phrases and talking points from your various sales weapons, based on Video Module 3.",
    emptyTitle: "Start With Your Current Sales Messaging",
    emptyCopy:
      "Paste key phrases or talking points from your sales weapons below. This module will classify them as self/company/product-focused or customer-focused, using the Video Module 3 evaluation framework.",
    inputPlaceholder:
      "Paste key phrases from your website, emails, call outlines, proposals, or other sales materials.",
    prompt: module3Prompt,
    vectorStoreEnvVar: "",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "evaluate sales messaging, classify statements as self/company/product-focused or customer-focused, and review directly related sales weapons and source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for evaluating sales messaging from Video Module 3, including sales weapons, key phrases, and directly related source material."
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
    knowledgeText: module4Knowledge,
    vectorStoreEnvVar: "MODULE_4_VECTOR_STORE_ID",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "draft, review, refine, or discuss bridge lines, customer issues addressed, outcomes delivered, and directly related sales-story source material"
    ),
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
    knowledgeText: module5Knowledge,
    vectorStoreEnvVar: "MODULE_5_VECTOR_STORE_ID",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "draft, review, refine, critique, or discuss differentiation talking points, true differentiators, and directly related source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for differentiation talking points, true differentiators, and directly related source material."
  },
  "6.1.1": {
    slug: "6.1.1",
    moduleNumber: "Module 6.1.1",
    shortLabel: "6.1.1",
    title: "Live Prospecting Phone Call (#1)",
    subtitle:
      "Sales friend, now it's time to put all your effort on building YOUR SALES STORY to work. A live prospecting phone call example will be created from 3 client issues addressed and use the format 'I've been hearing from <type/role> who are looking to...'",
    emptyTitle: "Build Your Live Prospecting Phone Call",
    emptyCopy:
      "Start by sharing your name, role, company, and location, then provide your Bridge Line, Client Issues Addressed, Offer, and Differentiators. This module will turn that into a live prospecting phone call outline.",
    inputPlaceholder:
      "Provide your name, role, company, location, and sales story inputs, or ask how to get started.",
    prompt: module6_1_1Prompt,
    vectorStoreEnvVar: "",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "build, refine, continue, or restart the Live Prospecting Phone Call (#1) outline from the user's sales story inputs and directly related source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for building a live prospecting phone call outline from your sales story inputs and directly related source material."
  },
  "6.1.2": {
    slug: "6.1.2",
    moduleNumber: "Module 6.1.2",
    shortLabel: "6.1.2",
    title: "Live Prospecting Phone Call (#2)",
    subtitle:
      "Sales friend, now it's time to put all your effort on building your sales story to work. A live prospecting phone call example will be created from 3 issues addressed and use the format 'A mutual friend asked me to call you...'",
    emptyTitle: "Build Your Live Prospecting Phone Call",
    emptyCopy:
      "Start by sharing your name, then provide your Bridge Line, Client Issues Addressed, Offer, and Differentiators. This module will turn that into a live prospecting phone call outline using the mutual-friend format.",
    inputPlaceholder:
      "Provide your name and sales story inputs, or ask how to get started.",
    prompt: module6_1_2Prompt,
    vectorStoreEnvVar: "",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "build, refine, continue, or restart the Live Prospecting Phone Call (#2) outline from the user's sales story inputs and directly related source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for building a live prospecting phone call outline from your sales story inputs and directly related source material."
  },
  "6.1.3": {
    slug: "6.1.3",
    moduleNumber: "Module 6.1.3",
    shortLabel: "6.1.3",
    title: "Live Prospecting Phone Call (#3)",
    subtitle:
      "Sales friend, now it's time to put all your effort on building YOUR SALES STORY to work. A live prospecting phone call example will be created from 3 client issues addressed and use the format 'The reason I'm calling is...I've been hearing from <type/role> who are looking to...'",
    emptyTitle: "Build Your Live Prospecting Phone Call",
    emptyCopy:
      "Start by sharing your name, role, company, and location, then provide your Bridge Line, Client Issues Addressed, Offer, and Differentiators. This module will turn that into a live prospecting phone call outline using the 'The reason I'm calling is...' format.",
    inputPlaceholder:
      "Provide your name, role, company, location, and sales story inputs, or ask how to get started.",
    prompt: module6_1_3Prompt,
    vectorStoreEnvVar: "",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "build, refine, continue, or restart the Live Prospecting Phone Call (#3) outline from the user's sales story inputs and directly related source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for building a live prospecting phone call outline from your sales story inputs and directly related source material."
  },
  "6.2.1": {
    slug: "6.2.1",
    moduleNumber: "Module 6.2.1",
    shortLabel: "6.2.1",
    title: "Email to Target Prospect (#1)",
    subtitle:
      "Sales friend, now it's time to put all your effort on building your sales story to work. An email to target prospect example will be created from 3 issues addressed and use the format 'XYZ encouraged me to connect with you and thought we would both benefit from a conversation...'",
    emptyTitle: "Build Your Target Prospect Email",
    emptyCopy:
      "Start by sharing your first name, then provide your Bridge Line, Client Issues Addressed, Offer, and Differentiators. This module will turn that into an email outline for a target prospect.",
    inputPlaceholder:
      "Provide your first name and sales story inputs, or ask how to get started.",
    prompt: module6_2_1Prompt,
    vectorStoreEnvVar: "",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "build, refine, continue, or restart the Email to Target Prospect (#1) from the user's sales story inputs and directly related source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for building a target prospect email from your sales story inputs and directly related source material."
  },
  "6.2.2": {
    slug: "6.2.2",
    moduleNumber: "Module 6.2.2",
    shortLabel: "6.2.2",
    title: "Email to Target Prospect (#2)",
    subtitle:
      "Sales friend, now it's time to put all your effort on building your sales story to work. An email to target prospect example will be created from 3 issues addressed + 2 Differentiators. Format 'I lead our <team> and was hoping to spend just a minute...'",
    emptyTitle: "Build Your Target Prospect Email",
    emptyCopy:
      "Start by sharing your full name, team, target industry, company name, and phone number, then provide your Bridge Line, Client Issues Addressed, Offer, and Differentiators. This module will turn that into an email outline for a target prospect.",
    inputPlaceholder:
      "Provide your contact details and sales story inputs, or ask how to get started.",
    prompt: module6_2_2Prompt,
    vectorStoreEnvVar: "",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "build, refine, continue, or restart the Email to Target Prospect (#2) from the user's sales story inputs and directly related source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for building a target prospect email from your sales story inputs and directly related source material."
  },
  "6.3.1": {
    slug: "6.3.1",
    moduleNumber: "Module 6.3.1",
    shortLabel: "6.3.1",
    title: "Voicemail to Target Prospect (#1)",
    subtitle:
      "Sales friend, now it's time to put all your effort on building your sales story to work. A voicemail to target prospect example will be created from 2 client issues addressed and use the format 'I haven't called you before...'",
    emptyTitle: "Build Your Target Prospect Voicemail",
    emptyCopy:
      "Start by sharing your full name, company name, and phone number, then provide your Bridge Line, Client Issues Addressed, Offer, and Differentiators. This module will turn that into a voicemail outline for a target prospect.",
    inputPlaceholder:
      "Provide your contact details and sales story inputs, or ask how to get started.",
    prompt: module6_3_1Prompt,
    vectorStoreEnvVar: "",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "build, refine, continue, or restart the Voicemail to Target Prospect (#1) from the user's sales story inputs and directly related source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for building a target prospect voicemail from your sales story inputs and directly related source material."
  },
  "6.3.2": {
    slug: "6.3.2",
    moduleNumber: "Module 6.3.2",
    shortLabel: "6.3.2",
    title: "Voicemail to Target Prospect (#2)",
    subtitle:
      "Sales friend, now it's time to put all your effort on building your sales story to work. A voicemail to target prospect example will be created from 3 client issues addressed and use the format 'Getting back to you...I'd love to connect...'",
    emptyTitle: "Build Your Target Prospect Voicemail",
    emptyCopy:
      "Start by sharing your full name, company name, phone number, and the one thing you'd like to connect about, then provide your Bridge Line, Client Issues Addressed, Offer, and Differentiators. This module will turn that into a voicemail outline for a target prospect.",
    inputPlaceholder:
      "Provide your contact details, connection topic, and sales story inputs, or ask how to get started.",
    prompt: module6_3_2Prompt,
    vectorStoreEnvVar: "",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "build, refine, continue, or restart the Voicemail to Target Prospect (#2) from the user's sales story inputs, connection topic, and directly related source material"
    ),
    scopeErrorMessage:
      "This AI Assist is only for building a target prospect voicemail from your sales story inputs and directly related source material."
  },
  "6.4.1": {
    slug: "6.4.1",
    moduleNumber: "Module 6.4.1",
    shortLabel: "6.4.1",
    title: "Conversational Sales Story Example",
    subtitle:
      "Sales friend, now it's time to put all your effort on building YOUR SALES STORY to work. Imagine your ideal prospect asks you 'What does your company do?' Let's create a short 30 second conversational example from your Bridge Line, Customer Issues Addressed Talking Points and your Differentiators.",
    emptyTitle: "Build Your Conversational Sales Story Example",
    emptyCopy:
      "Share your bridge line, client issues addressed, offer, optional, and differentiation talking points. This module will turn them into a short conversational response you can use when a prospect asks what your company does.",
    inputPlaceholder:
      "Paste your bridge line, client issues addressed, offer, optional, and differentiators, or ask how to get started.",
    prompt: module6_4_1Prompt,
    knowledgeText: module6_4_1Knowledge,
    vectorStoreEnvVars: [],
    scopeClassifierPrompt:
      "You decide whether a user input reasonably aligns with the purpose of this module. " +
      "The purpose of this module is to build, refine, continue, or restart the conversational sales story example from the user's bridge line, customer issues addressed, offers, differentiators, attachments, and directly related source material. " +
      "Be strongly biased toward ALLOW. " +
      "Allow raw pasted bridge lines, customer issues addressed, differentiators, offers, headings, numbered lists, messy notes, attachment-related requests, and structured source material even when the user does not write an explicit request sentence. " +
      "If the pasted content looks like module working material that could reasonably be turned into the conversational sales story output, respond ALLOW. " +
      "Only respond BLOCK if the input clearly does not make sense for this module and is clearly trying to use the app for a different task entirely. " +
      "Respond with one word only: ALLOW or BLOCK.",
    scopeErrorMessage:
      "This AI Assist is only for building a short conversational sales story example from your bridge line, customer issues addressed, differentiators, and directly related source material."
  },
  "support-chat": {
    slug: "support-chat",
    moduleNumber: "Support",
    shortLabel: "Support",
    title: "YSS AI Support Assistant",
    subtitle:
      "Ask questions about course access, modules, attachments, exports, licensing, admin behavior, and common troubleshooting.",
    emptyTitle: "Ask A Support Question",
    emptyCopy:
      "Ask about logins, module access, which AI Assist to use, attachments, exports, or other product support topics. This assistant stays grounded in internal support knowledge only.",
    inputPlaceholder:
      "Ask about access, modules, attachments, exports, troubleshooting, or how the course works.",
    prompt: supportChatPrompt,
    knowledgeText: supportChatKnowledge,
    vectorStoreEnvVar: "",
    scopeClassifierPrompt: buildScopeClassifierPrompt(
      "answer support questions about the YSS AI website, modules, licensing, access, attachments, exports, sessions, usage reporting, module purpose, and directly related product troubleshooting"
    ),
    scopeErrorMessage:
      "This support assistant is only for YSS AI course, module, access, licensing, attachment, export, and troubleshooting questions."
  }
};

const MODULE_ALIASES = {
  module1: "module-1",
  "1": "module-1",
  module2: "module-2",
  "2": "module-2",
  module3: "module-3",
  "3": "module-3",
  module4: "module-4",
  "4": "module-4",
  module5: "module-5",
  "5": "module-5",
  "6.1.1": "6.1.1",
  "6.1.2": "6.1.2",
  "6.1.3": "6.1.3",
  "6.2.1": "6.2.1",
  "6.2.2": "6.2.2",
  "6.3.1": "6.3.1",
  "6.3.2": "6.3.2",
  "6.4.1": "6.4.1",
  "support-chat": "support-chat",
  support: "support-chat",
  "help": "support-chat",
  "supportchat": "support-chat",
  module611: "6.1.1",
  module612: "6.1.2",
  module613: "6.1.3",
  module621: "6.2.1",
  module622: "6.2.2",
  module631: "6.3.1",
  module632: "6.3.2",
  module641: "6.4.1",
  modulesupport: "support-chat",
  "module-support": "support-chat",
  "module-6-1-1": "6.1.1",
  "module-6-1-2": "6.1.2",
  "module-6-1-3": "6.1.3",
  "module-6-2-1": "6.2.1",
  "module-6-2-2": "6.2.2",
  "module-6-3-1": "6.3.1",
  "module-6-3-2": "6.3.2",
  "module-6-4-1": "6.4.1",
  "module-support-chat": "support-chat",
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

export function resolveModuleVectorStoreIds(slug) {
  const moduleDef = getModuleDefinition(slug);
  const resolved = [];

  if (Array.isArray(moduleDef.vectorStoreEnvVars)) {
    for (const envVarName of moduleDef.vectorStoreEnvVars) {
      const value = String(process.env[envVarName] || "").trim();
      if (value) {
        resolved.push(value);
      }
    }
  }

  if (moduleDef.vectorStoreEnvVar && process.env[moduleDef.vectorStoreEnvVar]) {
    resolved.push(process.env[moduleDef.vectorStoreEnvVar]);
  }

  if (
    moduleDef.slug === DEFAULT_MODULE_SLUG &&
    process.env.OPENAI_VECTOR_STORE_ID &&
    !resolved.includes(process.env.OPENAI_VECTOR_STORE_ID)
  ) {
    resolved.push(process.env.OPENAI_VECTOR_STORE_ID);
  }

  return resolved.filter(Boolean);
}

export function resolveModuleVectorStoreId(slug) {
  return resolveModuleVectorStoreIds(slug)[0] || "";
}
