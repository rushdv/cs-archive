import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  Search,
  Menu,
  X,
  Star,
  Clock,
  Settings,
  Home,
  BookOpen,
  CheckSquare,
  Copy,
  Share2,
  MoreVertical,
  Bookmark,
  Archive
} from 'lucide-react';
import './App.css';

// Sidebar Navigation Component
const SidebarNav = ({ item, level = 0, onSelect, activePath, expandedFolders, toggleFolder }) => {
  const isExpanded = expandedFolders[item.path];
  const isActive = activePath === item.path;
  const hasChildren = item.type === 'directory' && item.children?.length > 0;

  return (
    <>
      <div
        className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${level === 0 ? 'sidebar-item-root' : ''}`}
        style={{ '--level': level }}
        onClick={(e) => {
          e.stopPropagation();
          if (item.type === 'directory') {
            toggleFolder(item.path);
          } else {
            onSelect(item);
          }
        }}
      >
        {hasChildren && (
          <button
            className="sidebar-toggle"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(item.path);
            }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {!hasChildren && <div className="sidebar-toggle-spacer" />}

        <span className="sidebar-icon">
          {item.type === 'directory' ? (
            <Folder size={16} />
          ) : (
            <FileText size={16} />
          )}
        </span>

        <span className="sidebar-label">{item.name}</span>
      </div>

      {isExpanded && item.children && (
        <div className="sidebar-children">
          {item.children.map((child, idx) => (
            <SidebarNav
              key={child.path + idx}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              activePath={activePath}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </>
  );
};

// Breadcrumb Component
const Breadcrumb = ({ path, name }) => {
  const parts = path?.replace('content/', '')?.split('/').slice(0, -1) || [];

  return (
    <div className="breadcrumb">
      <button className="breadcrumb-btn">
        <Home size={14} />
      </button>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          <span className="breadcrumb-sep">/</span>
          <button className="breadcrumb-btn">{part}</button>
        </React.Fragment>
      ))}
      {name && (
        <>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{name}</span>
        </>
      )}
    </div>
  );
};

// Document Header Component
const DocumentHeader = ({ title, path }) => {
  const depth = path?.split('/').length || 0;

  return (
    <div className="doc-header">
      <div className="doc-header-top">
        <div className="doc-badge">Documentation</div>
        <div className="doc-actions">
          <button className="doc-action-btn" title="Bookmark">
            <Bookmark size={18} />
          </button>
          <button className="doc-action-btn" title="Share">
            <Share2 size={18} />
          </button>
          <button className="doc-action-btn" title="More">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <h1 className="doc-title">{title}</h1>

      <div className="doc-meta">
        <span className="doc-meta-item">
          <Clock size={14} />
          Updated today
        </span>
        <span className="doc-meta-item">
          <FileText size={14} />
          {depth} sections
        </span>
        <span className="doc-meta-item">
          <BookOpen size={14} />
          Knowledge base
        </span>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onBrowse }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Folder size={64} />
      </div>
      <h2 className="empty-title">Welcome to Brain Vault</h2>
      <p className="empty-desc">
        Your personal knowledge management system. Select a document from the sidebar to get started.
      </p>
      <button onClick={onBrowse} className="empty-btn md:hidden">
        <Menu size={18} />
        Browse Knowledge Base
      </button>
    </div>
  );
};

// Loading Component
const LoadingState = () => {
  return (
    <div className="loading-container">
      <div className="loader"></div>
      <p className="loader-text">Loading vault...</p>
    </div>
  );
};

// Error Component
const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2 className="error-title">Something went wrong</h2>
      <p className="error-message">{message}</p>
      <button onClick={onRetry} className="error-btn">
        Try Again
      </button>
    </div>
  );
};


// Main App Component
function App() {
  const [fileTree, setFileTree] = useState([]);
  const [currentContent, setCurrentContent] = useState(null);
  const [currentMeta, setCurrentMeta] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/manifest.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setFileTree(data || []);
        setLoading(false);
        const initialExpanded = {};
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.type === 'directory') initialExpanded[item.path] = true;
          });
        }
        setExpandedFolders(initialExpanded);
      })
      .catch(err => {
        console.error("Manifest error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const loadFile = async (file) => {
    try {
      const res = await fetch(`/${file.path}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const text = await res.text();
      setCurrentContent(text);
      setCurrentMeta(file);
      setSidebarOpen(false);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error("Error loading file:", e);
      alert(`Error: ${e.message}`);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="app-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <BookOpen size={20} />
            </div>
            <div className="logo-text">
              <div className="logo-title">Brain Vault</div>
              <div className="logo-subtitle">Knowledge Base</div>
            </div>
          </div>
          <button
            className="sidebar-close md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-search">
          <Search size={16} />
          <input type="text" placeholder="Search documents..." />
        </div>

        <nav className="sidebar-nav">
          {fileTree.map((item, idx) => (
            <SidebarNav
              key={item.path + idx}
              item={item}
              activePath={currentMeta?.path}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              onSelect={loadFile}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-footer-btn">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <button
              className="menu-btn md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            {currentMeta && <Breadcrumb path={currentMeta.path} name={currentMeta.name.replace('.md', '')} />}
            {!currentMeta && (
              <div className="header-title">Welcome</div>
            )}
          </div>
          <div className="header-right">
            <button className="header-btn">
              <Search size={18} />
            </button>
            <button className="header-btn">
              <Bookmark size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="content-wrapper">
          {currentContent ? (
            <div className="content-container animate-fade-in">
              <DocumentHeader
                title={currentMeta.name.replace('.md', '').split('-').join(' ')}
                path={currentMeta.path}
              />

              <article className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    li: ({ children, checked, ...props }) => {
                      if (checked !== null && checked !== undefined) {
                        return (
                          <li className="task-item">
                            <div className={`task-checkbox ${checked ? 'task-checked' : ''}`}>
                              {checked && <CheckSquare size={16} />}
                            </div>
                            <span className={checked ? 'task-done' : ''}>{children}</span>
                          </li>
                        );
                      }
                      return <li {...props}>{children}</li>;
                    },
                    details: ({ children, ...props }) => (
                      <details className="details-block" {...props}>{children}</details>
                    ),
                    summary: ({ children, ...props }) => (
                      <summary className="details-summary" {...props}>{children}</summary>
                    ),
                    code: ({ children, inline, ...props }) => {
                      if (inline) {
                        return <code className="code-inline">{children}</code>;
                      }
                      return <code className="code-block" {...props}>{children}</code>;
                    },
                    pre: ({ children }) => <pre className="pre-block">{children}</pre>,
                  }}
                >
                  {currentContent}
                </ReactMarkdown>
              </article>

              <div className="content-footer">
                <span className="footer-text">Last updated today</span>
                <button className="footer-action">Share Document</button>
              </div>
            </div>
          ) : (
            <EmptyState onBrowse={() => setSidebarOpen(true)} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;