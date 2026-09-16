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

  // Status badge styling adhering strictly to reference
  const getStatusBadge = () => {
    if (isApproved) {
      return (
        <span className="font-sans text-[11px] font-medium px-2 py-0.5 rounded bg-[#2E4A3B] text-[#5FB88A] border border-[#5FB88A]/60 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>approved</span>
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="font-sans text-[11px] font-medium px-2 py-0.5 rounded bg-[#4A2622] text-[#E2574C] border border-[#E2574C]/60 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          <span>denied</span>
        </span>
      );
    }
    return (
      <span className="font-sans text-[11px] font-medium px-2 py-0.5 rounded bg-[#4A3B20] text-[#E2A23C] border border-[#E2A23C]/60 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 text-[#E2A23C]" />
        <span>confirmation required</span>
      </span>
    );
  };

  return (
    <div
      className={`rounded-lg p-4 transition-colors font-sans border ${
        isApproved
          ? 'bg-[#1D1814] border-[#2E4A3B]'
          : isRejected
          ? 'bg-[#1D1814] border-[#4A2622] opacity-80'
          : 'bg-[#1D1814] border-[#3A2F22] hover:border-[#B8850A]/60'
      }`}
    >
      {/* Top Machine Voice / Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#3A2F22]">
        <div className="flex items-center gap-2">
          {/* Tool identifier strictly in IBM Plex Mono */}
          <span className="font-mono text-xs font-semibold text-[#FFB000] bg-[#15120F] px-2 py-0.5 rounded border border-[#3A2F22]">
            {approval.tool_name}
          </span>
          {getStatusBadge()}
        </div>

        {/* Idempotency Key Tag in IBM Plex Mono */}
        <div className="flex items-center gap-1 font-mono text-[11px] text-[#F3E9D2]/50 bg-[#15120F] px-2 py-0.5 rounded border border-[#3A2F22]">
          <Key className="w-3 h-3 text-[#B8850A]" />
          <span className="truncate max-w-[170px]" title={approval.idempotency_key}>
            {approval.idempotency_key}
          </span>
        </div>
      </div>

      {/* Human Decision Summary strictly in IBM Plex Sans */}
      <div className="py-2.5 text-sm text-[#F3E9D2] font-normal leading-relaxed">
        {approval.summary}
      </div>

      {/* Machine Payload Parameters strictly in IBM Plex Mono */}
      <div className="bg-[#15120F] rounded p-2.5 border border-[#3A2F22] mb-3 space-y-1 font-mono text-xs">
        <div className="text-[10px] uppercase tracking-wider text-[#B8850A] font-sans font-semibold mb-1">
          Parameters
        </div>
        {Object.entries(approval.parameters).map(([key, val]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-[#F3E9D2]/60 min-w-[80px]">{key}:</span>
            <span className="text-[#FFB000] break-all">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>

      {/* External Warning */}
      {approval.external_impact_warning && (
        <div className="p-2 rounded bg-[#4A3B20]/40 border border-[#E2A23C]/40 text-[#E2A23C] text-xs font-sans mb-3 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#E2A23C] shrink-0 mt-0.5" />
          <span className="leading-snug">{approval.external_impact_warning}</span>
        </div>
      )}

      {/* Decision Buttons strictly in IBM Plex Sans */}
      {isPending ? (
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-[#3A2F22]">
          <span className="text-[11px] text-[#F3E9D2]/50 font-sans">
            Awaiting operator decision before execution
          </span>

          <div className="flex items-center gap-2">
            {showRejectInput ? (
              <div className="flex items-center gap-2 w-full sm:w-auto font-sans">
                <input
                  type="text"
                  placeholder="Denial reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded border border-[#3A2F22] bg-[#15120F] text-[#F3E9D2] focus:outline-none focus:border-[#E2574C]"
                />
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-[#E2574C] hover:bg-[#E2574C]/90 text-[#15120F] rounded text-xs font-semibold disabled:opacity-50"
                >
                  Confirm Deny
                </button>
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-2 py-1 text-[#F3E9D2]/60 hover:text-[#F3E9D2] text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-[#15120F] hover:bg-[#4A2622] text-[#E2574C] border border-[#E2574C]/60 hover:border-[#E2574C] rounded text-xs font-sans font-medium transition-colors disabled:opacity-50"
                  id={`reject-${approval.id}`}
                >
                  Deny
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#5FB88A] hover:bg-[#5FB88A]/90 text-[#15120F] rounded text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  id={`approve-${approval.id}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <span>Approve</span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-2 flex items-center justify-between text-xs text-[#F3E9D2]/60 border-t border-[#3A2F22] font-sans">
          <span>
            Resolved by {approval.resolved_by || 'Operator'}{' '}
            {approval.resolved_at && `at ${new Date(approval.resolved_at).toLocaleTimeString()}`}
          </span>
          <span className="font-mono text-[11px] text-[#B8850A]">
            STATE: {approval.status.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};
