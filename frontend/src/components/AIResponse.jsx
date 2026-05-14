import React from 'react';
import Markdown from 'react-markdown';

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
  if (!data) return null;

  const content = data?.choices?.[0]?.message?.content || 'No response generated';
  const model = data?.model || 'AI';
  const tokens = data?.usage?.total_tokens;

  return (
    <div className="ai-response-container">
      <div className="ai-response-header">
        <div className="ai-icon">✨</div>
        <div>
          <h3>AI Analysis</h3>
          <small>Powered by AI Assistant</small>
        </div>
      </div>
      <div className="ai-response-body">
        <Markdown>{content}</Markdown>
      </div>
      <div className="ai-response-meta">
        <span className="model-badge">{model}</span>
        {tokens && <span>{tokens} tokens used</span>}
      </div>
    </div>
  );
}
