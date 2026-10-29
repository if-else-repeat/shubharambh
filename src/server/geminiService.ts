import { GoogleGenAI, Type } from '@google/genai';
import { processAssistantOffline } from '../services/assistantEngine.ts';
import { generateDefaultEventPlan, GeneratedPlanResult } from './defaultPlans.ts';
import { HostEvent } from '../types/host.ts';

let aiInstance: GoogleGenAI | null = null;

/**
 * Initializes the GoogleGenAI client singleton if an API key is present.
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;

  if (process.env.GEMINI_API_KEY) {
    try {
      aiInstance = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      console.log('Gemini AI engine initialized successfully.');
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI instance, falling back to deterministic engine:', err);
    }
  } else {
    console.log('No GEMINI_API_KEY detected. Running in deterministic offline fallback mode.');
  }

  return aiInstance;
}

/**
 * Generates an assistant reply or anomaly rebalancing advice using Gemini 3.8 Flash,
 * with deterministic cultural offline fallback.
 */
export async function generateAssistantResponse(
  sanitizedMessage: string,
  eventState: HostEvent
) {
  const ai = getGeminiClient();

  if (!ai) {
    return processAssistantOffline(sanitizedMessage, eventState);
  }

  try {
    const budgetNum = Number(eventState?.totalBudget) || 50000;
    const guestNum = Number(eventState?.guestCount) || 25;
    const eventName = eventState?.name || 'Celebration';

    const prompt = `You are "shubharambh Brain": an elite, hyper-contextual AI strategist and financial architect for Indian celebrations and life milestones.

EVENT CONTEXT:
- Event Name: "${eventName}"
- Budget Cap: ₹${budgetNum} (INR)
- Expected Guests: ${guestNum} attendees
- Current Line Items (Vendors, Shopping & Advances): ${JSON.stringify(eventState?.vendors || [])}
- Tasks & Deadlines: ${JSON.stringify(eventState?.tasks || [])}
- Host Query: "${sanitizedMessage}"

CRITICAL CULTURAL & FINANCIAL REASONING RULES:
1. DEEPLY ADAPT TO THE REAL BUDGET SCALE & EVENT TYPE (NEVER USE GENERIC STATIC RATIOS):
   - Micro Gathering (₹2k - ₹25k, 5 - 25 guests, e.g. Birthday, Intimate Anniversary, Game Night, Friends Farewell):
     Do NOT propose banquet halls, 5-course buffets, or grand floral arches. Focus on: artisanal home bakery cake, bulk food platters (biryani handi, street snack boxes, pizza), DIY polaroid & warm fairy light corners, curated Spotify playlist, soft drinks & chai.
   - Puja / Ritual / Baby Shower / Housewarming / Haldi (₹25k - ₹2.5L, 30 - 100 guests, e.g. Griha Pravesh, Godh Bharai, Satyanarayan Puja, Mundan, Intimate Sangeet):
     Focus on: Pandit ji dakshina & puja samagri list, local halwai mithai (kaju katli, besan laddoo), marigold torans, brass urulis with floating tea lights, shamiana or mattress floor seating, areca nut leaf biodegradable plates, return gifts (brass diyas, dry fruit potlis), sound decibel rules.
   - Grand Wedding / Sangeet / Destination Reception (₹3L - ₹1Cr+, 100 - 1000+ guests):
     Focus on: Venue lawn contract & power generator deposits, per-plate catering buffer leakage audits (stopping counter theft), bridal lehenga & sherwani shopping (Chandni Chowk, Commercial St, T. Nagar), candid cinematography, live food stations (chaat, dahi bhalla), physical invitation boxes with dry fruits vs digital WhatsApp passes, vendor advance tranche schedules.

2. AVOID GENERIC BOT CALCULATOR RESPONSES:
   - Speak with the sharp wisdom of an experienced Indian event host who understands middle-class budgeting, "khatirdari" (warm guest hospitality), "izzat" (family dignity), and practical "jugaad".
   - If the user asks for ideas (decor, food, shopping, cards, venue, checklist): Give 3 ultra-specific, tailored, culturally astute bullet points aligned with their exact budget tier and celebration name.
   - If the user describes an ANOMALY or BUDGET SHOCK (e.g. guests surged, budget cut, unexpected cost):
     * Calculate the real financial impact based on their actual budget scale. If 10 extra guests at a ₹10,000 party, catering cost is ₹2,000 (not ₹25,000!). If 50 extra guests at a ₹15L wedding, catering cost is ₹75,000.
     * Identify real areas to absorb the shock without humiliating the host or cutting essential hospitality.
     * Return structured 'vendorAdjustments' matching their actual current vendors (or propose realistic line items) so the host can click "Apply Changes" to rebalance immediately.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description:
                'Culturally astute, context-rich response with bullet points tailored to the specific budget and event type',
            },
            isAnomaly: {
              type: Type.BOOLEAN,
              description: 'True if host requested handling an anomaly or budget shock',
            },
            calculatedDeficit: {
              type: Type.NUMBER,
              description: 'Calculated deficit in rupees, or 0 if not an anomaly',
            },
            guestCountDelta: {
              type: Type.NUMBER,
              description: 'Guest count delta if applicable, or 0',
            },
            budgetDropPercent: {
              type: Type.NUMBER,
              description: 'Budget drop percentage if mentioned, or 0',
            },
            newBudgetCap: {
              type: Type.NUMBER,
              description: 'New recommended total budget cap in rupees',
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 3 specific cost-saving actions',
            },
            vendorAdjustments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  vendorId: { type: Type.STRING },
                  name: { type: Type.STRING },
                  cutAmount: { type: Type.NUMBER },
                  newActualCost: { type: Type.NUMBER },
                  rationale: { type: Type.STRING },
                },
                required: ['name', 'cutAmount', 'newActualCost', 'rationale'],
              },
              description: 'Structured vendor budget adjustments for Apply Changes button',
            },
          },
          required: ['reply', 'isAnomaly'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      reply: parsed.reply,
      isAnomaly: Boolean(parsed.isAnomaly),
      anomalyData: parsed.isAnomaly
        ? {
            calculatedDeficit: parsed.calculatedDeficit || 0,
            guestCountDelta: parsed.guestCountDelta || 0,
            budgetDropPercent: parsed.budgetDropPercent || 0,
            newBudgetCap: parsed.newBudgetCap || eventState?.totalBudget,
            recommendations: parsed.recommendations || [],
            vendorAdjustments: parsed.vendorAdjustments || [],
          }
        : null,
    };
  } catch (err) {
    console.warn('Gemini assistant generation error, using deterministic fallback:', err);
    return processAssistantOffline(sanitizedMessage, eventState);
  }
}

/**
 * Generates an initial celebration plan and ledger using Gemini 3.8 Flash,
 * with cultural default fallback.
 */
export async function generateAiEventPlan(
  name: string,
  budget: number,
  guests: number,
  date?: string
): Promise<GeneratedPlanResult> {
  const ai = getGeminiClient();

  if (!ai) {
    return generateDefaultEventPlan(name, budget, guests);
  }

  try {
    const prompt = `You are the master celebration planner for "shubharambh".
A host is planning:
- Event: "${name}"
- Budget: ₹${budget} (INR)
- Guest Count: ${guests} attendees
- Target Date: "${date || 'Upcoming'}"

Generate a 100% custom, culturally accurate, non-generic initial plan with:
1. 3 to 5 realistic vendors / shopping items matching their EXACT budget scale. (If ₹5k birthday: cake, snacks, lights. If ₹50k puja: pandit, halwai, flowers, return gifts. If ₹10L wedding: venue, catering, photo, decor).
2. 3 to 4 realistic chronological host tasks for deadlines (e.g. 3 Months Out, 1 Month Out, Week Of, Day Of).

Return clean JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vendors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  cost: { type: Type.NUMBER, description: 'Single cost tally in rupees' },
                  status: { type: Type.STRING, description: 'Pending, Booked, or Paid' },
                },
                required: ['name', 'category', 'cost', 'status'],
              },
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  deadlineGroup: {
                    type: Type.STRING,
                    description: '3 Months Out, 1 Month Out, Week Of, or Day Of',
                  },
                  dueDate: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN },
                },
                required: ['title', 'deadlineGroup', 'dueDate', 'completed'],
              },
            },
          },
          required: ['vendors', 'tasks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    interface RawVendorItem {
      name?: string;
      category?: string;
      cost?: number;
      actualCost?: number;
      estimatedCost?: number;
      status?: 'Pending' | 'Booked' | 'Paid';
    }
    interface RawTaskItem {
      title: string;
      deadlineGroup?: string;
      dueDate?: string;
      completed?: boolean;
    }

    const vendorsWithIds = (parsed.vendors || []).map((v: RawVendorItem, i: number) => ({
      id: `v-${Date.now()}-${i}`,
      name: v.name || 'Expense Item',
      category: v.category || 'Other',
      cost: Number(v.cost ?? v.actualCost ?? v.estimatedCost) || 0,
      status: (v.status || 'Pending') as 'Pending' | 'Booked' | 'Paid',
    }));

    const tasksWithIds = (parsed.tasks || []).map((t: RawTaskItem, i: number) => ({
      ...t,
      deadlineGroup: t.deadlineGroup || 'Week Of',
      dueDate: t.dueDate || 'TBD',
      completed: Boolean(t.completed),
      id: `t-${Date.now()}-${i}`,
    }));

    if (vendorsWithIds.length > 0) {
      return { vendors: vendorsWithIds, tasks: tasksWithIds };
    }

    return generateDefaultEventPlan(name, budget, guests);
  } catch (e) {
    console.warn('Failed to generate AI event plan with Gemini, using cultural fallback:', e);
    return generateDefaultEventPlan(name, budget, guests);
  }
}
