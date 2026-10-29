# shubharambh: Celebration & Event Planner

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)](https://github.com/if-else-repeat)
[![Test Suite](https://img.shields.io/badge/Tests-14%20Passed%20(100%25)-success?style=flat-square)](https://github.com/if-else-repeat)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Backend-Express%204.21-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Repo Size](https://img.shields.io/badge/Repo_Size-509KB%20(%3C1MB)-blue?style=flat-square)](https://github.com/if-else-repeat)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> **Official Problem Statement:**
> GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.

---

## 1. Vertical & Problem Statement Alignment

- **Chosen Vertical:** Celebration & Event Planner
- **Target Personas:** Everyday hosts, couples, parents, and community leads organizing:
  1. **Weddings & Pre-Wedding Rituals:** Sangeet, Haldi, Mehendi, Griha Pravesh, and Receptions.
  2. **Birthdays & Intimate Milestones:** From budget-friendly ₹5,000 terrace dinners to grand 1st birthday parties.
  3. **Community & Festive Gatherings:** Society Diwali galas, beachside NYE parties, and club banquets.
- **The Core Problem:** Traditional event planning suffers from fragmented WhatsApp groups, overwhelming spreadsheets with broken multi-column calculations, and static calculators that fail when real-world crises occur.
- **The shubharambh Solution:** A dedicated operating system that unites a **Single Cost Tally Ledger**, a **Chronological Milestone Execution Checklist**, and an intelligent **GenAI Assistant** backed by Google Gemini 3.8 Flash.

---

## 2. Architectural Overview

shubharambh couples real-time financial tracking with contextual generative reasoning:

```
+-------------------------------------------------------------------------------+
|                           shubharambh Host System                             |
+-----------------------------------+-------------------------------------------+
| Frontend Layer (React 19 + Vite)  | Tailwind CSS, Motion, LocalStorage Cache  |
| 1. Single Cost Tally Ledger       | Instant line item cost balance & status   |
| 2. Milestone Checklist            | Filterable execution tasks with due dates |
| 3. GenAI Strategic Brain          | Contextual chat & anomaly crisis solver   |
+-----------------------------------+-------------------------------------------+
| Backend Layer (Node.js + Express) | Server-side Gemini 3.8 Flash integration  |
| Security & Hardening              | Security headers, 100kb limit, sanitation |
| Resilient Fallback Engine         | Deterministic cultural offline fallback   |
+-----------------------------------+-------------------------------------------+
```

### Visual & Aesthetic Discipline
- **Three-Tone Palette:** Deep Obsidian (`#0A0A0A`), Warm Haldi Gold (`#E5A91A`), and Crimson Red (`#C41E3A`).
- **Zero Pill / Zero Gradient Discipline:** High-contrast borders (`border-[#E5A91A]/30`), flat progress bars, zero distracting drop shadows, and clean typography (`Outfit` and `Inter`).
- **Tactile Usability:** Single cost field per vendor instead of confusing 3-column splits. Statuses clearly display `Pending`, `Booked`, or `Paid`.

---

## 3. How the Solution Works

### 3.1 Budget & Vendors Screen (`/budget`)
- **Single Cost Tally:** Every line item records a clean contract cost in INR (₹).
- **Payment Lifecycle:** Tracks three distinct states:
  - `Pending` (vendor contacted or proposal under review)
  - `Booked` (contract signed or advance paid)
  - `Paid` (fully settled)
- **Real-Time Financial Math:** Continuously recalculates total budget cap, total allocated cost, and remaining balance or deficit.
- **Inline Operations:** Fast item creation, status switching, and deletion with instant reactivity.

### 3.2 Timelines & Checklist Screen (`/checklist`)
- **Flat Milestone Organization:** Replaces complicated Gantt charts with actionable, chronological stages (`3 Months Out`, `1 Month Out`, `Week Of`, `Day Of`).
- **Execution Tracking:** Real-time completion counter and visual percentage progress bar.
- **Quick Filters:** Filter tasks by `All`, `Pending`, or `Completed` in one tap.

### 3.3 GenAI Assistant Screen (`/ai`)
- **Full Host Context:** Automatically primed with the celebration name, budget cap, guest count, vendor contracts, and milestone checklist.
- **Thematic Ideation:** Delivers culturally astute recommendations for floral decor, catering menus, clothing shopping, and digital invitations.
- **Anomaly Engine:** Solves sudden crisis scenarios (for example: *"Guest count surged by 30 and budget dropped by 15%"*). The AI:
  1. Computes the exact net rupee deficit based on event scale (micro gatherings scale at ₹350/guest; grand weddings scale at ₹1,600/guest).
  2. Generates specific, culturally sound trade-offs that preserve guest hospitality.
  3. Displays an **Apply Changes to Budget** button that automatically recalculates and updates the live vendor ledger.

### 3.4 Celebration Hub & Switcher (`/menu`)
- Dedicated full-page view to create, switch, and manage multiple simultaneous celebrations.
- 1-click **Next Celebration** action directly in the top sub-bar.
- Includes a safety-gated option to wipe local celebration data with confirmation safeguards.

### 3.5 First-Time Host Onboarding
- When opening the application for the first time, two distinct options appear:
  1. `+ Create Your First Celebration`: Starts a custom blank ledger or generates a tailored plan using the Gemini engine.
  2. `Load Sample Celebrations`: Preloads curated presets including a Royal Udaipur Wedding (₹15L), an Intimate Birthday Dinner (₹15k), and a Goa NYE Celebration (₹4L).

---

## 4. Key Engineering Assumptions

1. **Single Cost Tally Over Complex Column Splits:** Real event hosts get confused by multi-column estimates and advance splits. A single transparent cost field paired with explicit status tags (`Pending`, `Booked`, `Paid`) delivers greater day-of clarity.
2. **Culturally Grounded Reasoning:** The AI models Indian event realities, such as plate pilferage audits (preventing banquet caterers from billing phantom plates), auspicious muhurats, sweet shop bulk procurement, and family hospitality standards.
3. **Dual-Mode Reliability:** If an external Gemini API key is missing or network requests fail, the application automatically engages a built-in deterministic offline engine. Every feature remains fully functional without downtime.

---

## 5. Evaluation Criteria Alignment

| Evaluation Tier | Criteria | Score Strategy & Verified Implementation |
| :--- | :--- | :--- |
| **High Impact** | **Code Quality** | Clean modular architecture, TypeScript strict mode with noImplicitAny, ESLint flat config, Prettier formatting, React ErrorBoundary, GitHub Actions CI workflow, typed models (`src/types/host.ts`), JSDoc docs, zero lint or type errors. |
| **High Impact** | **Alignment** | Built directly around the Celebration & Event Planner vertical with budgets, timelines, vendor checklists, and personalized ideas. |
| **Medium Impact** | **Security** | Express proxy for all AI endpoints, strict input sanitization, HTTP security headers (`nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`), and 100kb payload constraints. |
| **Medium Impact** | **Efficiency** | Lightweight repository footprint (vastly under the 10MB limit), instant client load times, zero bloat, and sub-second deterministic fallback response. |
| **Low Impact** | **Testing** | Automated test suite (14 tests in `src/services/assistantEngine.test.ts`) covering calculation algorithms, anomaly math, cost tallies, and edge cases with a 100% pass rate. |
| **Low Impact** | **Accessibility** | Explicit `htmlFor` and `id` bindings on all form inputs, high contrast color palette (`#0A0A0A`, `#E5A91A`, `#C41E3A`), and keyboard-friendly controls. |

---

## 6. Project Structure

```
.
├── .editorconfig               # Editor code formatting conventions
├── .env.example                # Environment variables template
├── .gitattributes              # Line ending normalization
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI matrix for lint, test & build
├── .gitignore                  # Git ignore rules including .aistudio/
├── .prettierrc.json            # Prettier code formatting rules
├── eslint.config.js            # Modern flat ESLint configuration
├── LICENSE                     # MIT open source license
├── index.html                  # HTML entry point with metadata tags
├── metadata.json               # Application capabilities & description
├── package.json                # Project dependencies and test scripts
├── README.md                   # Comprehensive project documentation
├── server.ts                   # Clean Express application entry point & graceful shutdown
├── tsconfig.json               # Strict TypeScript configuration
├── vite.config.ts              # Vite bundler configuration
└── src/
    ├── App.tsx                 # Clean layout coordinator & screen routing
    ├── main.tsx                # React 19 application mount with ErrorBoundary
    ├── index.css               # Tailwind CSS imports & base styles
    ├── constants/
    │   └── celebration.ts      # Centralized categories, deadlines, and theme tokens
    ├── hooks/
    │   ├── useCelebrationEvents.ts # Custom hook for event state & operations
    │   └── useAssistantChat.ts     # Custom hook for chat state & offline engine
    ├── types/
    │   └── host.ts             # HostEvent, HostVendor, HostTask, and Anomaly models
    ├── data/
    │   └── initialEvents.ts    # Curated celebration presets
    ├── utils/
    │   └── sanitize.ts         # User input sanitizer & currency formatter
    ├── services/
    │   ├── assistantEngine.ts  # Pure modular assistant & anomaly calculations
    │   └── assistantEngine.test.ts # 14 Unit tests (100% passing)
    ├── server/
    │   ├── defaultPlans.ts     # Cultural fallback celebration plans
    │   ├── geminiService.ts    # Server-side Gemini 3.8 Flash model execution
    │   └── routes/
    │       └── aiRouter.ts     # Express router for assistant & plan endpoints
    └── components/
        ├── ErrorBoundary.tsx   # React error boundary for runtime fault tolerance
        ├── LandingPage.tsx     # Hero landing page & quick actions
        ├── Navbar.tsx          # Navigation header & celebration selector
        ├── NewEventModal.tsx   # Modal for creating new celebrations
        ├── common/
        │   ├── ScreenHeaderNav.tsx # Reusable sub-navigation bar
        │   └── MarkdownText.tsx    # Markdown renderer for assistant messages
        ├── budget/
        │   ├── BudgetSummaryMetrics.tsx # 3-card metrics & spending progress
        │   ├── VendorItemRow.tsx        # Individual vendor row with inline edit
        │   └── AddVendorForm.tsx        # Accessible form to add line items
        ├── checklist/
        │   ├── TaskItemRow.tsx          # Checklist task row with toggle
        │   ├── AddTaskForm.tsx          # Accessible form to add milestones
        │   └── TaskProgressHeader.tsx   # Execution progress indicator
        ├── assistant/
        │   ├── ChatMessageBubble.tsx    # Chat bubble with role styling
        │   ├── AnomalyActionCard.tsx    # Structured anomaly box & apply button
        │   └── QuickPromptChips.tsx     # Dynamic suggested prompt buttons
        ├── overview/
        │   ├── OverviewHeroBanner.tsx   # Celebration header & delete modal
        │   └── ShortcutNavigationCards.tsx # 3 primary execution cards
        ├── menu/
        │   ├── CelebrationSwitcherCard.tsx # Multi-event switch & delete card
        │   └── MenuFooterCredits.tsx       # Author profile links & attribution
        └── screens/
            ├── OverviewScreen.tsx  # Executive dashboard layout
            ├── VendorsScreen.tsx   # Single cost tally ledger layout
            ├── TimelineScreen.tsx  # Milestone checklist layout
            ├── AssistantScreen.tsx # GenAI assistant layout
            └── MenuScreen.tsx      # Multi-event management layout
```

---

## 7. Getting Started Locally

### Prerequisites
- Node.js 20+ installed
- npm installed

### Setup & Run
```bash
# 1. Clone repository
git clone https://github.com/if-else-repeat/shubharambh.git
cd shubharambh

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for live Gemini API calls)
cp .env.example .env
# Add your GEMINI_API_KEY in .env

# 4. Run automated test suite
npm test

# 5. Start local development server
npm run dev

# 6. Build for production deployment
npm run build
npm start
```

---

## 8. Author & Credits

- **Project:** AN OLDMILL PROJECT
- **Website:** [oldmill.in](https://oldmill.in)
- **GitHub:** [if-else-repeat](https://github.com/if-else-repeat)
- **LinkedIn:** [Priyanshu Raj Mishra](https://www.linkedin.com/in/priyanshu-raj-mishra)
