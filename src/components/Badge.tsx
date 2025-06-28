import React from 'react';
import styles from '../styles/Badge.module.css';

interface BadgeProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const Badge: React.FC<BadgeProps> = ({ name, description, icon, color }) => {
  const badgeStyle = {
    background: color,
  };

  return (
    <div className={styles.badgeContainer}>
      <div className={styles.badgeCircle} style={badgeStyle}>
        <div className={styles.badgeIcon}>{icon}</div>
      </div>
      <div className={styles.badgeName}>{name}</div>
      <div className={styles.badgeDescription}>{description}</div>
    </div>
  );
};

export default Badge; 