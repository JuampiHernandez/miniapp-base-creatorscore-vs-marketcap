"use client";

import { useState } from 'react';

interface TestResult {
  type?: string;
  data?: Record<string, unknown>;
  success?: boolean;
  error?: string;
}

export default function DebugPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCreatorScore = async () => {
    try {
      setError('');
      setTestResult(null);
      setLoading(true);
      
      // Test our server-side API route for creator score
      const response = await fetch('/api/creator-score?fid=6730');
      
      if (!response.ok) {
        throw new Error(`API Route Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestResult({ type: 'creator_score', data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testCredentials = async () => {
    try {
      setError('');
      setTestResult(null);
      setLoading(true);
      
      // Test our server-side API route for credentials (market cap)
      const response = await fetch('/api/credentials?fid=6730&slug=zora');
      
      if (!response.ok) {
        throw new Error(`API Route Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestResult({ type: 'credentials', data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDirectApi = async () => {
    try {
      setError('');
      setTestResult(null);
      setLoading(true);
      
      // Test direct Talent API (this will fail without API key in client)
      const response = await fetch(
        `https://api.talentprotocol.com/score?id=6730&account_source=farcaster&scorer_slug=creator_score`
      );
      
      if (!response.ok) {
        throw new Error(`Direct API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestResult({ type: 'direct_api', data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Page - Talent Protocol API</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Test API Routes</h2>
          <div className="space-x-2">
            <button 
              onClick={testCreatorScore}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Creator Score'}
            </button>
            
            <button 
              onClick={testCredentials}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Credentials (Market Cap)'}
            </button>
            
            <button 
              onClick={testDirectApi}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Direct API'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="text-red-600">
            <h3 className="font-semibold">Error:</h3>
            <p>{error}</p>
          </div>
        )}
        
        {testResult && (
          <div>
            <h3 className="font-semibold">API Response ({testResult.type}):</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
