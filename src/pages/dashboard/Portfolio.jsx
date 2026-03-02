import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentApi } from '../../services/api';
import { toast } from '../../components/Toast';
import {
    FolderOpen, Plus, X, Upload, Link as LinkIcon, Image, Video,
    FileText, Trash2, ExternalLink, Download, Eye, ChevronLeft, Tag
} from 'lucide-react';

/* ─────────── Immersive Viewer ─────────── */
const ImmersiveViewer = ({ item, onClose }) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!item) return;
        if (item.url) { setLoading(false); return; }
        if (item.fileId) {
            const load = async () => {
                try {
                    const res = await studentApi.downloadPortfolioItem(item._id);
                    const url = URL.createObjectURL(res.data);
                    setBlobUrl(url);
                } catch { toast.error('Failed to load file'); }
                setLoading(false);
            };
            load();
            return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
        }
        setLoading(false);
    }, [item]);

    if (!item) return null;

    const src = item.url || blobUrl;
    const isImage = item.type === 'image' || item.mimeType?.startsWith('image/');
    const isVideo = item.type === 'video' || item.mimeType?.startsWith('video/');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '2rem', cursor: 'pointer',
            }}
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '90vw', maxHeight: '85vh', position: 'relative', cursor: 'default' }}
            >
                <button onClick={onClose} style={{
                    position: 'absolute', top: '-1rem', right: '-1rem', zIndex: 10,
                    background: '#fff', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}>
                    <X size={18} />
                </button>

                {loading ? (
                    <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} />
                ) : isImage && src ? (
                    <img src={src} alt={item.title} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }} />
                ) : isVideo && src ? (
                    <video src={src} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }} />
                ) : (
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', textAlign: 'center', minWidth: '300px' }}>
                        <FileText size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>{item.description || 'No description'}</p>
                        {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                <ExternalLink size={16} /> Open Link
                            </a>
                        )}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '0.95rem' }}>{item.title}</h4>
                    {item.description && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{item.description}</p>}
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─────────── Add Item Modal ─────────── */
const AddItemModal = ({ onClose, onAdded }) => {
    const [mode, setMode] = useState('link'); // link | file
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);

        try {
            if (mode === 'link') {
                if (!url.trim()) { toast.error('Please provide a URL'); setLoading(false); return; }
                await studentApi.addPortfolioLink({
                    title, description, url: url.trim(),
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                });
            } else {
                if (!file) { toast.error('Please select a file'); setLoading(false); return; }
                const fd = new FormData();
                fd.append('file', file);
                fd.append('title', title);
                fd.append('description', description);
                fd.append('tags', tags);
                await studentApi.addPortfolioItem(fd);
            }
            toast.success('Portfolio item added!');
            onAdded();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add item');
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '500px',
                    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)',
                    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 24px 60px rgba(37,99,235,0.12)', padding: '1.5rem',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Add to Portfolio</h3>
                    <button onClick={onClose} style={{ background: 'var(--bg-pearl)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'var(--bg-pearl)', borderRadius: '10px', padding: '4px' }}>
                    {[{ key: 'link', icon: LinkIcon, label: 'Link' }, { key: 'file', icon: Upload, label: 'Upload File' }].map(m => (
                        <button key={m.key} onClick={() => setMode(m.key)} style={{
                            flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: mode === m.key ? '#fff' : 'transparent',
                            boxShadow: mode === m.key ? 'var(--shadow-sm)' : 'none',
                            color: mode === m.key ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            transition: 'all 0.2s',
                        }}>
                            <m.icon size={14} /> {m.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                        <label className="input-label">Title *</label>
                        <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. My Portfolio Website" required />
                    </div>
                    <div>
                        <label className="input-label">Description</label>
                        <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
                    </div>

                    {mode === 'link' ? (
                        <div>
                            <label className="input-label">URL *</label>
                            <input className="input-field" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://github.com/..." required />
                        </div>
                    ) : (
                        <div>
                            <label className="input-label">File</label>
                            <div
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    border: '2px dashed var(--bg-ice)', borderRadius: '12px', padding: '1.5rem',
                                    textAlign: 'center', cursor: 'pointer', background: 'var(--bg-pearl)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {file ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                        <FileText size={18} color="var(--primary)" />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{file.name}</span>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={24} color="var(--text-tertiary)" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to upload</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Images, videos, documents (max 20MB)</p>
                                    </>
                                )}
                            </div>
                            <input ref={fileRef} type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                        </div>
                    )}

                    <div>
                        <label className="input-label">Tags (comma separated)</label>
                        <input className="input-field" value={tags} onChange={e => setTags(e.target.value)} placeholder="react, portfolio, web" />
                    </div>

                    <motion.button type="submit" className="btn btn-primary btn-lg" disabled={loading} whileTap={{ scale: 0.97 }} style={{ width: '100%' }}>
                        {loading ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : <><Plus size={18} /> Add Item</>}
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
};

/* ─────────── Portfolio Card ─────────── */
const typeIcons = { github: LinkIcon, website: LinkIcon, video: Video, document: FileText, image: Image, project: FolderOpen };
const typeColors = { github: '#333', website: '#2563EB', video: '#EF4444', document: '#F59E0B', image: '#10B981', project: '#8B5CF6' };

const PortfolioCard = ({ item, onView, onDelete }) => {
    const Icon = typeIcons[item.type] || FileText;
    const color = typeColors[item.type] || '#64748B';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4 }}
            className="glass-card"
            style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            onClick={() => onView(item)}
        >
            {/* Type badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={20} color={color} />
                </div>
                <span className="tag tag-neutral" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{item.type}</span>
            </div>

            <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem', lineHeight: 1.3 }}>{item.title}</h4>
                {item.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                    </p>
                )}
            </div>

            {/* Tags */}
            {item.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {item.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="tag tag-neutral" style={{ fontSize: '0.65rem' }}>{tag}</span>
                    ))}
                    {item.tags.length > 3 && <span className="tag tag-neutral" style={{ fontSize: '0.65rem' }}>+{item.tags.length - 3}</span>}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--bg-ice)' }}>
                <button onClick={e => { e.stopPropagation(); onView(item); }} className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: '0.75rem' }}>
                    <Eye size={14} /> View
                </button>
                <button onClick={e => { e.stopPropagation(); onDelete(item._id); }} className="btn btn-sm" style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', fontSize: '0.75rem' }}>
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
};

