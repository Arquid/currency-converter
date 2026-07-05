import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null}

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="result-box result-box--error">
          <p className="result-error">⚠ Something went wrong. Please reload the page.</p>
          <button className="refresh-btn" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}