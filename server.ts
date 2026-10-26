import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  parseNaturalCommandOffline,
  generateTradeOffScenariosOffline,
  interrogateVendorQuoteOffline,
} from './src/services/offlineFallback.ts';
import { processAssistantOffline } from './src/services/assistantEngine.ts';
import { sanitizeInput } from './src/utils/sanitize.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  // Initialize Gemini if API key is provided
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
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

  // 1. Natural Language Command Parser Route
  app.post('/api/gemini/parse-command', async (req, res) => {
    const { input, currentState } = req.body;
    const sanitized = sanitizeInput(input || '');

    if (!sanitized) {
      return res.status(400).json({ error: 'Command text is required.' });
    }

    if (!ai) {
      const offlineResult = parseNaturalCommandOffline(sanitized, currentState);
      return res.json(offlineResult);
    }

    try {
      const prompt = `You are the core natural language command engine for "shubharambh." - a fintech event OS.
Input text from user: "${sanitized}"
Current event vendors: ${JSON.stringify(currentState?.budgetItems?.map((b: any) => ({ name: b.vendorName, category: b.category })) || [])}

Parse the input into exact actionType:
- 'VENDOR_PAYMENT' if user mentions paying a vendor or advance
- 'GUEST_HEADCOUNT' if user mentions guests arriving, attending, veg/non-veg counts
- 'CATERER_PLATE' if user mentions caterer plate count claimed
- 'TASK_STATUS' if user mentions task delay, cancellation, or completion
- 'SHAGUN_ENTRY' if user mentions receiving shagun / gift money
- 'UNKNOWN' if ambiguous

Extract structured mutations and a concise, crisp human confirmation toast message.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actionType: {
                type: Type.STRING,
                description: 'VENDOR_PAYMENT, GUEST_HEADCOUNT, CATERER_PLATE, TASK_STATUS, SHAGUN_ENTRY, or UNKNOWN',
              },
              toastMessage: {
                type: Type.STRING,
                description: 'Clean user-facing confirmation toast message',
              },
              mutations: {
                type: Type.OBJECT,
                properties: {
                  vendorPayment: {
                    type: Type.OBJECT,
                    properties: {
                      vendorIdOrName: { type: Type.STRING },
                      amountPaid: { type: Type.NUMBER },
                      paymentMode: { type: Type.STRING },
                    },
                  },
                  guestAdjustment: {
                    type: Type.OBJECT,
                    properties: {
                      deltaGuests: { type: Type.NUMBER },
                      isNonVegDelta: { type: Type.NUMBER },
                      isDrinkingDelta: { type: Type.NUMBER },
                    },
                  },
                  catererPlates: {
                    type: Type.OBJECT,
                    properties: {
                      claimedPlates: { type: Type.NUMBER },
                    },
                  },
                  taskStatus: {
                    type: Type.OBJECT,
                    properties: {
                      taskQuery: { type: Type.STRING },
                      newStatus: { type: Type.STRING },
                      delayDays: { type: Type.NUMBER },
                    },
                  },
                  shagun: {
                    type: Type.OBJECT,
                    properties: {
                      guestName: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      mode: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            required: ['actionType', 'toastMessage'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error) {
      console.warn('Gemini command parser error, using deterministic fallback:', error);
      const fallbackResult = parseNaturalCommandOffline(sanitized, currentState);
      return res.json(fallbackResult);
    }
  });

  // 2. AI Trade-off Scenarios Generator Route
  app.post('/api/gemini/rebalance-tradeoffs', async (req, res) => {
    const { budgetItems, deficitRupees, guestDelta, timelineDaysShift } = req.body;

    if (!ai) {
      const fallbackPlans = generateTradeOffScenariosOffline(
        budgetItems || [],
        Number(deficitRupees) || 50000,
        Number(guestDelta) || 0,
        Number(timelineDaysShift) || 0
      );
      return res.json({ plans: fallbackPlans });
    }

    try {
      const prompt = `You are the financial crisis & dependency rebalancer for "shubharambh."
Mathematical Deficit to solve: ₹${deficitRupees}
Guest Surge: +${guestDelta} attendees
Timeline Shift: ${timelineDaysShift} days earlier.
Budget line items: ${JSON.stringify(budgetItems)}

CRITICAL GUARDRAIL:
Items with priorityRank === 1 are strictly [LOCKED] and MUST NEVER HAVE ANY BUDGET CUTS.
Cuts must come exclusively from priorityRank 3, 4, and 5 (flexible categories like floral decor, stationery, photo drone tiers).
Generate 3 distinct, mathematically sound Trade-Off Plans that total to the deficit.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plans: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    categoryAdjustments: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          category: { type: Type.STRING },
                          deltaRupees: { type: Type.NUMBER },
                          konkretAction: { type: Type.STRING },
                        },
                        required: ['category', 'deltaRupees', 'konkretAction'],
                      },
                    },
                    timelineMitigation: { type: Type.STRING },
                    riskRating: { type: Type.STRING },
                    totalSavingsRupees: { type: Type.NUMBER },
                  },
                  required: ['id', 'title', 'summary', 'categoryAdjustments', 'timelineMitigation', 'riskRating', 'totalSavingsRupees'],
                },
              },
            },
            required: ['plans'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error) {
      console.warn('Gemini trade-off error, using deterministic fallback:', error);
      const fallbackPlans = generateTradeOffScenariosOffline(
        budgetItems || [],
        Number(deficitRupees) || 50000,
        Number(guestDelta) || 0,
        Number(timelineDaysShift) || 0
      );
      return res.json({ plans: fallbackPlans });
    }
  });

  // 3. Vendor Quote Interrogator Route
  app.post('/api/gemini/interrogate-quote', async (req, res) => {
    const { rawQuoteText, budgetContext } = req.body;
    const sanitized = sanitizeInput(rawQuoteText || '');

    if (!sanitized) {
      return res.status(400).json({ error: 'Quote text is required.' });
    }

    if (!ai) {
      const fallbackAnalysis = interrogateVendorQuoteOffline(sanitized, budgetContext || { targetBudget: 150000 });
      return res.json(fallbackAnalysis);
    }

    try {
      const prompt = `You are a forensic Indian wedding & event vendor contract interrogator for "shubharambh."
Raw Vendor WhatsApp Quote:
"""
${sanitized}
"""
Target Allocated Budget: ₹${budgetContext?.targetBudget || 150000}

Extract:
1. Vendor name & quoted total
2. Per plate cost (if catering)
3. Included items list
4. Hidden costs, traps, and unbilled liabilities (e.g. 18% GST excluded, diesel generator charges, corkage fees, plate count minimum locks, setup overtime)
5. Whether it is within budget
6. 5 sharp, copyable WhatsApp negotiation questions`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vendorName: { type: Type.STRING },
              quotedTotal: { type: Type.NUMBER },
              perPlateCost: { type: Type.NUMBER },
              includedItems: { type: Type.ARRAY, items: { type: Type.STRING } },
              hiddenCostsAndTraps: { type: Type.ARRAY, items: { type: Type.STRING } },
              isWithinBudget: { type: Type.BOOLEAN },
              negotiationQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              summaryNote: { type: Type.STRING },
            },
            required: ['vendorName', 'quotedTotal', 'includedItems', 'hiddenCostsAndTraps', 'isWithinBudget', 'negotiationQuestions', 'summaryNote'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error) {
      console.warn('Gemini interrogator error, using deterministic fallback:', error);
      const fallbackAnalysis = interrogateVendorQuoteOffline(sanitized, budgetContext || { targetBudget: 150000 });
      return res.json(fallbackAnalysis);
    }
  });

  // 4. Host AI Assistant (Ideas & Anomaly Engine)
  app.post('/api/ai/assistant', async (req, res) => {
    const { message, eventState } = req.body;
    const sanitized = sanitizeInput(message || '');

    if (!sanitized) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    if (!ai) {
      const offlineResult = processAssistantOffline(sanitized, eventState);
      return res.json(offlineResult);
    }

    try {
      const budgetNum = Number(eventState?.totalBudget) || 50000;
      const guestNum = Number(eventState?.guestCount) || 25;
      const eventName = eventState?.name || 'Celebration';

      const prompt = `You are "shubharambh Brain" — an elite, hyper-contextual AI strategist and financial architect for Indian celebrations and life milestones.

EVENT CONTEXT:
- Event Name: "${eventName}"
- Budget Cap: ₹${budgetNum} (INR)
- Expected Guests: ${guestNum} attendees
- Current Line Items (Vendors, Shopping & Advances): ${JSON.stringify(eventState?.vendors || [])}
- Tasks & Deadlines: ${JSON.stringify(eventState?.tasks || [])}
- Host Query: "${sanitized}"

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
                description: 'Culturally astute, context-rich response with bullet points tailored to the specific budget and event type',
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
      return res.json({
        reply: parsed.reply,
        isAnomaly: !!parsed.isAnomaly,
        anomalyData: parsed.isAnomaly ? {
          calculatedDeficit: parsed.calculatedDeficit || 0,
          guestCountDelta: parsed.guestCountDelta || 0,
          budgetDropPercent: parsed.budgetDropPercent || 0,
          newBudgetCap: parsed.newBudgetCap || eventState?.totalBudget,
          recommendations: parsed.recommendations || [],
          vendorAdjustments: parsed.vendorAdjustments || [],
        } : null,
      });
    } catch (err) {
      console.warn('Gemini assistant route error, using deterministic fallback:', err);
      const fallback = processAssistantOffline(sanitized, eventState);
      return res.json(fallback);
    }
  });

  // 5. Intelligent Event Plan & Ledger Generator
  app.post('/api/ai/generate-event-plan', async (req, res) => {
    const { name, totalBudget, guestCount, date } = req.body;
    const sanitizedName = sanitizeInput(name || 'Celebration');
    const budgetNum = Number(totalBudget) || 50000;
    const guestNum = Number(guestCount) || 25;

    const fallbackPlan = () => {
      const isMicro = budgetNum < 35000 || guestNum <= 25;
      const isRitual =
        sanitizedName.toLowerCase().includes('puja') ||
        sanitizedName.toLowerCase().includes('griha') ||
        sanitizedName.toLowerCase().includes('haldi') ||
        sanitizedName.toLowerCase().includes('mehendi') ||
        sanitizedName.toLowerCase().includes('godh');

      if (isMicro) {
        return {
          vendors: [
            { id: `v-${Date.now()}-1`, name: 'Custom Photo Cake & Desserts', category: 'Catering', cost: Math.round(budgetNum * 0.28), status: 'Booked' },
            { id: `v-${Date.now()}-2`, name: 'Food Platters & Beverage Crate', category: 'Catering', cost: Math.round(budgetNum * 0.42), status: 'Pending' },
            { id: `v-${Date.now()}-3`, name: 'Fairy Lights & Polaroid Corner', category: 'Decor', cost: Math.round(budgetNum * 0.12), status: 'Pending' },
          ],
          tasks: [
            { id: `t-${Date.now()}-1`, title: 'Order custom cake with custom design', deadlineGroup: '1 Month Out', dueDate: 'TBD', completed: true },
            { id: `t-${Date.now()}-2`, title: 'Curate party playlist & test sound system', deadlineGroup: 'Week Of', dueDate: 'TBD', completed: false },
            { id: `t-${Date.now()}-3`, title: 'Confirm RSVP head count & order bulk platters', deadlineGroup: 'Day Of', dueDate: 'TBD', completed: false },
          ],
        };
      }
      if (isRitual) {
        return {
          vendors: [
            { id: `v-${Date.now()}-1`, name: 'Pandit Ji Dakshina & Puja Samagri', category: 'Ritual', cost: Math.round(budgetNum * 0.18), status: 'Booked' },
            { id: `v-${Date.now()}-2`, name: 'Traditional Halwai & Prasad Feast', category: 'Catering', cost: Math.round(budgetNum * 0.42), status: 'Booked' },
            { id: `v-${Date.now()}-3`, name: 'Fresh Marigold Torans & Brass Urulis', category: 'Decor', cost: Math.round(budgetNum * 0.2), status: 'Pending' },
            { id: `v-${Date.now()}-4`, name: 'Return Gifts (Brass Diyas & Dry Fruits)', category: 'Stationery', cost: Math.round(budgetNum * 0.15), status: 'Pending' },
          ],
          tasks: [
            { id: `t-${Date.now()}-1`, title: 'Lock auspicious shubh muhurat & book Pandit Ji', deadlineGroup: '1 Month Out', dueDate: 'TBD', completed: true },
            { id: `t-${Date.now()}-2`, title: 'Procure dry puja samagri & fresh havan items', deadlineGroup: 'Week Of', dueDate: 'TBD', completed: false },
            { id: `t-${Date.now()}-3`, title: 'Organize return gifts and packaging for departing guests', deadlineGroup: 'Day Of', dueDate: 'TBD', completed: false },
          ],
        };
      }
      return {
        vendors: [
          { id: `v-${Date.now()}-1`, name: 'Primary Venue Space', category: 'Venue', cost: Math.round(budgetNum * 0.35), status: 'Booked' },
          { id: `v-${Date.now()}-2`, name: 'Catering & Beverages', category: 'Catering', cost: Math.round(budgetNum * 0.35), status: 'Booked' },
          { id: `v-${Date.now()}-3`, name: 'Ambient Decor & Floral Staging', category: 'Decor', cost: Math.round(budgetNum * 0.12), status: 'Pending' },
          { id: `v-${Date.now()}-4`, name: 'Cinematic Photography & Sound', category: 'Photography', cost: Math.round(budgetNum * 0.1), status: 'Pending' },
        ],
        tasks: [
          { id: `t-${Date.now()}-1`, title: 'Finalize venue lease agreement and deposit', deadlineGroup: '3 Months Out', dueDate: 'TBD', completed: true },
          { id: `t-${Date.now()}-2`, title: 'Lock menu tasting & verify plate count audit clauses', deadlineGroup: '1 Month Out', dueDate: 'TBD', completed: false },
          { id: `t-${Date.now()}-3`, title: 'Disburse RTGS advance payments to caterer & decorators', deadlineGroup: 'Week Of', dueDate: 'TBD', completed: false },
        ],
      };
    };

    if (!ai) {
      return res.json(fallbackPlan());
    }

    try {
      const prompt = `You are the master celebration planner for "shubharambh".
A host is planning:
- Event: "${sanitizedName}"
- Budget: ₹${budgetNum} (INR)
- Guest Count: ${guestNum} attendees
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
                    deadlineGroup: { type: Type.STRING, description: '3 Months Out, 1 Month Out, Week Of, or Day Of' },
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
      const vendorsWithIds = (parsed.vendors || []).map((v: any, i: number) => ({
        id: `v-${Date.now()}-${i}`,
        name: v.name,
        category: v.category,
        cost: Number(v.cost ?? v.actualCost ?? v.estimatedCost) || 0,
        status: v.status || 'Pending',
      }));
      const tasksWithIds = (parsed.tasks || []).map((t: any, i: number) => ({
        ...t,
        id: `t-${Date.now()}-${i}`,
      }));

      if (vendorsWithIds.length > 0) {
        return res.json({ vendors: vendorsWithIds, tasks: tasksWithIds });
      }
      return res.json(fallbackPlan());
    } catch (e) {
      console.warn('Failed to generate AI event plan with Gemini, using cultural fallback:', e);
      return res.json(fallbackPlan());
    }
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Dev mode Vite middleware or Production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`shubharambh. server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
