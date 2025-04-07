import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'; // Import Supabase client helper
import { Database } from '@/types/supabase'; // Import generated types

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
    retrievedRawContext?: Partial<Database['public']['Tables']['initiatives']['Row']>; // Store fetched details
    ragFetchError?: string; // Store user-facing error if fetch fails
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
If the user selects an existing initiative, context about it (like name, value lever, uplift, confidence, effort) might be provided in a separate system message. Use this context to tailor your follow-up questions where relevant.
Once the user selects an initiative or 'New', acknowledge their choice and then guide them sequentially through these sections:
1. Overview: Ask for Executive Summary, then Primary Problem, then Target Segments.
2. Product Requirements (Simplified): Ask for Solution Summary, then Key Success Metrics. **Specifically, when asking for Key Success Metrics, relate your question to the initiative's 'Value Lever' if context was provided.**
3. Risks & Assumptions: Ask for major risks or assumptions.
Once the user has provided input for risks/assumptions, inform them they can type /done to generate the PRD.
Keep your responses concise. Acknowledge the user's input for one section before prompting for the next piece of information within that section or moving to the next section.`,
};
// --- End System Prompt ---

// --- Function to Extract PRD Data using OpenAI --- 
// Pass sessionId for logging purposes
async function extractPrdData(history: ChatMessage[], sessionId: string): Promise<ExtractedPrdData | null> {
    console.log(`[${sessionId}] Attempting to extract PRD data from history...`);
    
    // Filter out system messages (except main), the final /done command, 
    // AND the assistant message immediately preceding the /done command if it prompts for it.
    const historyForExtraction = history.filter((msg, index, arr) => {
        const isLastMessage = index === arr.length - 1;
        const isSecondLastMessage = index === arr.length - 2;

        // Exclude the very last message if it's the /done command
        if (isLastMessage && msg.role === 'user' && msg.content.toLowerCase() === '/done') {
            return false;
        }

        // Exclude the second-to-last message IF the last message was /done and this one is the assistant prompting for it
        if (isSecondLastMessage && 
            arr[arr.length - 1]?.role === 'user' && 
            arr[arr.length - 1]?.content.toLowerCase() === '/done' && 
            msg.role === 'assistant' && 
            msg.content.includes('/done')) { 
            console.log(`[${sessionId}] Filtering out assistant prompt preceding /done.`); 
            return false;
        }

        // Keep the original system prompt, discard other system messages (like RAG context)
        if (msg.role === 'system' && msg.content !== systemPrompt.content) {
            return false;
        }
        // Keep all other messages
        return true;
    });

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
        Conversation History:` // Keep this note for clarity, but don't include the actual history string here.
    };
    
    // === Log the messages being sent for extraction ===
    console.log("--- DEBUG: Messages for Extraction Call START ---");
    // Log the messages array directly
    console.log([extractionPrompt, ...historyForExtraction]); 
    console.log("--- DEBUG: Messages for Extraction Call END ---");
    // === End logging ===

    // Construct the messages array correctly
    const extractionMessages: ChatMessage[] = [
        extractionPrompt, 
        ...historyForExtraction // Spread the filtered history messages directly
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', // <-- Use gpt-4o for extraction
            messages: extractionMessages,
            temperature: 0.2, // Lower temperature for more deterministic JSON output
            response_format: { type: "json_object" }, // Force JSON output mode
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
             const match = replyContent.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
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
        // Use Database generic for type safety
        supabase = createServerSupabaseClient<Database>({ req, res });
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
                 initialMessageContent += `${initiatives.length + 1}. New Initiative\n\n`;
                 initialMessageContent += "Please reply with the number of your choice.";
             } else {
                 initialMessageContent += "Let's start creating a new PRD. What is the executive summary?"; // Fallback if no initiatives
            }

            const initialAssistantMessage: ChatMessage = {
                role: 'assistant',
                content: initialMessageContent,
            };

            // Initialize session data
            sessionData = {
                 history: [systemPrompt, initialAssistantMessage],
                 availableInitiatives: initiatives, // Store for later validation
                 selectedInitiativeId: undefined,
                 isNewInitiative: undefined,
                 retrievedRawContext: undefined, // Initialize RAG fields
                 ragFetchError: undefined,
             };
            sessionStore.set(sessionId, sessionData);

            console.log(`[${sessionId}] Session initialized. Sending initial greeting.`);
             // Return only the initial assistant message to the client
             return res.status(200).json({ message: initialAssistantMessage, ragError: null });

        } else {
             console.log(`[${sessionId}] Existing session found. Processing user message.`);
             // Existing session, process the incoming message
            const { message: userMessageContent } = req.body;

            // --- Handle Refresh Initialization --- 
            if (userMessageContent === '__INITIALIZE__') {
                console.log(`[${sessionId}] Received __INITIALIZE__ on existing session. Sending last message.`);
                const lastMessage = sessionData.history[sessionData.history.length - 1];
                // Also check if there was a pending RAG error from the *previous* turn
                const lastRagError = sessionData.ragFetchError; 
                return res.status(200).json({ message: lastMessage, ragError: lastRagError || null });
            }
            // --- End Handle Refresh Initialization ---

            if (!userMessageContent || typeof userMessageContent !== 'string' || userMessageContent.trim() === '') {
                return res.status(400).json({ message: 'Message content is required.' });
            }

            const userMessage: ChatMessage = { role: 'user', content: userMessageContent.trim() };

            // Add user message to history *before* checking for /done or processing selection
            sessionData.history.push(userMessage);
            console.log(`[${sessionId}] Added user message to history. History length: ${sessionData.history.length}`);

             // --- Handle Initiative Selection OR /done OR Normal Turn --- 
             let requiresOpenAICall = true; // Assume we need to call OpenAI unless an early exit happens

            // 1. Check if Initiative Selection is needed
            if (sessionData.selectedInitiativeId === undefined) {
                 console.log(`[${sessionId}] Processing initiative selection response.`);
                 let selectedOptionText = '';
                 let isValidSelection = false;
                 // let ragError = null; // RAG error is now part of sessionData

                 try {
                    const selectedIndex = parseInt(userMessage.content, 10) - 1;
                    const numAvailable = sessionData.availableInitiatives?.length ?? 0;

                    if (selectedIndex >= 0 && selectedIndex < numAvailable) {
                         // Selected an existing initiative
                         const selectedInitiative = sessionData.availableInitiatives![selectedIndex];
                         sessionData.selectedInitiativeId = selectedInitiative.id;
                         sessionData.isNewInitiative = false;
                         selectedOptionText = `Selected Initiative: ${selectedInitiative.name}`; // For history
                         isValidSelection = true;
                         console.log(`[${sessionId}] User selected existing initiative: ID ${selectedInitiative.id}, Name: ${selectedInitiative.name}`);

                        // --- RAG Fetch Logic --- 
                        try {
                            console.log(`[${sessionId}] Attempting RAG fetch for initiative ID: ${sessionData.selectedInitiativeId}`);
                            const { data: initiativeDetails, error: dbError } = await supabase
                                .from('initiatives')
                                .select('name, value_lever, uplift, confidence, effort_estimate') 
                                .eq('id', sessionData.selectedInitiativeId)
                                .single();

                            if (dbError) {
                                console.error(`[${sessionId}] RAG Fetch Error:`, dbError);
                                sessionData.retrievedRawContext = undefined;
                                sessionData.ragFetchError = "Sorry, I couldn't retrieve the specific details for that initiative right now. Let's continue with the general questions.";
                            } else if (initiativeDetails) {
                                console.log(`[${sessionId}] RAG Fetch Success.`);
                                sessionData.retrievedRawContext = initiativeDetails;
                                sessionData.ragFetchError = undefined;
                            } else {
                                console.warn(`[${sessionId}] RAG Fetch Warning: No details found.`);
                                sessionData.retrievedRawContext = undefined;
                            }
                        } catch (fetchCatchError) {
                             console.error(`[${sessionId}] RAG Fetch Exception:`, fetchCatchError);
                             sessionData.retrievedRawContext = undefined;
                             sessionData.ragFetchError = "Sorry, an unexpected error occurred while fetching initiative details.";
                        }
                         // --- End RAG Fetch Logic ---

                     } else if (selectedIndex === numAvailable) {
                         // Selected "New Initiative"
                         sessionData.selectedInitiativeId = null; 
                         sessionData.isNewInitiative = true;
                         selectedOptionText = "Selected: New Initiative"; 
                         isValidSelection = true;
                         console.log(`[${sessionId}] User selected New Initiative.`);
                         sessionData.retrievedRawContext = undefined;
                         sessionData.ragFetchError = undefined;
                     } // else: Invalid number handled below

                 } catch (e) {
                    // Handle non-numeric input, which is also invalid here
                    console.log(`[${sessionId}] Invalid selection input (not a number).`);
                    isValidSelection = false; 
                 }

                 if (!isValidSelection) {
                     // Invalid selection, ask again
                     const replyMessage: ChatMessage = {
                         role: 'assistant',
                         content: "Sorry, that wasn't a valid selection. Please enter the number corresponding to your choice.",
                     };
                     // IMPORTANT: Remove the invalid user message from history before saving/responding
                     sessionData.history.pop(); 
                     sessionStore.set(sessionId, sessionData); 
                     requiresOpenAICall = false; // Don't call OpenAI after invalid selection
                     return res.status(200).json({ message: replyMessage, ragError: sessionData.ragFetchError || null });
                 } 
                 // If selection was valid, requiresOpenAICall remains true, and we proceed below
            }

            // 2. Check for /done command (only if selection is complete)
            // Note: This condition is now checked even immediately after a valid selection
            if (sessionData.selectedInitiativeId !== undefined && userMessage.content.toLowerCase() === '/done') {
                console.log(`[${sessionId}] /done command received. Generating Markdown.`);
                const extractedData = await extractPrdData(sessionData.history, sessionId);
                requiresOpenAICall = false; // Don't call OpenAI after /done

                if (extractedData) {
                    const markdown = formatJsonToMarkdown(extractedData);
                    console.log(`[${sessionId}] Markdown generated successfully.`);
                    // Return the markdown content directly in the 'message' field for simplicity? Or a dedicated field? Let's use 'markdown'.
                    return res.status(200).json({ markdown: markdown, ragError: null }); 
                } else {
                    console.error(`[${sessionId}] Failed to extract data or format Markdown.`);
                    const errorMessage: ChatMessage = {
                        role: 'assistant',
                        content: "Sorry, I encountered an error while trying to generate the PRD. Please check the conversation or try again.",
                    };
                    // Don't alter history on failure, just return error
                    return res.status(500).json({ message: errorMessage, ragError: null }); 
                }
            }
            
            // 3. Handle Normal Conversation Turn (if no early exit occurred)
            if (requiresOpenAICall) { 
                console.log(`[${sessionId}] Processing normal turn (or turn after valid selection).`);
                // --- Prepare and Call OpenAI for a standard turn ---
                const messagesForOpenAI: ChatMessage[] = [systemPrompt]; 

                // Add RAG context message if available 
                if (sessionData.retrievedRawContext) { // Check if context exists (implies existing initiative selected)
                    const contextContent = `Context for the selected initiative ('${sessionData.retrievedRawContext.name || 'N/A'}'):\n- Value Lever: ${sessionData.retrievedRawContext.value_lever || 'N/A'}\n- Uplift: ${sessionData.retrievedRawContext.uplift || 'N/A'}%\n- Confidence: ${sessionData.retrievedRawContext.confidence || 'N/A'}%\n- Effort Estimate: ${sessionData.retrievedRawContext.effort_estimate || 'N/A'} days`;
                    messagesForOpenAI.push({ role: 'system', content: contextContent });
                    console.log(`[${sessionId}] Added RAG context message to OpenAI prompt.`);
                }

                // Add the rest of the history (excluding non-primary system messages)
                messagesForOpenAI.push(...sessionData.history.filter(msg => msg.role === 'user' || msg.role === 'assistant'));

                console.log(`[${sessionId}] Sending ${messagesForOpenAI.length} messages to OpenAI.`);

                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o', 
                    messages: messagesForOpenAI,
                    temperature: 0.7, 
                });

                const assistantReply = completion.choices[0]?.message;

                if (!assistantReply || !assistantReply.content) {
                    console.error(`[${sessionId}] OpenAI response missing content.`);
                    const errorMessage: ChatMessage = {
                        role: 'assistant',
                        content: "Sorry, I encountered an issue communicating with the AI. Please try again.",
                    };
                    // Remove the user message that caused the error? Maybe not, let user retry.
                    return res.status(500).json({ message: errorMessage, ragError: null }); 
                }

                console.log(`[${sessionId}] Received reply from OpenAI.`);
                sessionData.history.push(assistantReply as ChatMessage); // Add AI reply to history

                // Retrieve RAG error that might have been set during initiative selection
                const responseRagError = sessionData.ragFetchError;
                sessionData.ragFetchError = undefined; // Clear error after use

                sessionStore.set(sessionId, sessionData); // Save updated session

                console.log(`[${sessionId}] Sending assistant reply to client. RAG Error: ${responseRagError}`);
                res.status(200).json({ message: assistantReply, ragError: responseRagError || null });
            } // End of normal turn processing / OpenAI call block
            
        } // End of existing session processing block

    } catch (error: any) {
        console.error(`[${sessionId}] Unhandled error in API handler:`, error);
        res.status(500).json({ message: 'An unexpected server error occurred.', error: error.message });
    }
}