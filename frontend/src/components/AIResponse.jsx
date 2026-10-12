import React from 'react';
import AIReport from './AIReport';

export default function AIResponse({ data, loading }) {
  if (loading) {
    return (
      <div className="ai-response-container">
        <div className="ai-loading">
          <div className="spinner"></div>
          <span>AI is thinking...</span>
        </div>
      </div>
    );
  }
  if (data === null || data === undefined) return null;

  const content = data?.choices?.[0]?.message?.content ?? data?.content ?? data;
  const model = data?.model;
  const tokens = data?.usage?.total_tokens;

  return <AIReport response={content} title="AI Analysis" model={model} tokens={tokens} />;
}
