import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Terjadi kesalahan saat menampilkan aplikasi.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SEJATI MAPS ErrorBoundary]', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] p-6 text-[#1C1917]">
          <div className="w-full max-w-md rounded-2xl border border-[#E6E4DF] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-wider text-[#14532D] uppercase">
              SEJATI MAPS
            </p>
            <h1 className="mt-2 text-lg font-bold text-[#1C1917]">
              Gagal Memuat Tampilan Aplikasi
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
              Aplikasi mengalami kendala teknis saat memuat halaman. Silakan muat ulang aplikasi.
            </p>
            {this.state.errorMessage && (
              <div className="mt-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 font-mono text-xs text-[#B91C1C] break-words">
                {this.state.errorMessage}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-5 inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166534]"
            >
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
