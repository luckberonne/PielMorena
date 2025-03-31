import React from 'react';
import { FeedbackMessage as FeedbackType } from '../types/product';

interface FeedbackMessageProps {
  feedback: FeedbackType;
}

export default function FeedbackMessage({ feedback }: FeedbackMessageProps) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {feedback.message}
    </div>
  );
}