import React, { useState, useMemo } from 'react';
import { HostVendor, getVendorCost, AppView } from '../../types/host.ts';
import { ScreenHeaderNav } from '../common/ScreenHeaderNav.tsx';
import { BudgetSummaryMetrics } from '../budget/BudgetSummaryMetrics.tsx';
import { VendorItemRow } from '../budget/VendorItemRow.tsx';
import { AddVendorForm } from '../budget/AddVendorForm.tsx';

interface VendorsScreenProps {
  vendors: HostVendor[];
  totalBudget: number;
  onAddVendor: (vendor: Omit<HostVendor, 'id'>) => void;
  onUpdateVendor: (vendor: HostVendor) => void;
  onDeleteVendor: (vendorId: string) => void;
  onNavigate?: (view: AppView) => void;
}

/**
 * VendorsScreen coordinates the celebration budget ledger, line item tallies,
 * and payment milestone statuses.
 */
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
  const [editCost, setEditCost] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Single Cost Tally: total sum across all vendors
  const totalCost = useMemo(
    () => vendors.reduce((sum, v) => sum + getVendorCost(v), 0),
    [vendors]
  );
  const balance = totalBudget - totalCost;
  const percentSpent = Math.min(100, Math.round((totalCost / (totalBudget || 1)) * 100));

  // Available unique categories
  const categories = useMemo(() => {
    const set = new Set(vendors.map((v) => v.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    if (categoryFilter === 'All') return vendors;
    return vendors.filter((v) => v.category === categoryFilter);
  }, [vendors, categoryFilter]);

  const handleStartEditing = (vendor: HostVendor) => {
    setEditingId(vendor.id);
    setEditCost(getVendorCost(vendor));
  };

  const handleSaveEditing = (vendor: HostVendor) => {
    onUpdateVendor({
      ...vendor,
      cost: Math.max(0, Number(editCost) || 0),
      actualCost: Math.max(0, Number(editCost) || 0),
      estimatedCost: Math.max(0, Number(editCost) || 0),
    });
    setEditingId(null);
  };

  const handleCycleStatus = (vendor: HostVendor) => {
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
      {onNavigate && <ScreenHeaderNav currentView="budget" onNavigate={onNavigate} />}

      {/* Screen Title & Add Button */}
      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E5A91A] tracking-tight">
              Budget & Vendors
            </h2>
            <p className="text-xs font-medium text-[#E5A91A]/70 mt-1">
              Transparent single cost tally ledger. Click any cost to edit, or tap status badges to update contracts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E5A91A] hover:bg-[#C41E3A] hover:text-[#E5A91A] text-[#0A0A0A] border border-[#E5A91A] text-xs font-bold rounded transition-colors cursor-pointer select-none"
          >
            {isAdding ? 'Close Form' : '+ Add Line Item'}
          </button>
        </div>

        <div className="mt-6">
          <BudgetSummaryMetrics
            totalBudget={totalBudget}
            totalCost={totalCost}
            balance={balance}
            percentSpent={percentSpent}
          />
        </div>
      </div>

      {isAdding && (
        <AddVendorForm
          onAddVendor={(vendor) => {
            onAddVendor(vendor);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* Ledger Section with Category Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-heading font-bold text-lg text-[#E5A91A]">
            Celebration Line Items ({filteredVendors.length})
          </h3>

          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-[#E5A91A] text-[#0A0A0A] border-[#E5A91A] font-bold'
                      : 'bg-[#0A0A0A] text-[#E5A91A]/70 border-[#E5A91A]/20 hover:border-[#E5A91A]/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredVendors.length === 0 ? (
          <div className="p-8 text-center bg-[#0A0A0A] border border-[#E5A91A]/20 rounded-lg">
            <p className="text-sm text-[#E5A91A]/60">No items match the selected category.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredVendors.map((vendor) => (
              <VendorItemRow
                key={vendor.id}
                vendor={vendor}
                isEditing={editingId === vendor.id}
                editCost={editCost}
                onStartEditing={handleStartEditing}
                onEditCostChange={setEditCost}
                onSaveEditing={handleSaveEditing}
                onCancelEditing={() => setEditingId(null)}
                onCycleStatus={handleCycleStatus}
                onDeleteVendor={onDeleteVendor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
