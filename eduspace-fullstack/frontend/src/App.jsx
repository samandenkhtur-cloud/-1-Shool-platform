import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { LocaleProvider } from './hooks/useLocale';
import { AppRouter } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 3 },
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRouter />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: '500',
                  borderRadius: '12px',
                  padding: '12px 16px',
                },
              }}
            />
          </AuthProvider>
        </QueryClientProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
