import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';

const ICONS = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
};

const COLORS = {
    error: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '#EF4444' },
    success: { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', icon: '#10B981' },
    info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: '#2563EB' },
};

let toastId = 0;
let addToastFn = null;

export const toast = {
    success: (message, options) => addToastFn?.({ message, type: 'success', ...options }),
    error: (message, options) => addToastFn?.({ message, type: 'error', ...options }),
    info: (message, options) => addToastFn?.({ message, type: 'info', ...options }),
};

const ToastItem = ({ toast: t, onDismiss }) => {
    const Icon = ICONS[t.type] || Info;
    const colors = COLORS[t.type] || COLORS.info;

    useEffect(() => {
        const timer = setTimeout(() => onDismiss(t.id), t.duration || 4000);
        return () => clearTimeout(timer);
    }, [t.id, t.duration, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                maxWidth: '400px',
                width: '100%',
                cursor: t.onRetry ? 'pointer' : 'default',
            }}
            onClick={t.onRetry}
        >
            <Icon size={18} color={colors.icon} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, color: colors.text, lineHeight: 1.4 }}>
                {t.message}
            </span>
            {t.onRetry && (
                <RefreshCw size={14} color={colors.icon} style={{ flexShrink: 0, opacity: 0.7 }} />
            )}
            <button
                onClick={(e) => { e.stopPropagation(); onDismiss(t.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
            >
                <X size={14} color={colors.text} />
            </button>
        </motion.div>
    );
};

const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((config) => {
        const id = ++toastId;
        setToasts(prev => [...prev.slice(-4), { ...config, id }]);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        addToastFn = addToast;
        return () => { addToastFn = null; };
    }, [addToast]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'flex-end',
        }}>
            <AnimatePresence mode="popLayout">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
