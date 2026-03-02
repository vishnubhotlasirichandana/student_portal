import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import NotificationDrawer from './NotificationDrawer';
import {
    User, Briefcase, FolderOpen, Search, MessageCircle,
    Bell, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Profile', icon: User, end: true },
    { path: '/dashboard/portfolio', label: 'Portfolio', icon: FolderOpen },
    { path: '/dashboard/projects', label: 'Discover', icon: Search },
    { path: '/dashboard/my-projects', label: 'My Projects', icon: Briefcase },
    { path: '/dashboard/chat', label: 'Chat', icon: MessageCircle },
];

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const isChat = location.pathname === '/dashboard/chat';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-pearl)' }}>
            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)',
                            backdropFilter: 'blur(4px)', zIndex: 40,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: 0 }}
                style={{
                    width: '260px',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRight: '1px solid rgba(255,255,255,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    top: 0, left: 0, bottom: 0,
                    zIndex: 50,
                    boxShadow: '4px 0 24px rgba(37,99,235,0.04)',
                    transform: sidebarOpen ? 'translateX(0)' : undefined,
                }}
                className="sidebar-desktop"
            >
                {/* Brand */}
                <div style={{
                    padding: '1.5rem 1.25rem',
                    borderBottom: '1px solid var(--bg-ice)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563EB, #007AFF)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                    }}>
                        <Briefcase size={20} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Student</h2>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Portal</span>
                    </div>
                    {/* Mobile close */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="sidebar-close-btn"
                        style={{
                            marginLeft: 'auto', background: 'none', border: 'none',
                            cursor: 'pointer', padding: '4px', display: 'none', color: 'var(--text-secondary)',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.7rem 1rem', borderRadius: '10px',
                                fontSize: '0.875rem', fontWeight: isActive ? 600 : 500,
                                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--primary-bg)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            style={{
                                                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                                                width: '3px', height: '60%', borderRadius: '0 4px 4px 0',
                                                background: 'linear-gradient(180deg, var(--primary), var(--primary-azure))',
                                            }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                    {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User area */}
                <div style={{
                    padding: '1rem 1.25rem', borderTop: '1px solid var(--bg-ice)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)',
                    }}>
                        {(user?.email?.[0] || 'S').toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email || 'Student'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Student</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '6px', borderRadius: '8px', display: 'flex',
                            color: 'var(--text-tertiary)', transition: 'all 0.2s',
                        }}
                        title="Logout"
                        onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </motion.aside>

            {/* Main content */}
            <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Top bar */}
                <header style={{
                    height: '60px',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid var(--bg-ice)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 1.5rem',
                    position: 'sticky', top: 0, zIndex: 30,
                }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="hamburger-btn"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '6px', display: 'none', color: 'var(--text-secondary)',
                        }}
                    >
                        <Menu size={22} />
                    </button>

                    <div style={{ flex: 1 }} />

                    {/* Notification Bell */}
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        style={{
                            position: 'relative', background: notifOpen ? 'var(--primary-bg)' : 'none',
                            border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '10px',
                            color: notifOpen ? 'var(--primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Bell size={20} />
                    </button>
                </header>

                {/* Notification Drawer */}
                <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

                {/* Page content */}
                <main style={{ flex: 1, overflow: isChat ? 'hidden' : 'auto' }}>
                    <Outlet />
                </main>
            </div>

            {/* Responsive styles */}
            <style>{`
        .main-content {
          margin-left: 260px;
        }
        @media (max-width: 768px) {
          .sidebar-desktop {
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .sidebar-close-btn { display: flex !important; }
          .hamburger-btn { display: flex !important; }
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
        </div>
    );
};

export default DashboardLayout;
