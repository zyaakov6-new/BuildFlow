"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Scoped client-side error boundary.
 * Use this to wrap smaller sections (e.g. a single widget on the dashboard)
 * so one component's crash does not take down the entire screen.
 *
 * Usage:
 *   <ErrorBoundary fallback={<FallbackUI />}>
 *     <RiskyComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[BondFlow] ErrorBoundary caught:", error, info);
    // Forward to Sentry if available
    if (typeof window !== "undefined" && (window as unknown as { Sentry?: { captureException: (e: Error) => void } }).Sentry) {
      (window as unknown as { Sentry: { captureException: (e: Error) => void } }).Sentry.captureException(error);
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        className="rounded-2xl p-5 text-center border"
        style={{
          background: "white",
          borderColor: "oklch(0.9 0.04 25 / 0.4)",
          boxShadow: "0 2px 10px oklch(0 0 0 / 0.05)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl"
          style={{ background: "oklch(0.92 0.05 25 / 0.3)" }}
        >
          ⚠️
        </div>
        <p className="text-sm font-black mb-1" style={{ color: "oklch(0.2 0.03 255)" }}>
          משהו השתבש כאן
        </p>
        <p className="text-xs mb-3" style={{ color: "oklch(0.55 0.03 255)" }}>
          ניסיון חוזר בדרך כלל פותר את זה.
        </p>
        <button
          onClick={this.reset}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: "oklch(0.65 0.14 140)" }}
        >
          נסה שוב
        </button>
      </div>
    );
  }
}
