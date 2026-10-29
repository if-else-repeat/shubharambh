import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { processAssistantOffline } from './src/services/assistantEngine.ts';
import { sanitizeInput } from './src/utils/sanitize.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function generateDefaultEventPlan(name: string, budget: number, guests: number) {
  const isMicro = budget < 35000 || guests <= 25;
  const isRitual =
    name.toLowerCase().includes('puja') ||
    name.toLowerCase().includes('griha') ||
    name.toLowerCase().includes('haldi') ||
    name.toLowerCase().includes('mehendi') ||
    name.toLowerCase().includes('godh');

  if (isMicro) {
    return {
      vendors: [
        {
          id: `v-${Date.now()}-1`,
          name: 'Custom Photo Cake & Desserts',
          category: 'Catering',
          cost: Math.round(budget * 0.28),
          status: 'Booked' as const,
        },
        {
          id: `v-${Date.now()}-2`,
          name: 'Food Platters & Beverage Crate',
          category: 'Catering',
          cost: Math.round(budget * 0.42),
          status: 'Pending' as const,
        },
        {
          id: `v-${Date.now()}-3`,
          name: 'Fairy Lights & Polaroid Corner',
          category: 'Decor',
          cost: Math.round(budget * 0.12),
          status: 'Pending' as const,
        },
      ],
      tasks: [
        {
          id: `t-${Date.now()}-1`,
          title: 'Order custom cake with custom design',
          deadlineGroup: '1 Month Out',
          dueDate: 'TBD',
          completed: true,
        },
        {
          id: `t-${Date.now()}-2`,
          title: 'Curate party playlist & test sound system',
          deadlineGroup: 'Week Of',
          dueDate: 'TBD',
          completed: false,
        },
        {
          id: `t-${Date.now()}-3`,
          title: 'Confirm RSVP head count & order bulk platters',
          deadlineGroup: 'Day Of',
          dueDate: 'TBD',
          completed: false,
        },
      ],
    };
  }

  if (isRitual) {
    return {
      vendors: [
        {
          id: `v-${Date.now()}-1`,
          name: 'Pandit Ji Dakshina & Puja Samagri',
          category: 'Ritual',
          cost: Math.round(budget * 0.18),
          status: 'Booked' as const,
        },
        {
          id: `v-${Date.now()}-2`,
          name: 'Traditional Halwai & Prasad Feast',
          category: 'Catering',
          cost: Math.round(budget * 0.42),
          status: 'Booked' as const,
        },
        {
          id: `v-${Date.now()}-3`,
          name: 'Fresh Marigold Torans & Brass Urulis',
          category: 'Decor',
          cost: Math.round(budget * 0.2),
          status: 'Pending' as const,
        },
        {
          id: `v-${Date.now()}-4`,
          name: 'Return Gifts (Brass Diyas & Dry Fruits)',
          category: 'Stationery',
          cost: Math.round(budget * 0.15),
          status: 'Pending' as const,
        },
      ],
      tasks: [
        {
          id: `t-${Date.now()}-1`,
          title: 'Lock auspicious shubh muhurat & book Pandit Ji',
          deadlineGroup: '1 Month Out',
          dueDate: 'TBD',
          completed: true,
        },
        {
          id: `t-${Date.now()}-2`,
          title: 'Procure dry puja samagri & fresh havan items',
          deadlineGroup: 'Week Of',
          dueDate: 'TBD',
          completed: false,
        },
        {
          id: `t-${Date.now()}-3`,
          title: 'Organize return gifts and packaging for departing guests',
          deadlineGroup: 'Day Of',
          dueDate: 'TBD',
          completed: false,
        },
      ],
    };
  }

  return {
    vendors: [
      {
        id: `v-${Date.now()}-1`,
        name: 'Primary Venue Space',
        category: 'Venue',
        cost: Math.round(budget * 0.35),
        status: 'Booked' as const,
      },
      {
        id: `v-${Date.now()}-2`,
        name: 'Catering & Beverages',
        category: 'Catering',
        cost: Math.round(budget * 0.35),
        status: 'Booked' as const,
      },
      {
        id: `v-${Date.now()}-3`,
        name: 'Ambient Decor & Floral Staging',
        category: 'Decor',
        cost: Math.round(budget * 0.12),
        status: 'Pending' as const,
      },
      {
        id: `v-${Date.now()}-4`,
        name: 'Cinematic Photography & Sound',
        category: 'Photography',
        cost: Math.round(budget * 0.1),
        status: 'Pending' as const,
      },
    ],
    tasks: [
      {
        id: `t-${Date.now()}-1`,
        title: 'Finalize venue lease agreement and deposit',
        deadlineGroup: '3 Months Out',
        dueDate: 'TBD',
        completed: true,
      },
      {
        id: `t-${Date.now()}-2`,
        title: 'Lock menu tasting & verify plate count audit clauses',
        deadlineGroup: '1 Month Out',
        dueDate: 'TBD',
        completed: false,
      },
      {
        id: `t-${Date.now()}-3`,
        title: 'Disburse RTGS advance payments to caterer & decorators',
        deadlineGroup: 'Week Of',
        dueDate: 'TBD',
        completed: false,
      },
    ],
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Security headers & request body limits
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' https: http: data: blob: ws: wss:; frame-ancestors 'self' https:;"
    );
    next();
  });
  app.use(express.json({ limit: '100kb' }));

  // Initialize Gemini client if environment key is provided
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

  // 1. Host AI Assistant (Ideas & Anomaly Engine)
  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    const { message, eventState } = req.body;
    const sanitized = sanitizeInput(message || '');

    if (!sanitized) {
      return res.status(400).json({ error: 'Message text is required.' });
    }
    if (sanitized.length > 5000) {
      return res.status(400).json({ error: 'Message exceeds maximum length.' });
    }

    if (!ai) {
      const offlineResult = processAssistantOffline(sanitized, eventState);
      return res.json(offlineResult);
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
      });
    } catch (err) {
      console.warn('Gemini assistant route error, using deterministic fallback:', err);
      const fallback = processAssistantOffline(sanitized, eventState);
      return res.json(fallback);
    }
  });

  // 2. Intelligent Event Plan & Ledger Generator
  app.post('/api/ai/generate-event-plan', async (req: Request, res: Response) => {
    const { name, totalBudget, guestCount, date } = req.body;
    const sanitizedName = sanitizeInput(name || 'Celebration').slice(0, 200);
    const budgetNum = Math.min(100000000, Math.max(1000, Number(totalBudget) || 50000));
    const guestNum = Math.min(10000, Math.max(1, Number(guestCount) || 25));

    if (!ai) {
      return res.json(generateDefaultEventPlan(sanitizedName, budgetNum, guestNum));
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
      const vendorsWithIds = (parsed.vendors || []).map((v: RawVendorItem, i: number) => ({
        id: `v-${Date.now()}-${i}`,
        name: v.name || 'Expense Item',
        category: v.category || 'Other',
        cost: Number(v.cost ?? v.actualCost ?? v.estimatedCost) || 0,
        status: v.status || 'Pending',
      }));
      const tasksWithIds = (parsed.tasks || []).map((t: RawTaskItem, i: number) => ({
        ...t,
        id: `t-${Date.now()}-${i}`,
      }));

      if (vendorsWithIds.length > 0) {
        return res.json({ vendors: vendorsWithIds, tasks: tasksWithIds });
      }
      return res.json(generateDefaultEventPlan(sanitizedName, budgetNum, guestNum));
    } catch (e) {
      console.warn('Failed to generate AI event plan with Gemini, using cultural fallback:', e);
      return res.json(generateDefaultEventPlan(sanitizedName, budgetNum, guestNum));
    }
  });

  // 3. Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Dev mode Vite middleware or Production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // 5. Global error handling middleware
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Internal server error occurred.' });
  });

  // 6. Server launch with graceful termination listener
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`shubharambh server running on http://0.0.0.0:${PORT}`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`Received ${signal}. Gracefully closing HTTP server...`);
    server.close(() => {
      console.log('HTTP server closed successfully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer();
