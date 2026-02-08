import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, END } from "@langchain/langgraph";
import { safeJsonParse } from "../utils/text.js";
import { getJobs } from "../store/memory.js";

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  temperature: 0.2
});

const conversationStore = new Map();
const MAX_MESSAGES = 8;

function getConversation(sessionId) {
  if (!conversationStore.has(sessionId)) {
    conversationStore.set(sessionId, []);
  }
  return conversationStore.get(sessionId);
}

function formatConversation(messages) {
  if (!messages?.length) {
    return "";
  }
  return messages
    .slice(-MAX_MESSAGES)
    .map((entry) => `${entry.role}: ${entry.content}`)
    .join("\n");
}

function detectFilterTools(message) {
  const text = (message || "").toLowerCase();
  const filters = {};
  let matched = false;

  if (text.includes("clear all filters") || text.includes("reset filters")) {
    return { intent: "update_filters", filters: { reset: true }, answer: "Filters cleared." };
  }

  if (text.includes("remote")) {
    filters.workMode = "remote";
    matched = true;
  }

  if (text.includes("hybrid")) {
    filters.workMode = "hybrid";
    matched = true;
  }

  if (text.includes("on-site") || text.includes("onsite")) {
    filters.workMode = "on-site";
    matched = true;
  }

  if (text.includes("full-time")) {
    filters.jobType = "full-time";
    matched = true;
  }

  if (text.includes("part-time")) {
    filters.jobType = "part-time";
    matched = true;
  }

  if (text.includes("contract")) {
    filters.jobType = "contract";
    matched = true;
  }

  if (text.includes("internship")) {
    filters.jobType = "internship";
    matched = true;
  }

  if (text.includes("last 24 hours") || text.includes("last 24 hrs")) {
    filters.dateRange = "24h";
    matched = true;
  }

  if (text.includes("last week")) {
    filters.dateRange = "week";
    matched = true;
  }

  if (text.includes("last month")) {
    filters.dateRange = "month";
    matched = true;
  }

  if (text.includes("today")) {
    filters.dateRange = "24h";
    matched = true;
  }

  if (text.includes("high match") || text.includes("70%")) {
    filters.matchScore = "high";
    matched = true;
  }

  if (text.includes("medium match") || text.includes("40%")) {
    filters.matchScore = "medium";
    matched = true;
  }

  const locationMatch = text.match(/\bin\s+([a-z\s]+)$/i);
  if (locationMatch) {
    filters.location = locationMatch[1].trim();
    matched = true;
  }

  if (!matched) {
    return null;
  }

  return {
    intent: "update_filters",
    filters,
    answer: "Filters updated. Want to refine further?"
  };
}

const intentPrompt = `You are an assistant for a job tracker UI.\nReturn JSON only: {"intent": "search"|"update_filters"|"help", "filters": {"role": string, "skills": string[], "dateRange": "any"|"24h"|"week"|"month", "jobType": "any"|"full-time"|"part-time"|"contract"|"internship", "workMode": "any"|"remote"|"hybrid"|"on-site", "location": string, "matchScore": "all"|"high"|"medium"}, "searchQuery": string, "answer": string}.\nIf the user wants jobs or search, set intent to search and include a short searchQuery. If they want to update UI filters, set intent to update_filters and provide filters. Otherwise set intent to help and provide a short answer.`;

const helpPrompt = `You are a helpful product assistant for an AI job tracker.\nAnswer briefly and clearly. Mention features like resume scoring, filters, best matches, and application tracking when relevant.`;

const graph = new StateGraph({
  channels: {
    message: { value: "", default: () => "" },
    sessionId: { value: "default", default: () => "default" },
    conversation: { value: [], default: () => [] },
    intent: { value: "help", default: () => "help" },
    filters: { value: {}, default: () => ({}) },
    searchQuery: { value: "", default: () => "" },
    answer: { value: "", default: () => "" },
    jobs: { value: [], default: () => [] },
    result: { value: null, default: () => null }
  }
});

graph.addNode("intentDetect", async (state) => {
  const toolMatch = detectFilterTools(state.message);
  if (toolMatch) {
    return {
      intent: toolMatch.intent,
      filters: toolMatch.filters,
      searchQuery: "",
      answer: toolMatch.answer
    };
  }

  const response = await model.invoke([
    { role: "system", content: intentPrompt },
    {
      role: "user",
      content: `${formatConversation(state.conversation)}\nUser: ${state.message}`.trim()
    }
  ]);

  const parsed = safeJsonParse(response.content, {
    intent: "help",
    filters: {},
    searchQuery: "",
    answer: "I can help with job search, filters, and product questions."
  });

  return {
    intent: parsed.intent || "help",
    filters: parsed.filters || {},
    searchQuery: parsed.searchQuery || "",
    answer: parsed.answer || ""
  };
});

graph.addNode("router", async (state) => ({ intent: state.intent }));

graph.addNode("jobSearch", async (state) => {
  const query = (state.searchQuery || state.message || "").toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const jobs = getJobs();

  const matches = jobs.filter((job) => {
    const haystack = [
      job.title,
      job.company,
      job.location,
      job.description,
      (job.skills || []).join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return terms.length ? terms.every((term) => haystack.includes(term)) : true;
  });

  const results = matches.slice(0, 8);
  const answer = results.length
    ? `Found ${results.length} matching roles. Update filters or open any job to apply.`
    : "No matching roles found. Try different keywords or filters.";

  return { jobs: results, answer };
});

graph.addNode("filterUpdate", async (state) => {
  const answer = state.answer || "Filters updated. Anything else to refine?";
  return { answer };
});

graph.addNode("productHelp", async (state) => {
  const response = await model.invoke([
    { role: "system", content: helpPrompt },
    {
      role: "user",
      content: `${formatConversation(state.conversation)}\nUser: ${state.message}`.trim()
    }
  ]);

  return { answer: response.content || "How can I help with your job search?" };
});

graph.addNode("finalize", async (state) => {
  return {
    result: {
      intent: state.intent,
      filters: state.filters || {},
      answer: state.answer || "How can I help?",
      jobs: state.jobs || []
    }
  };
});

graph.addEdge("intentDetect", "router");
graph.addConditionalEdges("router", (state) => state.intent, {
  search: "jobSearch",
  update_filters: "filterUpdate",
  help: "productHelp"
});

graph.addEdge("jobSearch", "finalize");
graph.addEdge("filterUpdate", "finalize");
graph.addEdge("productHelp", "finalize");
graph.addEdge("finalize", END);

graph.setEntryPoint("intentDetect");

const app = graph.compile();

export async function runAssistant({ message, sessionId = "default" }) {
  const conversation = getConversation(sessionId);
  const result = await app.invoke({ message, sessionId, conversation });
  const assistantAnswer = result.result?.answer || "How can I help?";

  conversation.push({ role: "user", content: message });
  conversation.push({ role: "assistant", content: assistantAnswer });
  conversationStore.set(sessionId, conversation.slice(-MAX_MESSAGES));

  return result.result;
}
