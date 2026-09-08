import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-6 p-8">
          <div className="mystery-static absolute inset-0 opacity-20 pointer-events-none" />
          <h1 className="font-display text-4xl text-primary blood-glow relative z-10">
            SIGNAL LOST
          </h1>
          <p className="type-label text-muted-foreground relative z-10 text-center max-w-sm">
            Something went wrong. The tape may be damaged.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="relative z-10 vcr-button type-label uppercase px-6 py-3 text-primary border border-primary/50 hover:bg-primary/10 transition-colors"
          >
            REWIND &amp; RETRY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
