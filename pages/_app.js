import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '../Layout';
import '../styles/globals.css';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout currentPageName={Component.displayName || Component.name || 'Page'}>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  );
}
