import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentApi } from '../../services/api';
import { toast } from '../../components/Toast';
import {
    User, GraduationCap, Briefcase, Code, Save, Check, Plus, X,
    Calendar, Building2, BookOpen, Sparkles, PenLine, Shield, Eye, Lock
} from 'lucide-react';

/* ─────────── Auto-Save Indicator ─────────── */
const SaveIndicator = ({ saving, saved }) => (
    <AnimatePresence>
        {(saving || saved) && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.3rem 0.75rem', borderRadius: '999px',
                    background: saving ? '#FEF3C7' : '#ECFDF5',
                    border: `1px solid ${saving ? '#FDE68A' : '#A7F3D0'}`,
                    fontSize: '0.75rem', fontWeight: 600,
                    color: saving ? '#B45309' : '#065F46',
                }}
            >
                {saving ? (
                    <><div className="spinner spinner-sm" style={{ width: 12, height: 12, borderWidth: '1.5px' }} /> Saving...</>
                ) : (
                    <><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}><Check size={12} /></motion.div> Saved</>
                )}
            </motion.div>
        )}
    </AnimatePresence>
);

/* ─────────── Skill Tag Component ─────────── */
const SkillTag = ({ skill, onRemove, index }) => (
    <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: index * 0.03 }}
        layout
        className="tag tag-skill"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
    >
        {skill}
        <button onClick={() => onRemove(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--primary)', opacity: 0.6 }}>
            <X size={12} />
        </button>
    </motion.span>
);

