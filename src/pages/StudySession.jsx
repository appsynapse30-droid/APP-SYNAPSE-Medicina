import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFSRS } from '../context/FSRSContext';
import { useAuth } from '../context/AuthContext';
import FlashcardView from '../components/study/FlashcardView';
import RatingButtons from '../components/study/RatingButtons';
import StudyProgress from '../components/study/StudyProgress';
import './StudySession.css';

function StudySession() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const deckId = searchParams.get('deck');

    const { user } = useAuth();
    const {
        isStudying,
        loading,
        error,
        studyQueue,
        startStudySession,
        endStudySession,
        getCurrentCard,
        getCurrentSchedulingOptions,
        answerCard,
        skipCard,
        getProgress,
        sessionStats
    } = useFSRS();

    const [showAnswer, setShowAnswer] = useState(false);
    const [isFlipping, setIsFlipping] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    // Start session on mount
    useEffect(() => {
        if (user && !isStudying) {
            startStudySession(deckId, {
                includeNew: true,
                newCardsLimit: 20,
                reviewLimit: 100
            });
        }
    }, [user, deckId, startStudySession, isStudying]);

    // Check if session is complete
    useEffect(() => {
        if (isStudying && studyQueue.length > 0) {
            const progress = getProgress();
            if (progress.remaining === 0 && progress.completed > 0) {
                setSessionComplete(true);
            }
        }
    }, [isStudying, studyQueue, getProgress]);

    const currentCard = getCurrentCard();
    const schedulingOptions = getCurrentSchedulingOptions();
    const progress = getProgress();

    const handleShowAnswer = () => {
        setIsFlipping(true);
        setTimeout(() => {
            setShowAnswer(true);
            setIsFlipping(false);
        }, 150);
    };

    const handleRating = async (rating) => {
        setShowAnswer(false);
        await answerCard(rating);
    };

    const handleSkip = () => {
        setShowAnswer(false);
        skipCard();
    };

    const handleEndSession = async () => {
        await endStudySession();
        navigate('/dashboard');
    };

    const handleContinue = () => {
        setSessionComplete(false);
        // Restart session to get any remaining cards
        startStudySession(deckId, {
            includeNew: true,
            newCardsLimit: 10,
            reviewLimit: 50
        });
    };

    // Loading state
    if (loading && !isStudying) {
        return (
            <div className="study-session-page">
                <div className="study-loading">
                    <span className="loading-brain">🧠</span>
                    <p>Preparando sesión de estudio...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="study-session-page">
                <div className="study-error">
                    <span className="error-icon">⚠️</span>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/dashboard')}>
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // No cards available
    if (isStudying && studyQueue.length === 0) {
        return (
            <div className="study-session-page">
                <div className="no-cards">
                    <span className="celebration-icon">🎉</span>
                    <h2>¡No hay tarjetas pendientes!</h2>
                    <p>Has completado todas tus revisiones por hoy.</p>
                    <button onClick={() => navigate('/dashboard')} className="primary-button">
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Session complete
    if (sessionComplete) {
        return (
            <div className="study-session-page">
                <div className="session-complete">
                    <div className="complete-header">
                        <span className="trophy-icon">🏆</span>
                        <h2>¡Sesión Completada!</h2>
                    </div>

                    <div className="session-stats-grid">
                        <div className="stat-card">
                            <span className="stat-value">{sessionStats.studied}</span>
                            <span className="stat-label">Tarjetas</span>
                        </div>
                        <div className="stat-card correct">
                            <span className="stat-value">{sessionStats.correct}</span>
                            <span className="stat-label">Correctas</span>
                        </div>
                        <div className="stat-card incorrect">
                            <span className="stat-value">{sessionStats.incorrect}</span>
                            <span className="stat-label">A repasar</span>
                        </div>
                        <div className="stat-card accuracy">
                            <span className="stat-value">{progress.accuracy}%</span>
                            <span className="stat-label">Precisión</span>
                        </div>
                    </div>

                    <div className="complete-actions">
                        <button onClick={handleContinue} className="secondary-button">
                            Continuar Estudiando
                        </button>
                        <button onClick={handleEndSession} className="primary-button">
                            Finalizar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="study-session-page">
            {/* Header */}
            <header className="study-header">
                <button className="back-button" onClick={handleEndSession}>
                    ← Salir
                </button>
                <div className="deck-info">
                    {currentCard?.flashcard_decks?.name || 'Sesión de Estudio'}
                </div>
                <button className="skip-button" onClick={handleSkip}>
                    Saltar
                </button>
            </header>

            {/* Progress Bar */}
            <StudyProgress
                current={progress.currentIndex}
                total={progress.total}
                correct={sessionStats.correct}
                incorrect={sessionStats.incorrect}
            />

            {/* Main Content */}
            <main className="study-content">
                {currentCard ? (
                    <>
                        {/* Flashcard */}
                        <FlashcardView
                            card={currentCard}
                            showAnswer={showAnswer}
                            isFlipping={isFlipping}
                            onFlip={handleShowAnswer}
                        />

                        {/* Action Area */}
                        <div className="study-actions">
                            {!showAnswer ? (
                                <button
                                    className="show-answer-button"
                                    onClick={handleShowAnswer}
                                >
                                    Mostrar Respuesta
                                </button>
                            ) : (
                                <RatingButtons
                                    options={schedulingOptions}
                                    onRate={handleRating}
                                    loading={loading}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="no-current-card">
                        <p>Cargando siguiente tarjeta...</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default StudySession;
