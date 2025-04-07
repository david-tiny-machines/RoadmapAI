import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Ensure the OpenAI API key is set in environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

// Instantiate the OpenAI client
// It automatically reads the OPENAI_API_KEY environment variable
const openai = new OpenAI();

// Placeholder for session/conversation management (to be implemented later)
// interface ConversationState {
//   history: OpenAI.Chat.ChatCompletionMessageParam[];
// }
// const conversationStore: Record<string, ConversationState> = {}; // Example: In-memory store

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Basic request body validation (expecting messages)
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Request body must contain a non-empty array of messages' });
    }

    console.log('Received messages:', messages);

    // --- Basic OpenAI Interaction (Example - can be refined) ---

    // TODO: Implement proper conversation history management
    const systemPrompt: OpenAI.Chat.ChatCompletionMessageParam = {
        role: 'system',
        content: 'You are a helpful assistant guiding a user to create a Product Requirements Document (PRD). Start by asking for the executive summary.',
    };

    const conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [
        systemPrompt,
        ...messages, // Include user's latest message(s)
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4', // Or your preferred model
            messages: conversationHistory,
            temperature: 0.7, // Adjust as needed
            // max_tokens: 150, // Limit response length if desired
        });

        const replyContent = completion.choices[0]?.message?.content;

        if (!replyContent) {
            console.error('OpenAI response missing content:', completion);
            return res.status(500).json({ message: 'Failed to get reply from AI: Empty content' });
        }

        // TODO: Update conversation history in session state

        // Return the AI's reply
        return res.status(200).json({ reply: replyContent });

    } catch (aiError: any) {
        console.error('Error calling OpenAI API:', aiError);
        // Forward OpenAI specific errors if needed, otherwise return a generic server error
        const statusCode = aiError.status || 500;
        const errorMessage = aiError.message || 'Failed to communicate with AI service';
        return res.status(statusCode).json({ message: errorMessage });
    }

    // --- End Basic OpenAI Interaction ---

    // --- Placeholder Response (if not calling OpenAI yet) ---
    // console.log('Received messages:', req.body.messages);
    // // Placeholder logic: Just acknowledge receipt and return a static message
    // const staticReply = "Hello! I am the PRD agent (Placeholder). I received your message.";
    // return res.status(200).json({ reply: staticReply });
    // --- End Placeholder Response ---

  } catch (error: any) {
    console.error('Error in PRD agent handler:', error);
    return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
} 