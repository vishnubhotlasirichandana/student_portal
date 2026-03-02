import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    UserPlus, Mail, Lock, Shield, ArrowRight, ArrowLeft, AlertCircle, CheckCircle,
    GraduationCap, Building2, BookOpen, Calendar, Globe, Clock, User
} from 'lucide-react';

const ACADEMIC_STATUSES = [
    'Undergraduate', 'Postgraduate', 'PhD / Doctoral', 'Diploma', 'Foundation Year', 'Other'
];

const Register = () => {
    const [step, setStep] = useState(1); // 1 = personal, 2 = academic, 3 = verify/pending
    const [direction, setDirection] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();

    // Step 1: Personal
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    // Step 2: Academic
    const [currentAcademicStatus, setCurrentAcademicStatus] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [institutionWebsite, setInstitutionWebsite] = useState('');
    const [course, setCourse] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [courseStartYear, setCourseStartYear] = useState('');
    const [courseEndYear, setCourseEndYear] = useState('');

    // Step 3
    const [code, setCode] = useState('');

    const goNext = () => { setDirection(1); setStep(s => s + 1); setError(''); };
    const goBack = () => { setDirection(-1); setStep(s => s - 1); setError(''); };

    const validateStep1 = () => {
        const names = [firstName, middleName, lastName].filter(n => n.trim());
        if (names.length < 2) { setError('Please provide at least 2 of 3 name fields.'); return false; }
        if (!email) { setError('Email is required.'); return false; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return false; }
        if (!/[A-Z]/.test(password)) { setError('Password must contain at least one uppercase letter.'); return false; }
        if (!/[0-9]/.test(password)) { setError('Password must contain at least one number.'); return false; }
        if (password !== confirmPw) { setError('Passwords do not match.'); return false; }
        return true;
    };

    const validateStep2 = () => {
        if (!currentAcademicStatus) { setError('Please select your academic status.'); return false; }
        if (!institutionName.trim()) { setError('Institution name is required.'); return false; }
        if (!course.trim()) { setError('Course is required.'); return false; }
        if (!courseStartYear || !courseEndYear) { setError('Start and end year are required.'); return false; }
        if (Number(courseEndYear) <= Number(courseStartYear)) { setError('End year must be after start year.'); return false; }
        return true;
    };

    const handleStep1Next = (e) => {
        e.preventDefault();
        if (validateStep1()) goNext();
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;
        setLoading(true);
        setError('');
        try {
            const result = await register({
                email, password,
                firstName: firstName.trim(), middleName: middleName.trim(), lastName: lastName.trim(),
                currentAcademicStatus, institutionName: institutionName.trim(),
                institutionWebsite: institutionWebsite.trim() || undefined,
                course: course.trim(), fieldOfStudy: fieldOfStudy.trim() || undefined,
                courseStartYear: Number(courseStartYear), courseEndYear: Number(courseEndYear)
            });

            if (result.user?.status === 'pending') {
                setIsPending(true);
                goNext(); // Go to step 3 but show pending message
            } else {
                // Domain verified → login and go to email verify step
                try {
                    await login(email, password);
                    goNext(); // Go to step 3 for email verification
                } catch {
                    goNext(); // Still go to step 3 even if auto-login fails
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { authApi } = await import('../services/api');
            await authApi.verifyEmail({ code });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const slideVariants = {
        enter: (d) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
    };

    const currentYear = new Date().getFullYear();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #F4F7FB 0%, #FFFFFF 50%, #EFF6FF 100%)',
            padding: '1rem',
        }}>
            <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,122,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    width: '100%', maxWidth: '480px',
                    background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 20px 60px rgba(37,99,235,0.08)',
                    padding: '2.5rem', position: 'relative', zIndex: 1, overflow: 'hidden',
                }}
            >
                {/* Step indicators */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: s === step ? '2rem' : '0.5rem', height: '0.35rem',
                            borderRadius: '4px', transition: 'all 0.3s ease',
                            background: s <= step ? 'linear-gradient(135deg, #2563EB, #007AFF)' : '#E2E8F0',
                        }} />
                    ))}
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                    {/* ═══════ STEP 1: Personal Info ═══════ */}
                    {step === 1 && (
                        <motion.div key="personal" custom={direction} variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #2563EB, #007AFF)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                                }}
                            >
                                <UserPlus size={26} color="#fff" />
                            </motion.div>

                            <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.3rem' }}>Create Account</h1>
                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
                                Step 1 — Personal Information
                            </p>

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '0.82rem', color: '#991B1B' }}>
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleStep1Next} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* Name fields — 2-column grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label className="input-label">First Name *</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input className="input-field" style={{ paddingLeft: '2.2rem', fontSize: '0.88rem' }} placeholder="First" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Middle Name</label>
                                        <input className="input-field" style={{ fontSize: '0.88rem' }} placeholder="Middle" value={middleName} onChange={e => setMiddleName(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Last Name *</label>
                                    <input className="input-field" style={{ fontSize: '0.88rem' }} placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
                                </div>
                                <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '-0.3rem' }}>* Provide at least 2 of 3 name fields</p>

                                <div>
                                    <label className="input-label">Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input type="email" className="input-field" style={{ paddingLeft: '2.2rem' }} placeholder="you@university.edu"
                                            value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label className="input-label">Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input type="password" className="input-field" style={{ paddingLeft: '2.2rem' }} placeholder="Min 8 chars"
                                                value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Confirm</label>
                                        <div style={{ position: 'relative' }}>
                                            <Shield size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input type="password" className="input-field" style={{ paddingLeft: '2.2rem' }} placeholder="Re-enter"
                                                value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required autoComplete="new-password" />
                                        </div>
                                    </div>
                                </div>

                                <motion.button type="submit" className="btn btn-primary btn-lg" whileTap={{ scale: 0.97 }} style={{ width: '100%', marginTop: '0.5rem' }}>
                                    Next: Academic Details <ArrowRight size={18} />
                                </motion.button>
                            </form>

                            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748B' }}>
                                Already have an account? <Link to="/login" style={{ fontWeight: 600, color: '#2563EB' }}>Sign in</Link>
                            </p>
                        </motion.div>
                    )}

                    {/* ═══════ STEP 2: Academic Details ═══════ */}
                    {step === 2 && (
                        <motion.div key="academic" custom={direction} variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(139,92,246,0.25)',
                                }}
                            >
                                <GraduationCap size={26} color="#fff" />
                            </motion.div>

                            <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.3rem' }}>Academic Details</h1>
                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
                                Step 2 — Tell us about your studies
                            </p>

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '0.82rem', color: '#991B1B' }}>
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                    <label className="input-label">Academic Status</label>
                                    <select className="input-field" value={currentAcademicStatus} onChange={e => setCurrentAcademicStatus(e.target.value)} required
                                        style={{ cursor: 'pointer' }}>
                                        <option value="">Select your status…</option>
                                        {ACADEMIC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="input-label">Institution Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <Building2 size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input className="input-field" style={{ paddingLeft: '2.2rem' }} placeholder="e.g. University of Oxford"
                                            value={institutionName} onChange={e => setInstitutionName(e.target.value)} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Institution Website (for domain verification)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Globe size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input className="input-field" style={{ paddingLeft: '2.2rem' }} placeholder="e.g. https://ox.ac.uk"
                                            value={institutionWebsite} onChange={e => setInstitutionWebsite(e.target.value)} />
                                    </div>
                                    <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                                        If your email domain matches, your account is auto-approved.
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label className="input-label">Course</label>
                                        <div style={{ position: 'relative' }}>
                                            <BookOpen size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input className="input-field" style={{ paddingLeft: '2.2rem' }} placeholder="e.g. B.Sc"
                                                value={course} onChange={e => setCourse(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Field of Study</label>
                                        <input className="input-field" placeholder="e.g. Computer Science"
                                            value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label className="input-label">Start Year</label>
                                        <div style={{ position: 'relative' }}>
                                            <Calendar size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input type="number" className="input-field" style={{ paddingLeft: '2.2rem' }}
                                                placeholder={String(currentYear)} min="2000" max={currentYear + 2}
                                                value={courseStartYear} onChange={e => setCourseStartYear(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">End Year</label>
                                        <div style={{ position: 'relative' }}>
                                            <Calendar size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input type="number" className="input-field" style={{ paddingLeft: '2.2rem' }}
                                                placeholder={String(currentYear + 3)} min="2000" max="2040"
                                                value={courseEndYear} onChange={e => setCourseEndYear(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <motion.button type="button" className="btn btn-ghost" onClick={goBack} whileTap={{ scale: 0.97 }}
                                        style={{ flex: '0 0 auto' }}>
                                        <ArrowLeft size={16} /> Back
                                    </motion.button>
                                    <motion.button type="submit" className="btn btn-primary btn-lg" disabled={loading} whileTap={{ scale: 0.97 }}
                                        style={{ flex: 1 }}>
                                        {loading ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : <>Create Account <ArrowRight size={18} /></>}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* ═══════ STEP 3: Verify / Pending ═══════ */}
                    {step === 3 && (
                        <motion.div key="verify" custom={direction} variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            {isPending ? (
                                /* ── Pending Review State ── */
                                <>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        style={{
                                            width: '56px', height: '56px', borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(245,158,11,0.25)',
                                        }}
                                    >
                                        <Clock size={26} color="#fff" />
                                    </motion.div>

                                    <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Account Under Review</h1>
                                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                        Your email domain doesn't match your institution's website, so your account requires manual verification by an administrator.
                                    </p>

                                    <div style={{
                                        padding: '1rem 1.25rem', borderRadius: '12px',
                                        background: '#FFFBEB', border: '1px solid #FDE68A',
                                        fontSize: '0.82rem', color: '#92400E', lineHeight: 1.6,
                                    }}>
                                        <strong>What happens next?</strong>
                                        <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', marginBottom: 0 }}>
                                            <li>A Super Admin will review your registration details</li>
                                            <li>Once approved, you'll be able to log in normally</li>
                                            <li>You'll also receive an email verification code</li>
                                        </ul>
                                    </div>

                                    <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#2563EB' }}>
                                        ← Back to Login
                                    </Link>
                                </>
                            ) : (
                                /* ── Email Verification State ── */
                                <>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        style={{
                                            width: '56px', height: '56px', borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #10B981, #34D399)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                                        }}
                                    >
                                        <Mail size={26} color="#fff" />
                                    </motion.div>

                                    <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.3rem' }}>Verify Email</h1>
                                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748B', marginBottom: '1.8rem' }}>
                                        We sent a 6-digit code to <strong style={{ color: '#0F172A' }}>{email}</strong>
                                    </p>

                                    {error && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '0.85rem', color: '#991B1B' }}>
                                            <AlertCircle size={16} /> {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label className="input-label">Verification Code</label>
                                            <input type="text" className="input-field" placeholder="Enter 6-digit code"
                                                value={code} onChange={e => setCode(e.target.value)} required maxLength={6}
                                                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700 }} />
                                        </div>

                                        <motion.button type="submit" className="btn btn-primary btn-lg" disabled={loading} whileTap={{ scale: 0.97 }} style={{ width: '100%' }}>
                                            {loading ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : <>Verify & Continue <CheckCircle size={18} /></>}
                                        </motion.button>
                                    </form>

                                    <button onClick={() => navigate('/dashboard')} style={{ display: 'block', margin: '1rem auto 0', background: 'none', border: 'none', fontSize: '0.85rem', color: '#64748B', cursor: 'pointer' }}>
                                        Skip for now →
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Register;
