import { Router, Request, Response } from 'express';
import { sanitizeInput } from '../../utils/sanitize.ts';
import { generateAssistantResponse, generateAiEventPlan } from '../geminiService.ts';

export const aiRouter = Router();

/**
 * POST /api/ai/assistant
 * Handles contextual celebration strategy questions and budget shock anomalies.
 */
aiRouter.post('/assistant', async (req: Request, res: Response) => {
  const { message, eventState } = req.body;
  const sanitized = sanitizeInput(message || '');

  if (!sanitized) {
    return res.status(400).json({ error: 'Message text is required.' });
  }
  if (sanitized.length > 5000) {
    return res.status(400).json({ error: 'Message exceeds maximum length.' });
  }

  const result = await generateAssistantResponse(sanitized, eventState);
  return res.json(result);
});

/**
 * POST /api/ai/generate-event-plan
 * Generates an initial celebration ledger and chronological task list.
 */
aiRouter.post('/generate-event-plan', async (req: Request, res: Response) => {
  const { name, totalBudget, guestCount, date } = req.body;
  const sanitizedName = sanitizeInput(name || 'Celebration').slice(0, 200);
  const budgetNum = Math.min(100000000, Math.max(1000, Number(totalBudget) || 50000));
  const guestNum = Math.min(10000, Math.max(1, Number(guestCount) || 25));

  const plan = await generateAiEventPlan(sanitizedName, budgetNum, guestNum, date);
  return res.json(plan);
});
