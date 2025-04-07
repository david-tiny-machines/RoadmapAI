import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// --- Define ChatMessage Interface locally for API --- 
interface ChatMessage {
    role: 'user' | 'assistant' | 'system'; // Include system for history
    content: string;
  }
// --- End Interface Definition ---

// Ensure the OpenAI API key is set in environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

// Instantiate the OpenAI client
const openai = new OpenAI();

// --- In-memory Session Store (Non-persistent) ---
// Stores conversation history per session. Lost on server restart.
const sessionStore = new Map<string, ChatMessage[]>();
// --- End Session Store ---

// --- System Prompt Definition ---
const systemPrompt: ChatMessage = {
  role: 'system',
  content: `You are a helpful assistant guiding a user to create a concise Product Requirements Document (PRD) for an MVP. 
Guide the user sequentially through these sections: 
1. Overview: Ask for Executive Summary, then Primary Problem, then Target Segments.
2. Product Requirements (Simplified): Ask for Solution Summary, then Key Success Metrics.
3. Risks & Assumptions: Ask for major risks or assumptions.
Keep your responses concise. Acknowledge the user's input for one section before prompting for the next piece of information within that section or moving to the next section.`,
};
// --- End System Prompt --- 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // --- Get Session Key (Using hardcoded key for v0.0.5d MVP) ---
    // TODO: Replace with actual user session identification (e.g., from Supabase auth)
    const sessionId = 'test-session'; 
    // --- End Session Key ---

    // --- Request Body Validation (expecting single message object) ---
    const { message: newUserMessage } = req.body;
    if (!newUserMessage || typeof newUserMessage !== 'object' || !newUserMessage.role || !newUserMessage.content) {
      return res.status(400).json({ message: 'Request body must contain a valid message object { role: \'user\', content: string }' });
    }
    if (newUserMessage.role !== 'user') {
         return res.status(400).json({ message: 'Message role must be \'user\'', });
    }
    // --- End Request Body Validation ---

    // --- Retrieve and Update Conversation History --- 
    let currentHistory = sessionStore.get(sessionId);

    if (!currentHistory) {
      // Initialize history if not found (first interaction)
      currentHistory = [systemPrompt];
      console.log(`Initialized history for session: ${sessionId}`);
    }

    // Add the new user message to the history
    const updatedHistory = [...currentHistory, newUserMessage];
    // --- End History Management --- 

    console.log(`[${sessionId}] History sent to OpenAI:`, updatedHistory); 

    // --- Call OpenAI API --- 
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4', // Or your preferred model
        messages: updatedHistory, // Pass the full history
        temperature: 0.7, 
      });

      const replyContent = completion.choices[0]?.message?.content;
      const assistantMessage = completion.choices[0]?.message;

      if (!replyContent || !assistantMessage) {
        console.error('OpenAI response missing content or message structure:', completion);
        return res.status(500).json({ message: 'Failed to get valid reply structure from AI' });
      }

      // --- Store Updated History (including assistant reply) ---
      const finalHistory = [...updatedHistory, assistantMessage as ChatMessage]; 
      sessionStore.set(sessionId, finalHistory); 
      console.log(`[${sessionId}] Updated stored history.`);
      // --- End History Storage ---

      // Return only the latest AI reply content
      return res.status(200).json({ reply: replyContent });

    } catch (aiError: any) {
      console.error(`[${sessionId}] Error calling OpenAI API:`, aiError);
      const statusCode = aiError.status || 500;
      const errorMessage = aiError.message || 'Failed to communicate with AI service';
      return res.status(statusCode).json({ message: errorMessage });
    }
    // --- End OpenAI API Call --- 

  } catch (error: any) {
    console.error('Error in PRD agent handler:', error);
    return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
} 