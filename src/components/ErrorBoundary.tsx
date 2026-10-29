import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global React Error Boundary to catch unhandled rendering exceptions
 * and render a graceful recovery screen aligned with the shubharambh design system.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error in shubharambh:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#E5A91A] flex items-center justify-center p-6 selection:bg-[#E5A91A] selection:text-[#0A0A0A]">
          <div className="max-w-md w-full border border-[#E5A91A]/40 bg-[#0A0A0A] p-6 text-center shadow-lg">
            <div className="w-12 h-12 mx-auto mb-4 border border-[#C41E3A] flex items-center justify-center text-[#C41E3A] font-bold text-xl">
              !
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#E5A91A] uppercase mb-2">
              Something Needs Attention
            </h1>
            <p className="text-xs text-[#E5A91A]/80 mb-6 leading-relaxed">
              shubharambh encountered an unexpected rendering condition. Your saved celebrations and ledgers remain safely preserved in local storage.
            </p>
            {this.state.error?.message && (
              <div className="bg-[#141414] border border-[#E5A91A]/20 p-3 mb-6 text-left overflow-x-auto text-[11px] font-mono text-[#E5A91A]/70">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-[#E5A91A]/50 text-[#E5A91A] hover:bg-[#E5A91A]/10 transition-colors"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 text-xs uppercase tracking-wider font-bold bg-[#E5A91A] text-[#0A0A0A] hover:bg-[#E5A91A]/90 transition-colors"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
