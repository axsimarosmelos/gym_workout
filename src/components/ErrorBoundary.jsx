import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main className="fatal-error"><h1>Something interrupted the app.</h1><p>Your saved data has not been cleared. Reload the page to try again.</p><button className="btn" onClick={() => window.location.reload()}>Reload</button><details><summary>Technical detail</summary><pre>{this.state.error.message}</pre></details></main>;
    return this.props.children;
  }
}
