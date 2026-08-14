import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public declare props: Props;
  public declare state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-xl font-bold border border-red-100">
              ⚠️
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-slate-900">Session Connection Interrupted</h2>
              <p className="text-xs text-slate-500 font-mono leading-relaxed">
                {this.state.error?.message || 'A temporary authentication or connection issue occurred.'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-[#FF5A36] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Refresh Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
