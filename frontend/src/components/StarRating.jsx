import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  onRate = null,
  readOnly = false,
  size = 20,
  showValue = true
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const currentDisplay = hoverRating || rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= currentDisplay;
          return (
            <Star
              key={starIndex}
              size={size}
              style={{
                cursor: readOnly ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                color: isFilled ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)',
                fill: isFilled ? '#fbbf24' : 'transparent',
                transform: (!readOnly && hoverRating === starIndex) ? 'scale(1.15)' : 'scale(1)'
              }}
              onMouseEnter={() => !readOnly && setHoverRating(starIndex)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              onClick={() => !readOnly && onRate && onRate(starIndex)}
            />
          );
        })}
      </div>
      {showValue && (
        <span style={{
          fontWeight: 700,
          fontSize: `${size * 0.75}px`,
          color: rating > 0 ? '#fbbf24' : 'var(--color-text-dim)',
          marginLeft: '0.25rem'
        }}>
          {rating > 0 ? Number(rating).toFixed(1) : 'Unrated'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