/* ═══════════ MAIN PORTFOLIO PAGE ═══════════ */
const Portfolio = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [showAdd, setShowAdd] = useState(false);
    const [viewItem, setViewItem] = useState(null);

    const fetchPortfolio = async (pg = 1) => {
        setLoading(true);
        try {
            const res = await studentApi.listPortfolio(pg, 20);
            setItems(res.data.data || []);
            setTotal(res.data.total || 0);
            setPage(pg);
        } catch {
            toast.error('Failed to load portfolio');
        }
        setLoading(false);
    };

    useEffect(() => { fetchPortfolio(); }, []);

    const handleDelete = async (itemId) => {
        if (!window.confirm('Delete this portfolio item?')) return;
        try {
            // Optimistic
            setItems(prev => prev.filter(i => i._id !== itemId));
            await studentApi.deletePortfolioItem(itemId);
            toast.success('Item deleted');
        } catch {
            toast.error("Couldn't delete item");
            fetchPortfolio(page);
        }
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1><FolderOpen size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Portfolio</h1>
                    <p>Showcase your best work — {total} item{total !== 1 ? 's' : ''}</p>
                </div>
                <motion.button className="btn btn-primary" onClick={() => setShowAdd(true)} whileTap={{ scale: 0.95 }}>
                    <Plus size={16} /> Add Item
                </motion.button>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: '200px' }} />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state" style={{ marginTop: '3rem' }}>
                    <FolderOpen size={48} />
                    <h3>Your portfolio is empty</h3>
                    <p>Add links to your GitHub repos, websites, or upload files to showcase your work.</p>
                    <motion.button className="btn btn-primary" onClick={() => setShowAdd(true)} whileTap={{ scale: 0.95 }} style={{ marginTop: '1rem' }}>
                        <Plus size={16} /> Add Your First Item
                    </motion.button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    <AnimatePresence>
                        {items.map(item => (
                            <PortfolioCard key={item._id} item={item} onView={setViewItem} onDelete={handleDelete} />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                    <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => fetchPortfolio(page - 1)}>Previous</button>
                    <span style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Page {page}</span>
                    <button className="btn btn-secondary btn-sm" disabled={items.length < 20} onClick={() => fetchPortfolio(page + 1)}>Next</button>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onAdded={() => fetchPortfolio(1)} />}
            </AnimatePresence>
            <AnimatePresence>
                {viewItem && <ImmersiveViewer item={viewItem} onClose={() => setViewItem(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default Portfolio;
