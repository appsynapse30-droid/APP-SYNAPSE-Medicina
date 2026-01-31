import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

function Register() {
    const navigate = useNavigate();
    const { signUp, loading, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        university: '',
        careerYear: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('Por favor, completa los campos obligatorios');
            return false;
        }

        if (!formData.email.includes('@')) {
            setError('Por favor, ingresa un email válido');
            return false;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        const metadata = {
            display_name: formData.displayName || formData.email.split('@')[0],
            university: formData.university || null,
            career_year: formData.careerYear ? parseInt(formData.careerYear) : null
        };

        const { error: signUpError } = await signUp(
            formData.email,
            formData.password,
            metadata
        );

        if (signUpError) {
            if (signUpError.message.includes('already registered')) {
                setError('Este email ya está registrado. Intenta iniciar sesión.');
            } else {
                setError(signUpError.message);
            }
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="register-page">
                <div className="register-container success-container">
                    <div className="success-content">
                        <span className="success-icon">✅</span>
                        <h2>¡Registro exitoso!</h2>
                        <p>
                            Te hemos enviado un email de confirmación a <strong>{formData.email}</strong>.
                            Por favor, verifica tu correo para activar tu cuenta.
                        </p>
                        <Link to="/login" className="go-login-button">
                            Ir a Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page">
            <div className="register-container">
                {/* Logo and Header */}
                <div className="register-header">
                    <div className="register-logo">
                        <span className="logo-icon">🧠</span>
                        <span className="logo-text">SYNAPSE</span>
                    </div>
                    <h1>Crear Cuenta</h1>
                    <p className="register-subtitle">
                        Únete a la plataforma de estudio médico más avanzada
                    </p>
                </div>

                {/* Error Message */}
                {(error || authError) && (
                    <div className="register-error">
                        <span className="error-icon">⚠️</span>
                        <span>{error || authError}</span>
                    </div>
                )}

                {/* Register Form */}
                <form className="register-form" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico *</label>
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
                                required
                            />
                        </div>
                    </div>

                    {/* Display Name */}
                    <div className="form-group">
                        <label htmlFor="displayName">Nombre (opcional)</label>
                        <div className="input-wrapper">
                            <span className="input-icon">👤</span>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                autoComplete="name"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* University */}
                    <div className="form-group">
                        <label htmlFor="university">Universidad (opcional)</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🏛️</span>
                            <input
                                type="text"
                                id="university"
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                placeholder="Universidad de Medicina"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Career Year */}
                    <div className="form-group">
                        <label htmlFor="careerYear">Año de carrera (opcional)</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📚</span>
                            <select
                                id="careerYear"
                                name="careerYear"
                                value={formData.careerYear}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Selecciona tu año</option>
                                <option value="1">1° Año</option>
                                <option value="2">2° Año</option>
                                <option value="3">3° Año</option>
                                <option value="4">4° Año</option>
                                <option value="5">5° Año</option>
                                <option value="6">6° Año</option>
                                <option value="7">Internado</option>
                                <option value="8">Residencia</option>
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">Contraseña *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                autoComplete="new-password"
                                disabled={loading}
                                required
                                minLength={8}
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

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repite tu contraseña"
                                autoComplete="new-password"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creando cuenta...
                            </>
                        ) : (
                            'Crear Cuenta'
                        )}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="register-footer">
                    <p>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="login-link">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="register-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                </div>
            </div>
        </div>
    );
}

export default Register;
