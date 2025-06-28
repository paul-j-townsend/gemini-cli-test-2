import React from 'react';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

// Engagement
export const HeadphoneIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v3z"></path>
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3z"></path>
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

export const FireIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c2.4 2.4 3.6 5.1 3.6 8.1 0 3.3-1.5 6.2-3.6 8.1-2.1-1.9-3.6-4.8-3.6-8.1 0-3 1.2-5.7 3.6-8.1z"></path>
    <path d="M15.6 6.4C14.4 5.2 13.2 4.1 12 2"></path>
    <path d="M8.4 6.4c1.2-1.2 2.4-2.3 3.6-4.4"></path>
    <path d="M12 22c-1.2-1.2-2.4-2.3-3.6-4.4"></path>
    <path d="M15.6 17.6c-1.2 1.2-2.4 2.3-3.6 4.4"></path>
  </svg>
);

export const CompassIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
  </svg>
);

export const RepeatIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"></polyline>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
    <polyline points="7 23 3 19 7 15"></polyline>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
  </svg>
);

// Learning
export const PencilIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
        <path d="M18 13l-1.5-1.5"></path>
        <path d="M4 22l-3-3 7-7"></path>
    </svg>
);

export const BrainIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.2.5 2.3 1.3 3.1-1.3 1.6-1.3 3.8 0 5.4 1.3 1.6 3.4 2.2 5.2 1.5.7.8 1.8 1.5 3 1.5 2.5 0 4.5-2 4.5-4.5S20.5 9 18 9c-1.2 0-2.3.5-3.1 1.3-1.6-1.3-3.8-1.3-5.4 0-1.6 1.3-2.2 3.4-1.5 5.2.8.7 1.5 1.8 1.5 3 0 2.5-2 4.5-4.5 4.5S5 20.5 5 18c0-1.2.5-2.3 1.3-3.1C5 13.3 5 11.1 6.3 9.5 7.9 8.2 10 7.6 11.8 8.3c.7-.8 1.8-1.3 3.1-1.3 2.5 0 4.5 2 4.5 4.5"></path>
    </svg>
);

export const TargetIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
    </svg>
);

export const ArrowUpRightIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="7" y1="17" x2="17" y2="7"></line>
        <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
);

export const LaurelWreathIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 64 64">
        <path fill="currentColor" d="M33.1,51.1c-6-1.3-11.3-4.9-15.6-10.2c-4.8-6-7.3-13.3-7.3-21.3C10.2,12.7,14.7,6.8,21.5,3c1.3-0.7,2.8-0.5,3.8,0.5 c1,1,1.3,2.5,0.5,3.8c-5.8,3.2-9.5,8.1-9.5,13.3c0,7.1,2.4,13.6,6.5,18.9c3.8,4.8,8.4,7.9,13.8,9.2c1.5,0.3,2.5,1.7,2.2,3.2 C38.1,53.4,36.5,54.4,35,54.1C34.3,53.9,33.1,51.1,33.1,51.1z M51.5,3c-1.3-0.7-2.8-0.5-3.8,0.5c-1,1-1.3,2.5-0.5,3.8 c5.8,3.2,9.5,8.1,9.5,13.3c0,7.1-2.4,13.6-6.5,18.9c-3.8,4.8-8.4,7.9-13.8,9.2c-1.5,0.3-2.5,1.7-2.2,3.2c0.3,1.5,1.7,2.5,3.2,2.2 c6-1.3,11.3-4.9,15.6-10.2c4.8-6,7.3-13.3,7.3-21.3C63.8,12.7,59.3,6.8,52.5,3C52.1,2.8,51.8,2.9,51.5,3z"></path>
    </svg>
);

// Certification
export const CertificateIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
        <circle cx="12" cy="15" r="3"></circle>
    </svg>
);

export const MicroscopeIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2"></path>
        <path d="M14 18h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2"></path>
        <path d="M8 18v-5a4 4 0 0 1 8 0v5"></path>
        <line x1="12" y1="3" x2="12" y2="8"></line>
        <line x1="10" y1="3" x2="14" y2="3"></line>
    </svg>
);

// Community & Fun
export const UsersIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

export const UserCheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <polyline points="17 11 19 13 23 9"></polyline>
    </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
);

export const MessageSquareIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

export const GiftIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12"></polyline>
        <rect x="2" y="7" width="20" height="5"></rect>
        <line x1="12" y1="22" x2="12" y2="7"></line>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
);

// Generic
export const PawIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 11.5C12 9.5 10.5 8 8.5 8S5 9.5 5 11.5 6.5 15 8.5 15s3.5-1.5 3.5-3.5z"></path>
    <path d="M15.5 8C17.5 8 19 9.5 19 11.5S17.5 15 15.5 15 12 13.5 12 11.5 13.5 8 15.5 8z"></path>
    <path d="M8.5 15a5.5 5.5 0 0 0 7 0"></path>
    <path d="M5.2 11.5A6.8 6.8 0 0 1 12 5a6.8 6.8 0 0 1 6.8 6.5"></path>
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export const CheckSquareIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
); 