import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Activity,
    Mail,
    ArrowLeft,
    ArrowRight,
    AlertCircle,
    CheckCircle,
    Send
} from 'lucide-react';
import './ForgotPassword.css';

function ForgotPassword() {
    const { resetPassword, loading } = useAuth();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Por favor, ingresa tu email');
            return;
        }

        if (!email.includes('@')) {
            setError('Por favor, ingresa un email válido');
            return;
        }

        const { error: resetError } = await resetPassword(email);

        if (resetError) {
            setError(resetError.message);
        } else {
            setSuccess(true);
        }
    };

    // Success Screen
    if (success) {
        return (
            <div className="forgot-page">
                <div className="forgot-background">
                    <div className="forgot-background-overlay"></div>
                </div>

                <div className="forgot-card">
                    <div className="forgot-header">
                        <div className="forgot-logo-container">
                            <div className="forgot-logo-icon">
                                <Activity />
                            </div>
                        </div>
                    </div>

                    <div className="success-content">
                        <div className="success-icon">
                            <CheckCircle />
                        </div>
                        <h2>¡Email Enviado!</h2>
                        <p>
                            Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
                            <br /><br />
                            Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y sigue las instrucciones para restablecer tu contraseña.
                        </p>
                        <Link to="/login" className="back-to-login-btn">
                            <ArrowLeft />
                            Volver al Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-page">
            {/* Background Layer */}
            <div className="forgot-background">
                <div className="forgot-background-overlay"></div>
            </div>

            {/* Forgot Password Card */}
            <div className="forgot-card">
                {/* Header */}
                <div className="forgot-header">
                    <div className="forgot-logo-container">
                        <div className="forgot-logo-icon">
                            <Activity />
                        </div>
                    </div>
                    <h1 className="forgot-title">Recuperar Contraseña</h1>
                    <p className="forgot-subtitle">
                        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="forgot-error">
                        <AlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form className="forgot-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Institucional</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <Mail />
                            </span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="forgot-input"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                placeholder="tu@email.com"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="forgot-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send />
                                Enviar Enlace de Recuperación
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="forgot-footer">
                    <Link to="/login" className="back-link">
                        <ArrowLeft />
                        Volver al Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