/* ─────────── Timeline Entry Form ─────────── */
const TimelineEntryForm = ({ entry, onChange, onRemove, type, readOnly }) => {
    const fields = type === 'education'
        ? [
            { key: 'institution', label: 'Institution', icon: Building2, required: true },
            { key: 'degree', label: 'Degree', icon: GraduationCap },
            { key: 'field', label: 'Field of Study', icon: BookOpen },
            { key: 'startYear', label: 'Start Year', icon: Calendar, type: 'number' },
            { key: 'endYear', label: 'End Year', icon: Calendar, type: 'number' },
            { key: 'grade', label: 'Grade / GPA', icon: Sparkles },
        ]
        : [
            { key: 'title', label: 'Title', icon: Briefcase, required: true },
            { key: 'company', label: 'Company', icon: Building2, required: true },
            { key: 'from', label: 'From', icon: Calendar, type: 'date' },
            { key: 'to', label: 'To', icon: Calendar, type: 'date' },
            { key: 'description', label: 'Description', icon: PenLine, multiline: true },
        ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            layout
            className="glass-card-static"
            style={{ padding: '1.25rem', position: 'relative', opacity: readOnly ? 0.92 : 1 }}
        >
            {/* Verified Institution badge for isPrimary */}
            {readOnly && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.25rem 0.7rem', borderRadius: '999px',
                    background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                    border: '1px solid #93C5FD',
                    fontSize: '0.7rem', fontWeight: 700, color: '#1D4ED8',
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                }}>
                    <Lock size={10} /> Verified Institution
                </div>
            )}

            {/* Delete button (hidden for primary entries) */}
            {!readOnly && (
                <button onClick={onRemove} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#FEF2F2', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: '#EF4444', display: 'flex' }}>
                    <X size={14} />
                </button>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {fields.map(f => (
                    <div key={f.key} style={f.multiline ? { gridColumn: '1 / -1' } : {}}>
                        <label className="input-label">{f.label}</label>
                        {f.multiline ? (
                            <textarea
                                className="input-field"
                                value={entry[f.key] || ''}
                                onChange={e => onChange(f.key, e.target.value)}
                                placeholder={`Enter ${f.label.toLowerCase()}`}
                                rows={2}
                                disabled={readOnly}
                                style={readOnly ? { background: '#F8FAFC', cursor: 'not-allowed' } : {}}
                            />
                        ) : (
                            <input
                                type={f.type || 'text'}
                                className="input-field"
                                value={entry[f.key] || ''}
                                onChange={e => onChange(f.key, e.target.value)}
                                placeholder={`Enter ${f.label.toLowerCase()}`}
                                required={f.required}
                                disabled={readOnly}
                                style={readOnly ? { background: '#F8FAFC', cursor: 'not-allowed' } : {}}
                            />
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

/* ═══════════ MAIN PROFILE PAGE ═══════════ */
const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    // Fetch profile
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await studentApi.getProfile();
                setProfile(res.data.data);
            } catch (err) {
                toast.error('Failed to load profile');
            }
            setLoading(false);
        };
        fetch();
    }, []);

    // Explicit save — filters out incomplete entries before sending
    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            // Filter education: must have institution
            const cleanEducation = (profile.education || []).filter(e => e.institution && e.institution.trim());
            // Filter experience: must have title AND company
            const cleanExperience = (profile.experience || []).filter(e => e.title && e.title.trim() && e.company && e.company.trim());

            await studentApi.updateProfile({
                education: cleanEducation,
                techStack: profile.techStack,
                experience: cleanExperience,
                bio: profile.bio,
                privacy: profile.privacy,
            });

            // Update local state with cleaned data
            setProfile(prev => ({ ...prev, education: cleanEducation, experience: cleanExperience }));
            setSaving(false);
            setSaved(true);
            setHasChanges(false);
            toast.success('Profile saved successfully!');
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setSaving(false);
            toast.error(err.response?.data?.message || "Couldn't save changes. Please try again.");
        }
    };

    const updateField = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    // Skill management
    const addSkill = () => {
        const skill = newSkill.trim();
        if (!skill || profile.techStack.includes(skill)) return;
        setProfile(prev => ({ ...prev, techStack: [...prev.techStack, skill] }));
        setNewSkill('');
        setHasChanges(true);
    };

    const removeSkill = (skill) => {
        setProfile(prev => ({ ...prev, techStack: prev.techStack.filter(s => s !== skill) }));
        setHasChanges(true);
    };

    // Timeline management
    const addTimelineEntry = (type) => {
        const empty = type === 'education'
            ? { institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '' }
            : { title: '', company: '', from: '', to: '', description: '' };
        setProfile(prev => ({ ...prev, [type]: [...(prev[type] || []), empty] }));
        setHasChanges(true);
    };

    const updateTimelineEntry = (type, index, key, value) => {
        setProfile(prev => {
            const arr = [...(prev[type] || [])];
            arr[index] = { ...arr[index], [key]: value };
            return { ...prev, [type]: arr };
        });
        setHasChanges(true);
    };

    const removeTimelineEntry = (type, index) => {
        setProfile(prev => {
            const arr = [...(prev[type] || [])];
            arr.splice(index, 1);
            return { ...prev, [type]: arr };
        });
        setHasChanges(true);
    };

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="page-container">
                <div className="empty-state"><p>Failed to load profile.</p></div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1><User size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />My Profile</h1>
                    <p>Keep your profile up to date to stand out</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <SaveIndicator saving={saving} saved={saved} />
                    <motion.button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        whileTap={{ scale: 0.95 }}
                    >
                        {saving ? (
                            <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                        ) : (
                            <><Save size={16} /> Save Changes</>
                        )}
                    </motion.button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Bio Section */}
                <motion.section className="glass-card-static" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PenLine size={18} color="var(--primary)" /> About Me
                    </h3>
                    <textarea
                        className="input-field"
                        value={profile.bio || ''}
                        onChange={e => updateField('bio', e.target.value)}
                        placeholder="Tell employers about yourself — your passions, goals, and what makes you unique..."
                        rows={4}
                        maxLength={2000}
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                        {(profile.bio || '').length}/2000
                    </div>
                </motion.section>

                {/* Tech Stack / Skills */}
                <motion.section className="glass-card-static" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Code size={18} color="var(--primary)" /> Skills & Tech Stack
                    </h3>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            className="input-field"
                            value={newSkill}
                            onChange={e => setNewSkill(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            placeholder="Type a skill and press Enter"
                            style={{ flex: 1 }}
                        />
                        <motion.button className="btn btn-primary" onClick={addSkill} whileTap={{ scale: 0.95 }} disabled={!newSkill.trim()}>
                            <Plus size={16} /> Add
                        </motion.button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '40px' }}>
                        <AnimatePresence>
                            {(profile.techStack || []).map((skill, i) => (
                                <SkillTag key={skill} skill={skill} onRemove={removeSkill} index={i} />
                            ))}
                        </AnimatePresence>
                        {(profile.techStack || []).length === 0 && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                Add your first skill above ↑
                            </p>
                        )}
                    </div>
                </motion.section>

                {/* Education Timeline */}
                <motion.section className="glass-card-static" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <GraduationCap size={18} color="var(--primary)" /> Education
                        </h3>
                        <motion.button className="btn btn-ghost btn-sm" onClick={() => addTimelineEntry('education')} whileTap={{ scale: 0.95 }}>
                            <Plus size={14} /> Add
                        </motion.button>
                    </div>

                    {/* Timeline line */}
                    <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--bg-ice)' }}>
                        <AnimatePresence>
                            {(profile.education || []).map((edu, i) => (
                                <div key={i} style={{ marginBottom: '1rem', position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '-1.8rem', top: '1rem',
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-azure))',
                                        border: '2px solid var(--bg-white)',
                                        boxShadow: '0 0 0 3px var(--primary-bg)',
                                    }} />
                                    <TimelineEntryForm
                                        entry={edu}
                                        onChange={(key, val) => updateTimelineEntry('education', i, key, val)}
                                        onRemove={() => removeTimelineEntry('education', i)}
                                        type="education"
                                        readOnly={!!edu.isPrimary}
                                    />
                                </div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {(profile.education || []).length === 0 && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic', paddingLeft: '1.5rem' }}>
                            No education entries yet
                        </p>
                    )}
                </motion.section>

                {/* Experience Timeline */}
                <motion.section className="glass-card-static" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={18} color="var(--primary)" /> Experience
                        </h3>
                        <motion.button className="btn btn-ghost btn-sm" onClick={() => addTimelineEntry('experience')} whileTap={{ scale: 0.95 }}>
                            <Plus size={14} /> Add
                        </motion.button>
                    </div>

                    <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--bg-ice)' }}>
                        <AnimatePresence>
                            {(profile.experience || []).map((exp, i) => (
                                <div key={i} style={{ marginBottom: '1rem', position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '-1.8rem', top: '1rem',
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-azure))',
                                        border: '2px solid var(--bg-white)',
                                        boxShadow: '0 0 0 3px var(--primary-bg)',
                                    }} />
                                    <TimelineEntryForm
                                        entry={exp}
                                        onChange={(key, val) => updateTimelineEntry('experience', i, key, val)}
                                        onRemove={() => removeTimelineEntry('experience', i)}
                                        type="experience"
                                    />
                                </div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {(profile.experience || []).length === 0 && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic', paddingLeft: '1.5rem' }}>
                            No experience entries yet
                        </p>
                    )}
                </motion.section>

                {/* Privacy Settings */}
                <motion.section className="glass-card-static" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={18} color="var(--primary)" /> Privacy
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { key: 'publicProfile', label: 'Public Profile', desc: 'Allow others to view your profile' },
                            { key: 'portfolioPublic', label: 'Public Portfolio', desc: 'Allow others to see your portfolio items' },
                        ].map(item => (
                            <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-pearl)', borderRadius: '10px', cursor: 'pointer' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                                </div>
                                <div
                                    onClick={() => updateField('privacy', { ...profile.privacy, [item.key]: !profile.privacy?.[item.key] })}
                                    style={{
                                        width: '44px', height: '24px', borderRadius: '12px',
                                        background: profile.privacy?.[item.key] ? 'linear-gradient(135deg, var(--primary), var(--primary-azure))' : '#CBD5E1',
                                        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                                        boxShadow: profile.privacy?.[item.key] ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                                    }}
                                >
                                    <motion.div
                                        animate={{ x: profile.privacy?.[item.key] ? 22 : 2 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        style={{
                                            width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                                            position: 'absolute', top: '2px',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                                        }}
                                    />
                                </div>
                            </label>
                        ))}
                    </div>
                </motion.section>

                {/* Bottom Save Button */}
                {hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}
                    >
                        <motion.button
                            className="btn btn-primary btn-lg"
                            onClick={handleSave}
                            disabled={saving}
                            whileTap={{ scale: 0.95 }}
                        >
                            {saving ? (
                                <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                            ) : (
                                <><Save size={16} /> Save Changes</>
                            )}
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Profile;
