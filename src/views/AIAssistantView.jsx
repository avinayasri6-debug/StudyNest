import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SEMESTER_1_SUBJECTS } from '../data/subjectsData';
import { SUBJECT_STARTER_PROMPTS, QUICK_ACTIONS, EXPLANATION_MODES } from '../data/aiPromptsData';
import {
  IconSparkles,
  IconSend,
  IconBot,
  IconMessageSquare,
  IconTrash,
  IconPlus,
  IconRefreshCw,
  IconZap,
  IconCopy,
  IconCheckCircle,
  IconFileText,
  IconChevronRight,
  IconX,
  IconPython
} from '../components/Icons';
import MarkdownRenderer from '../components/MarkdownRenderer';
import {
  getAISettings,
  saveAISettings,
  getAIActiveChatId,
  saveAIActiveChatId
} from '../services/storage';
import './AIAssistantView.css';

function createChatId() {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function createMsgId(role) {
  return `msg_${Date.now()}_${role}_${Math.random().toString(36).substring(2, 5)}`;
}

function getTimestamp() {
  return new Date().toISOString();
}

export default function AIAssistantView({
  profile,
  conversations = [],
  onSaveConversations,
  onNavigate,
  onShowToast,
  onSaveNote
}) {
  // Stored preferences
  const settings = getAISettings();

  const [activeSubjectId, setActiveSubjectId] = useState(() => settings.defaultSubjectId || 'math101');
  const [activeMode, setActiveMode] = useState(() => settings.defaultMode || 'intermediate');
  const [activeChatId, setActiveChatId] = useState(() => getAIActiveChatId() || null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [savedNoteMsgId, setSavedNoteMsgId] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Close drawer on Escape key or when window resizes to mobile/tablet
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isHistoryOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsHistoryOpen(false);
      }
    };
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && isHistoryOpen) {
        setIsHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isHistoryOpen]);

  // Live status from backend
  const [aiStatus, setAiStatus] = useState({
    configured: false,
    provider: 'checking',
    model: ''
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Check backend AI status
  const checkAiStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      } else {
        setAiStatus({ configured: false, provider: 'none', model: 'demo' });
      }
    } catch {
      setAiStatus({ configured: false, provider: 'offline', model: 'pedagogy-v1' });
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch('/api/ai/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          setAiStatus(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setAiStatus({ configured: false, provider: 'offline', model: 'pedagogy-v1' });
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Persist active settings
  useEffect(() => {
    saveAISettings({ defaultSubjectId: activeSubjectId, defaultMode: activeMode });
  }, [activeSubjectId, activeMode]);

  // Active Subject Object
  const currentSubject = SEMESTER_1_SUBJECTS.find((s) => s.id === activeSubjectId) || SEMESTER_1_SUBJECTS[0];

  // Current Active Conversation
  let activeChat = conversations.find((c) => c.id === activeChatId);
  if (!activeChat && conversations.length > 0) {
    activeChat = conversations[0];
  }

  // Auto-scroll chat to bottom
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeChatId, activeChat?.messages?.length, isLoading]);

  // Start a new chat session
  const handleStartNewChat = () => {
    const newChat = {
      id: createChatId(),
      title: 'New Discussion',
      subjectId: activeSubjectId,
      subjectCode: currentSubject.code,
      subjectTitle: currentSubject.title,
      mode: activeMode,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
      messages: []
    };

    const updated = [newChat, ...conversations];
    onSaveConversations?.(updated);
    setActiveChatId(newChat.id);
    saveAIActiveChatId(newChat.id);
    setApiError(null);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsHistoryOpen(false);
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Switch chat
  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    saveAIActiveChatId(chatId);
    const targetChat = conversations.find((c) => c.id === chatId);
    if (targetChat?.subjectId) {
      setActiveSubjectId(targetChat.subjectId);
    }
    if (targetChat?.mode) {
      setActiveMode(targetChat.mode);
    }
    setApiError(null);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsHistoryOpen(false);
    }
  };

  // Delete chat
  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== chatId);
    onSaveConversations?.(updated);

    if (activeChatId === chatId) {
      const nextId = updated.length > 0 ? updated[0].id : null;
      setActiveChatId(nextId);
      saveAIActiveChatId(nextId);
    }
    onShowToast?.('Conversation removed from history');
  };

  // Send a message
  const handleSendMessage = async (textToSend = null, quickActionType = null) => {
    const rawText = textToSend !== null ? textToSend : inputMessage;
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    setApiError(null);
    setInputMessage('');

    // Ensure we have an active chat
    let currentChat = activeChat;
    let updatedConversations = [...conversations];

    if (!currentChat) {
      currentChat = {
        id: createChatId(),
        title: trimmed.length > 40 ? trimmed.slice(0, 40) + '...' : trimmed,
        subjectId: activeSubjectId,
        subjectCode: currentSubject.code,
        subjectTitle: currentSubject.title,
        mode: activeMode,
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
        messages: []
      };
      updatedConversations = [currentChat, ...updatedConversations];
      setActiveChatId(currentChat.id);
      saveAIActiveChatId(currentChat.id);
    }

    // Add user message
    const userMessage = {
      id: createMsgId('u'),
      role: 'user',
      content: trimmed,
      timestamp: getTimestamp()
    };

    const newMessages = [...currentChat.messages, userMessage];

    // Auto-update conversation title from first user query
    let newTitle = currentChat.title;
    if (currentChat.messages.length === 0 || currentChat.title === 'New Discussion') {
      newTitle = trimmed.length > 45 ? trimmed.slice(0, 45) + '...' : trimmed;
    }

    const chatWithUserMsg = {
      ...currentChat,
      title: newTitle,
      subjectId: activeSubjectId,
      subjectCode: currentSubject.code,
      subjectTitle: currentSubject.title,
      mode: activeMode,
      updatedAt: getTimestamp(),
      messages: newMessages
    };

    const convIndex = updatedConversations.findIndex((c) => c.id === currentChat.id);
    if (convIndex >= 0) {
      updatedConversations[convIndex] = chatWithUserMsg;
    } else {
      updatedConversations.unshift(chatWithUserMsg);
    }

    onSaveConversations?.(updatedConversations);
    setIsLoading(true);

    try {
      // Server-side call: API keys are NEVER exposed in client code
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          subject: {
            id: currentSubject.id,
            title: currentSubject.title,
            code: currentSubject.code,
            shortName: currentSubject.shortName
          },
          mode: activeMode,
          quickAction: quickActionType
        })
      });

      const data = await response.json();

      const assistantMessage = {
        id: createMsgId('a'),
        role: 'assistant',
        content: data.content || data.error || 'No response received from assistant.',
        isDemo: Boolean(data.isDemo),
        provider: data.provider || (aiStatus.configured ? aiStatus.provider : 'demo'),
        model: data.model || 'pedagogy-v1',
        mode: activeMode,
        subjectId: currentSubject.id,
        timestamp: getTimestamp()
      };

      const finalMessages = [...newMessages, assistantMessage];
      const finalChat = {
        ...chatWithUserMsg,
        updatedAt: getTimestamp(),
        messages: finalMessages
      };

      const finalConvs = updatedConversations.map((c) => (c.id === finalChat.id ? finalChat : c));
      onSaveConversations?.(finalConvs);

      if (!data.ok && data.error) {
        setApiError(data.error);
      }
    } catch (err) {
      console.error('AI Request Error:', err);
      setApiError(err.message || 'Failed to reach AI backend server.');

      // Provide local fallback error message in chat so user is not stuck
      const errorMsg = {
        id: createMsgId('err'),
        role: 'assistant',
        content: `> **[Connection Notice]**\n> Unable to communicate with the AI server (\`${err.message}\`).\n> Please ensure the Vite development server is running and check your network connection.`,
        isDemo: true,
        mode: activeMode,
        subjectId: currentSubject.id,
        timestamp: getTimestamp()
      };

      const fallbackChat = {
        ...chatWithUserMsg,
        updatedAt: getTimestamp(),
        messages: [...newMessages, errorMsg]
      };
      onSaveConversations?.(updatedConversations.map((c) => (c.id === fallbackChat.id ? fallbackChat : c)));
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  // Handle textarea enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy full response
  const handleCopyMessage = (text, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(id);
      onShowToast?.('AI explanation copied to clipboard');
      setTimeout(() => setCopiedMsgId(null), 2500);
    }
  };

  // Save to Smart Notes
  const handleSaveToNotes = (msg) => {
    if (!onSaveNote) return;

    const noteTitle = activeChat?.title && activeChat.title !== 'New Discussion'
      ? activeChat.title
      : `AI Lesson: ${currentSubject.shortName}`;

    const newNote = {
      id: createMsgId('note'),
      title: noteTitle,
      subjectCode: currentSubject.code,
      subjectName: currentSubject.title,
      content: msg.content,
      tags: ['AI Assistant', currentSubject.shortName, activeMode.toUpperCase()],
      isPinned: false,
      isFavorite: true,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    };

    onSaveNote(newNote);
    setSavedNoteMsgId(msg.id);
    onShowToast?.('Explanation saved directly to your Smart Notes!');
    setTimeout(() => setSavedNoteMsgId(null), 3000);
  };

  // Send Python code to Practice Lab
  const handleSendToPythonLab = (code) => {
    try {
      sessionStorage.setItem('studynest_python_incoming_snippet', code);
      onShowToast?.('Code loaded into Python Practice Lab!');
      onNavigate?.('python');
    } catch (e) {
      console.error('Error sending code to Python Lab:', e);
    }
  };

  // Quick Action Click
  const handleQuickAction = (qa) => {
    if (qa.id === 'python') {
      // If Python quick action, auto-switch subject to Python if not already
      setActiveSubjectId('cs103');
    }

    const starterPrompt = `${qa.promptPrefix} ${currentSubject.title}: `;
    setInputMessage(starterPrompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Starter prompt clicked from welcome card
  const handleStarterPromptClick = (starter) => {
    handleSendMessage(starter.prompt, starter.action);
  };

  const starterPrompts = SUBJECT_STARTER_PROMPTS[activeSubjectId] || SUBJECT_STARTER_PROMPTS.math101;

  return (
    <div className="ai-assistant-container">
      {/* Mobile Drawer Backdrop */}
      {isHistoryOpen && (
        <div
          className="ai-history-backdrop"
          onClick={() => setIsHistoryOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. Left Conversation History Sidebar / Slide-out Drawer */}
      <aside
        id="ai-history-drawer"
        className={`ai-history-sidebar ${isHistoryOpen ? 'open' : ''}`}
        aria-label="Study chat history"
        aria-hidden={typeof window !== 'undefined' && window.innerWidth < 1024 ? !isHistoryOpen : false}
      >
        <div className="ai-history-header">
          <div className="ai-history-title">
            <IconMessageSquare size={16} />
            <span>Study Chats</span>
            {conversations.length > 0 && (
              <span className="ai-history-count-badge">{conversations.length}</span>
            )}
          </div>
          <div className="ai-history-header-actions">
            <button
              type="button"
              className="ai-new-chat-btn"
              onClick={handleStartNewChat}
              title="Start New Conversation"
            >
              <IconPlus size={14} />
              <span className="ai-sidebar-new-label">New Chat</span>
            </button>
            <button
              type="button"
              className="ai-history-close-btn"
              onClick={() => setIsHistoryOpen(false)}
              aria-label="Close chat history"
              title="Close chat history"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        <div className="ai-history-list">
          {conversations.length === 0 ? (
            <div className="ai-history-empty">
              No saved conversations yet. Ask your first engineering question to start learning!
            </div>
          ) : (
            conversations.map((chat) => {
              const isSelected = chat.id === (activeChat?.id || activeChatId);
              const messageCount = chat.messages?.length || 0;
              const dateStr = new Date(chat.updatedAt || chat.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={chat.id}
                  className={`ai-history-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="ai-history-item-content">
                    <div className="ai-history-item-title" title={chat.title}>
                      {chat.title || 'Untitled Discussion'}
                    </div>
                    <div className="ai-history-item-meta">
                      <span className="ai-history-item-badge">
                        {chat.subjectCode || 'ENG'}
                      </span>
                      <span>{messageCount} {messageCount === 1 ? 'msg' : 'msgs'}</span>
                      <span>• {dateStr}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ai-history-item-delete"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    title="Delete Conversation"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. Main Chat Stage */}
      <div className="ai-chat-stage">
        {/* Top Header Command Bar */}
        <header className="ai-top-bar">
          <div className="ai-top-bar-left">
            <button
              type="button"
              className={`ai-history-toggle-btn ${isHistoryOpen ? 'active' : ''}`}
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              aria-expanded={isHistoryOpen}
              aria-controls="ai-history-drawer"
              aria-label={isHistoryOpen ? 'Close chat history' : 'Open chat history'}
              title={isHistoryOpen ? 'Close chat history' : 'Open chat history'}
            >
              <IconMessageSquare size={16} />
              <span className="ai-history-toggle-label">Chats</span>
              {conversations.length > 0 && (
                <span className="ai-history-toggle-badge">{conversations.length}</span>
              )}
            </button>
            <div className="ai-header-info">
              <div className="ai-header-title">
                <IconSparkles size={18} style={{ color: 'var(--forest-800)' }} />
                <span className="ai-header-title-full">StudyNest AI Academic Assistant</span>
                <span className="ai-header-title-short">AI Tutor</span>
              </div>
              <div className="ai-header-subtitle">
                24/7 Socratic engineering mentor tailored to your Semester 1 curriculum
              </div>
            </div>
          </div>

          <div className="ai-top-bar-right">
            {/* Live / Demo Status Pill */}
            {aiStatus.configured ? (
              <div className="ai-status-pill live" title={`Connected to ${aiStatus.provider} (${aiStatus.model})`}>
                <span className="ai-status-dot" />
                <span className="ai-status-text-full">Live AI ({aiStatus.provider === 'gemini' ? (aiStatus.model ? `Gemini (${aiStatus.model.replace('gemini-', '')})` : 'Gemini') : 'OpenAI'})</span>
                <span className="ai-status-text-short">Live AI</span>
              </div>
            ) : (
              <div className="ai-status-pill demo" title="Running in intelligent offline demo mode">
                <span className="ai-status-dot" />
                <span className="ai-status-text-full">Demo Mode</span>
                <span className="ai-status-text-short">Demo</span>
                <button
                  type="button"
                  className="ai-setup-api-btn"
                  onClick={() => setIsSetupModalOpen(true)}
                >
                  <IconZap size={11} />
                  <span>Setup API</span>
                </button>
              </div>
            )}

            <button
              type="button"
              className="ai-new-chat-btn ai-top-new-chat-btn"
              onClick={handleStartNewChat}
              title="Start New Conversation"
            >
              <IconPlus size={14} />
              <span className="ai-top-new-chat-label">New Chat</span>
            </button>
          </div>
        </header>

        {/* Controls Strip: Subject Dropdown & Explanation Mode Selector */}
        <div className="ai-controls-strip">
          <div className="ai-control-group">
            <span className="ai-control-label">Subject:</span>
            <select
              className="ai-subject-select"
              value={activeSubjectId}
              onChange={(e) => setActiveSubjectId(e.target.value)}
            >
              {SEMESTER_1_SUBJECTS.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} — {sub.title}
                </option>
              ))}
            </select>
          </div>

          <div className="ai-control-group">
            <span className="ai-control-label">Explanation Level:</span>
            <div className="ai-mode-pills">
              {EXPLANATION_MODES.map((mode) => {
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    className={`ai-mode-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveMode(mode.id)}
                    title={mode.tooltip}
                  >
                    <span>{mode.icon}</span>
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="ai-quick-actions-bar">
          {QUICK_ACTIONS.map((qa) => {
            const isPythonAction = qa.id === 'python';
            return (
              <button
                key={qa.id}
                type="button"
                className={`ai-quick-chip ${isPythonAction ? 'python-highlight' : ''}`}
                onClick={() => handleQuickAction(qa)}
                title={qa.desc}
              >
                <span>{qa.icon}</span>
                <span>{qa.label}</span>
              </button>
            );
          })}
        </div>

        {/* API Error Banner if any */}
        {apiError && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#FEF2F2',
              borderBottom: '1px solid #FCA5A5',
              color: '#991B1B',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <span>Notice: {apiError}</span>
            <button
              type="button"
              onClick={() => setApiError(null)}
              style={{ background: 'transparent', border: 'none', color: '#991B1B', cursor: 'pointer' }}
            >
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="ai-messages-scroll">
          {(!activeChat || activeChat.messages.length === 0) ? (
            /* Welcome Empty Screen */
            <div className="ai-welcome-card">
              <div className="ai-welcome-icon">
                <IconBot size={28} />
              </div>
              <h2 className="ai-welcome-title">
                Hello, {profile?.name?.split(' ')[0] || 'Engineering Student'}!
              </h2>
              <p className="ai-welcome-desc">
                I'm your StudyNest AI Assistant for <strong>{currentSubject.title}</strong> ({currentSubject.code}).
                Choose a starter prompt below, tap a quick action above, or type your engineering question to begin.
              </p>

              <div className="ai-starter-prompts-grid">
                {starterPrompts.map((starter, idx) => (
                  <div
                    key={idx}
                    className="ai-starter-prompt-card"
                    onClick={() => handleStarterPromptClick(starter)}
                  >
                    <div className="ai-starter-prompt-title">
                      <span>{starter.title}</span>
                      <IconChevronRight size={14} style={{ color: 'var(--sage-600)' }} />
                    </div>
                    <div className="ai-starter-prompt-text">
                      "{starter.prompt}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Message Thread */
            activeChat.messages.map((msg) => {
              const isUser = msg.role === 'user';
              const timeStr = msg.timestamp
                ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div key={msg.id} className={`ai-message-row ${isUser ? 'user' : 'assistant'}`}>
                  <div className={`ai-avatar ${isUser ? 'user' : 'assistant'}`}>
                    {isUser ? (
                      (profile?.name || 'S')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    ) : (
                      <IconSparkles size={18} />
                    )}
                  </div>

                  <div className="ai-message-bubble">
                    <div className="ai-message-header">
                      <div className="ai-message-sender-name">
                        <span>{isUser ? (profile?.name || 'You') : 'StudyNest AI Assistant'}</span>
                      </div>

                      <div className="ai-message-badges">
                        {!isUser && msg.isDemo && (
                          <span className="ai-bubble-badge demo" title="Generated by offline pedagogical curriculum engine">
                            Demo Mode
                          </span>
                        )}
                        {!isUser && msg.mode && (
                          <span className="ai-bubble-badge">
                            {msg.mode.toUpperCase()}
                          </span>
                        )}
                        <span className="ai-message-timestamp">{timeStr}</span>
                      </div>
                    </div>

                    <div className="ai-message-body">
                      {isUser ? (
                        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>
                      ) : (
                        <MarkdownRenderer
                          content={msg.content}
                          onSendToPython={handleSendToPythonLab}
                          onShowToast={onShowToast}
                        />
                      )}
                    </div>

                    {/* AI Message Action Buttons */}
                    {!isUser && (
                      <div className="ai-message-actions">
                        <button
                          type="button"
                          className="ai-msg-action-btn"
                          onClick={() => handleCopyMessage(msg.content, msg.id)}
                          title="Copy explanation to clipboard"
                        >
                          {copiedMsgId === msg.id ? (
                            <>
                              <IconCheckCircle size={13} style={{ color: '#10B981' }} />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <IconCopy size={13} />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="ai-msg-action-btn"
                          onClick={() => handleSaveToNotes(msg)}
                          title="Save this explanation directly into Smart Notes"
                        >
                          {savedNoteMsgId === msg.id ? (
                            <>
                              <IconCheckCircle size={13} style={{ color: '#10B981' }} />
                              <span>Saved to Notes</span>
                            </>
                          ) : (
                            <>
                              <IconFileText size={13} />
                              <span>Save to Smart Notes</span>
                            </>
                          )}
                        </button>

                        {/* If explanation contains python code */}
                        {msg.content.includes('```python') && (
                          <button
                            type="button"
                            className="ai-msg-action-btn"
                            style={{ backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)' }}
                            onClick={() => {
                              const match = msg.content.match(/```python([\s\S]*?)```/);
                              if (match && match[1]) {
                                handleSendToPythonLab(match[1].trim());
                              } else {
                                onNavigate?.('python');
                              }
                            }}
                            title="Open Python code in the browser Practice Lab"
                          >
                            <IconPython size={13} />
                            <span>Run in Python Practice Lab</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="ai-message-row assistant">
              <div className="ai-avatar assistant">
                <IconSparkles size={18} />
              </div>
              <div className="ai-typing-indicator">
                <div className="ai-typing-dots">
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                </div>
                <span className="ai-typing-text">
                  Formulating step-by-step {activeMode} explanation...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="ai-input-bar-container">
          <div className="ai-input-box-wrap">
            <textarea
              ref={textareaRef}
              className="ai-textarea"
              rows={2}
              placeholder={`Ask a question on ${currentSubject.title} (e.g. "Explain eigenvalues intuitively", "Debug my Python code")...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <div className="ai-input-footer-row">
              <div className="ai-input-hints">
                <span>Subject: <strong>{currentSubject.shortName}</strong></span>
                <span>• Mode: <strong>{activeMode}</strong></span>
                <span>• Press <kbd>Enter ↵</kbd> to send, <kbd>Shift + Enter</kbd> for newline</span>
              </div>

              <div className="ai-input-actions">
                <button
                  type="button"
                  className="ai-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  <IconSend size={14} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. API Setup & Configuration Modal */}
      {isSetupModalOpen && (
        <div className="ai-modal-backdrop" onClick={() => setIsSetupModalOpen(false)}>
          <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <div className="ai-modal-title">
                <IconZap size={18} style={{ color: 'var(--forest-800)' }} />
                <span>Configure Real AI Connection</span>
              </div>
              <button
                type="button"
                className="ai-modal-close-btn"
                onClick={() => setIsSetupModalOpen(false)}
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="ai-modal-body">
              <p>
                StudyNest is currently operating in <strong>Curriculum Demo Mode</strong>.
                To connect real live AI models (like Google Gemini 3.8 Flash or OpenAI), follow these simple steps:
              </p>

              <div className="ai-modal-step">
                <span className="ai-step-num">1</span>
                <div>
                  <strong>Get a Free Google Gemini API Key</strong>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Visit Google AI Studio (<a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest-800)', fontWeight: 600 }}>aistudio.google.com</a>) and generate a free API key.
                  </p>
                </div>
              </div>

              <div className="ai-modal-step">
                <span className="ai-step-num">2</span>
                <div>
                  <strong>Create a <code>.env</code> file in your project root</strong>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    In the <code>StudyNest</code> root folder, create a file named <code>.env</code> and paste your key:
                  </p>
                  <div className="ai-code-snippet-box">
                    GEMINI_API_KEY=your_actual_gemini_api_key_here<br />
                    GEMINI_MODEL=gemini-3.8-flash
                  </div>
                </div>
              </div>

              <div className="ai-modal-step">
                <span className="ai-step-num">3</span>
                <div>
                  <strong>Restart the Dev Server</strong>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Restart Vite in your terminal with <code>npm.cmd run dev</code>.
                    Your key is securely read by Node.js on the server side and is <strong>never exposed in client code</strong>.
                  </p>
                </div>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: 'var(--sage-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-sage)', fontSize: '12px' }}>
                🔒 <strong>Security Guarantee:</strong> StudyNest processes all AI calls through server-side middleware. Your API keys are kept strictly in environment variables and never sent to any third party.
              </div>
            </div>

            <div className="ai-modal-footer">
              <button
                type="button"
                className="ai-setup-api-btn"
                onClick={async () => {
                  await checkAiStatus();
                  onShowToast?.('Checked AI backend connection.');
                }}
              >
                <IconRefreshCw size={13} />
                <span>Test Connection</span>
              </button>
              <button
                type="button"
                className="ai-new-chat-btn"
                onClick={() => setIsSetupModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
