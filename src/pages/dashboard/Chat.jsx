import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StreamChat } from 'stream-chat';
import {
    Chat, Channel, ChannelList, Window, ChannelHeader,
    MessageList, MessageInput, Thread, useChatContext
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { motion } from 'framer-motion';
import { projectApi } from '../../services/api';
import { ArrowLeft, Info, X, Briefcase, Code, FileText, Link as LinkIcon, Download } from 'lucide-react';
import { toast } from '../../components/Toast';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

/* ─────────── Error Boundary ─────────── */
class ChatErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', background: '#FEF2F2', color: '#991B1B', borderRadius: '16px', margin: '1.5rem', border: '1px solid #FECACA' }}>
                    <h3 style={{ marginTop: 0 }}>Chat Error</h3>
                    <p>{this.state.error?.toString()}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ─────────── Project Details Sidebar ─────────── */
const ProjectDetailsSidebar = ({ project, isMobile, onClose }) => {
    if (!project) return null;

    const handleDownload = async (fileId, fileName) => {
        try {
            const res = await projectApi.downloadDocument(fileId);
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.download = fileName || 'document';
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
        } catch { toast.error('Download failed'); }
    };

    const videoUrl = project.video?.url || project.videoUrl;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
            <div style={{
                padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--bg-ice)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-pearl)',
            }}>
                <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={16} color="var(--primary)" /> Project Details
                </h3>
                {isMobile && (
                    <button onClick={onClose} style={{ background: 'var(--bg-ice)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                        <X size={14} />
                    </button>
                )}
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{project.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-pearl)', padding: '0.75rem', borderRadius: '8px' }}>
                        {project.description}
                    </p>
                </div>

                {project.roles?.length > 0 && (
                    <div>
                        <span className="input-label">Roles</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
                            {project.roles.map((r, i) => <span key={i} className="tag tag-skill">{r}</span>)}
                        </div>
                    </div>
                )}

                {project.techStack?.length > 0 && (
                    <div>
                        <span className="input-label">Tech Stack</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
                            {project.techStack.map((t, i) => <span key={i} className="tag tag-neutral">{t}</span>)}
                        </div>
                    </div>
                )}

                {videoUrl && (
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>
                        <LinkIcon size={14} /> Watch Video
                    </a>
                )}

                {project.projectDocuments?.length > 0 && (
                    <div>
                        <span className="input-label">Documents</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.3rem' }}>
                            {project.projectDocuments.map((doc, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--bg-pearl)', borderRadius: '8px' }}>
                                    <FileText size={14} color="var(--text-secondary)" />
                                    <span style={{ fontSize: '0.82rem', flex: 1 }}>{doc.tag || `Doc ${i + 1}`}</span>
                                    {doc.url ? (
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer"><LinkIcon size={12} color="var(--primary)" /></a>
                                    ) : doc.fileId ? (
                                        <button onClick={() => handleDownload(doc.fileId, doc.fileName)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                            <Download size={14} />
                                        </button>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────── Chat Layout ─────────── */
const ChatLayout = ({ projects, userId }) => {
    const { channel, setActiveChannel } = useChatContext();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showDetails, setShowDetails] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        if (window.innerWidth < 768) setActiveChannel(null);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setShowDetails(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeProject = useMemo(() => {
        if (!channel || !projects) return null;
        return projects.find(p => p.streamChannelId === channel.id);
    }, [channel, projects]);

    const filters = useMemo(() => {
        if (!userId) return null;
        return { type: 'messaging', members: { $in: [userId] } };
    }, [userId]);

    const showChannelList = !isMobile || (isMobile && !channel);
    const showChannel = !isMobile || (isMobile && channel);

    if (!filters) return null;

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', background: '#fff' }}>
            {/* Channel list */}
            {showChannelList && (
                <div style={{
                    width: isMobile ? '100%' : '300px', borderRight: isMobile ? 'none' : '1px solid var(--bg-ice)',
                    background: 'var(--bg-pearl)', flexShrink: 0, display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--bg-ice)', background: '#fff' }}>
                        <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Project Chats</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <ChannelList
                            filters={filters}
                            sort={{ last_message_at: -1 }}
                            setActiveChannelOnMount={!isMobile}
                        />
                    </div>
                </div>
            )}

            {/* Chat area */}
            {showChannel && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
                    <Channel>
                        <Window>
                            <div style={{
                                display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--bg-ice)',
                                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
                                padding: isMobile ? '0 0.5rem' : '0',
                            }}>
                                {isMobile && (
                                    <button onClick={() => setActiveChannel(null)} style={{ padding: '0.5rem', marginRight: '0.5rem', color: 'var(--primary)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <ArrowLeft size={22} />
                                    </button>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}><ChannelHeader /></div>
                                {activeProject && (
                                    <button
                                        onClick={() => setShowDetails(!showDetails)}
                                        style={{
                                            marginRight: '1rem', padding: '0.5rem 0.7rem', borderRadius: '8px', cursor: 'pointer',
                                            background: showDetails ? 'var(--primary)' : 'var(--primary-bg)',
                                            border: '1px solid var(--primary)',
                                            color: showDetails ? '#fff' : 'var(--primary)',
                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.2s',
                                        }}
                                    >
                                        <Info size={16} /> {!isMobile && 'Details'}
                                    </button>
                                )}
                            </div>
                            <MessageList />
                            <MessageInput />
                        </Window>
                        <Thread />
                    </Channel>

                    {/* Mobile details overlay */}
                    {isMobile && showDetails && activeProject && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)' }}>
                            <motion.div initial={{ x: 200 }} animate={{ x: 0 }} style={{ width: '85%', maxWidth: '340px', background: '#fff', height: '100%', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)' }}>
                                <ProjectDetailsSidebar project={activeProject} isMobile onClose={() => setShowDetails(false)} />
                            </motion.div>
                        </div>
                    )}
                </div>
            )}

            {/* Desktop details */}
            {!isMobile && showDetails && activeProject && showChannel && (
                <div style={{ width: '320px', flexShrink: 0, borderLeft: '1px solid var(--bg-ice)' }}>
                    <ProjectDetailsSidebar project={activeProject} isMobile={false} onClose={() => setShowDetails(false)} />
                </div>
            )}
        </div>
    );
};

/* ═══════════ MAIN CHAT PAGE ═══════════ */
const StudentChat = () => {
    const [client, setClient] = useState(null);
    const [userId, setUserId] = useState(null);
    const [initError, setInitError] = useState(null);
    const [projects, setProjects] = useState([]);
    const isConnecting = useRef(false);

    useEffect(() => {
        if (!apiKey) {
            setInitError('VITE_STREAM_API_KEY is not defined.');
            return;
        }

        let isMounted = true;

        // Guard against double-init from React 18 StrictMode
        if (isConnecting.current) return;
        isConnecting.current = true;

        const init = async () => {
            try {
                const streamToken = localStorage.getItem('streamToken');
                const userStr = localStorage.getItem('user');

                if (!streamToken || !userStr) {
                    if (isMounted) setInitError('Missing chat credentials. Please log out and back in.');
                    return;
                }

                const user = JSON.parse(userStr);
                const id = String(user.id || user._id);
                if (isMounted) setUserId(id);

                try {
                    const projRes = await projectApi.getMyProjects();
                    if (isMounted) setProjects(projRes.data.data || []);
                } catch (e) {
                    console.warn('Failed to load projects for chat', e);
                }

                const chatClient = StreamChat.getInstance(apiKey);

                // Already connected as the right user — just reuse
                if (chatClient.userID === id) {
                    if (isMounted) setClient(chatClient);
                    return;
                }

                // Connected as someone else — disconnect first
                if (chatClient.userID) {
                    await chatClient.disconnectUser();
                }

                if (!isMounted) return;

                await chatClient.connectUser(
                    { id, name: user.email || 'Student', role: 'user' },
                    streamToken
                );

                if (isMounted) {
                    setClient(chatClient);
                }
            } catch (err) {
                console.error('Chat init error:', err);
                if (isMounted) setInitError(err.message || 'Failed to initialize chat.');
            } finally {
                isConnecting.current = false;
            }
        };

        init();

        return () => {
            isMounted = false;
        };
    }, []);

    if (initError) {
        return (
            <div style={{ padding: '2rem', margin: '1.5rem' }}>
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '16px', padding: '2rem', color: '#991B1B' }}>
                    <h3 style={{ marginTop: 0 }}>Chat Initialization Failed</h3>
                    <p>{initError}</p>
                </div>
            </div>
        );
    }

    if (!client || !userId) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <div className="spinner" />
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Connecting to chat...</span>
                </div>
            </div>
        );
    }

    return (
        <ChatErrorBoundary>
            <style>{`
        .str-chat {
          --str-chat__font-family: 'Inter', sans-serif;
          --str-chat__primary-color: #2563EB;
          --str-chat__active-primary-color: #1D4ED8;
          --str-chat__surface-color: #FFFFFF;
          --str-chat__background-color: #F4F7FB;
        }
        .str-chat__header-hamburger { display: none !important; }
      `}</style>
            <div style={{
                height: 'calc(100vh - 60px)', width: '100%',
                display: 'flex', overflow: 'hidden',
                background: '#fff',
            }}>
                <Chat client={client} theme="str-chat__theme-light">
                    <ChatLayout projects={projects} userId={userId} />
                </Chat>
            </div>
        </ChatErrorBoundary>
    );
};

export default StudentChat;
