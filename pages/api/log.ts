import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'auth.log');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, data, level = 'info' } = req.body;
    const timestamp = new Date().toISOString();
    const logMessage = `[RoadmapAI] [${timestamp}] [CLIENT] ${message}${data ? '\nData: ' + JSON.stringify(data, null, 2) : ''}\n`;

    // Append to log file
    fs.appendFileSync(LOG_FILE, logMessage);

    // Also log to console for server-side visibility
    if (level === 'error') {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error writing to log file:', error);
    res.status(500).json({ error: 'Failed to write log' });
  }
} 