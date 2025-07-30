import React from 'react';
import Certificate from '../Certificate';
import PaywallWrapper from '../payments/PaywallWrapper';
import { QuizCompletion } from '@/types/database';

interface ProtectedCertificateProps {
  contentId: string; // The content ID that needs to be purchased
  completion: QuizCompletion;
  userName: string;
  quizTitle: string;
  onDownload?: () => void;
}

const ProtectedCertificate: React.FC<ProtectedCertificateProps> = ({
  contentId,
  completion,
  userName,
  quizTitle,
  onDownload,
}) => {
  return (
    <PaywallWrapper
      contentId={contentId}
      contentTitle={quizTitle}
      contentType="certificate"
      showPreview={true}
      previewMessage={`Download your personalized CPD certificate for completing "${quizTitle}".`}
    >
      <Certificate
        completion={completion}
        userName={userName}
        quizTitle={quizTitle}
        onDownload={onDownload}
      />
    </PaywallWrapper>
  );
};

export default ProtectedCertificate;