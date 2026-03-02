import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Activity,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    ShieldCheck
} from 'lucide-react';
import './ResetPassword.css';

function ResetPassword() {
    const navigate = useNavigate();
    const { updatePassword, loading, session } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    // Check if user arrived via a valid recovery link (Supabase sets session automatically)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (session) {
                setIsValidSession(true);
            }
            setCheckingSession(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [session]);

    // Also react if session appears after mount
    useEffect(() => {
        if (session && checkingSession) {
            setIsValidSession(true);
            setCheckingSession(false);
        }
    }, [session, checkingSession]);

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { level: 1, label: 'Débil', color: '#f85149' };
        if (score <= 2) return { level: 2, label: 'Regular', color: '#f0883e' };
        if (score <= 3) return { level: 3, label: 'Buena', color: '#f7c948' };
        if (score <= 4) return { level: 4, label: 'Fuerte', color: '#3fb950' };
        return { level: 5, label: 'Excelente', color: '#58a6ff' };
    };

    const strength = getPasswordStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!password) {
            setError('Por favor, ingresa tu nueva contraseña');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        const { error: updateError } = await updatePassword(password);

        if (updateError) {
            const msg = updateError.message || '';
            if (msg.includes('same_password') || msg.includes('different')) {
                setError('La nueva contraseña debe ser diferente a la anterior.');
            } else if (msg.includes('weak') || msg.includes('short')) {
                setError('La contraseña es demasiado débil. Usa al menos 6 caracteres.');
            } else if (msg.includes('session') || msg.includes('not authenticated')) {
                setError('Tu sesión ha expirado. Solicita un nuevo enlace de recuperación.');
            } else {
                setError('Error al actualizar la contraseña. Intenta nuevamente.');
            }
        } else {
            setSuccess(true);
        }
    };

    // Loading state while checking session
    if (checkingSession) {
        return (
            <div className="reset-page">
                <div className="reset-background">
                    <div className="reset-bg-gradient"></div>
                    <div className="reset-glow-1"></div>
                    <div className="reset-glow-2"></div>
                </div>
                <div className="reset-card">
                    <div className="reset-header">
                        <div className="reset-logo-container">
                            <div className="reset-logo-icon">
                                <Activity />
                            </div>
                        </div>
                        <h1 className="reset-title">Verificando enlace...</h1>
                        <p className="reset-subtitle">Validando tu solicitud de recuperación.</p>
                    </div>
                    <div className="reset-loading-state">
                        <span className="reset-spinner-large"></span>
                    </div>
                </div>
            </div>
        );
    }

    // Invalid / expired link state
    if (!isValidSession) {
        return (
            <div className="reset-page">
                <div className="reset-background">
                    <div className="reset-bg-gradient"></div>
                    <div className="reset-glow-1"></div>
                    <div className="reset-glow-2"></div>
                </div>
                <div className="reset-card">
                    <div className="reset-header">
                        <div className="reset-logo-container">
                            <div className="reset-logo-icon">
                                <Activity />
                            </div>
                        </div>
                    </div>
                    <div className="expired-content">
                        <div className="expired-icon-wrapper">
                            <AlertCircle />
                        </div>
                        <h2>Enlace Inválido o Expirado</h2>
                        <p>
                            Este enlace de recuperación ya no es válido. Puede haber expirado
                            o ya fue utilizado anteriormente.
                        </p>
                        <Link to="/forgot-password" className="reset-action-btn">
                            Solicitar Nuevo Enlace
                        </Link>
                        <Link to="/login" className="back-link-reset">
                            Volver al Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Success screen
    if (success) {
        return (
            <div className="reset-page">
                <div className="reset-background">
                    <div className="reset-bg-gradient"></div>
                    <div className="reset-glow-1"></div>
                    <div className="reset-glow-2"></div>
                </div>
                <div className="reset-card">
                    <div className="reset-header">
                        <div className="reset-logo-container">
                            <div className="reset-logo-icon">
                                <Activity />
                            </div>
                        </div>
                    </div>
                    <div className="success-content">
                        <div className="success-icon-wrapper">
                            <CheckCircle />
                        </div>
                        <h2>¡Contraseña Actualizada!</h2>
                        <p>
                            Tu contraseña ha sido cambiada exitosamente.<br />
                            Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>
                        <Link to="/login" className="reset-action-btn">
                            Ir al Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Main form
    return (
        <div className="reset-page">
            <div className="reset-background">
                <div className="reset-bg-gradient"></div>
                <div className="reset-glow-1"></div>
                <div className="reset-glow-2"></div>
            </div>

            <div className="reset-card">
                <div className="reset-header">
                    <div className="reset-logo-container">
                        <div className="reset-logo-icon">
                            <Activity />
                        </div>
                    </div>
                    <h1 className="reset-title">Nueva Contraseña</h1>
                    <p className="reset-subtitle">
                        Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
                    </p>
                </div>

                {error && (
                    <div className="reset-error">
                        <AlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                <form className="reset-form" onSubmit={handleSubmit}>
                    {/* New Password */}
                    <div className="form-group">
                        <label htmlFor="reset-password">Nueva Contraseña</label>
                        <div className="reset-input-wrapper">
                            <span className="reset-input-icon">
                                <Lock />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="reset-password"
                                className="reset-input has-toggle"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Mínimo 6 caracteres"
                                autoComplete="new-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="reset-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>

                        {/* Strength indicator */}
                        {password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={`strength-segment ${i <= strength.level ? 'active' : ''}`}
                                            style={i <= strength.level ? { background: strength.color } : {}}
                                        />
                                    ))}
                                </div>
                                <span className="strength-label" style={{ color: strength.color }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="reset-confirm">Confirmar Contraseña</label>
                        <div className="reset-input-wrapper">
                            <span className="reset-input-icon">
                                <ShieldCheck />
                            </span>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                id="reset-confirm"
                                className="reset-input has-toggle"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Repite tu nueva contraseña"
                                autoComplete="new-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="reset-toggle-password"
                                onClick={() => setShowConfirm(!showConfirm)}
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <span className="field-error">Las contraseñas no coinciden</span>
                        )}
                        {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                            <span className="field-match">
                                <CheckCircle size={14} /> Contraseñas coinciden
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="reset-button"
                        disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                    >
                        {loading ? (
                            <>
                                <span className="reset-spinner"></span>
                                Actualizando...
                            </>
                        ) : (
                            <>
                                <ShieldCheck />
                                Restablecer Contraseña
                            </>
                        )}
                    </button>
                </form>

                <div className="reset-footer">
                    <Link to="/login" className="back-link-reset">
                        Volver al Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
