import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-state">
          <div className="app-error-card">
            <span className="app-error-icon"><AlertTriangle size={22} /></span>
            <span className="section-kicker"><span className="section-kicker-line" /> Workspace error</span>
            <h2>We hit a small snag</h2>
            <p>That page could not finish loading. Try again, and your workspace should be right where you left it.</p>
            <button onClick={() => window.location.reload()} className="primary-owner-button"><RotateCcw size={15} /> Try again</button>
            <details><summary>Show technical details</summary><pre>{this.state.error?.stack}</pre></details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
