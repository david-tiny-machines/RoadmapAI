# Phase 5: AI PRD Agent (MVP) - High-Level Plan

This document outlines the planned incremental delivery for Phase 5, focusing on building a Minimum Viable Product (MVP) for the AI-powered PRD generation agent.

## Goal
Deliver an MVP AI agent that guides users through a conversational interface to gather information for core PRD sections and generates a structured Markdown output.

## MVP Scope

The MVP will focus on generating the following sections based on user input:

*   **Overview**
    *   `executive_summary`
    *   `problem_statements`: (Primary problem, `target_segments`, `impacted_segments`, Optional: `primary_okr`)
*   **Product Requirements (Simplified)**
    *   `solution_summary`
    *   `measuring_impact`: (Key `metrics` and expected impact)
*   **Risks & Assumptions**
    *   `discovery_risks_and_assumptions`

**Output Format:** Markdown (`.md`)

## Build Approach

Phase 5 will be delivered incrementally:

### v0.0.5a: Backend Setup & Basic Conversation Endpoint

*   **Goal:** Set up the foundational backend infrastructure and a basic endpoint to interact with the AI model.
*   **Functionality:**
    *   Create a new API route (e.g., `/api/agents/prd-generator`) to handle conversation turns.
    *   Integrate basic OpenAI API client setup.
    *   Implement initial prompt engineering to start the PRD generation conversation.
    *   Set up basic session handling (in-memory or Supabase for persistence if simple).
*   **Technical Considerations:**
    *   Next.js API Route.
    *   OpenAI SDK (`openai` package).
    *   Basic state management for conversation history within a session.

### v0.0.5b: Frontend UI Setup & Chat Interface

*   **Goal:** Create the user-facing chat interface within the new "Agents" section.
*   **Functionality:**
    *   Add "Agents" to the main navigation (`components/layout/MainLayout.tsx` or similar).
    *   Create a new page `pages/agents/index.tsx` listing available agents (initially just the PRD Generator).
    *   Create a new page `pages/agents/prd-generator.tsx`.
    *   Implement a basic chat UI component (`components/agents/ChatInterface.tsx` or similar) capable of displaying messages and accepting user input.
*   **Technical Considerations:**
    *   React components for chat display (user/assistant messages).
    *   Input field and send button.
    *   Basic state management for chat history on the frontend.

### v0.0.5c: Connect Frontend, Backend & Basic Conversational Flow

*   **Goal:** Enable communication between the chat UI and the backend API, implementing the initial conversational turn-taking.
*   **Functionality:**
    *   Connect the frontend chat input to call the backend API endpoint.
    *   Display responses from the backend/AI in the chat interface.
    *   Implement the initial question flow for the "Overview" section (`executive_summary`, `problem_statements`).
    *   Refine backend prompt engineering to guide the conversation for the first section.
*   **Technical Considerations:**
    *   `fetch` or similar library for API calls.
    *   Handling loading states in the UI while waiting for AI response.
    *   Updating frontend/backend state management.

### v0.0.5d: Implement Full MVP Conversation Flow & State Management

*   **Goal:** Extend the conversational logic to cover all MVP sections and manage the collected information.
*   **Functionality:**
    *   Implement question flows for "Product Requirements" and "Risks & Assumptions".
    *   Develop backend logic to store the collected information structured according to the MVP schema (likely in session state).
    *   Refine prompt engineering to handle transitions between sections and gather required details.
*   **Technical Considerations:**
    *   More sophisticated state management on the backend to hold the accumulating PRD data.
    *   Error handling for API calls and AI interactions.

### v0.0.5e: Markdown Generation & Export

*   **Goal:** Generate the final Markdown output from the collected data and allow the user to access it.
*   **Functionality:**
    *   Add a mechanism to signal the end of the conversation (e.g., a user command like "/done" or an AI determination).
    *   Implement backend logic to format the collected data into a structured Markdown string.
    *   Provide the generated Markdown to the frontend.
    *   Add a "Copy to Clipboard" or "Download .md file" button to the chat interface.
*   **Technical Considerations:**
    *   Markdown formatting logic on the backend.
    *   Frontend UI elements for export/copy.
    *   Handling the final state transition.

### v0.0.5f: Initiative Selection on Start

*   **Goal:** Enhance the agent's starting interaction to query existing initiatives and allow the user to select one or start a new PRD.
*   **Functionality:**
    *   Backend fetches initiatives from Supabase on session start.
    *   Initial greeting message dynamically includes the list of initiatives and a "New" option.
    *   Backend handles the user's first response to select an initiative or "New".
*   **Technical Considerations:**
    *   Supabase client interaction in API route.
    *   Updating initial message generation logic.
    *   Handling the first user response specifically.

### v0.0.5g: Retrieval-Augmented Generation (RAG) Integration

*   **Goal:** Enhance the agent's responses by dynamically retrieving and incorporating specific details about the selected initiative during the PRD generation conversation.
*   **Functionality:**
    *   Identify key points in the conversation where initiative data is relevant (e.g., discussing problem, impact).
    *   Backend retrieves specific data fields (e.g., `value_lever`, `uplift`, `effort_estimate`) for the selected initiative from Supabase before certain LLM calls.
    *   Retrieved data is formatted and injected into the LLM prompt.
    *   LLM uses the augmented prompt to generate more context-aware questions or statements.
*   **Technical Considerations:**
    *   Conditional Supabase queries within the main conversation loop.
    *   Advanced prompt engineering to instruct the LLM on using retrieved data.
    *   Potential need for more robust session state management to track conversation progress and trigger retrieval.

### v0.0.5h: Suggestive Content Generation

*   **Goal:** Make the agent more proactive by suggesting draft content for PRD sections (e.g., executive summary, metrics) based on retrieved initiative data, rather than just asking open-ended questions.
*   **Functionality:**
    *   Update system prompt to instruct the agent to suggest content first when context (from RAG) is available.
    *   LLM uses retrieved initiative details (via RAG from v0.0.5g) to formulate relevant suggestions.
    *   Agent presents the suggestion and asks for user confirmation or modification.
    *   Backend logic potentially needs refinement to handle user feedback on suggestions.
*   **Technical Considerations:**
    *   Requires successful implementation of RAG (v0.0.5g).
    *   Significant changes to prompt engineering.
    *   Potential adjustments to conversation flow logic to handle feedback loops on suggestions.

## Technical Considerations

*   **Frontend:** Next.js, React, TypeScript, TailwindCSS
*   **Backend:** Next.js API Routes, TypeScript, OpenAI API
*   **Authentication:** Leverage existing Supabase auth (`@supabase/auth-helpers-nextjs`).
*   **State Management:** Consider appropriate state management for chat history (frontend) and conversation context/PRD data (backend - potentially Supabase for persistence later, but session state for MVP).
*   **Key Challenge:** Prompt engineering for GPT-4 to maintain context, follow the desired conversational flow, extract structured information, and handle potential user digressions.

## Database Schema

No new persistent database tables are strictly required for the MVP if conversation state and generated data are managed transiently within user sessions or returned directly. However, consider if storing conversation history or final PRDs in Supabase is desirable for future enhancements (like resuming conversations). For MVP, assume no schema changes unless session persistence becomes necessary. 