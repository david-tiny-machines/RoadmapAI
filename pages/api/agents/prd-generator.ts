import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'; // Import Supabase client helper

// --- Define ChatMessage Interface locally for API ---
interface ChatMessage {
    role: 'user' | 'assistant' | 'system'; // Include system for history
    content: string;
}
// --- End Interface Definition ---

// --- Define Session Data Structure ---
interface SessionData {
    history: ChatMessage[];
    availableInitiatives?: { id: string, name: string }[]; // Store fetched initiatives for validation
    selectedInitiativeId?: string | null;
    isNewInitiative?: boolean;
}
// --- End Session Data Structure ---

// Define expected structure for extracted PRD data
interface ExtractedPrdData {
    executiveSummary?: string;
    primaryProblem?: string;
    targetSegments?: string[]; // Keep simple for MVP
    solutionSummary?: string;
    keyMetrics?: string[]; // Keep simple for MVP
    risksAssumptions?: string;
}

// Ensure the OpenAI API key is set in environment variables
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
}

// Instantiate the OpenAI client
const openai = new OpenAI();

// --- In-memory Session Store (Non-persistent) ---
// const sessionStore = new Map<string, ChatMessage[]>(); // Old structure
const sessionStore = new Map<string, SessionData>(); // Use new structure
// --- End Session Store ---

// --- System Prompt Definition (for conversation) ---
const systemPrompt: ChatMessage = {
    role: 'system',
    content: `You are a helpful assistant guiding a user to create a concise Product Requirements Document (PRD) for an MVP.
First, you will present a list of existing initiatives or the option to create a new one. Await the user's selection.
Once the user selects an initiative or 'New', acknowledge their choice and then guide them sequentially through these sections:
1. Overview: Ask for Executive Summary, then Primary Problem, then Target Segments.
2. Product Requirements (Simplified): Ask for Solution Summary, then Key Success Metrics.
3. Risks & Assumptions: Ask for major risks or assumptions.
Once the user has provided input for risks/assumptions, inform them they can type /done to generate the PRD.
Keep your responses concise. Acknowledge the user's input for one section before prompting for the next piece of information within that section or moving to the next section.`,
};
// --- End System Prompt ---

// --- Function to Extract PRD Data using OpenAI --- 
async function extractPrdData(history: ChatMessage[]): Promise<ExtractedPrdData | null> {
    console.log('Attempting to extract PRD data from history...');
    // Filter out the initial system prompt and potentially the initiative selection messages
    // before sending to extraction, if they might confuse it. For now, send all.
    const relevantHistory = history.filter(msg => msg.role !== 'system'); // Basic filter

    const extractionPrompt: ChatMessage = {
        role: 'system',
        content: `Analyze the following conversation history and extract the key information for the PRD sections. Format the output STRICTLY as a JSON object with these keys (use null if information is missing): 
        {
          "executiveSummary": "string | null",
          "primaryProblem": "string | null",
          "targetSegments": ["string1", "string2", ...] | null,
          "solutionSummary": "string | null",
          "keyMetrics": ["string1", "string2", ...] | null,
          "risksAssumptions": "string | null"
        }
        Conversation History:`
    };

    // Combine extraction prompt + relevant history as the content for the extraction call
    const historyString = relevantHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const extractionMessages: ChatMessage[] = [
        extractionPrompt,
        { role: 'user', content: historyString } // Pass history as user message
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4', // Or a model known for good JSON output
            messages: extractionMessages,
            temperature: 0.2, // Lower temperature for more deterministic JSON output
        });

        const replyContent = completion.choices[0]?.message?.content;
        if (!replyContent) {
            console.error('OpenAI extraction response missing content.');
            return null;
        }

        console.log('Raw JSON extraction from AI:', replyContent);
        // Attempt to parse the JSON response
        // Ensure robust parsing
        let jsonData: ExtractedPrdData | null = null;
        try {
            jsonData = JSON.parse(replyContent);
        } catch(parseError) {
            console.error('Failed to parse JSON from AI extraction:', parseError);
             console.error('Raw content was:', replyContent);
             // Attempt to find JSON within ```json ... ``` block if exists
             const match = replyContent.match(/```json\\n([\s\S]*?)\\n?```/);
             if (match && match[1]) {
                 try {
                     jsonData = JSON.parse(match[1]);
                     console.log('Successfully parsed JSON from within markdown block.');
                 } catch (nestedParseError) {
                    console.error('Failed to parse JSON even from markdown block:', nestedParseError);
                    return null;
                 }
             } else {
                 return null;
             }
        }

        // Basic validation (can be enhanced)
        if (typeof jsonData === 'object' && jsonData !== null) {
             console.log('Successfully parsed extracted JSON data.');
            return jsonData as ExtractedPrdData;
        } else {
            console.error('Extracted data is not a valid object:', jsonData);
            return null;
        }

    } catch (error: any) {
        console.error('Error during OpenAI extraction call or JSON parsing:', error);
        if (error instanceof SyntaxError) {
            console.error("Failed to parse JSON, raw response was:", error); // Log the raw response if parsing failed
        }
        return null;
    }
}
// --- End Extraction Function ---

