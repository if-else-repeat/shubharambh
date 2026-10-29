import React, { useState } from 'react';
import { HostVendor } from '../../types/host.ts';
import { VENDOR_CATEGORIES, VENDOR_STATUSES } from '../../constants/celebration.ts';

interface AddVendorFormProps {
  onAddVendor: (vendor: Omit<HostVendor, 'id'>) => void;
  onCancel: () => void;
}

/**
 * AddVendorForm provides an accessible form to create a new vendor or expense item.
 */
export const AddVendorForm: React.FC<AddVendorFormProps> = ({ onAddVendor, onCancel }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Venue');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Booked' | 'Paid'>('Pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddVendor({
      name: name.trim(),
      category: category.trim() || 'General',
      cost: Math.max(0, Number(cost) || 0),
      status,
    });

    setName('');
    setCategory('Venue');
    setCost('');
    setStatus('Pending');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0A0A0A] border border-[#E5A91A] rounded-lg p-5 space-y-4"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#E5A91A]/20">
        <h3 className="font-heading font-bold text-base text-[#E5A91A]">Add New Line Item</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-[#E5A91A]/60 hover:text-[#E5A91A]"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vendor-name-input" className="block text-xs font-bold text-[#E5A91A] mb-1">
            Vendor / Expense Name *
          </label>
          <input
            id="vendor-name-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Royal Palace Lawn, Halwai Feast, Floral Torans"
            className="w-full px-3 py-2 text-xs bg-[#0A0A0A] border border-[#E5A91A]/40 rounded text-[#E5A91A] placeholder-[#E5A91A]/30 focus:outline-none focus:border-[#E5A91A]"
          />
        </div>

        <div>
          <label
            htmlFor="vendor-category-select"
            className="block text-xs font-bold text-[#E5A91A] mb-1"
          >
            Category
          </label>
          <select
            id="vendor-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#0A0A0A] border border-[#E5A91A]/40 rounded text-[#E5A91A] focus:outline-none focus:border-[#E5A91A]"
          >
            {VENDOR_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vendor-cost-input" className="block text-xs font-bold text-[#E5A91A] mb-1">
            Cost (₹ INR) *
          </label>
          <input
            id="vendor-cost-input"
            type="number"
            min="0"
            required
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="e.g. 75000"
            className="w-full px-3 py-2 text-xs bg-[#0A0A0A] border border-[#E5A91A]/40 rounded text-[#E5A91A] placeholder-[#E5A91A]/30 focus:outline-none focus:border-[#E5A91A]"
          />
        </div>

        <div>
          <label
            htmlFor="vendor-status-select"
            className="block text-xs font-bold text-[#E5A91A] mb-1"
          >
            Payment Status
          </label>
          <select
            id="vendor-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Pending' | 'Booked' | 'Paid')}
            className="w-full px-3 py-2 text-xs bg-[#0A0A0A] border border-[#E5A91A]/40 rounded text-[#E5A91A] focus:outline-none focus:border-[#E5A91A]"
          >
            {VENDOR_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-[#E5A91A]/80 hover:text-[#E5A91A] border border-[#E5A91A]/30 rounded cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-bold bg-[#E5A91A] text-[#0A0A0A] hover:bg-[#C41E3A] hover:text-[#E5A91A] rounded transition-colors cursor-pointer"
        >
          Add to Ledger
        </button>
      </div>
    </form>
  );
};
