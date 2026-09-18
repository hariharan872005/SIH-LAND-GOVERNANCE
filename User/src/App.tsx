import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/common/Header';
import { AppRoutes } from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-emerald-500 selection:text-white">
          <Header />
          <main className="flex-1 relative">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
