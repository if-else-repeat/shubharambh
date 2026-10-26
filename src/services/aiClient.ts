import { EventPreset, BudgetItem, TradeOffPlan, InterrogatedQuote } from '../types/index.ts';
import {
  parseNaturalCommandOffline,
  generateTradeOffScenariosOffline,
  interrogateVendorQuoteOffline,
  ParsedCommandResult,
} from './offlineFallback.ts';

export async function parseCommand(
  input: string,
  currentState: EventPreset
): Promise<ParsedCommandResult> {
  try {
    const response = await fetch('/api/gemini/parse-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, currentState }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.info('Using client offline fallback for command parsing:', error);
    return parseNaturalCommandOffline(input, currentState);
  }
}

export async function generateTradeOffs(
  budgetItems: BudgetItem[],
  deficitRupees: number,
  guestDelta: number,
  timelineDaysShift: number
): Promise<TradeOffPlan[]> {
  try {
    const response = await fetch('/api/gemini/rebalance-tradeoffs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budgetItems,
        deficitRupees,
        guestDelta,
        timelineDaysShift,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
      return data.plans;
    }
    throw new Error('No plans array');
  } catch (error) {
    console.info('Using client offline fallback for trade-offs:', error);
    return generateTradeOffScenariosOffline(budgetItems, deficitRupees, guestDelta, timelineDaysShift);
  }
}

export async function interrogateQuote(
  rawQuoteText: string,
  budgetContext: { targetBudget: number; category?: string }
): Promise<InterrogatedQuote> {
  try {
    const response = await fetch('/api/gemini/interrogate-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawQuoteText, budgetContext }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.info('Using client offline fallback for quote interrogation:', error);
    return interrogateVendorQuoteOffline(rawQuoteText, budgetContext);
  }
}
