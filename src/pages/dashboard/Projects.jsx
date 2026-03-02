import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectApi } from '../../services/api';
import { toast } from '../../components/Toast';
import {
    Search, Filter, Briefcase, Code, Users, Clock, Building2,
    GraduationCap, Send, CheckCircle, X, ChevronLeft, ChevronRight,
    FileText, Link as LinkIcon, Download, ArrowRight, Sparkles
} from 'lucide-react';

/* ─────────── Project Detail Modal ─────────── */
const ProjectDetail = ({ project, onClose, onApply, applying }) => {
    if (!project) return null;

    const videoUrl = project.video?.url || project.videoUrl;
    const postedByType = project.postedByModel === 'Company' ? 'Company' : 'University';
    const PostedByIcon = project.postedByModel === 'Company' ? Building2 : GraduationCap;
    const hasApplied = project._hasApplied;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
                className="glass-card-static"
                style={{
                    width: '100%', maxWidth: '600px', maxHeight: '85vh', overflow: 'auto',
                    padding: '2rem', position: 'relative',
                }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-pearl)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                    <X size={16} />
                </button>

                {/* Type badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <PostedByIcon size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{postedByType} Project</span>
                </div>

                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>{project.title}</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{project.description}</p>

                {/* Meta */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <span className="tag tag-primary"><Users size={12} /> {project.availableSlots || (project.maxStudentsRequired - (project.acceptedStudents?.length || 0))} spots left</span>
                    <span className="tag tag-neutral"><Clock size={12} /> {project.durationInWeeks} weeks</span>
                    <span className={`status-badge status-${project.status}`}>{project.status?.replace('_', ' ')}</span>
                </div>

                {/* Roles */}
                {project.roles?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Roles Needed</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {project.roles.map((r, i) => <span key={i} className="tag tag-skill">{r}</span>)}
                        </div>
                    </div>
                )}

                {/* Tech Stack */}
                {project.techStack?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Tech Stack</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {project.techStack.map((t, i) => <span key={i} className="tag tag-neutral">{t}</span>)}
                        </div>
                    </div>
                )}

                {/* Video */}
                {videoUrl && (
                    <div style={{ marginBottom: '1rem' }}>
                        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                            <LinkIcon size={14} /> Watch Video
                        </a>
                    </div>
                )}

                {/* Documents */}
                {project.projectDocuments?.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Documents</h4>
                        {project.projectDocuments.map((doc, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--bg-pearl)', borderRadius: '8px', marginBottom: '0.35rem' }}>
                                <FileText size={14} color="var(--text-secondary)" />
                                <span style={{ fontSize: '0.85rem', flex: 1 }}>{doc.tag || `Document ${i + 1}`}</span>
                                {doc.url ? (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600 }}><LinkIcon size={12} /></a>
                                ) : doc.fileId ? (
                                    <button onClick={async () => {
                                        try {
                                            const res = await projectApi.downloadDocument(doc.fileId);
                                            const url = URL.createObjectURL(res.data);
                                            const a = document.createElement('a');
                                            a.href = url; a.download = doc.fileName || 'document';
                                            a.click(); URL.revokeObjectURL(url);
                                        } catch { toast.error('Download failed'); }
                                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                        <Download size={14} />
                                    </button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}

                {/* Apply / Applied */}
                {project.status === 'open' && (
                    <motion.button
                        className={`btn ${hasApplied ? 'btn-secondary' : 'btn-primary'} btn-lg`}
                        style={{ width: '100%' }}
                        disabled={hasApplied || applying}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => !hasApplied && onApply(project._id)}
                    >
                        {applying ? (
                            <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                        ) : hasApplied ? (
                            <><CheckCircle size={18} /> Already Applied</>
                        ) : (
                            <><Send size={18} /> Apply Now</>
                        )}
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    );
};

/* ═══════════ MAIN PROJECTS PAGE ═══════════ */
const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [techFilter, setTechFilter] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [applying, setApplying] = useState(false);
    const [myApplications, setMyApplications] = useState(new Set());

    // Fetch user's own applications to know which projects they've applied to
    useEffect(() => {
        const fetchMyApps = async () => {
            try {
                const res = await projectApi.getMyProjects();
                // The student's applications are indicated by being in appliedStudents
                // We get projects from /projects/me which returns accepted projects
                // For applied ones, we need to check against the project listing
            } catch { /* ignore */ }
        };
        fetchMyApps();
    }, []);

    const fetchProjects = useCallback(async (pg = 1) => {
        setLoading(true);
        try {
            const params = { page: pg, limit: 12 };
            if (search.trim()) params.q = search.trim();
            if (techFilter.trim()) params.techStack = techFilter.trim();
            if (authorFilter) params.authorType = authorFilter;

            const res = await projectApi.list(params);
            const data = res.data.data || [];

            // Check which projects current user has applied to
            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : null;
            const enriched = data.map(p => ({
                ...p,
                _hasApplied: userId ? (p.appliedStudents || []).some(a => (a.studentRef?._id || a.studentRef) === userId) : false,
            }));

            setProjects(enriched);
            setTotal(res.data.total || 0);
            setPage(pg);
        } catch {
            toast.error('Failed to load projects');
        }
        setLoading(false);
    }, [search, techFilter, authorFilter]);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleApply = async (projectId) => {
        setApplying(true);
        try {
            await projectApi.apply(projectId);
            toast.success('Application submitted! 🎉');
            // Optimistic update
            setProjects(prev => prev.map(p => p._id === projectId ? { ...p, _hasApplied: true } : p));
            setMyApplications(prev => new Set([...prev, projectId]));
            if (selectedProject?._id === projectId) {
                setSelectedProject(prev => ({ ...prev, _hasApplied: true }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Application failed');
        }
        setApplying(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProjects(1);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <h1><Search size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Discover Projects</h1>
                <p>Find exciting projects to work on</p>
            </div>

            {/* Filters */}
            <motion.div
                className="glass-card-static"
                style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: '2 1 200px' }}>
                        <label className="input-label">Search</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input className="input-field" style={{ paddingLeft: '2.2rem' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." />
                        </div>
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <label className="input-label">Tech</label>
                        <input className="input-field" value={techFilter} onChange={e => setTechFilter(e.target.value)} placeholder="e.g. React, Python" />
                    </div>
                    <div style={{ flex: '1 1 120px' }}>
                        <label className="input-label">Posted By</label>
                        <select className="input-field" value={authorFilter} onChange={e => setAuthorFilter(e.target.value)} style={{ cursor: 'pointer' }}>
                            <option value="">All</option>
                            <option value="company">Companies</option>
                            <option value="university">Universities</option>
                        </select>
                    </div>
                    <motion.button type="submit" className="btn btn-primary" whileTap={{ scale: 0.95 }}>
                        <Filter size={14} /> Filter
                    </motion.button>
                </form>
            </motion.div>

            {/* Project Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '220px' }} />)}
                </div>
            ) : projects.length === 0 ? (
                <div className="empty-state" style={{ marginTop: '3rem' }}>
                    <Search size={48} />
                    <h3>No projects found</h3>
                    <p>Try adjusting your search filters or check back later for new opportunities.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    <AnimatePresence>
                        {projects.map((project, i) => {
                            const postedByModel = project.postedByModel;
                            const Icon = postedByModel === 'Company' ? Building2 : GraduationCap;
                            const slotsLeft = project.availableSlots ?? (project.maxStudentsRequired - (project.acceptedStudents?.length || 0));

                            return (
                                <motion.div
                                    key={project._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.03 }}
                                    whileHover={{ y: -4 }}
                                    className="glass-card"
                                    style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                                    onClick={() => setSelectedProject(project)}
                                >
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Icon size={14} color="var(--primary)" />
                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{postedByModel}</span>
                                        </div>
                                        <span className={`status-badge status-${project.status}`}>{project.status}</span>
                                    </div>

                                    <h3 style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>{project.title}</h3>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {project.description}
                                    </p>

                                    {/* Tech tags */}
                                    {project.techStack?.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                            {project.techStack.slice(0, 4).map((t, j) => (
                                                <span key={j} className="tag tag-neutral" style={{ fontSize: '0.65rem' }}>{t}</span>
                                            ))}
                                            {project.techStack.length > 4 && <span className="tag tag-neutral" style={{ fontSize: '0.65rem' }}>+{project.techStack.length - 4}</span>}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--bg-ice)' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={12} /> {slotsLeft} left</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> {project.durationInWeeks}w</span>
                                        </div>
                                        {project._hasApplied ? (
                                            <span className="tag tag-success" style={{ fontSize: '0.7rem' }}><CheckCircle size={10} /> Applied</span>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleApply(project._id); }}
                                                className="btn btn-primary btn-sm"
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                Apply <ArrowRight size={12} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {total > 12 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                    <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => fetchProjects(page - 1)}>
                        <ChevronLeft size={14} /> Prev
                    </button>
                    <span style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Page {page} of {Math.ceil(total / 12)}
                    </span>
                    <button className="btn btn-secondary btn-sm" disabled={projects.length < 12} onClick={() => fetchProjects(page + 1)}>
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <ProjectDetail
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                        onApply={handleApply}
                        applying={applying}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Projects;
