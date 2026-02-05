# Loom Presentation Script: Neurobotik Assessment

**Goal:** Prove technical competence, design polish, and business understanding in under 5 minutes.
**Setup:** 
1. Open your **Portfolio Page** in one tab (`localhost:8080`).
2. Open your **n8n Workflow** in a second tab.
3. Have the **Escalation Email** screenshot or inbox ready (optional, since it's on the page).

---

## 0:00 – Introduction & The "Why"
*(Start with your facecam on, looking at the Hero Section of the Portfolio)*

"Hi team, this is the final walkthrough for my **Neurobotik Business Operations & AI Automation Assessment**. 

Instead of just sending over a folder of screenshots, I built this **interactive portfolio** to demonstrate not just the *answers*, but the actual *functionality* of the AI agents I've designed. I wanted to simulate a real client delivery experience."

---

## 0:45 – The Portfolio Tour
*(Scroll down slowly though the page)*

"First, the **Execution Dashboard**. 
- I’ve organized the **Practical Deliverables** here—including the Architecture Walkthrough and the Data Audit—so stakeholders have one-click access to the technical specs.
- Below that, I’ve included my **Final Interview Responses**, structured as a readable report rather than a dry document. This shows my thinking on reporting ownership, data discipline, and handling escalations."

---

## 1:30 – The Live Demo (The "Magic" Moment)
*(Scroll to the **"Conversation Evidence"** section)*

"But the most important part is the **Live Evidence**. Rather than static screenshots, I’ve wired these buttons to trigger the live AI agent directly."

*(Click the **"1. Service Intent"** or **"3. Delivery Timelines"** button)*

"For example, if a client asks about delivery timelines...
*(Watch the chat open, type, and send automatically)*
...you can see the agent effectively retrieves the specific SLA from the Knowledge Base and formats it clearly. It solves the query instantly without human intervention."

---

## 2:30 – Under the Hood (The Logic)
*(Switch tab to your **n8n Workflow**)*

"Now, here is the engine driving that interaction. This is the **n8n orchestration layer**.

1.  **Router Architecture:** The prompt classifier first determines if the user needs a project lookup, general info, or a human.
2.  **RAG Pipeline:** If it's a question, we query the Vector Store (Pinecone/Supabase) to retrieve the relevant policy docs.
3.  **Safety & Formatting:** Before replying, the final LLM node formats the answer to match Neurobotik's professional tone."

*(Briefly hover over the **Escalation Node**)*
"And here is the **Escalation Logic**. If the sentiment is negative or the confidence is low, we bypass the AI and trigger this tailored email workflow."

---

## 3:30 – Escalation & Conclusion
*(Switch back to the **Portfolio Page**, scroll to **Escalation Evidence**)*

"You can see the result of that escalation here. The system automatically formats a handover email with the **User Context**, **Session ID**, and **Intent Summary**, ensuring the support team isn't starting from scratch.

To summarize: This build demonstrates a production-ready loop of **Automated Resolution -> Smart Routing -> Seamless Escalation**.

Thanks for the opportunity, and I look forward to discussing this in the final interview!"
