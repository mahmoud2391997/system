import React, { useState } from 'react';
import { Key, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
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

  const isPending = approval.status === 'pending';
  const isApproved = approval.status === 'approved';
  const isRejected = approval.status === 'rejected';

  const getStatusBadge = () => {
    if (isApproved) {
      return (
        <span className="font-sans text-[11px] font-medium px-2 py-0.5 bg-ok-bg text-ok border border-ok/50 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>approved</span>
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="font-sans text-[11px] font-medium px-2 py-0.5 bg-danger-bg text-danger border border-danger/50 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          <span>denied</span>
        </span>
      );
    }
    return (
      <span className="font-sans text-[11px] font-medium px-2 py-0.5 bg-warn-bg text-amber border border-amber/50 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 text-amber" />
        <span>confirmation required</span>
      </span>
    );
  };

  return (
    <div
      className={`p-4 transition-colors font-sans border ${
        isApproved
          ? 'bg-ink-900 border-ok/30'
          : isRejected
          ? 'bg-ink-900 border-danger/30 opacity-80'
          : 'bg-ink-900 border-ink-border hover:border-amber/50 approval-pending'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-ink-border">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-amber bg-ink-950 px-2 py-0.5 border border-ink-border">
            {approval.tool_name}
          </span>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-paper/50 bg-ink-950 px-2 py-0.5 border border-ink-border">
          <Key className="w-3 h-3 text-amber-dim" />
          <span className="truncate max-w-[170px]" title={approval.idempotency_key}>
            {approval.idempotency_key}
          </span>
        </div>
      </div>

      <div className="py-2.5 text-sm text-paper font-normal leading-relaxed">{approval.summary}</div>

      <div className="bg-ink-950 p-2.5 border border-ink-border mb-3 space-y-1 font-mono text-[13px]">
        <div className="text-[11px] uppercase tracking-wider text-amber-dim font-sans font-semibold mb-1">Parameters</div>
        {Object.entries(approval.parameters).map(([key, val]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-paper/55 min-w-[80px]">{key}:</span>
            <span className="text-amber break-all">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
          </div>
        ))}
      </div>

      {approval.external_impact_warning && (
        <div className="p-2 bg-warn-bg border border-amber/40 text-amber text-sm font-sans mb-3 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
          <span className="leading-snug">{approval.external_impact_warning}</span>
        </div>
      )}

      {isPending ? (
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-ink-border">
          <span className="text-[11px] text-paper/50 font-sans">Awaiting operator decision before execution</span>
          <div className="flex items-center gap-2">
            {showRejectInput ? (
              <div className="flex items-center gap-2 w-full sm:w-auto font-sans">
                <input
                  type="text"
                  placeholder="Denial reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="px-2.5 py-1 text-sm border border-ink-border bg-ink-950 text-paper placeholder:text-paper/35 focus:outline-none focus:border-danger"
                />
                <button onClick={handleReject} disabled={isSubmitting} className="px-3 py-1 bg-danger hover:bg-danger/90 text-paper text-sm font-semibold disabled:opacity-50">
                  Confirm Deny
                </button>
                <button onClick={() => setShowRejectInput(false)} className="px-2 py-1 text-paper/60 hover:text-paper text-sm">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-ink-950 hover:bg-danger-bg text-danger border border-danger/60 hover:border-danger text-sm font-sans font-medium transition-colors disabled:opacity-50"
                  id={`reject-${approval.id}`}
                >
                  Deny
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-ok hover:bg-ok/90 text-ink-950 text-sm font-sans font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  id={`approve-${approval.id}`}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Executing...</span></>
                  ) : (
                    <span>Approve</span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-2 flex items-center justify-between text-sm text-paper/55 border-t border-ink-border font-sans">
          <span>
            Resolved by {approval.resolved_by || 'Operator'}{' '}
            {approval.resolved_at && `at ${new Date(approval.resolved_at).toLocaleTimeString()}`}
          </span>
          <span className="font-mono text-[11px] text-amber-dim">STATE: {approval.status.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
};
