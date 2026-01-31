import React from 'react';
import './StudyProgress.css';

/**
 * StudyProgress Component
 * Shows study session progress with stats
 */
function StudyProgress({ current, total, correct, incorrect }) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    const correctPercentage = current > 0 ? Math.round((correct / current) * 100) : 0;

    return (
        <div className="study-progress">
            {/* Progress Bar */}
            <div className="progress-bar-container">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
                <div className="progress-text">
                    {current} / {total}
                </div>
            </div>

            {/* Stats Row */}
            <div className="progress-stats">
                <div className="stat correct">
                    <span className="stat-icon">✓</span>
                    <span className="stat-value">{correct}</span>
                </div>
                <div className="stat incorrect">
                    <span className="stat-icon">✗</span>
                    <span className="stat-value">{incorrect}</span>
                </div>
                {current > 0 && (
                    <div className="stat accuracy">
                        <span className="stat-icon">%</span>
                        <span className="stat-value">{correctPercentage}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudyProgress;
