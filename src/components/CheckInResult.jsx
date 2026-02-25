import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, QrCode } from "lucide-react";

const CheckInResult = ({ result, onScanNext, onClose }) => {
  if (!result) return null;

  const { type, data, error } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
      <div className="w-full max-w-sm mx-4 rounded-2xl border border-white/10 bg-[#0d1526] p-6 shadow-2xl shadow-black/40 space-y-4">
        {type === "success" && (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-300">Checked In</h3>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-xl font-semibold text-white">{data.attendeeName}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-white/70">
                <span>{data.ticketType}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Qty {data.quantity}</span>
              </div>
            </div>
          </>
        )}

        {type === "already_checked_in" && (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mb-3">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-amber-300">Already Checked In</h3>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-xl font-semibold text-white">{data.attendeeName}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-white/70">
                <span>{data.ticketType}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Qty {data.quantity}</span>
              </div>
              {data.checkedInAt && (
                <p className="text-xs text-amber-300/70">
                  Checked in at{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                  }).format(new Date(data.checkedInAt))}
                </p>
              )}
            </div>
          </>
        )}

        {type === "error" && (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center mb-3">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-red-300">Check-in Failed</h3>
            </div>
            <p className="text-sm text-red-300/80 text-center">{error}</p>
          </>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onScanNext}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 border border-white/10 hover:border-emerald-300/40 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Scan Next
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15 transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInResult;
