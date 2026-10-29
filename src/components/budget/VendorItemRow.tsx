import React from 'react';
import { HostVendor, getVendorCost } from '../../types/host.ts';
import { formatRupees } from '../../utils/sanitize.ts';

interface VendorItemRowProps {
  vendor: HostVendor;
  isEditing: boolean;
  editCost: number;
  onStartEditing: (vendor: HostVendor) => void;
  onEditCostChange: (cost: number) => void;
  onSaveEditing: (vendor: HostVendor) => void;
  onCancelEditing: () => void;
  onCycleStatus: (vendor: HostVendor) => void;
  onDeleteVendor: (vendorId: string) => void;
}

/**
 * VendorItemRow renders an individual vendor line item with inline editing,
 * status badge toggling, and deletion controls.
 */
export const VendorItemRow: React.FC<VendorItemRowProps> = ({
  vendor,
  isEditing,
  editCost,
  onStartEditing,
  onEditCostChange,
  onSaveEditing,
  onCancelEditing,
  onCycleStatus,
  onDeleteVendor,
}) => {
  const currentCost = getVendorCost(vendor);
  const statusColorMap = {
    Pending: 'bg-[#E5A91A]/10 text-[#E5A91A] border-[#E5A91A]/40',
    Booked: 'bg-[#E5A91A] text-[#0A0A0A] border-[#E5A91A]',
    Paid: 'bg-[#16A34A]/20 text-[#16A34A] border-[#16A34A]/60',
  };

  const currentStatus = (vendor.status as 'Pending' | 'Booked' | 'Paid') || 'Pending';
  const badgeClasses = statusColorMap[currentStatus] || statusColorMap.Pending;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0A0A0A] border border-[#E5A91A]/20 rounded-lg hover:border-[#E5A91A]/40 transition-colors gap-3">
      {/* Name and Category */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-heading font-bold text-base text-[#E5A91A] truncate">
            {vendor.name}
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E5A91A]/10 text-[#E5A91A]/80 border border-[#E5A91A]/20">
            {vendor.category}
          </span>
        </div>
      </div>

      {/* Cost display or edit field */}
      <div className="flex items-center gap-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#E5A91A]">₹</span>
            <input
              type="number"
              min="0"
              value={editCost || ''}
              onChange={(e) => onEditCostChange(Math.max(0, Number(e.target.value) || 0))}
              className="w-24 px-2 py-1 text-xs bg-[#0A0A0A] border border-[#E5A91A] rounded text-[#E5A91A] font-bold focus:outline-none focus:ring-1 focus:ring-[#E5A91A]"
              autoFocus
            />
            <button
              type="button"
              onClick={() => onSaveEditing(vendor)}
              className="text-xs font-bold px-2 py-1 bg-[#E5A91A] text-[#0A0A0A] rounded hover:bg-[#C41E3A] hover:text-[#E5A91A] transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancelEditing}
              className="text-xs text-[#E5A91A]/60 hover:text-[#E5A91A]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onStartEditing(vendor)}
            className="text-left group cursor-pointer"
            title="Click to edit cost"
          >
            <span className="font-heading font-extrabold text-lg text-[#E5A91A] group-hover:underline">
              {formatRupees(currentCost)}
            </span>
          </button>
        )}

        {/* Status cycling button */}
        <button
          type="button"
          onClick={() => onCycleStatus(vendor)}
          className={`text-xs font-bold px-2.5 py-1 rounded border cursor-pointer transition-colors select-none ${badgeClasses}`}
          title="Click to cycle status: Pending -> Booked -> Paid"
        >
          {currentStatus}
        </button>

        {/* Delete item button */}
        <button
          type="button"
          onClick={() => onDeleteVendor(vendor.id)}
          className="text-[#C41E3A] hover:bg-[#C41E3A] hover:text-[#0A0A0A] p-1.5 rounded transition-colors cursor-pointer"
          title="Delete vendor"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
