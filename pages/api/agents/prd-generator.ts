import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// --- Define ChatMessage Interface locally for API --- 
interface ChatMessage {
    role: 'user' | 'assistant' | 'system'; // Include system for history
    content: string;
}
// --- End Interface Definition ---

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
const sessionStore = new Map<string, ChatMessage[]>();
// --- End Session Store ---

// --- System Prompt Definition (for conversation) ---
const systemPrompt: ChatMessage = {
    role: 'system',
    content: `You are a helpful assistant guiding a user to create a concise Product Requirements Document (PRD) for an MVP. 
Guide the user sequentially through these sections: 
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

    // Combine extraction prompt + history as the content for the extraction call
    const historyString = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
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
        const jsonData = JSON.parse(replyContent);
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
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        // --- Get Session Key ---
        const sessionId = 'test-session'; // Hardcoded for now
        // --- End Session Key ---

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

        // --- Retrieve Current History --- 
        let currentHistory = sessionStore.get(sessionId);
        if (!currentHistory) {
            currentHistory = [systemPrompt];
        }
        // --- End History Retrieval ---

        // --- Handle Generation Request (/done) --- 
        if (isDoneCommand) {
            console.log(`[${sessionId}] Received /done command. Attempting extraction...`);
            const extractedData = await extractPrdData(currentHistory); // Pass current history (without /done)

            if (extractedData) {
                const markdownOutput = formatJsonToMarkdown(extractedData);
                // Clear session history after successful generation
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

        // --- Normal Conversation Turn --- 
        // Add the new user message to the history for this turn
        const updatedHistory = [...currentHistory, newUserMessage];

        console.log(`[${sessionId}] History sent to OpenAI (conversation):`, updatedHistory);

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
            const finalHistory = [...updatedHistory, assistantMessage as ChatMessage];
            sessionStore.set(sessionId, finalHistory);
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
        console.error('Error in PRD agent handler:', error);
        return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
} 