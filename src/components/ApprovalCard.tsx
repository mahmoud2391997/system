import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Check, X, AlertTriangle, Key, ExternalLink, Loader2, Info } from 'lucide-react';
import { ApprovalAction } from '../types';

interface ApprovalCardProps {
  approval: ApprovalAction;
  onDecide: (id: string, decision: 'approve' | 'reject', notes?: string) => Promise<void>;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({ approval, onDecide }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onDecide(approval.id, 'approve');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onDecide(approval.id, 'reject', rejectReason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHighRisk = approval.risk_level === 'high_risk';

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all shadow-sm ${
        approval.status === 'approved'
          ? 'bg-emerald-50/70 border-emerald-300'
          : approval.status === 'rejected'
          ? 'bg-slate-50 border-slate-300 opacity-80'
          : isHighRisk
          ? 'bg-red-50/40 border-red-200 ring-1 ring-red-300/60'
          : 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-300/60'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg text-white ${
              approval.status === 'approved'
                ? 'bg-emerald-600'
                : approval.status === 'rejected'
                ? 'bg-slate-500'
                : isHighRisk
                ? 'bg-red-600'
                : 'bg-amber-600'
            }`}
          >
            {approval.status === 'approved' ? (
              <ShieldCheck className="w-4 h-4" />
            ) : isHighRisk ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">{approval.skill_title}</span>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold tracking-wider ${
                  approval.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : approval.status === 'rejected'
                    ? 'bg-slate-200 text-slate-700'
                    : isHighRisk
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {approval.status === 'pending'
                  ? approval.risk_level.replace('_', ' ')
                  : approval.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Requested by {approval.requested_by} • {new Date(approval.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Idempotency Key Tag */}
        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 bg-white/80 px-2 py-1 rounded border border-slate-200">
          <Key className="w-3 h-3 text-slate-400" />
          <span className="truncate max-w-[170px]" title={approval.idempotency_key}>
            {approval.idempotency_key}
          </span>
        </div>
      </div>

      {/* Summary Body */}
      <div className="py-3 text-sm text-slate-800 font-medium leading-relaxed">
        {approval.summary}
      </div>

      {/* Parameters Matrix */}
      <div className="bg-white rounded-lg p-3 border border-slate-200/80 mb-3 space-y-1.5 text-xs font-mono">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans">
          Payload Parameters (Schema-Validated)
        </div>
        {Object.entries(approval.parameters).map(([key, val]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-slate-500 font-medium min-w-[90px]">{key}:</span>
            <span className="text-slate-900 break-all font-sans bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>

      {/* Warning regarding External Side Effects */}
      {approval.external_impact_warning && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs mb-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{approval.external_impact_warning}</p>
        </div>
      )}

      {/* Controls */}
      {approval.status === 'pending' ? (
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Policy Engine halted execution awaiting operator approval</span>
          </div>

          <div className="flex items-center gap-2">
            {showRejectInput ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                />
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={isSubmitting}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  id={`reject-${approval.id}`}
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 ${
                    isHighRisk
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500'
                      : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500'
                  }`}
                  id={`approve-${approval.id}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Server-Side...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Execute via Live API</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Resolved by {approval.resolved_by || 'Admin'} at{' '}
            {approval.resolved_at ? new Date(approval.resolved_at).toLocaleTimeString() : 'Recently'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Immutable Audit State: {approval.status.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};
