import React from 'react';
import { formatRupees } from '../../utils/sanitize.ts';

interface BudgetSummaryMetricsProps {
  totalBudget: number;
  totalCost: number;
  balance: number;
  percentSpent: number;
}

/**
 * BudgetSummaryMetrics renders the financial dashboard cards and spending progress bar.
 */
export const BudgetSummaryMetrics: React.FC<BudgetSummaryMetricsProps> = ({
  totalBudget,
  totalCost,
  balance,
  percentSpent,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Metric 1: Budget Cap */}
        <div className="bg-[#0A0A0A] border border-[#E5A91A]/40 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider font-bold text-[#E5A91A]/70">
            Total Budget Cap
          </p>
          <p className="font-heading font-extrabold text-2xl text-[#E5A91A] mt-1">
            {formatRupees(totalBudget)}
          </p>
          <p className="text-[11px] text-[#E5A91A]/50 mt-1">Target maximum expense</p>
        </div>

        {/* Metric 2: Total Cost */}
        <div className="bg-[#0A0A0A] border border-[#E5A91A]/40 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider font-bold text-[#E5A91A]/70">
            Total Cost Allocated
          </p>
          <p className="font-heading font-extrabold text-2xl text-[#E5A91A] mt-1">
            {formatRupees(totalCost)}
          </p>
          <p className="text-[11px] text-[#E5A91A]/50 mt-1">Single cost tally sum</p>
        </div>

        {/* Metric 3: Remaining Liquidity / Deficit */}
        <div
          className={`bg-[#0A0A0A] border rounded-lg p-4 ${
            balance < 0 ? 'border-[#C41E3A] bg-[#C41E3A]/5' : 'border-[#E5A91A]/40'
          }`}
        >
          <p className="text-xs uppercase tracking-wider font-bold text-[#E5A91A]/70">
            {balance < 0 ? 'Budget Deficit' : 'Remaining Balance'}
          </p>
          <p
            className={`font-heading font-extrabold text-2xl mt-1 ${
              balance < 0 ? 'text-[#C41E3A]' : 'text-[#E5A91A]'
            }`}
          >
            {formatRupees(Math.abs(balance))}
          </p>
          <p className="text-[11px] text-[#E5A91A]/50 mt-1">
            {balance < 0 ? 'Exceeds budget cap' : 'Available cushion'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#0A0A0A] border border-[#E5A91A]/30 rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-[#E5A91A]">Spending Progress</span>
          <span className={percentSpent > 100 ? 'text-[#C41E3A]' : 'text-[#E5A91A]'}>
            {percentSpent}% of total cap allocated
          </span>
        </div>
        <div className="w-full bg-[#E5A91A]/10 h-2.5 rounded-full overflow-hidden border border-[#E5A91A]/30">
          <div
            className={`h-full transition-all duration-300 ${
              percentSpent > 100 ? 'bg-[#C41E3A]' : 'bg-[#E5A91A]'
            }`}
            style={{ width: `${Math.min(100, percentSpent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
