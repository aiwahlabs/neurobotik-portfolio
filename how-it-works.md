# Neurobotik Demo Assistant - Implementation Overview

## How It Works
The assistant is built on a "Hybrid AI" architecture using **n8n** as the orchestration engine and **OpenRouter (Gemini 2.5 Flash)** as the intelligence layer.

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
- **Date Awareness:** The system is explicitly pinned to a "Demo Date" of **Feb 3, 2026**.
- **No-Hallucination Policy:** The system prompt includes negative constraints: "If you are uncertain, do not guess. Offer to escalate to a human."

## Assumptions
- **Demo Date:** Tuesday, Feb 3, 2026.
- **Project #123456:** Hardcoded in the datastore as "In Production" with a due date of Feb 10, 2026 (exactly 5 working days from Feb 3, excluding weekends).
- **Escalation:** The assistant offers to escalate issues it cannot solve to the Neurobotik team via the `escalate_issue` workflow.

## How to Productionize for a Client
1. **Vector Database:** Move from the current markdown-based knowledge base to a vector store (like Pinecone or Qdrant) for handling thousands of pages of documentation.
2. **Database Integration:** Swap the Google Sheet for the client's actual production database (PostgreSQL, HubSpot API, etc.) for real-time accuracy.
3. **Advanced Security:** Implement PII (Personally Identifiable Information) masking nodes to ensure user data is stripped before reaching the AI model.
4. **Human-in-the-Loop:** Connect the escalation trigger to a live Slack or Zendesk channel for immediate human takeover.
