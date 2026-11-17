import { Component, type ComponentType, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorFallbackProps { error: Error; resetError: () => void }
interface ErrorBoundaryProps { children: ReactNode; FallbackComponent?: ComponentType<ErrorFallbackProps>; resetKey?: unknown }
interface ErrorBoundaryState { error: Error | null }

function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  try { return new Error(JSON.stringify(value)); } catch { return new Error(String(value)); }
}

function DefaultFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        {import.meta.env.DEV ? <pre className="mt-4 overflow-x-auto rounded p-3 text-left text-xs">{error.message || String(error)}</pre> : null}
        <button type="button" onClick={resetError} className="mt-4 rounded px-4 py-2 text-sm">Try again</button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState { return { error: toError(error) }; }
  componentDidCatch(error: unknown, info: ErrorInfo): void { console.error('ErrorBoundary caught an error:', toError(error), info.componentStack); }
  componentDidUpdate(prev: ErrorBoundaryProps): void { if (this.state.error !== null && prev.resetKey !== this.props.resetKey) this.resetError(); }
  resetError = (): void => { this.setState({ error: null }); };
  render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}
