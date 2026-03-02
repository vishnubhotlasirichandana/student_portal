import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../services/api';
import { KeyRound, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1 = email, 2 = code + new pw, 3 = success
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authApi.forgotPassword({ email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await authApi.resetPassword({ email, code, newPassword });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code or reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #F4F7FB 0%, #FFFFFF 50%, #EFF6FF 100%)', padding: '1rem',
        }}>
            <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    width: '100%', maxWidth: '420px',
                    background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 20px 60px rgba(37,99,235,0.08)',
                    padding: '2.5rem', position: 'relative', zIndex: 1, overflow: 'hidden',
                }}
            >
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="email" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(245,158,11,0.25)' }}>
                                <KeyRound size={26} color="#fff" />
                            </motion.div>
                            <h1 style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '0.3rem' }}>Reset Password</h1>
                            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748B', marginBottom: '1.8rem' }}>Enter your email to receive a reset code</p>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '0.85rem', color: '#991B1B' }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="input-label">Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input type="email" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="your@email.com"
                                            value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                                    </div>
                                </div>
                                <motion.button type="submit" className="btn btn-primary btn-lg" disabled={loading} whileTap={{ scale: 0.97 }} style={{ width: '100%' }}>
                                    {loading ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : <>Send Reset Code <ArrowRight size={18} /></>}
                                </motion.button>
                            </form>
                            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748B' }}>
                                <Link to="/login" style={{ fontWeight: 600, color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><ArrowLeft size={14} /> Back to Login</Link>
                            </p>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="code" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563EB, #007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(37,99,235,0.25)' }}>
                                <ShieldCheck size={26} color="#fff" />
                            </motion.div>
                            <h1 style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '0.3rem' }}>Enter Code</h1>
                            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748B', marginBottom: '1.8rem' }}>Check <strong style={{ color: '#0F172A' }}>{email}</strong> for the code</p>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '0.85rem', color: '#991B1B' }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="input-label">Reset Code</label>
                                    <input type="text" className="input-field" placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} required maxLength={6}
                                        style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700 }} />
                                </div>
                                <div>
                                    <label className="input-label">New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input type="password" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="Min 6 characters"
                                            value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" />
                                    </div>
                                </div>
                                <motion.button type="submit" className="btn btn-primary btn-lg" disabled={loading} whileTap={{ scale: 0.97 }} style={{ width: '100%' }}>
                                    {loading ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : <>Reset Password <ArrowRight size={18} /></>}
                                </motion.button>
                            </form>
                            <button onClick={() => setStep(1)} style={{ display: 'block', margin: '1rem auto 0', background: 'none', border: 'none', fontSize: '0.85rem', color: '#64748B', cursor: 'pointer' }}>
                                ← Try different email
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(16,185,129,0.25)' }}>
                                <CheckCircle size={32} color="#fff" />
                            </motion.div>
                            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Password Reset!</h1>
                            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '2rem' }}>Your password has been updated successfully.</p>
                            <Link to="/login">
                                <motion.button className="btn btn-primary btn-lg" whileTap={{ scale: 0.97 }} style={{ width: '100%' }}>
                                    Sign In <ArrowRight size={18} />
                                </motion.button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
