import React from 'react';
import Quiz from '../Quiz';
import PaywallWrapper from '../payments/PaywallWrapper';

interface ProtectedQuizProps {
  contentId: string; // The content ID that needs to be purchased
  quizId: string; // Required - every podcast now has a quiz
  podcastId?: string;
  episodeTitle?: string;
  episodeDuration?: number; // Duration in seconds for CPD calculation
  onComplete?: () => void; // Callback when quiz is completed
}

const ProtectedQuiz: React.FC<ProtectedQuizProps> = ({
  contentId,
  quizId,
  podcastId,
  episodeTitle,
  episodeDuration,
  onComplete,
}) => {
  return (
    <PaywallWrapper
      contentId={contentId}
      contentTitle={episodeTitle}
      contentType="quiz"
      showPreview={true}
      previewMessage={`Complete the quiz for "${episodeTitle}" to test your knowledge and earn CPD credits.`}
    >
      <Quiz
        quizId={quizId}
        podcastId={podcastId}
        episodeTitle={episodeTitle}
        episodeDuration={episodeDuration}
        onComplete={onComplete}
      />
    </PaywallWrapper>
  );
};

export default ProtectedQuiz;