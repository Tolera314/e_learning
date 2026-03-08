'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary — catches JS errors in any child component tree
 * and shows a graceful fallback instead of crashing the entire dashboard.
 * 
 * Usage:
 *   <ErrorBoundary componentName="StudentProgressTracker">
 *     <StudentProgressTracker />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send this to your logging service
    console.error(`[ErrorBoundary] ${this.props.componentName ?? 'Component'} crashed:`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-red-500/30 bg-red-500/10 text-center gap-4">
          <div className="text-red-400 text-4xl">⚠️</div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">
              {this.props.componentName ?? 'This section'} failed to load
            </h3>
            <p className="text-slate-400 text-sm max-w-sm">
              An unexpected error occurred. Your data is safe. Try refreshing or click below.
            </p>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-xs text-red-300 bg-red-900/20 rounded p-3 max-w-full overflow-auto text-left">
              {this.state.error?.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
