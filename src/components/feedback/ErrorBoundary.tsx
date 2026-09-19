import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { logger } from '@/core/logger/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught React render error', {
      component: 'ErrorBoundary',
      error: error.message,
      stack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
          <div className="max-w-md w-full rounded-2xl border border-stone-200 bg-white p-8 shadow-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-5">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-stone-900">
              Terjadi Kendala pada Halaman
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Aplikasi mengalami kesalahan tak terduga saat memproses tampilan.
              Sistem kasir dapat dipulihkan dengan memuat ulang halaman.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 rounded-lg bg-stone-100 text-left overflow-x-auto text-xs font-mono text-stone-700">
                {this.state.error.message}
              </div>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={this.handleReset}
              >
                Coba Lagi
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Home className="w-4 h-4" />}
                onClick={this.handleReload}
              >
                Muat Ulang Halaman
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