// --- Function to Format Extracted Data to Markdown --- 
function formatJsonToMarkdown(data: ExtractedPrdData): string {
    let markdown = `# Product Requirements Document (MVP)

`;

    markdown += `## Overview

`;
    if (data.executiveSummary) {
        markdown += `### Executive Summary
${data.executiveSummary}

`;
    }
    if (data.primaryProblem) {
        markdown += `### Primary Problem
${data.primaryProblem}

`;
    }
    if (data.targetSegments && data.targetSegments.length > 0) {
        markdown += `### Target Segments
${data.targetSegments.map(s => `- ${s}`).join('\n')}

`;
    }

    markdown += `## Product Requirements (Simplified)

`;
    if (data.solutionSummary) {
        markdown += `### Solution Summary
${data.solutionSummary}

`;
    }
    if (data.keyMetrics && data.keyMetrics.length > 0) {
        markdown += `### Key Success Metrics
${data.keyMetrics.map(m => `- ${m}`).join('\n')}

`;
    }

    markdown += `## Risks & Assumptions

`;
    if (data.risksAssumptions) {
        markdown += `${data.risksAssumptions}
`;
    }

    return markdown.trim();
}
// --- End Formatting Function ---

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Initialize Supabase Client (outside try/catch for clearer error handling if it fails)
    let supabase;
    try {
        supabase = createServerSupabaseClient({ req, res });
    } catch (initError) {
        console.error('Failed to initialize Supabase client:', initError);
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const sessionId = 'test-session'; // Hardcoded session ID for now

    try {
        console.log(`[${sessionId}] Handler started. Method: ${req.method}`);

        // --- Retrieve or Initialize Session ---
        let sessionData = sessionStore.get(sessionId);

        if (!sessionData) {
            console.log(`[${sessionId}] No existing session data found. Entering initialization block...`);

            // Fetch Initiatives
            let initiatives: { id: string, name: string }[] = [];
            try {
                const { data: fetchedInitiatives, error: dbError } = await supabase
                  .from('initiatives')
                  .select('id, name')
                  .order('created_at', { ascending: true }); // Or sort as desired

                if (dbError) {
                  console.error(`[${sessionId}] Error fetching initiatives:`, dbError);
                  // Proceed without initiatives, fallback greeting will be used
                } else if (fetchedInitiatives) {
                    initiatives = fetchedInitiatives;
                    console.log(`[${sessionId}] Successfully fetched ${initiatives.length} initiatives.`);
                }
            } catch (fetchError) {
                console.error(`[${sessionId}] Exception during initiative fetch:`, fetchError);
            }

            // Construct Initial Message
            let initialMessageContent = "Hello! I can help you generate a Product Requirements Document (PRD).\n\n";
            if (initiatives.length > 0) {
                 initialMessageContent += "Would you like to generate a PRD for an existing initiative or a new one?\n\n";
                 initiatives.forEach((initiative, index) => {
                    initialMessageContent += `${index + 1}. ${initiative.name}\n`;
                 });
                 initialMessageContent += "New - Start a PRD for a completely new initiative.\n\nPlease reply with the number of the initiative or the word \"New\".";
            } else {
                initialMessageContent += "Let's start creating a new PRD. First, what's the executive summary?";
            }
            console.log(`[${sessionId}] Constructed initial message content (first 100 chars): ${initialMessageContent.substring(0,100)}`);

            const initialAssistantMessage: ChatMessage = { role: 'assistant', content: initialMessageContent };

            // Initialize session data
            sessionData = {
                history: [systemPrompt, initialAssistantMessage],
                availableInitiatives: initiatives.length > 0 ? initiatives : undefined, // Store if fetched
                selectedInitiativeId: null,
                isNewInitiative: initiatives.length === 0 ? true : undefined, // Assume new if no initiatives exist
            };
            sessionStore.set(sessionId, sessionData);

            // Return the initial greeting immediately
            console.log(`[${sessionId}] Initialization complete. Sending initial greeting response.`);
            return res.status(200).json({ reply: initialAssistantMessage.content });
        } else {
             console.log(`[${sessionId}] Found existing session data. Skipping initialization.`);
        }
        // --- End Session Initialization ---

        // --- Request Body Validation ---
        const { message: newUserMessage } = req.body;
        if (!newUserMessage || typeof newUserMessage !== 'object' || !newUserMessage.role || !newUserMessage.content) {
            return res.status(400).json({ message: 'Request body must contain a valid message object { role: \'user\', content: string }' });
        }
        if (newUserMessage.role !== 'user') {
            return res.status(400).json({ message: 'Message role must be \'user\'' });
        }
        // --- End Request Body Validation ---

        // --- Check for End Trigger Command ---
        const isDoneCommand = newUserMessage.content.trim().toLowerCase() === '/done';
        // --- End Trigger Check ---

        // Retrieve history from session data for potential use
        let currentHistory = sessionData.history;

        // --- Handle Generation Request (/done) ---
        if (isDoneCommand) {
            // Prevent /done if initiative selection is still pending
            const needsSelection = sessionData.isNewInitiative === undefined && sessionData.availableInitiatives && sessionData.availableInitiatives.length > 0;
            if(needsSelection) {
                console.log(`[${sessionId}] /done received but initiative selection pending. Re-prompting.`);
                const initialGreeting = sessionData.history.find(m => m.role === 'assistant')?.content || "";
                const listPart = initialGreeting.split('\n\n').slice(1).join('\n\n');
                const repromptContent = `Please select an initiative or 'New' first.

${listPart}`;
                 return res.status(200).json({ reply: repromptContent });
            }

            console.log(`[${sessionId}] Received /done command. Attempting extraction...`);
            const extractedData = await extractPrdData(currentHistory); // Pass current history (without /done)

            if (extractedData) {
                const markdownOutput = formatJsonToMarkdown(extractedData);
                // Clear session data after successful generation
                sessionStore.delete(sessionId);
                console.log(`[${sessionId}] PRD generated and session cleared.`);
                // Return the generated Markdown
                return res.status(200).json({ markdown: markdownOutput });
            } else {
                console.log(`[${sessionId}] Extraction failed.`);
                // Don't clear history if extraction failed
                return res.status(500).json({ message: 'Failed to extract PRD data from conversation. Please check logs or try adding more detail.' });
            }
        }
        // --- End Generation Request Handling ---

        // --- Handle First User Response (Initiative Selection) ---
        // Check if selection hasn't been made yet (isNewInitiative is undefined) and initiatives were presented
        const needsSelection = sessionData.isNewInitiative === undefined && sessionData.availableInitiatives && sessionData.availableInitiatives.length > 0;

        if (needsSelection) {
            console.log(`[${sessionId}] Handling first user response for initiative selection.`);
            const inputText = newUserMessage.content.trim().toLowerCase();
            const availableInitiatives = sessionData.availableInitiatives!; // Safe due to check above
            let selectionValid = false;
            let acknowledgementContent = "";
            let selectedInitiativeName = "";

            // Try parsing as number
            const selectedNumber = parseInt(inputText, 10);
            if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= availableInitiatives.length) {
                const selectedInitiative = availableInitiatives[selectedNumber - 1];
                sessionData.selectedInitiativeId = selectedInitiative.id;
                sessionData.isNewInitiative = false;
                selectionValid = true;
                selectedInitiativeName = selectedInitiative.name;
                acknowledgementContent = `Okay, let's start a PRD for '${selectedInitiativeName}'. First, what's the executive summary?`;
                console.log(`[${sessionId}] User selected initiative #${selectedNumber}: ${selectedInitiativeName}`);
            } else if (inputText === 'new') {
                sessionData.selectedInitiativeId = null;
                sessionData.isNewInitiative = true;
                selectionValid = true;
                acknowledgementContent = "Okay, let's start a new PRD. First, what's the executive summary?";
                console.log(`[${sessionId}] User selected 'New'.`);
            }

            if (selectionValid) {
                // Add user selection message to history
                sessionData.history.push(newUserMessage);
                // Create and add acknowledgement message to history
                const acknowledgementMessage: ChatMessage = { role: 'assistant', content: acknowledgementContent };
                sessionData.history.push(acknowledgementMessage);
                // Update session store
                sessionStore.set(sessionId, sessionData);
                // Return acknowledgement message
                return res.status(200).json({ reply: acknowledgementContent });
            } else {
                 console.log(`[${sessionId}] Invalid selection: '${newUserMessage.content}'. Re-prompting.`);
                // Invalid selection, re-prompt
                const initialGreeting = sessionData.history.find(m => m.role === 'assistant')?.content || "";
                const listPart = initialGreeting.split('\n\n').slice(1).join('\n\n');
                const repromptContent = `Sorry, I didn't understand that. Please reply with the number of the initiative or the word "New".

${listPart}`;
                return res.status(200).json({ reply: repromptContent });
                // Note: We don't add the invalid user message or the re-prompt to history here.
            }
        }
        // --- End First User Response Handling ---

        // --- Normal Conversation Turn --- 
        console.log(`[${sessionId}] Handling normal conversation turn.`);
        // Add the new user message to the history for this turn
        const updatedHistory = [...currentHistory, newUserMessage];

        console.log(`[${sessionId}] History sent to OpenAI (conversation):`, updatedHistory.map(m => ({ role: m.role, content: m.content.substring(0, 100) + '...' }))); // Log snippet

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: updatedHistory,
                temperature: 0.7,
            });

            const replyContent = completion.choices[0]?.message?.content;
            const assistantMessage = completion.choices[0]?.message;

            if (!replyContent || !assistantMessage) {
                console.error('OpenAI response missing content or message structure:', completion);
                return res.status(500).json({ message: 'Failed to get valid reply structure from AI' });
            }

            // Store Updated History (including this turn's user + assistant messages)
            sessionData.history = [...updatedHistory, assistantMessage as ChatMessage]; // Update history in sessionData
            sessionStore.set(sessionId, sessionData); // Save updated session data
            console.log(`[${sessionId}] Updated stored history (conversation turn).`);

            // Return the latest AI reply content
            return res.status(200).json({ reply: replyContent });

        } catch (aiError: any) {
            console.error(`[${sessionId}] Error calling OpenAI API (conversation):`, aiError);
            const statusCode = aiError.status || 500;
            const errorMessage = aiError.message || 'Failed to communicate with AI service';
            return res.status(statusCode).json({ message: errorMessage });
        }
        // --- End Normal Conversation Turn ---

    } catch (error: any) {
        console.error(`[${sessionId}] Unhandled error in API handler:`, error);
        return res.status(500).json({ message: 'An unexpected error occurred on the server.' });
    }
} 