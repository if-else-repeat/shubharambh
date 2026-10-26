# shubharambh — Celebration & Event Planner

> **Problem Statement Alignment:** GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.

---

## 1. Chosen Vertical & Problem Statement

- **Chosen Vertical:** Celebration & Event Planner
- **Target Persona:** Event hosts, families, and organizers managing:
  - **Weddings & Pre-Wedding Ceremonies** (Sangeet, Haldi, Mehendi, Receptions)
  - **Birthdays & Intimate Milestone Gatherings** (from ₹5,000 dinners to 1st birthdays)
  - **Community Events & Festivals** (Society Diwali parties, coastal NYE celebrations, puja soirees)
- **Core Mission:** Eliminate chaotic spreadsheets and fragmented messaging apps by providing an essentialist, high-utility host dashboard. It combines a **Single Cost Tally Ledger**, a **Chronological Milestone Checklist**, and an intelligent **GenAI Assistant** (`gemini-3.8-flash`) for personalized ideas and budget anomaly crisis rebalancing.

---

## 2. Approach & Architecture

Unlike generic task trackers or detached chat bots, **shubharambh** tightly couples financial accounting with dynamic generative intelligence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   shubharambh Host Dashboard                           │
├─────────────────────┬──────────────────────────┬───────────────────────┤
│   Budget & Vendors  │   Timelines & Checklist  │    GenAI Assistant    │
│  (Single Cost Tally)│   (Milestone Execution)  │  (Ideas & Anomaly OS) │
├─────────────────────┴──────────────────────────┴───────────────────────┤
│              Persistent Browser State (LocalStorage v5)                │
├────────────────────────────────────────────────────────────────────────┤
│      Server Engine (Express + Vite + @google/genai gemini-3.8-flash)   │
│           + Deterministic Offline Client Fallback Engine               │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual & Architectural Design Language
- **Strict Minimalist Palette:** Built with an intentional 3-color system:
  - Deep Obsidian Base (`#0A0A0A`)
  - Warm Haldi Amber (`#E5A91A`)
  - Crimson Red (`#C41E3A`)
- **Zero Pill / Zero Gradient Discipline:** High-contrast borders (`border-[#E5A91A]/30`), flat progress bars, zero distracting drop shadows, and clean typography (`Outfit` + `Inter`).
- **Zero Clutter:** Removed cumbersome multi-column financial splits in favor of a single clear cost tally per item. Removed nested scrollbars and all unnecessary arrow icons for a clean, linear, and tactile UI.

---

## 3. How the Solution Works

### 3.1 The 3 Dedicated Pillars & Home Shortcuts
1. **Budget & Vendors (`/budget`):**
   - Single cost tally tracking: each line item holds the real contractual cost in INR (₹).
   - Real-time three-stage status tracking: `Pending` → `Booked` → `Paid`.
   - Real-time remaining balance and budget overrun deficit calculations.
   - Inline cost editing and item deletion with instant ledger updates.

2. **Timelines & Checklist (`/checklist`):**
   - Flat, chronological milestone checklist (no cumbersome timeline blocks or confusing Gantt charts).
   - 1-click status completion toggles with completed count and progress percentage.
   - Quick filters (`All`, `Pending`, `Completed`) and fast inline task creation with due dates.

3. **GenAI Assistant (`/ai`):**
   - Connected directly to Google Gemini (`gemini-3.8-flash`).
   - Context-aware intelligence initialized with the active celebration's exact name, budget cap, guest count, vendor contracts, and tasks.
   - **Personalized Ideas:** Suggests budget-appropriate floral themes, catering concepts, return gifts, and local shopping itineraries (mithai, wedding cards, venue permits).
   - **Anomaly Engine:** When the host inputs unexpected surprises (e.g. *"Guest count surged by 50, and budget dropped by 10%"*), the AI calculates the exact deficit, identifies non-essential areas to trim, and provides an **"Apply Changes to Budget"** button that automatically recalculates and mutates the live vendor ledger.

### 3.2 Celebration Switcher & Workspace Management (`/menu`)
- Dedicated full page (not a popup modal) to switch seamlessly between multiple celebrations.
- 1-tap "Next Celebration" button right in the top sub-strip.
- Full celebration management: creation, deletion, and local database wipe.

### 3.3 New Celebration Creation
- **Option 1: Blank Slate:** Starts with a pristine 0-item ledger for manual customization.
- **Option 2: Powermax with AI Brain:** Calls Gemini to automatically tailor 3–5 initial vendors and 3–4 chronological tasks calibrated to the exact event type and budget tier.
- **First-Time / Empty State Experience:** Offers two clear actions on the landing page:
  - `+ Create Your First Celebration`
  - `Load Sample Celebrations` (preloads curated presets for weddings, birthdays, and community NYE events)

---

## 4. Explicit Assumptions Made

1. **Single Cost Tally:** Real event hosts do not need three confusing columns (estimated, actual, and advance) for simple accounting. A single cost ledger with clear payment statuses (`Pending`, `Booked`, `Paid`) provides superior clarity and faster day-of operational control.
2. **Indian Middle-Class Nuance & Practical Hospitality:** The GenAI engine assumes cultural conventions such as plate leakage audits (preventing caterers from billing phantom plates), mithai & puja samagri logistics, auspicious muhurats, and family dignity ("izzat" and "khatirdari") during budget rebalancing.
3. **Resilient Dual-Engine Operation:**
   - Server-side utilizes `process.env.GEMINI_API_KEY` with modern `@google/genai` TypeScript SDK and `gemini-3.8-flash`.
   - If the API key is unavailable or quota is exceeded, the application seamlessly activates an internal deterministic engine so all features (rebalancing, checklist suggestions, command parsing) continue to function without crashing.

---

## 5. Evaluation Criteria Alignment

| Criteria | Implementation Highlights |
| :--- | :--- |
| **Problem Statement Alignment** | Specifically designed for organizing weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas. |
| **Code Quality & Architecture** | Strict TypeScript throughout, functional React hooks, modular component boundaries, typed data models (`src/types/host.ts`), zero TypeScript or lint errors. |
| **Security & Privacy** | All API key transactions proxy through Express backend (`/api/*`). Input sanitization applied to all user queries. Zero telemetry or third-party trackers. |
| **Efficiency & Performance** | Instant load times, zero external heavy dependencies, localized browser caching (`localStorage`), sub-10MB repository size. |
| **Accessibility & Usability** | High-contrast WCAG-compliant color scheme (`#0A0A0A`, `#E5A91A`, `#C41E3A`), responsive mobile & desktop viewport presence, clear touch targets. |

---

## 6. Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional: for live Gemini API calls)
cp .env.example .env
# Set GEMINI_API_KEY=your_key_here

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
npm start
```
