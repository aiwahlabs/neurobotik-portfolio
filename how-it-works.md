# Neurobotik Demo Assistant - Implementation Overview

## How It Works
The assistant is built on a **Hybrid AI architecture** — combining rule-based routing with LLM intelligence — using **n8n** as the orchestration engine and **OpenRouter (Gemini 2.5 Flash)** as the intelligence layer.

### 1. Unified Entry Point
A single n8n Webhook receives all messages. This allows for a consistent state and session management across different interaction types.

### 2. Intelligent Routing (The Classifier)
Instead of a generic agent, we use a specialized **AI Classifier**. It categorizes every message into:
- `project_lookup`: Triggers the direct datastore search.
- `general_kb`: Triggers the RAG (Retrieval-Augmented Generation) pipeline.

### 3. Pro-Style Automation (Project Status)
When a project search is triggered:
- **Regex + AI ID Extraction:** We use a dual-layer approach to find 6-digit IDs, ensuring reliability even if the user forgets the "#" or embeds the ID in a sentence.
- **Direct Datastore Lookup:** The system queries a Google Sheet directly using the extracted ID. This is faster and more reliable than letting an AI agent "browse" a tool.
- **Automated Logging:** Every lookup attempt is logged back to a separate "Logs" sheet with a timestamp and success/failure status.

### 4. Guardrails & Accuracy
- **No-Hallucination Policy:** The system prompt includes negative constraints: "If you are uncertain, do not guess. Offer to escalate to a human."
- **Rate Limiting:** Webhook endpoints include throttling to prevent abuse (max 60 requests/minute per session).
- **Input Sanitization:** All user inputs are sanitized before processing to prevent prompt injection attacks.

### 5. Error Handling & Fallbacks
- **Google Sheet Timeout:** If the datastore lookup times out (>5s), the assistant responds with: "I'm having trouble accessing the project database. Let me escalate this to the team."
- **Classifier Uncertainty:** When the AI classifier confidence is below 70%, the system defaults to `general_kb` and adds a clarifying question to the response.
- **API Failures:** All external API calls are wrapped in try-catch logic with automatic retry (1x) before escalating to fallback responses.

## Assumptions
- **Escalation:** The assistant offers to escalate issues it cannot solve to the Neurobotik team via the `escalate_issue` workflow.
- **Session State:** Each conversation is treated as a unique session with context preserved within that session only.
- **Knowledge Base Scope:** The assistant only answers questions within the bounds of the provided knowledge base and connected datastores.

## How to Productionize for a Client
1. **Vector Database:** Move from the current markdown-based knowledge base to a vector store (like Pinecone or Qdrant) for handling thousands of pages of documentation.
2. **Database Integration:** Swap the Google Sheet for the client's actual production database (PostgreSQL, HubSpot API, etc.) for real-time accuracy.
3. **Advanced Security:** Implement PII (Personally Identifiable Information) masking nodes to ensure user data is stripped before reaching the AI model.
4. **Human-in-the-Loop:** Connect the escalation trigger to a live Slack or Zendesk channel for immediate human takeover.
5. **Authentication Guardrails:** For production environments, we implement JWT-based authentication for the chat-widget backend and SSO integration to ensure only authorized users can access sensitive project data or trigger system lookups.
