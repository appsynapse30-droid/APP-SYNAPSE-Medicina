import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Heart,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Mail,
    AlertCircle,
    Activity
} from 'lucide-react';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const { signIn, loading, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberDevice: false
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('student');

    const roles = [
        { id: 'premed', label: 'Pre-Med' },
        { id: 'student', label: 'Estudiante' },
        { id: 'resident', label: 'Residente' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Por favor, completa todos los campos');
            return;
        }

        const { error: signInError } = await signIn(formData.email, formData.password);

        if (signInError) {
            if (signInError.message.includes('Invalid login credentials')) {
                setError('Credenciales incorrectas. Verifica tu email y contraseña.');
            } else if (signInError.message.includes('Email not confirmed')) {
                setError('Por favor, confirma tu email antes de iniciar sesión.');
            } else {
                setError(signInError.message);
            }
        } else {
            navigate('/');
        }
    };

    return (
        <div className="login-page">
            {/* Background Layer */}
            <div className="login-background">
                <div className="login-background-overlay"></div>
            </div>

            {/* Decorative Elements */}
            <div className="login-decorations">
                <Activity className="decoration-icon top-right" />
                <Heart className="decoration-icon bottom-left" />
            </div>

            {/* Login Card */}
            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo-container">
                        <div className="login-logo-icon">
                            <Activity />
                        </div>
                    </div>
                    <h1 className="login-title">SYNAPSE</h1>
                    <p className="login-subtitle">
                        Ingresa tus credenciales para continuar estudiando
                    </p>
                </div>

                {/* Role Selector */}
                <div className="login-role-selector">
                    <div className="role-options">
                        {roles.map(role => (
                            <div key={role.id} className="role-option">
                                <input
                                    type="radio"
                                    id={role.id}
                                    name="role"
                                    value={role.id}
                                    checked={selectedRole === role.id}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                />
                                <label htmlFor={role.id}>{role.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {(error || authError) && (
                    <div className="login-error">
                        <AlertCircle />
                        <span>{error || authError}</span>
                    </div>
                )}

                {/* Login Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {/* Email/ID Input */}
                    <div className="form-group">
                        <label htmlFor="email">Email Institucional o ID</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <Mail />
                            </span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="login-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Ingresa tu email o ID médico"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <Lock />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className="login-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ingresa tu contraseña"
                                autoComplete="current-password"
                                disabled={loading}
                                style={{ paddingRight: '48px' }}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="login-actions-row">
                        <label className="remember-device">
                            <input
                                type="checkbox"
                                name="rememberDevice"
                                checked={formData.rememberDevice}
                                onChange={handleChange}
                            />
                            <span>Recordar dispositivo</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-password">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <span>Iniciar Sesión Seguro</span>
                                <ArrowRight />
                                <span className="button-pulse">
                                    <span className="pulse-ring"></span>
                                    <span className="pulse-dot"></span>
                                </span>
                            </>
                        )}
                    </button>
                </form>

                {/* Social Login Footer */}
                <div className="login-footer">
                    <div className="divider-with-text">
                        <div className="divider-line"></div>
                        <span className="divider-text">O accede con</span>
                        <div className="divider-line"></div>
                    </div>
                    <div className="social-buttons">
                        <button type="button" className="social-button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                            <span>Google</span>
                        </button>
                        <button type="button" className="social-button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.1 1.88-2.6 5.8 1.05 7.15-.4 1.25-1.5 3-3.1 4.06zm-4.7-14.7c.3-.2.5-.5.6-.8.2-.4.2-.8.1-1.2-.4.1-.8.3-1.1.6-.3.2-.5.5-.6.9-.2.4-.2.8-.1 1.2.4-.1.8-.3 1.1-.7z" />
                            </svg>
                            <span>Apple</span>
                        </button>
                    </div>
                </div>

                {/* Register Link */}
                <div className="register-link-section">
                    <p>
                        ¿No tienes una cuenta?
                        <Link to="/register">Regístrate aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
