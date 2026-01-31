import React from 'react';
import './FlashcardView.css';

/**
 * FlashcardView Component
 * Displays a flashcard with flip animation
 */
function FlashcardView({ card, showAnswer, isFlipping, onFlip }) {
    if (!card) return null;

    const getPriorityBadge = (priority) => {
        const badges = {
            CRITICAL: { label: 'Crítico', color: '#ef4444' },
            HIGH: { label: 'Alta', color: '#f59e0b' },
            NORMAL: { label: 'Normal', color: '#6366f1' },
            LOW: { label: 'Baja', color: '#6b7280' }
        };
        return badges[priority] || badges.NORMAL;
    };

    const priorityBadge = getPriorityBadge(card.priority);

    return (
        <div
            className={`flashcard-container ${isFlipping ? 'flipping' : ''}`}
            onClick={!showAnswer ? onFlip : undefined}
        >
            <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
                {/* Front - Question */}
                <div className="flashcard-face flashcard-front">
                    {/* Priority Badge */}
                    {card.priority && card.priority !== 'NORMAL' && (
                        <span
                            className="priority-badge"
                            style={{ backgroundColor: priorityBadge.color }}
                        >
                            {priorityBadge.label}
                        </span>
                    )}

                    {/* Deck Info */}
                    {card.flashcard_decks && (
                        <div className="deck-badge">
                            <span className="deck-icon">{card.flashcard_decks.icon || '📚'}</span>
                            <span className="deck-name">{card.flashcard_decks.name}</span>
                        </div>
                    )}

                    {/* Question */}
                    <div className="card-content">
                        <div className="question-text">
                            {card.front_content}
                        </div>
                    </div>

                    {/* Hint to tap */}
                    <div className="tap-hint">
                        <span className="tap-icon">👆</span>
                        <span>Toca para ver la respuesta</span>
                    </div>
                </div>

                {/* Back - Answer */}
                <div className="flashcard-face flashcard-back">
                    {/* Question reminder */}
                    <div className="question-reminder">
                        {card.front_content}
                    </div>

                    {/* Divider */}
                    <div className="answer-divider">
                        <span>Respuesta</span>
                    </div>

                    {/* Answer */}
                    <div className="card-content">
                        <div className="answer-text">
                            {card.back_content}
                        </div>

                        {/* Extra info if available */}
                        {card.extra_info && (
                            <div className="extra-info">
                                <details>
                                    <summary>💡 Más información</summary>
                                    <div className="extra-content">
                                        {card.extra_info}
                                    </div>
                                </details>
                            </div>
                        )}

                        {/* Tags */}
                        {card.tags && card.tags.length > 0 && (
                            <div className="card-tags">
                                {card.tags.map((tag, index) => (
                                    <span key={index} className="tag">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FlashcardView;
