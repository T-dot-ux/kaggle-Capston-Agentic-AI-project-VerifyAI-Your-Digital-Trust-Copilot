# How VerifyAI Works

VerifyAI (Digital Trust Copilot) is an Agentic AI application designed to analyze, classify, and verify documents, evaluating their authenticity and trustworthiness. It is composed of a Next.js frontend for user interaction and a FastAPI backend that orchestrates multiple specialized AI agents.

## Core Workflow

The system operates through a multi-stage pipeline, managed by a series of specialized agents in the backend.

### 1. Document Upload (UploadManagerAgent)
The process begins when a user uploads a document through the Next.js frontend interface (e.g., via `UploadZone.tsx`). The frontend sends this file to the backend's `/api/verify/upload` endpoint.
The **UploadManagerAgent** securely handles the incoming file, saves it, and creates a new Verification Job in the database with an `UPLOADING` status. The backend immediately returns a `job_id` to the frontend, and the heavy processing is delegated to a background task.

### 2. Text Extraction (OCRAgent)
Once the job is queued, its status changes to `EXTRACTING`. The **OCRAgent** processes the uploaded file (PDF, Image, etc.) and extracts raw text from the document. This text forms the basis for all subsequent analysis.

### 3. Document Classification (GeminiAgent)
The extracted text is passed to the **GeminiAgent**. The agent uses a Large Language Model (Gemini) to semantically understand the content and categorize the document (e.g., Identity Document, Financial Statement, Legal Contract).

### 4. Rule-Based Analysis (RuleEngineAgent)
The job status advances to `ANALYZING`. The **RuleEngineAgent** evaluates the extracted text against a set of predefined, deterministic rules based on the document category.
- It identifies **hard red flags** (e.g., expired dates, missing mandatory clauses, known fraudulent patterns).
- Any matched flags are saved to the database as `VerificationEvidence`.

### 5. AI Semantic Analysis (GeminiAgent)
Simultaneously or immediately following the rule engine, the **GeminiAgent** performs a deep semantic analysis of the document for nuances that hardcoded rules might miss.
- It looks for suspicious context, inconsistencies, or unusual language (AI Red Flags).
- It also identifies authenticating features or reassuring language (AI Positive Indicators).
- Both positive and negative indicators are recorded as evidence.

### 6. Risk Scoring (RiskScoringEngine)
Finally, all gathered intelligence is fed into the **RiskScoringEngine**. This engine calculates a comprehensive **Trust Score** (0-100) by combining:
- The deterministic flags from the Rule Engine.
- The semantic insights from the Gemini Agent.
- Simulated integrity scores (like OCR consistency and metadata validation).

### 7. Results Delivery
The job status is marked as `COMPLETED`. The final result includes the trust score, an AI-generated summary, a clear recommendation (e.g., "Approve", "Manual Review Required"), and a detailed list of all supporting evidence (both red flags and positive indicators).

The frontend, which periodically polls the `/api/verify/status/{job_id}` endpoint, receives this completed data payload and renders a comprehensive dashboard for the user to review the document's trustworthiness.
