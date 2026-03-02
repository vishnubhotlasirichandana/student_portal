import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, ArrowRight, AlertCircle, Clock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingReview, setPendingReview] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPendingReview(false);
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const status = err.response?.status;
            const code = err.response?.data?.code;
            if (status === 403 && code === 'ACCOUNT_PENDING') {
                setPendingReview(true);
            } else {
                setError(err.response?.data?.message || err.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #F4F7FB 0%, #FFFFFF 50%, #EFF6FF 100%)',
            padding: '1rem',
        }}>
            {/* Decorative orbs */}
            <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-15%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,122,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 20px 60px rgba(37,99,235,0.08)',
                    padding: '2.5rem',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Logo area */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                    style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #2563EB, #007AFF)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                    }}
                >
                    <LogIn size={26} color="#fff" />
                </motion.div>

                <h1 style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '0.3rem', color: '#0F172A' }}>
                    Welcome Back
                </h1>
                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748B', marginBottom: '1.8rem' }}>
                    Sign in to your student portal
                </p>

                {pendingReview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            padding: '1rem 1.25rem', marginBottom: '1rem',
                            background: '#FFFBEB', border: '1px solid #FDE68A',
                            borderRadius: '12px', fontSize: '0.82rem', color: '#92400E',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
                            <Clock size={16} /> Account Under Review
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>
                            Your email domain didn't match your institution's website. A Super Admin is reviewing your registration. You'll be able to log in once approved.
                        </p>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1rem', marginBottom: '1rem',
                            background: '#FEF2F2', border: '1px solid #FECACA',
                            borderRadius: '10px', fontSize: '0.85rem', color: '#991B1B',
                        }}
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>
                            Forgot password?
                        </Link>
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                        {loading ? (
                            <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                        ) : (
                            <>Sign In <ArrowRight size={18} /></>
                        )}
                    </motion.button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748B' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ fontWeight: 600, color: '#2563EB' }}>Create one</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
