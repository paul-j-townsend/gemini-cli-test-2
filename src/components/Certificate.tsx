import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { QuizCompletion } from '@/types/database';

interface CertificateProps {
  completion: QuizCompletion;
  userName: string;
  quizTitle: string;
  onDownload?: () => void;
}

const Certificate: React.FC<CertificateProps> = ({ 
  completion, 
  userName, 
  quizTitle, 
  onDownload 
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      // First try html2canvas
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let canvas;
      try {
        canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          backgroundColor: '#667eea',
          useCORS: true,
          allowTaint: true,
          logging: true,
          height: 600,
          width: 800,
          scrollX: 0,
          scrollY: 0,
          removeContainer: true,
        });
      } catch (html2canvasError) {
        console.warn('html2canvas failed, using fallback method:', html2canvasError);
        // Fallback: create canvas manually
        canvas = await createCertificateCanvas();
      }

      // Check if canvas is not empty
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas is empty - failed to capture element');
      }

      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      // Check if dataURL contains actual image data
      if (dataURL === 'data:image/png;base64,' || dataURL.length < 100) {
        throw new Error('Generated image is empty');
      }

      const link = document.createElement('a');
      link.download = `${userName.replace(/\s+/g, '_')}_${quizTitle.replace(/\s+/g, '_')}_Certificate.png`;
      link.href = dataURL;
      link.click();

      // Don't automatically close modal after download
      // Users can use the X button to close if they want
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    }
  };

  const createCertificateCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Add border
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, 780, 580);
    
    // Add inner border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 740, 540);
    
    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Title
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText('Certificate of Completion', 400, 100);
    
    // Subtitle
    ctx.font = '18px Georgia, serif';
    ctx.fillText('VETERINARY CPD', 400, 130);
    
    // "This certifies that"
    ctx.font = '20px Georgia, serif';
    ctx.fillText('This certifies that', 400, 200);
    
    // User name
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText(userName, 400, 260);
    
    // Line under name
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 275);
    ctx.lineTo(600, 275);
    ctx.stroke();
    
    // "has successfully completed"
    ctx.font = '20px Georgia, serif';
    ctx.fillText('has successfully completed the course', 400, 320);
    
    // Quiz title
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText(quizTitle, 400, 360);
    
    // Score and points
    ctx.font = '16px Georgia, serif';
    const cpdPoints = Math.max(1, Math.floor(completion.time_spent / 600) + (completion.percentage >= 90 ? 1 : 0));
    const cpdText = `${cpdPoints} CPD ${cpdPoints === 1 ? 'point' : 'points'} earned`;
    ctx.fillText(cpdText, 400, 390);
    
    // Date centered
    ctx.textAlign = 'center';
    ctx.font = '14px Georgia, serif';
    ctx.fillText('Date of Completion', 400, 470);
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText(formatDate(completion.completed_at), 400, 500);
    
    // Footer
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText('Vet Sidekick', 400, 550);
    ctx.font = '12px Georgia, serif';
    ctx.fillText('Continuing Professional Development Platform', 400, 570);
    
    return canvas;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateCPDPoints = () => {
    // Calculate CPD points based on time spent and score
    // Base: 1 point per 10 minutes, bonus for high scores
    const basePoints = Math.floor(completion.time_spent / 600); // 1 point per 10 minutes
    const scoreBonus = completion.percentage >= 90 ? 1 : 0;
    return Math.max(1, basePoints + scoreBonus); // Minimum 1 CPD point
  };

  const formatCPDPoints = () => {
    const points = calculateCPDPoints();
    return `${points} CPD ${points === 1 ? 'point' : 'points'} earned`;
  };

  return (
    <div className="certificate-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div 
        ref={certificateRef}
        className="certificate"
        style={{
          width: '800px',
          height: '600px',
          background: '#667eea',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '20px solid #2d3748',
          borderRadius: '20px',
          position: 'relative',
          fontFamily: 'Georgia, serif',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          margin: '0 auto'
        }}
      >
        {/* Background Pattern */}
        <div 
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(255,255,255,0.05)',
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.02) 10px,
                rgba(255,255,255,0.02) 20px
              )
            `,
            pointerEvents: 'none'
          }}
        />
        
        {/* Decorative Border */}
        <div 
          style={{
            position: 'absolute',
            top: '30px',
            left: '30px',
            right: '30px',
            bottom: '30px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            pointerEvents: 'none'
          }}
        />
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '900', 
            margin: '0 0 10px 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontFamily: 'Georgia, serif',
            color: '#ffffff'
          }}>
            Certificate of Completion
          </h1>
          <div style={{ 
            fontSize: '18px', 
            opacity: 0.95,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: '600',
            color: '#ffffff'
          }}>
            Veterinary CPD
          </div>
        </div>

        {/* Main Content */}
        <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '20px', marginBottom: '20px', opacity: 0.95, color: '#ffffff', fontWeight: '500' }}>
            This certifies that
          </div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: '900', 
            margin: '20px 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            borderBottom: '2px solid rgba(255,255,255,0.4)',
            paddingBottom: '10px',
            color: '#ffffff',
            fontFamily: 'Georgia, serif'
          }}>
            {userName}
          </div>
          <div style={{ fontSize: '20px', marginBottom: '10px', opacity: 0.95, color: '#ffffff', fontWeight: '500' }}>
            has successfully completed the course
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            margin: '20px 0',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            color: '#ffffff',
            fontFamily: 'Georgia, serif'
          }}>
            {quizTitle}
          </div>
          <div style={{ 
            fontSize: '16px', 
            marginTop: '20px',
            opacity: 0.9,
            color: '#ffffff',
            fontStyle: 'italic'
          }}>
            {formatCPDPoints()}
          </div>
        </div>

        {/* Date */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          width: '100%',
          maxWidth: '600px',
          marginTop: '30px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px', color: '#ffffff', fontWeight: '500' }}>
              Date of Completion
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {formatDate(completion.completed_at)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 1
        }}>
          <div style={{ fontSize: '16px', fontWeight: '900', marginBottom: '5px', color: '#ffffff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            Vet Sidekick
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9, color: '#ffffff', fontWeight: '500' }}>
            Continuing Professional Development Platform
          </div>
        </div>

        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '60px',
          width: '40px',
          height: '40px',
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(255,255,255,0.3)'
        }} />
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '60px',
          width: '40px',
          height: '40px',
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(255,255,255,0.3)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '100px',
          left: '60px',
          width: '30px',
          height: '30px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(255,255,255,0.25)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '100px',
          right: '60px',
          width: '30px',
          height: '30px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(255,255,255,0.25)'
        }} />
        
        {/* Additional decorative elements */}
        <div style={{
          position: 'absolute',
          top: '120px',
          left: '100px',
          width: '15px',
          height: '15px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          top: '120px',
          right: '100px',
          width: '15px',
          height: '15px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '50%'
        }} />
      </div>

      {/* Download Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={downloadCertificate}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          📄 Download Certificate
        </button>
      </div>
    </div>
  );
};

export default Certificate;