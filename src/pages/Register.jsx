import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Activity,
    Check,
    ArrowRight,
    ArrowLeft,
    Mail,
    Lock,
    User,
    GraduationCap,
    Building,
    AlertCircle,
    Eye,
    EyeOff,
    Heart,
    Brain,
    Stethoscope,
    Baby,
    PlusCircle,
    CheckCircle
} from 'lucide-react';
import './Register.css';

// Specialties data
const SPECIALTIES = [
    {
        id: 'cardiology',
        name: 'Cardiología',
        description: 'Estudio del corazón y vasos sanguíneos.',
        icon: Heart,
        colorClass: 'cardiology'
    },
    {
        id: 'neurology',
        name: 'Neurología',
        description: 'Trastornos del sistema nervioso.',
        icon: Brain,
        colorClass: 'neurology'
    },
    {
        id: 'surgery',
        name: 'Cirugía',
        description: 'Técnicas operativas manuales e instrumentales.',
        icon: Stethoscope,
        colorClass: 'surgery'
    },
    {
        id: 'pediatrics',
        name: 'Pediatría',
        description: 'Cuidado médico de infantes y niños.',
        icon: Baby,
        colorClass: 'pediatrics'
    }
];

const GRADUATION_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

function Register() {
    const navigate = useNavigate();
    const { signUp, loading, error: authError } = useAuth();

    // Multi-step state
    const [currentStep, setCurrentStep] = useState(1);

    // Form data
    const [formData, setFormData] = useState({
        // Step 1: Account
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        // Step 2: Trajectory
        graduationYear: '2027',
        university: '',
        currentStatus: 'preclinical',
        primaryInterest: ''
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

    const selectSpecialty = (specialtyId) => {
        setFormData(prev => ({
            ...prev,
            primaryInterest: specialtyId
        }));
    };

    const validateStep1 = () => {
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

    const nextStep = () => {
        if (currentStep === 1 && !validateStep1()) return;
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        setError('');

        const metadata = {
            display_name: formData.displayName || formData.email.split('@')[0],
            university: formData.university || null,
            graduation_year: parseInt(formData.graduationYear),
            current_status: formData.currentStatus,
            primary_interest: formData.primaryInterest || null
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

    // Progress calculation
    const getProgressWidth = () => {
        if (currentStep === 1) return '0%';
        if (currentStep === 2) return '50%';
        return '100%';
    };

    // Success Screen
    if (success) {
        return (
            <div className="register-page">
                <div className="register-background">
                    <div className="register-background-gradient"></div>
                    <div className="register-glow-1"></div>
                    <div className="register-glow-2"></div>
                </div>

                <header className="register-header">
                    <div className="register-logo">
                        <div className="register-logo-icon">
                            <Activity />
                        </div>
                        <h2>SYNAPSE</h2>
                    </div>
                </header>

                <main className="register-main">
                    <div className="register-card success-container">
                        <div className="success-icon">
                            <CheckCircle />
                        </div>
                        <h2>¡Registro exitoso!</h2>
                        <p>
                            Tu cuenta ha sido creada correctamente con el email <strong>{formData.email}</strong>.
                            <br /><br />
                            Te hemos enviado un email de verificación. Por favor, revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta.
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
                <div className="register-background-gradient"></div>
                <div className="register-glow-1"></div>
                <div className="register-glow-2"></div>
            </div>

            {/* Header */}
            <header className="register-header">
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

            {/* Main Content */}
            <main className="register-main">
                <div className="register-content">
                    {/* Progress Stepper */}
                    <div className="register-stepper">
                        <div className="stepper-container">
                            <div className="stepper-line-bg"></div>
                            <div
                                className="stepper-line-progress"
                                style={{ width: getProgressWidth() }}
                            ></div>

                            {/* Step 1 */}
                            <div className="stepper-step">
                                <div className={`step-circle ${currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'}`}>
                                    {currentStep > 1 ? <Check /> : currentStep === 1 ? <div className="step-pulse"></div> : '1'}
                                </div>
                                <span className={`step-label ${currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'}`}>
                                    Cuenta
                                </span>
                            </div>

                            {/* Step 2 */}
                            <div className="stepper-step">
                                <div className={`step-circle ${currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'}`}>
                                    {currentStep > 2 ? <Check /> : currentStep === 2 ? <div className="step-pulse"></div> : '2'}
                                </div>
                                <span className={`step-label ${currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'}`}>
                                    Trayectoria
                                </span>
                            </div>

                            {/* Step 3 */}
                            <div className="stepper-step">
                                <div className={`step-circle ${currentStep === 3 ? 'active' : 'pending'}`}>
                                    {currentStep === 3 ? <div className="step-pulse"></div> : '3'}
                                </div>
                                <span className={`step-label ${currentStep === 3 ? 'active' : 'pending'}`}>
                                    Confirmar
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card Content */}
                    <div className="register-card">
                        {/* Error Message */}
                        {(error || authError) && (
                            <div className="register-error">
                                <AlertCircle />
                                <span>{error || authError}</span>
                            </div>
                        )}

                        {/* Step 1: Account */}
                        {currentStep === 1 && (
                            <div className="step-account">
                                <h1 className="step-title">Crear tu cuenta</h1>
                                <p className="step-subtitle">
                                    Ingresa tus datos para comenzar tu viaje de estudio médico.
                                </p>

                                <div className="form-group">
                                    <label htmlFor="email">Email Institucional *</label>
                                    <div className="input-with-icon">
                                        <span className="icon"><Mail /></span>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="register-input"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="tu@universidad.edu"
                                            autoComplete="email"
                                            disabled={loading}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label htmlFor="displayName">Nombre (opcional)</label>
                                    <div className="input-with-icon">
                                        <span className="icon"><User /></span>
                                        <input
                                            type="text"
                                            id="displayName"
                                            name="displayName"
                                            className="register-input"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            placeholder="Tu nombre"
                                            autoComplete="name"
                                            disabled={loading}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label htmlFor="password">Contraseña *</label>
                                    <div className="password-wrapper">
                                        <div className="input-with-icon">
                                            <span className="icon"><Lock /></span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                name="password"
                                                className="register-input"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Mínimo 8 caracteres"
                                                autoComplete="new-password"
                                                disabled={loading}
                                                style={{ paddingLeft: '40px', paddingRight: '48px' }}
                                            />
                                        </div>
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

                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                                    <div className="input-with-icon">
                                        <span className="icon"><Lock /></span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            className="register-input"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Repite tu contraseña"
                                            autoComplete="new-password"
                                            disabled={loading}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="register-footer-actions">
                                    <div></div>
                                    <button
                                        type="button"
                                        className="continue-btn"
                                        onClick={nextStep}
                                        disabled={loading}
                                    >
                                        Continuar
                                        <ArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Trajectory */}
                        {currentStep === 2 && (
                            <div className="step-trajectory">
                                {/* Left Column */}
                                <div className="trajectory-left">
                                    <div>
                                        <h1 className="step-title">Define tu Trayectoria</h1>
                                        <p className="step-subtitle">
                                            Cuéntanos sobre tu camino médico para calibrar tus materiales de estudio.
                                        </p>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="graduationYear">Año de Graduación</label>
                                            <div className="input-with-icon">
                                                <span className="icon"><GraduationCap /></span>
                                                <select
                                                    id="graduationYear"
                                                    name="graduationYear"
                                                    className="register-select"
                                                    value={formData.graduationYear}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    style={{ paddingLeft: '40px' }}
                                                >
                                                    {GRADUATION_YEARS.map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="university">Universidad</label>
                                            <input
                                                type="text"
                                                id="university"
                                                name="university"
                                                className="register-input"
                                                value={formData.university}
                                                onChange={handleChange}
                                                placeholder="ej. Universidad de Medicina"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Estado Actual</label>
                                        <div className="status-toggle">
                                            <div className="status-option">
                                                <input
                                                    type="radio"
                                                    id="preclinical"
                                                    name="currentStatus"
                                                    value="preclinical"
                                                    checked={formData.currentStatus === 'preclinical'}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="preclinical">Pre-Clínico</label>
                                            </div>
                                            <div className="status-option">
                                                <input
                                                    type="radio"
                                                    id="clinical"
                                                    name="currentStatus"
                                                    value="clinical"
                                                    checked={formData.currentStatus === 'clinical'}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="clinical">Clínico</label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trust Indicator */}
                                    <div className="trust-indicator">
                                        <div className="trust-avatars">
                                            <div className="trust-avatar" style={{ background: '#6366f1' }}></div>
                                            <div className="trust-avatar" style={{ background: '#8b5cf6' }}></div>
                                            <div className="trust-avatar" style={{ background: '#a855f7' }}></div>
                                        </div>
                                        <p className="trust-text">
                                            Usado por <strong>10,000+</strong> estudiantes de medicina.
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="trajectory-right">
                                    <div className="specialty-section">
                                        <h3>Interés Principal</h3>
                                        <p>Selecciona una especialidad para personalizar tu dashboard.</p>
                                    </div>

                                    <div className="specialty-grid">
                                        {SPECIALTIES.map(specialty => {
                                            const Icon = specialty.icon;
                                            return (
                                                <div
                                                    key={specialty.id}
                                                    className={`specialty-card ${formData.primaryInterest === specialty.id ? 'selected' : ''}`}
                                                    onClick={() => selectSpecialty(specialty.id)}
                                                >
                                                    <div className="specialty-check">
                                                        <CheckCircle />
                                                    </div>
                                                    <div className={`specialty-icon ${specialty.colorClass}`}>
                                                        <Icon />
                                                    </div>
                                                    <h4>{specialty.name}</h4>
                                                    <p>{specialty.description}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button type="button" className="view-all-btn">
                                        <PlusCircle />
                                        Ver todas las especialidades
                                    </button>
                                </div>

                                {/* Footer Actions */}
                                <div className="register-footer-actions" style={{ gridColumn: '1 / -1' }}>
                                    <button
                                        type="button"
                                        className="back-btn"
                                        onClick={prevStep}
                                    >
                                        <ArrowLeft />
                                        Atrás
                                    </button>
                                    <button
                                        type="button"
                                        className="continue-btn"
                                        onClick={nextStep}
                                        disabled={loading}
                                    >
                                        Continuar
                                        <ArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirm */}
                        {currentStep === 3 && (
                            <div className="step-account">
                                <h1 className="step-title">Confirmar Registro</h1>
                                <p className="step-subtitle">
                                    Revisa tus datos antes de crear tu cuenta.
                                </p>

                                <div style={{
                                    background: 'var(--register-surface-dark)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <span style={{ color: 'var(--register-text-secondary)', fontSize: '0.875rem' }}>Email</span>
                                        <p style={{ fontWeight: '600' }}>{formData.email}</p>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <span style={{ color: 'var(--register-text-secondary)', fontSize: '0.875rem' }}>Nombre</span>
                                        <p style={{ fontWeight: '600' }}>{formData.displayName || formData.email.split('@')[0]}</p>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <span style={{ color: 'var(--register-text-secondary)', fontSize: '0.875rem' }}>Universidad</span>
                                        <p style={{ fontWeight: '600' }}>{formData.university || 'No especificada'}</p>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <span style={{ color: 'var(--register-text-secondary)', fontSize: '0.875rem' }}>Año de Graduación</span>
                                        <p style={{ fontWeight: '600' }}>{formData.graduationYear}</p>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <span style={{ color: 'var(--register-text-secondary)', fontSize: '0.875rem' }}>Estado</span>
                                        <p style={{ fontWeight: '600' }}>{formData.currentStatus === 'preclinical' ? 'Pre-Clínico' : 'Clínico'}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--register-text-secondary)', fontSize: '0.875rem' }}>Especialidad de Interés</span>
                                        <p style={{ fontWeight: '600' }}>
                                            {SPECIALTIES.find(s => s.id === formData.primaryInterest)?.name || 'No seleccionada'}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="register-footer-actions">
                                    <button
                                        type="button"
                                        className="back-btn"
                                        onClick={prevStep}
                                    >
                                        <ArrowLeft />
                                        Atrás
                                    </button>
                                    <button
                                        type="button"
                                        className="continue-btn"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner"></span>
                                                Creando cuenta...
                                            </>
                                        ) : (
                                            <>
                                                Crear Cuenta
                                                <ArrowRight />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Register;
