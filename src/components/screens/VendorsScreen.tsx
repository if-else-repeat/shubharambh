import React, { useState } from 'react';
import { HostVendor, getVendorCost, AppView } from '../../types/host.ts';

interface VendorsScreenProps {
  vendors: HostVendor[];
  totalBudget: number;
  onAddVendor: (vendor: Omit<HostVendor, 'id'>) => void;
  onUpdateVendor: (vendor: HostVendor) => void;
  onDeleteVendor: (vendorId: string) => void;
  onNavigate?: (view: AppView) => void;
}

export const VendorsScreen: React.FC<VendorsScreenProps> = ({
  vendors,
  totalBudget,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
  onNavigate,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add Form state (Only single cost tally!)
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Venue');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Booked' | 'Paid'>('Pending');

  // Edit inline state
  const [editCost, setEditCost] = useState<number>(0);

  // Single cost tally calculation
  const totalCost = vendors.reduce((sum, v) => sum + getVendorCost(v), 0);
  const balance = totalBudget - totalCost;
  const percentSpent = Math.min(100, Math.round((totalCost / (totalBudget || 1)) * 100));

  const handleSubmitNew = (e: React.FormEvent) => {
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
    setIsAdding(false);
  };

  const startEditing = (vendor: HostVendor) => {
    setEditingId(vendor.id);
    setEditCost(getVendorCost(vendor));
  };

  const saveEditing = (vendor: HostVendor) => {
    onUpdateVendor({
      ...vendor,
      cost: Math.max(0, Number(editCost) || 0),
      actualCost: Math.max(0, Number(editCost) || 0),
      estimatedCost: Math.max(0, Number(editCost) || 0),
    });
    setEditingId(null);
  };

  const cycleStatus = (vendor: HostVendor) => {
    const cycleMap: Record<'Pending' | 'Booked' | 'Paid', 'Pending' | 'Booked' | 'Paid'> = {
      Pending: 'Booked',
      Booked: 'Paid',
      Paid: 'Pending',
    };
    const currentStatus = (vendor.status as 'Pending' | 'Booked' | 'Paid') || 'Pending';
    onUpdateVendor({
      ...vendor,
      cost: getVendorCost(vendor),
      status: cycleMap[currentStatus] || 'Pending',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar with Back button and Quick Switchers */}
      {onNavigate && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5A91A]/20">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center text-xs font-bold text-[#E5A91A] hover:text-[#C41E3A] cursor-pointer transition-colors"
          >
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#E5A91A]/50">Quick switch:</span>
            <button
              type="button"
              onClick={() => onNavigate('checklist')}
              className="text-xs font-bold px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#E5A91A]/40 text-[#E5A91A] hover:border-[#E5A91A] hover:bg-[#E5A91A]/10 transition-colors cursor-pointer"
            >
              Timelines & Checklist
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ai')}
              className="text-xs font-bold px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#C41E3A]/50 text-[#C41E3A] hover:border-[#C41E3A] hover:bg-[#C41E3A]/10 transition-colors cursor-pointer"
            >
              GenAI Assistant
            </button>
          </div>
        </div>
      )}

      {/* Header & Single Cost Tally Summary */}
      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E5A91A] tracking-tight">
              Budget & Vendors
            </h2>
            <p className="text-xs font-medium text-[#E5A91A]/70 mt-1">
              Single cost tally ledger. Clear contract amounts and payment tracking across Pending, Booked, and Paid.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E5A91A] hover:bg-[#C41E3A] hover:text-[#E5A91A] text-[#0A0A0A] border border-[#E5A91A] text-xs font-bold rounded transition-colors cursor-pointer select-none"
          >
            {isAdding ? 'Close Form' : '+ Add Item / Vendor'}
          </button>
        </div>

        {/* Single Cost Tally Strip */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E5A91A]/20">
          <div className="bg-[#0A0A0A] p-3 rounded border border-[#E5A91A]/20">
            <span className="text-[11px] font-bold text-[#E5A91A]/70 uppercase tracking-wider block">
              Budget Cap
            </span>
            <p className="font-heading font-bold text-lg sm:text-xl text-[#E5A91A] mt-0.5">
              ₹{totalBudget.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-[#0A0A0A] p-3 rounded border border-[#E5A91A]/20">
            <span className="text-[11px] font-bold text-[#E5A91A]/70 uppercase tracking-wider block">
              Total Cost ({vendors.length} items)
            </span>
            <p className="font-heading font-bold text-lg sm:text-xl text-[#E5A91A] mt-0.5">
              ₹{totalCost.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-[#0A0A0A] p-3 rounded border border-[#E5A91A]/20">
            <span className="text-[11px] font-bold text-[#E5A91A]/70 uppercase tracking-wider block">
              {balance >= 0 ? 'Remaining Balance' : 'Budget Overrun Deficit'}
            </span>
            <p
              className={`font-heading font-bold text-lg sm:text-xl mt-0.5 ${
                balance >= 0 ? 'text-[#E5A91A]' : 'text-[#C41E3A]'
              }`}
            >
              ₹{Math.abs(balance).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Flat Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-bold text-[#E5A91A]/80 mb-1.5">
            <span>{percentSpent}% budget allocated</span>
            <span>
              ₹{totalCost.toLocaleString('en-IN')} / ₹{totalBudget.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-full bg-[#0A0A0A] h-2.5 rounded-full overflow-hidden border border-[#E5A91A]/40">
            <div
              className={`h-full transition-all duration-300 ${
                balance >= 0 ? 'bg-[#E5A91A]' : 'bg-[#C41E3A]'
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Vendor Form (Only Single Cost Tally!) */}
      {isAdding && (
        <form
          onSubmit={handleSubmitNew}
          className="bg-[#0A0A0A] border-2 border-[#E5A91A] rounded-lg p-5 sm:p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#E5A91A]/20 pb-2">
            <h3 className="font-heading font-bold text-base text-[#E5A91A]">Add Budget Item</h3>
            <span className="text-xs font-medium text-[#E5A91A]/70">Amount in INR (₹)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#E5A91A] mb-1">
                Vendor / Expense Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Marigold Decor or Wedding Cake"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] placeholder:text-[#E5A91A]/40 focus:outline-none focus:border-[#E5A91A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E5A91A] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] focus:outline-none focus:border-[#E5A91A]"
              >
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Decor">Decor</option>
                <option value="Photography">Photography</option>
                <option value="Sound & DJ">Sound & DJ</option>
                <option value="Stationery">Stationery</option>
                <option value="Styling">Styling</option>
                <option value="Ritual">Ritual</option>
                <option value="Logistics">Logistics</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E5A91A] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Pending' | 'Booked' | 'Paid')}
                className="w-full text-xs px-3 py-2 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] focus:outline-none focus:border-[#E5A91A]"
              >
                <option value="Pending">Pending</option>
                <option value="Booked">Booked</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#E5A91A] mb-1">
                Cost (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 75000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#0A0A0A] border border-[#E5A91A]/50 rounded font-medium text-[#E5A91A] placeholder:text-[#E5A91A]/40 focus:outline-none focus:border-[#E5A91A]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E5A91A]/20">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 text-xs font-bold text-[#E5A91A] border border-[#E5A91A]/40 rounded hover:bg-[#E5A91A]/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-[#E5A91A] text-[#0A0A0A] hover:bg-[#C41E3A] hover:text-[#E5A91A] border border-[#E5A91A] rounded cursor-pointer"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Clean Single-Cost Table */}
      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg overflow-hidden shadow-sm">
        {vendors.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-sm font-medium text-[#E5A91A]/60">No budget items added yet.</p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="text-xs font-bold text-[#C41E3A] hover:underline cursor-pointer"
            >
              + Add your first vendor or expense
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0A0A0A] text-[#E5A91A] border-b border-[#E5A91A]/30 font-heading font-bold">
                <tr>
                  <th className="py-3 px-4">Vendor / Expense</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Cost (₹)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5A91A]/15 font-medium">
                {vendors.map((vendor) => {
                  const isEditingThis = editingId === vendor.id;
                  const itemCost = getVendorCost(vendor);

                  return (
                    <tr key={vendor.id} className="hover:bg-[#E5A91A]/5 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-[#E5A91A]">
                        {vendor.name}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-[#E5A91A]/70 text-xs">
                        <span className="px-2 py-0.5 rounded bg-[#E5A91A]/10 border border-[#E5A91A]/20">
                          {vendor.category}
                        </span>
                      </td>

                      {/* Single Cost Tally */}
                      <td className="py-3.5 px-3 text-right font-bold text-[#E5A91A]">
                        {isEditingThis ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-xs text-[#E5A91A]/60">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={editCost}
                              onChange={(e) => setEditCost(Number(e.target.value))}
                              className="w-28 text-right px-2 py-1 border-2 border-[#E5A91A] rounded text-xs bg-[#0A0A0A] text-[#E5A91A] font-bold focus:outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="font-heading font-extrabold text-sm sm:text-base">
                            ₹{itemCost.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Status Toggle / Cycle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => cycleStatus(vendor)}
                          className={`text-xs font-bold px-2.5 py-1 rounded transition-colors cursor-pointer select-none ${
                            vendor.status === 'Paid'
                              ? 'bg-[#C41E3A] text-[#0A0A0A] border border-[#C41E3A]'
                              : vendor.status === 'Booked'
                              ? 'bg-[#E5A91A] text-[#0A0A0A] border border-[#E5A91A]'
                              : 'bg-transparent text-[#E5A91A]/60 border border-[#E5A91A]/30 hover:border-[#E5A91A]'
                          }`}
                          title="Click to cycle status: Pending -> Booked -> Paid"
                        >
                          {vendor.status || 'Pending'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEditingThis ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEditing(vendor)}
                                className="text-xs font-bold px-2.5 py-1 rounded bg-[#E5A91A] text-[#0A0A0A] border border-[#E5A91A] hover:bg-[#C41E3A] hover:text-[#E5A91A] cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="text-xs font-bold px-2 py-1 text-[#E5A91A]/60 hover:text-[#E5A91A] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditing(vendor)}
                                className="text-xs font-bold text-[#E5A91A] hover:text-[#C41E3A] cursor-pointer"
                                title="Edit Cost"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteVendor(vendor.id)}
                                className="text-xs font-bold text-[#C41E3A] hover:underline cursor-pointer ml-1"
                                title="Delete Vendor"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
