import React, { useState } from 'react';
import { HostEvent, HostVendor, HostTask } from '../types/host.ts';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: HostEvent) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  const [name, setName] = useState('');
  const [budgetCap, setBudgetCap] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [date, setDate] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  if (!isOpen) return null;

  // 1. Create with clean blank slate (0 prefilled items)
  const handleCreateBlank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const totalBudget = Number(budgetCap) || 50000;
    const guests = Number(guestCount) || 20;
    const id = `event-${Date.now()}`;

    const newEvent: HostEvent = {
      id,
      name: name.trim(),
      date: date.trim() || 'Upcoming 2026',
      totalBudget,
      guestCount: guests,
      vendors: [],
      tasks: [],
    };

    onCreateEvent(newEvent);
    handleClose();
  };

  // 2. Powermax with AI Brain: intelligently crafts customized vendors & tasks
  const handleCreateWithAIBrain = async () => {
    if (!name.trim()) return;

    setIsGeneratingPlan(true);
    const totalBudget = Number(budgetCap) || 50000;
    const guests = Number(guestCount) || 20;
    const id = `event-${Date.now()}`;

    try {
      const res = await fetch('/api/ai/generate-event-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          totalBudget,
          guestCount: guests,
          date: date.trim() || 'Upcoming 2026',
        }),
      });

      let vendors: HostVendor[] = [];
      let tasks: HostTask[] = [];

      if (res.ok) {
        const data = await res.json();
        vendors = data.vendors || [];
        tasks = data.tasks || [];
      }

      const newEvent: HostEvent = {
        id,
        name: name.trim(),
        date: date.trim() || 'Upcoming 2026',
        totalBudget,
        guestCount: guests,
        vendors,
        tasks,
      };

      onCreateEvent(newEvent);
      handleClose();
    } catch (err) {
      console.warn('AI plan generation error, creating blank event:', err);
      const fallbackEvent: HostEvent = {
        id,
        name: name.trim(),
        date: date.trim() || 'Upcoming 2026',
        totalBudget,
        guestCount: guests,
        vendors: [],
        tasks: [],
      };
      onCreateEvent(fallbackEvent);
      handleClose();
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleClose = () => {
    setName('');
    setBudgetCap('');
    setGuestCount('');
    setDate('');
    setIsGeneratingPlan(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/90 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0A0A0A] border-2 border-[#E5A91A] rounded-lg p-6 space-y-5 shadow-2xl text-[#E5A91A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5A91A]/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C41E3A]" />
            <h2 className="font-heading font-extrabold text-xl text-[#E5A91A] tracking-tight">
              Create New Celebration
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-[#E5A91A]/60 hover:text-[#C41E3A] font-extrabold text-xl leading-none cursor-pointer p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateBlank} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#E5A91A] mb-1">
              Celebration Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aanya's 1st Birthday or Priya & Kabir's Haldi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] placeholder:text-[#E5A91A]/30 focus:outline-none focus:border-[#E5A91A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#E5A91A] mb-1">
                Budget Cap (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 50000 or 1500000"
                value={budgetCap}
                onChange={(e) => setBudgetCap(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] placeholder:text-[#E5A91A]/30 focus:outline-none focus:border-[#E5A91A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E5A91A] mb-1">
                Expected Guests
              </label>
              <input
                type="number"
                placeholder="e.g. 25 or 300"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] placeholder:text-[#E5A91A]/30 focus:outline-none focus:border-[#E5A91A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E5A91A] mb-1">
              Target Date (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dec 15, 2026 or Next Sunday"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] placeholder:text-[#E5A91A]/30 focus:outline-none focus:border-[#E5A91A]"
            />
          </div>

          {/* Action Choice: Blank Ledger OR AI Brain Tailored Plan */}
          <div className="pt-3 border-t border-[#E5A91A]/20 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Option 1: AI Brain Tailored Plan */}
              <button
                type="button"
                disabled={!name.trim() || isGeneratingPlan}
                onClick={handleCreateWithAIBrain}
                className="flex-1 py-2.5 px-3 bg-[#E5A91A] hover:bg-[#C41E3A] hover:text-[#E5A91A] disabled:opacity-40 text-[#0A0A0A] text-xs font-bold rounded border border-[#E5A91A] transition-colors cursor-pointer inline-flex items-center justify-center"
                title="Generate celebration plan with shubharambh"
              >
                {isGeneratingPlan ? 'Generating Plan...' : 'shubharambh'}
              </button>

              {/* Option 2: Clean Blank Slate */}
              <button
                type="submit"
                disabled={!name.trim() || isGeneratingPlan}
                className="py-2.5 px-3 bg-[#0A0A0A] hover:bg-[#E5A91A]/10 disabled:opacity-40 text-[#E5A91A] text-xs font-bold rounded border border-[#E5A91A]/50 transition-colors cursor-pointer"
                title="Create with completely blank vendors and checklist"
              >
                Start Blank Slate
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
