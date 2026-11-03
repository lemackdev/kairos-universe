"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  onError: () => void;
  children: ReactNode;
}

export class AssemblyBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("Assembly scene failed; showing static schematic.", error, info.componentStack);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
