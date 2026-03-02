import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectApi } from '../../services/api';
import { toast } from '../../components/Toast';
import {
    Briefcase, Clock, Users, Building2, GraduationCap,
    CheckCircle, XCircle, ArrowRight, AlertCircle, Loader,
    Code, FileText, Link as LinkIcon, Send, X
} from 'lucide-react';

const MyProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawing, setWithdrawing] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    const fetchMyProjects = async () => {
        setLoading(true);
        try {
            // Get projects where student is accepted
            const acceptedRes = await projectApi.getMyProjects();
            const acceptedProjects = acceptedRes.data.data || [];

            // Also get all projects to find applications
            const allRes = await projectApi.list({ page: 1, limit: 100 });
            const allProjects = allRes.data.data || [];

            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : null;

            // Find projects where student has applied
            const appliedProjects = allProjects.filter(p =>
                (p.appliedStudents || []).some(a => (a.studentRef?._id || a.studentRef) === userId) &&
                !acceptedProjects.some(ap => ap._id === p._id)
            );

            // Categorize
            const categorized = [
                ...acceptedProjects.filter(p => p.status === 'in_progress').map(p => ({ ...p, _category: 'active' })),
                ...acceptedProjects.filter(p => p.status === 'completed').map(p => ({ ...p, _category: 'completed' })),
                ...appliedProjects.map(p => ({ ...p, _category: 'pending' })),
                ...acceptedProjects.filter(p => !['in_progress', 'completed'].includes(p.status)).map(p => ({ ...p, _category: 'other' })),
            ];

            setProjects(categorized);
        } catch {
            toast.error('Failed to load your projects');
        }
        setLoading(false);
    };

    useEffect(() => { fetchMyProjects(); }, []);

    const handleWithdraw = async (projectId) => {
        if (!window.confirm('Are you sure you want to withdraw your application?')) return;
        setWithdrawing(projectId);
        try {
            await projectApi.withdraw(projectId);
            toast.success('Application withdrawn');
            setProjects(prev => prev.filter(p => !(p._id === projectId && p._category === 'pending')));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to withdraw');
        }
        setWithdrawing(null);
    };

    const activeProjects = projects.filter(p => p._category === 'active');
    const pendingProjects = projects.filter(p => p._category === 'pending');
    const completedProjects = projects.filter(p => p._category === 'completed');

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><Briefcase size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />My Projects</h1>
                <p>Track your applications and active projects</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Active', count: activeProjects.length, color: '#10B981', bg: '#ECFDF5', icon: CheckCircle },
                    { label: 'Pending', count: pendingProjects.length, color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
                    { label: 'Completed', count: completedProjects.length, color: '#2563EB', bg: '#EFF6FF', icon: Briefcase },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card-static"
                        style={{ padding: '1.25rem', textAlign: 'center' }}
                    >
                        <stat.icon size={24} color={stat.color} style={{ margin: '0 auto 0.5rem' }} />
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color }}>{stat.count}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Active Projects — Hero Cards */}
            {activeProjects.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--jade-green)', animation: 'pulseGlow 2s ease-in-out infinite' }} />
                        Active Projects
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeProjects.map((project, i) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card"
                                style={{
                                    padding: '1.5rem',
                                    borderLeft: '4px solid var(--jade-green)',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setSelectedProject(project)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--jade-green)', animation: 'pulseGlow 2s ease-in-out infinite' }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Active</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{project.title}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {project.description}
                                        </p>
                                    </div>
                                    <ArrowRight size={18} color="var(--text-tertiary)" />
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                    {project.techStack?.slice(0, 4).map((t, j) => (
                                        <span key={j} className="tag tag-skill" style={{ fontSize: '0.7rem' }}>{t}</span>
                                    ))}
                                    <span className="tag tag-neutral" style={{ fontSize: '0.7rem' }}><Clock size={10} /> {project.durationInWeeks}w</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Pending Applications */}
            {pendingProjects.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} color="#F59E0B" /> Pending Applications
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pendingProjects.map((project, i) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card-static"
                                style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                            >
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                                    background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Send size={18} color="#F59E0B" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>{project.title}</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        <span><Users size={11} /> {project.maxStudentsRequired} spots</span>
                                        <span><Clock size={11} /> {project.durationInWeeks}w</span>
                                    </div>
                                </div>
                                <motion.button
                                    className="btn btn-sm"
                                    style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', fontSize: '0.75rem' }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={withdrawing === project._id}
                                    onClick={(e) => { e.stopPropagation(); handleWithdraw(project._id); }}
                                >
                                    {withdrawing === project._id ? <div className="spinner spinner-sm" /> : <><XCircle size={14} /> Withdraw</>}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Completed */}
            {completedProjects.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} color="var(--primary)" /> Completed
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {completedProjects.map((project, i) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card-static"
                                style={{ padding: '1.25rem', opacity: 0.8 }}
                            >
                                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>{project.title}</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <span className="status-badge status-completed">Completed</span>
                                    <span><Clock size={11} /> {project.durationInWeeks}w</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty state */}
            {projects.length === 0 && (
                <div className="empty-state" style={{ marginTop: '3rem' }}>
                    <Briefcase size={48} />
                    <h3>No projects yet</h3>
                    <p>Browse the Discover page to find exciting projects and submit your first application!</p>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedProject(null)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card-static"
                            style={{ width: '100%', maxWidth: '550px', maxHeight: '80vh', overflow: 'auto', padding: '2rem', position: 'relative' }}
                        >
                            <button onClick={() => setSelectedProject(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-pearl)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                                <X size={16} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: selectedProject._category === 'active' ? 'var(--jade-green)' : selectedProject._category === 'pending' ? '#F59E0B' : 'var(--primary)' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                    {selectedProject._category}
                                </span>
                            </div>

                            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{selectedProject.title}</h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>{selectedProject.description}</p>

                            {selectedProject.roles?.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <span className="input-label">Roles</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
                                        {selectedProject.roles.map((r, i) => <span key={i} className="tag tag-skill">{r}</span>)}
                                    </div>
                                </div>
                            )}

                            {selectedProject.techStack?.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <span className="input-label">Tech Stack</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
                                        {selectedProject.techStack.map((t, i) => <span key={i} className="tag tag-neutral">{t}</span>)}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <span className="tag tag-primary"><Users size={12} /> {selectedProject.maxStudentsRequired} max students</span>
                                <span className="tag tag-neutral"><Clock size={12} /> {selectedProject.durationInWeeks} weeks</span>
                                <span className={`status-badge status-${selectedProject.status}`}>{selectedProject.status?.replace('_', ' ')}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyProjects;
