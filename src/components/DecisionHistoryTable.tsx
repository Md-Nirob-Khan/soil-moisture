import React from 'react';
import { CheckCircle2, XCircle, SlidersHorizontal, History, ShieldAlert } from 'lucide-react';
import { DecisionLogEntry } from '../types';

interface DecisionHistoryTableProps {
  entries: DecisionLogEntry[];
  onClearHistory?: () => void;
}

export const DecisionHistoryTable: React.FC<DecisionHistoryTableProps> = ({
  entries,
  onClearHistory,
}) => {
  const getDecisionBadge = (decision: DecisionLogEntry['userDecision']) => {
    switch (decision) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF8EF] text-[#159947] border border-[#159947]/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#159947]" />
            Accepted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-500" />
            Rejected
          </span>
        );
      case 'Modified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            Modified
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#159947]" />
          <h3 className="font-bold text-sm text-slate-900 font-['Space_Grotesk']">
            Human-in-the-Loop Decision History
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {entries.length} logged actions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 font-['Space_Grotesk']">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">AI Recommendation</th>
              <th className="px-4 py-3">AI Confidence</th>
              <th className="px-4 py-3">User Decision</th>
              <th className="px-4 py-3">Final Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No decisions logged yet. Interact with the AI recommendation above to record audit entries.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-500 whitespace-nowrap">
                    {entry.timestamp}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    {entry.zone}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {entry.recommendation}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px]">
                      {entry.confidence}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getDecisionBadge(entry.userDecision)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                    {entry.finalAction}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
