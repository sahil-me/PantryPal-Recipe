import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State;
  // @ts-ignore
  setState: (state: Partial<State> | ((prevState: State) => Partial<State>)) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PantryPal ErrorBoundary] Uncaught rendering exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#121212] text-[#F5F2EB] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-xl bg-[#1A1918] border border-[#2A2724] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Header Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#23211E] border border-[#E6A135]/40 text-[#E6A135] flex items-center justify-center shadow-lg shadow-[#E6A135]/10">
              <AlertCircle className="w-8 h-8" />
            </div>

            {/* Error Message Header */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[#23211E] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                PantryPal Recovery Guard
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB]">
                Culinary Engine Interrupted
              </h1>
              <p className="text-xs sm:text-sm text-[#C2BCB2] max-w-md mx-auto leading-relaxed">
                An unexpected view error occurred. Don't worry — your pantry ingredients and saved recipes remain safely preserved in storage.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 hover:brightness-110 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-black" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleReload}
                className="px-5 py-3.5 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37]/40 text-[#F5F2EB] font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-[#A39C90]" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
