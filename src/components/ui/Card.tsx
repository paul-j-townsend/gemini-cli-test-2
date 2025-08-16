import React, { useMemo } from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  compact?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = React.memo(({
  title,
  children,
  className = '',
  actions,
  compact = false,
  bordered = true
}) => {
  const cardClasses = useMemo(() => [
    'bg-white rounded-xl overflow-hidden',
    bordered ? 'shadow-soft border border-emerald-200' : '',
    compact ? 'p-4' : 'p-6',
    className
  ].filter(Boolean).join(' '), [bordered, compact, className]);

  return (
    <div className={cardClasses}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-emerald-800">{title}</h2>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;