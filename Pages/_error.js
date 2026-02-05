import React from 'react';
import { Button } from '@/components/ui/button';

function ErrorPage({ statusCode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="text-gray-400">
          {statusCode
            ? `A server error occurred (status ${statusCode}).`
            : 'A client error occurred. Please refresh the page.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Button variant="ghost" onClick={() => (window.location.href = '/')}>Go Home</Button>
        </div>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
