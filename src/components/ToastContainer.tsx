import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 z-50 flex flex-col gap-2 max-w-sm w-full px-4 md:px-0 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center justify-between gap-3 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200 ${
              isSuccess
                ? 'bg-[#1E1D1B] border-[#D4AF37] text-[#F5F2EB] shadow-[#D4AF37]/10'
                : isError
                ? 'bg-[#1E1D1B] border-[#E6A135] text-[#F5F2EB] shadow-[#E6A135]/10'
                : 'bg-[#1E1D1B] border-[#2A2724] text-[#F5F2EB]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-[#E6A135] shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-[#A39C90] shrink-0" />}
              <span className="truncate">{toast.message}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction?.();
                    removeToast(toast.id);
                  }}
                  className="px-2.5 py-1 bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#D4AF37]" /> Undo
                </button>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-[#A39C90] hover:text-[#F5F2EB] transition-colors rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
