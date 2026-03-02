import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationApi } from '../services/api';
import { Bell, Check, X, Inbox, ChevronRight } from 'lucide-react';

const NotificationDrawer = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await notificationApi.getNotifications(1, 30);
            setNotifications(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch {
            // fail silently
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen, fetchNotifications]);

    const handleMarkRead = async (id) => {
        try {
            await notificationApi.markAsRead([id]);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch { /* silent */ }
    };

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
        if (unreadIds.length === 0) return;
        try {
            await notificationApi.markAsRead(unreadIds);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch { /* silent */ }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const typeColors = {
        application_accepted: { bg: '#ECFDF5', color: '#065F46' },
        application_rejected: { bg: '#FEF2F2', color: '#991B1B' },
        project_completed: { bg: '#EFF6FF', color: '#1E40AF' },
        default: { bg: '#F1F5F9', color: '#475569' },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                        position: 'absolute', top: '60px', right: '1rem',
                        width: '380px', maxWidth: 'calc(100vw - 2rem)',
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        borderRadius: '16px',
                        boxShadow: '0 16px 48px rgba(37,99,235,0.10)',
                        zIndex: 100,
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--bg-ice)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bell size={16} color="var(--primary)" />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: 'var(--primary)', color: '#fff',
                                    fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem',
                                    borderRadius: '999px', minWidth: '18px', textAlign: 'center',
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600,
                                    }}
                                >
                                    Mark all read
                                </button>
                            )}
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex' }}>
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <div className="spinner" style={{ margin: '0 auto' }} />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                <Inbox size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif, i) => {
                                const colors = typeColors[notif.type] || typeColors.default;
                                return (
                                    <motion.div
                                        key={notif._id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => !notif.read && handleMarkRead(notif._id)}
                                        style={{
                                            padding: '0.85rem 1.25rem',
                                            borderBottom: '1px solid var(--bg-ice)',
                                            cursor: notif.read ? 'default' : 'pointer',
                                            background: notif.read ? 'transparent' : 'rgba(37,99,235,0.02)',
                                            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                                            background: notif.read ? 'transparent' : 'var(--primary)',
                                            transition: 'all 0.3s',
                                        }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.82rem', fontWeight: notif.read ? 500 : 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                                                {notif.title}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                {notif.body}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                                                {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {!notif.read && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleMarkRead(notif._id); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-tertiary)', flexShrink: 0 }}
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationDrawer;
