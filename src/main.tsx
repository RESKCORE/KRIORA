import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  throw new Error('VITE_CONVEX_URL is not configured.');
}

const convex = new ConvexReactClient(CONVEX_URL);

if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.add('light');
  document.documentElement.setAttribute('data-theme', 'light');
  try {
    localStorage.removeItem('kriora_theme');
  } catch (_) {}
}

const RootApp = () => {
  if (!PUBLISHABLE_KEY) {
    return <App />;
  }

  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          variables: {
            colorPrimary: '#FF5A36',
            colorBackground: '#ffffff',
            colorText: '#0f172a',
            colorTextSecondary: '#64748b',
            borderRadius: '0.75rem',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ErrorBoundary>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);

