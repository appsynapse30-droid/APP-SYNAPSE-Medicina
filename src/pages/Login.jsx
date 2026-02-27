import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import {
    Activity,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Mail,
    AlertCircle
} from 'lucide-react';
import './Login.css';

// Google SVG icon
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
    </svg>
);



function Login() {
    const navigate = useNavigate();
    const { signIn, loading, clearError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [socialLoading, setSocialLoading] = useState('');

    // Clear stale auth errors when entering login page
    useEffect(() => {
        clearError();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Por favor, completa todos los campos');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Por favor, ingresa un email válido');
            return;
        }

        const { error: signInError } = await signIn(formData.email, formData.password);

        if (signInError) {
            const msg = signInError.message || '';
            if (msg.includes('Invalid login credentials')) {
                setError('Email o contraseña incorrectos');
            } else if (msg.includes('Email not confirmed')) {
                setError('Por favor, verifica tu email antes de iniciar sesión');
            } else if (msg.includes('rate limit') || msg.includes('too many requests')) {
                setError('Demasiados intentos. Espera unos minutos.');
            } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch')) {
                setError('Error de conexión. Verifica tu internet.');
            } else if (msg.includes('signup_disabled')) {
                setError('El registro está deshabilitado temporalmente.');
            } else {
                setError('Error al iniciar sesión. Intenta nuevamente.');
            }
        } else {
            navigate('/');
        }
    };

    const handleSocialLogin = async (provider) => {
        setSocialLoading(provider);
        setError('');

        try {
            const { error: socialError } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/`
                }
            });

            if (socialError) {
                setError(`Error al acceder con ${provider === 'google' ? 'Google' : 'Apple'}: ${socialError.message}`);
            }
        } catch (err) {
            setError(`Error inesperado: ${err.message}`);
        } finally {
            setSocialLoading('');
        }
    };

    return (
        <div className="login-page">
            {/* Background Layer */}
            <div className="login-background">
                <div className="login-bg-gradient"></div>
                <div className="login-glow-1"></div>
                <div className="login-glow-2"></div>
            </div>

            {/* Login Card */}
            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <Activity />
                    </div>
                    <h1 className="login-title">SYNAPSE</h1>
                    <p className="login-subtitle">
                        Ingresa tus credenciales para continuar tu estudio.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="login-form" style={{ paddingBottom: 0 }}>
                        <div className="login-error">
                            <AlertCircle />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="login-form-group">
                        <label htmlFor="login-email">Email Institucional</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">
                                <Mail />
                            </span>
                            <input
                                type="email"
                                id="login-email"
                                name="email"
                                className="login-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu@universidad.edu"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="login-form-group">
                        <label htmlFor="login-password">Contraseña</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">
                                <Lock />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="login-password"
                                name="password"
                                className="login-input has-toggle"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ingresa tu contraseña"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="login-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="login-actions-row">
                        <label className="login-remember">
                            <input type="checkbox" />
                            <span>Recordar dispositivo</span>
                        </label>
                        <Link to="/forgot-password" className="login-forgot-link">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="login-spinner"></span>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <span>Iniciar Sesión Seguro</span>
                                <ArrowRight />
                                <span className="login-button-pulse">
                                    <span className="ping"></span>
                                    <span className="dot"></span>
                                </span>
                            </>
                        )}
                    </button>
                </form>

                {/* Social Auth Footer */}
                <div className="login-footer">
                    <div className="login-divider">
                        <div className="login-divider-line"></div>
                        <span className="login-divider-text">O accede con</span>
                        <div className="login-divider-line"></div>
                    </div>
                    <div className="login-social-buttons">
                        <button
                            type="button"
                            className="login-social-btn"
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading || !!socialLoading}
                        >
                            {socialLoading === 'google' ? (
                                <span className="login-spinner"></span>
                            ) : (
                                <GoogleIcon />
                            )}
                            <span>Google</span>
                        </button>

                    </div>
                </div>

                {/* Register Link */}
                <div className="login-register-link">
                    ¿No tienes una cuenta?
                    <Link to="/register">Crear Cuenta</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
