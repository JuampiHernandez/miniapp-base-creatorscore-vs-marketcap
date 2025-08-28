"use client";

import { useMiniKit, useAddFrame } from "@coinbase/onchainkit/minikit";
import { useEffect, useMemo, useState, useCallback } from "react";
import { CreatorScoreProfile } from "./components/creator-score/CreatorScoreProfile";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);

  const addFrame = useAddFrame();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          onClick={handleAddFrame}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Save App
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
          <span>✅</span>
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 h-11">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">📊</div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Creator Score</h1>
              <p className="text-xs text-gray-600">vs Market Cap</p>
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <CreatorScoreProfile />
        </main>

        {/* Footer */}
        <footer className="mt-8 pt-4 flex justify-center">
          <button
            className="text-gray-500 text-xs hover:text-gray-700 transition-colors"
            onClick={() => window.open("https://base.org/builders/minikit", "_blank")}
          >
            Built on Base with MiniKit
          </button>
        </footer>
      </div>
    </div>
  );
}
