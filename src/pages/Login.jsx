import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const { signIn, loading, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            navigate('/dashboard');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Logo and Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <span className="logo-icon">🧠</span>
                        <span className="logo-text">SYNAPSE</span>
                    </div>
                    <h1>Iniciar Sesión</h1>
                    <p className="login-subtitle">
                        Accede a tu plataforma de estudio médico
                    </p>
                </div>

                {/* Error Message */}
                {(error || authError) && (
                    <div className="login-error">
                        <span className="error-icon">⚠️</span>
                        <span>{error || authError}</span>
                    </div>
                )}

                {/* Login Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📧</span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

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
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="login-footer">
                    <p>
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className="register-link">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="login-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                    <div className="decoration-circle circle-3"></div>
                </div>
            </div>
        </div>
    );
}

export default Login;
