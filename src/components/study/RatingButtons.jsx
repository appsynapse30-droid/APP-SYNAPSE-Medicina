import React from 'react';
import './RatingButtons.css';

/**
 * RatingButtons Component
 * Displays rating buttons (AGAIN, HARD, GOOD, EASY) with calculated intervals
 */
function RatingButtons({ options, onRate, loading }) {
    if (!options) return null;

    const buttonConfig = [
        {
            key: 'AGAIN',
            rating: 1,
            label: 'Otra vez',
            shortLabel: 'Again',
            color: '#ef4444',
            icon: '❌'
        },
        {
            key: 'HARD',
            rating: 2,
            label: 'Difícil',
            shortLabel: 'Hard',
            color: '#f59e0b',
            icon: '😅'
        },
        {
            key: 'GOOD',
            rating: 3,
            label: 'Bien',
            shortLabel: 'Good',
            color: '#10b981',
            icon: '✓'
        },
        {
            key: 'EASY',
            rating: 4,
            label: 'Fácil',
            shortLabel: 'Easy',
            color: '#06b6d4',
            icon: '⭐'
        }
    ];

    return (
        <div className="rating-buttons">
            {buttonConfig.map(({ key, rating, label, color, icon }) => (
                <button
                    key={key}
                    className="rating-button"
                    style={{ '--button-color': color }}
                    onClick={() => onRate(rating)}
                    disabled={loading}
                >
                    <span className="rating-icon">{icon}</span>
                    <span className="rating-label">{label}</span>
                    <span className="rating-interval">
                        {options[key]?.label || '...'}
                    </span>
                </button>
            ))}
        </div>
    );
}

export default RatingButtons;
