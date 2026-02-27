import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import {
    Activity,
    ArrowRight,
    Mail,
    Lock,
    User,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle,
    Check,
    X
} from 'lucide-react';
import './Register.css';

// Google SVG icon
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
    </svg>
);



function Register() {
    const navigate = useNavigate();
    const { signUp, loading, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        displayName: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    // Password strength checks
    const passwordChecks = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        number: /[0-9]/.test(formData.password)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('Por favor, completa los campos obligatorios');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Por favor, ingresa un email válido');
            return;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        const metadata = {
            display_name: formData.displayName || formData.email.split('@')[0]
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

    const handleSocialRegister = async (provider) => {
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
                setError(`Error al registrarse con ${provider === 'google' ? 'Google' : 'Apple'}: ${socialError.message}`);
            }
        } catch (err) {
            setError(`Error inesperado: ${err.message}`);
        } finally {
            setSocialLoading('');
        }
    };

    // Success Screen
    if (success) {
        return (
            <div className="register-page">
                <div className="register-background">
                    <div className="register-bg-gradient"></div>
                    <div className="register-glow-1"></div>
                    <div className="register-glow-2"></div>
                </div>

                <header className="register-navbar">
                    <div className="register-logo">
                        <div className="register-logo-icon">
                            <Activity />
                        </div>
                        <h2>SYNAPSE</h2>
                    </div>
                </header>

                <main className="register-main">
                    <div className="register-success-card">
                        <div className="success-check-wrapper">
                            <CheckCircle />
                        </div>
                        <h2>¡Registro exitoso!</h2>
                        <p>
                            Tu cuenta ha sido creada con el email <strong>{formData.email}</strong>.
                            <br /><br />
                            Te hemos enviado un email de verificación. Revisa tu bandeja de entrada
                            y sigue las instrucciones para activar tu cuenta.
                        </p>
                        <Link to="/login" className="go-login-btn">
                            Ir a Iniciar Sesión
                            <ArrowRight />
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="register-page">
            {/* Background */}
            <div className="register-background">
                <div className="register-bg-gradient"></div>
                <div className="register-glow-1"></div>
                <div className="register-glow-2"></div>
            </div>

            {/* Header */}
            <header className="register-navbar">
                <div className="register-logo">
                    <div className="register-logo-icon">
                        <Activity />
                    </div>
                    <h2>SYNAPSE</h2>
                </div>
                <div className="register-login-link">
                    <span>¿Ya tienes una cuenta?</span>
                    <Link to="/login">Iniciar Sesión</Link>
                </div>
            </header>

            {/* Main */}
            <main className="register-main">
                <div className="register-card">
                    {/* Card Header */}
                    <div className="register-card-header">
                        <div className="register-card-logo">
                            <Activity />
                        </div>
                        <h1>Crear tu Cuenta</h1>
                        <p>Completa tus datos para comenzar tu viaje de estudio médico.</p>
                    </div>

                    {/* Error */}
                    {(error || authError) && (
                        <div className="register-error">
                            <AlertCircle />
                            <span>{error || authError}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form className="register-form" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="register-form-group">
                            <label htmlFor="reg-email">Email Institucional *</label>
                            <div className="register-input-wrapper">
                                <span className="register-input-icon">
                                    <Mail />
                                </span>
                                <input
                                    type="email"
                                    id="reg-email"
                                    name="email"
                                    className="register-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="tu@universidad.edu"
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div className="register-form-group">
                            <label htmlFor="reg-name">Nombre (opcional)</label>
                            <div className="register-input-wrapper">
                                <span className="register-input-icon">
                                    <User />
                                </span>
                                <input
                                    type="text"
                                    id="reg-name"
                                    name="displayName"
                                    className="register-input"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    placeholder="Tu nombre completo"
                                    autoComplete="name"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="register-form-group">
                            <label htmlFor="reg-password">Contraseña *</label>
                            <div className="register-input-wrapper">
                                <span className="register-input-icon">
                                    <Lock />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="reg-password"
                                    name="password"
                                    className="register-input has-toggle"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 8 caracteres"
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="register-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            {/* Password requirements */}
                            {formData.password.length > 0 && (
                                <div className="password-requirements">
                                    <span className={`password-req ${passwordChecks.length ? 'met' : ''}`}>
                                        {passwordChecks.length ? <Check /> : <X />}
                                        8+ caracteres
                                    </span>
                                    <span className={`password-req ${passwordChecks.uppercase ? 'met' : ''}`}>
                                        {passwordChecks.uppercase ? <Check /> : <X />}
                                        Mayúscula
                                    </span>
                                    <span className={`password-req ${passwordChecks.number ? 'met' : ''}`}>
                                        {passwordChecks.number ? <Check /> : <X />}
                                        Número
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="register-form-group">
                            <label htmlFor="reg-confirm-password">Confirmar Contraseña *</label>
                            <div className="register-input-wrapper">
                                <span className="register-input-icon">
                                    <Lock />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="reg-confirm-password"
                                    name="confirmPassword"
                                    className="register-input"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repite tu contraseña"
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="register-spinner"></span>
                                    Creando cuenta...
                                </>
                            ) : (
                                <>
                                    <span>Crear Cuenta</span>
                                    <ArrowRight />
                                    <span className="register-button-pulse">
                                        <span className="ping"></span>
                                        <span className="dot"></span>
                                    </span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Auth */}
                    <div className="register-social-section">
                        <div className="register-divider">
                            <div className="register-divider-line"></div>
                            <span className="register-divider-text">O regístrate con</span>
                            <div className="register-divider-line"></div>
                        </div>
                        <div className="register-social-buttons">
                            <button
                                type="button"
                                className="register-social-btn"
                                onClick={() => handleSocialRegister('google')}
                                disabled={loading || !!socialLoading}
                            >
                                {socialLoading === 'google' ? (
                                    <span className="register-spinner"></span>
                                ) : (
                                    <GoogleIcon />
                                )}
                                <span>Google</span>
                            </button>

                        </div>
                    </div>

                    {/* Login link */}
                    <div className="register-bottom-link">
                        ¿Ya tienes una cuenta?
                        <Link to="/login">Iniciar Sesión</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Register;
