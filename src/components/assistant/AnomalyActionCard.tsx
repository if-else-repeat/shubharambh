import React from 'react';
import { AnomalyData } from '../../types/host.ts';
import { formatRupees } from '../../utils/sanitize.ts';

interface AnomalyActionCardProps {
  messageId: string;
  anomalyData: AnomalyData;
  applied?: boolean;
  onApplyChanges: (messageId: string, anomalyData: AnomalyData) => void;
}

/**
 * AnomalyActionCard renders the structured financial rebalancing recommendations
 * and provides the single-click 'Apply Changes to Budget' action.
 */
export const AnomalyActionCard: React.FC<AnomalyActionCardProps> = ({
  messageId,
  anomalyData,
  applied = false,
  onApplyChanges,
}) => {
  return (
    <div className="mt-4 pt-3 border-t border-[#E5A91A]/30 space-y-3">
      <div className="bg-[#E5A91A]/10 border border-[#E5A91A]/30 rounded p-3 text-xs space-y-2">
        <div className="flex items-center justify-between text-[#E5A91A] font-bold">
          <span>Calculated Budget Deficit:</span>
          <span className="font-heading font-bold text-[#C41E3A] text-sm">
            {formatRupees(anomalyData.calculatedDeficit)}
          </span>
        </div>

        {anomalyData.newBudgetCap && (
          <div className="flex items-center justify-between text-[#E5A91A] font-semibold">
            <span>Recommended New Budget Cap:</span>
            <span className="font-heading font-bold text-[#E5A91A]">
              {formatRupees(anomalyData.newBudgetCap)}
            </span>
          </div>
        )}

        {anomalyData.vendorAdjustments && anomalyData.vendorAdjustments.length > 0 && (
          <div className="pt-2 border-t border-[#E5A91A]/20 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5A91A] block">
              Proposed Vendor Cost Reductions:
            </span>
            {anomalyData.vendorAdjustments.map((adj, i) => (
              <div key={i} className="flex justify-between items-center text-xs text-[#E5A91A]">
                <span className="font-medium">{adj.name}</span>
                <span className="font-bold text-[#C41E3A]">
                  -{formatRupees(adj.cutAmount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {applied ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E5A91A] border border-[#E5A91A] text-[#0A0A0A] text-xs font-bold rounded">
            Budget adjustments applied to Vendors
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onApplyChanges(messageId, anomalyData)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C41E3A] hover:bg-[#A3162C] text-[#0A0A0A] text-xs font-bold rounded border border-[#C41E3A] transition-colors cursor-pointer select-none"
          >
            Apply Changes to Budget
          </button>
        )}
      </div>
    </div>
  );
};
