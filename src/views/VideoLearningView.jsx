import React, { useState, useMemo } from 'react';
import {
  VIDEO_LESSONS,
  VIDEO_SUBJECT_CATEGORIES,
  VIDEO_ACADEMIC_DISCLAIMER,
  DEFAULT_VIDEO_PLAYLISTS
} from '../data/videosData';
import {
  IconVideo,
  IconBookmark,
  IconCheckCircle,
  IconCircle,
  IconSearch,
  IconClock,
  IconSparkles,
  IconPlay,
  IconPlus,
  IconTrash,
  IconX,
  IconExternalLink,
  IconTag,
  IconBot,
  IconRefreshCw
} from '../components/Icons';
import MarkdownRenderer from '../components/MarkdownRenderer';
import './VideoLearningView.css';

// Helper to extract YouTube ID from standard or short link
function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match) return match[1];
  if (/^[\w-]{11}$/.test(str)) return str;
  return null;
}

function parseTimestampToSeconds(str) {
  if (!str) return 0;
  const parts = str.trim().split(':').map(Number);
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return parseInt(str, 10) || 0;
}

export default function VideoLearningView({
  completedVideoIds = [],
  onToggleCompleteVideo,
  watchLaterVideoIds = [],
  onToggleWatchLater,
  recentlyWatchedVideos = [],
  onLogRecentlyWatchedVideo,
  customVideos = [],
  onSaveCustomVideos,
  videoPlaylists = DEFAULT_VIDEO_PLAYLISTS,
  onSaveVideoPlaylists,
  videoBookmarks = [],
  onSaveVideoBookmarks,
  _profile,
  initialSubjectId = 'all',
  onShowToast
}) {
  // Navigation tabs:
  // 'library' | 'playlists' | 'watch-later' | 'history' | 'bookmarks' | 'recommendations'
  const [activeTab, setActiveTab] = useState('library');

  // Filter & Search states
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(initialSubjectId);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all' | 'Beginner' | 'Intermediate' | 'Advanced'
  const [selectedSort, setSelectedSort] = useState('curated'); // 'curated' | 'popular' | 'recent' | 'short' | 'long'
  const [searchQuery, setSearchQuery] = useState('');

  // Active playing video & player state
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeVideoTab, setActiveVideoTab] = useState('notes'); // 'notes' | 'overview' | 'bookmarks' | 'related'
  const [playerStartSeconds, setPlayerStartSeconds] = useState(0);

  // New Bookmark Form (inside theater player)
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [bookmarkTimestampInput, setBookmarkTimestampInput] = useState('02:30');
  const [bookmarkNoteInput, setBookmarkNoteInput] = useState('');

  // Add Custom Video Modal / Form
  const [isAddingCustomVideo, setIsAddingCustomVideo] = useState(false);
  const [customVideoForm, setCustomVideoForm] = useState(() => ({
    title: '',
    youtubeUrl: '',
    subjectId: 'math101',
    unitNumber: 1,
    topicName: '',
    instructor: '',
    channel: '',
    duration: '15:00',
    level: 'Intermediate',
    description: ''
  }));

  // Create Custom Playlist Modal / Form
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistForm, setPlaylistForm] = useState(() => ({
    title: '',
    description: '',
    subjectId: 'math101',
    selectedVideoIds: []
  }));

  // AI Recommendation State
  const [aiRecLoading, setAiRecLoading] = useState(false);
  const [aiRecAdvice, setAiRecAdvice] = useState(null);

  // Combine standard curated lessons with user-added custom videos
  const allVideos = useMemo(() => {
    return [...VIDEO_LESSONS, ...customVideos];
  }, [customVideos]);

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allVideos.length };
    allVideos.forEach((v) => {
      counts[v.subjectId] = (counts[v.subjectId] || 0) + 1;
    });
    return counts;
  }, [allVideos]);

  // Total Progress Metrics
  const totalVideos = allVideos.length;
  const completedCount = completedVideoIds.length;
  const progressPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;
  const watchLaterCount = watchLaterVideoIds.length;

  // Filtered & Sorted Videos
  const filteredVideos = useMemo(() => {
    const list = allVideos.filter((vid) => {
      // 1. Subject Filter
      if (selectedSubjectFilter !== 'all' && vid.subjectId !== selectedSubjectFilter) {
        return false;
      }
      // 2. Difficulty Filter
      if (selectedDifficulty !== 'all' && vid.level !== selectedDifficulty) {
        return false;
      }
      // 3. Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = vid.title.toLowerCase().includes(q);
        const matchesChannel = vid.channel.toLowerCase().includes(q);
        const matchesInstructor = (vid.instructor || '').toLowerCase().includes(q);
        const matchesSubject = vid.subjectTitle.toLowerCase().includes(q);
        const matchesTopic = (vid.topicName || '').toLowerCase().includes(q);
        const matchesNotes = (vid.relatedNotes || []).some((n) => n.toLowerCase().includes(q));
        if (!matchesTitle && !matchesChannel && !matchesInstructor && !matchesSubject && !matchesTopic && !matchesNotes) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    if (selectedSort === 'popular') {
      return [...list].sort((a, b) => (b.popularityScore || 50) - (a.popularityScore || 50));
    }
    if (selectedSort === 'recent') {
      return [...list].sort((a, b) => (b.addedDate || '').localeCompare(a.addedDate || ''));
    }
    if (selectedSort === 'short') {
      return [...list].sort((a, b) => (a.durationSeconds || 600) - (b.durationSeconds || 600));
    }
    if (selectedSort === 'long') {
      return [...list].sort((a, b) => (b.durationSeconds || 600) - (a.durationSeconds || 600));
    }
    return list; // default curated order
  }, [allVideos, selectedSubjectFilter, selectedDifficulty, selectedSort, searchQuery]);

  // Group videos by subject and unit for organized hierarchical browsing
  const groupedVideosByUnit = useMemo(() => {
    const map = {};
    filteredVideos.forEach((vid) => {
      const key = `${vid.subjectId}_unit_${vid.unitNumber || 1}`;
      if (!map[key]) {
        map[key] = {
          subjectId: vid.subjectId,
          subjectTitle: vid.subjectTitle,
          subjectCode: vid.subjectCode,
          unitNumber: vid.unitNumber || 1,
          unitTitle: vid.unitTitle || `Unit ${vid.unitNumber || 1}: Core Syllabus Topics`,
          videos: []
        };
      }
      map[key].videos.push(vid);
    });
    return Object.values(map);
  }, [filteredVideos]);

  // Recently watched item for quick resume
  const lastWatched = useMemo(() => {
    return recentlyWatchedVideos[0] || null;
  }, [recentlyWatchedVideos]);

  // Related videos for active video
  const relatedVideos = useMemo(() => {
    if (!activeVideo) return [];
    return allVideos
      .filter((v) => v.id !== activeVideo.id && (v.subjectId === activeVideo.subjectId || v.unitNumber === activeVideo.unitNumber))
      .slice(0, 4);
  }, [activeVideo, allVideos]);

  // Bookmarks for the active playing video
  const activeVideoBookmarks = useMemo(() => {
    if (!activeVideo) return [];
    return videoBookmarks
      .filter((b) => b.videoId === activeVideo.id)
      .sort((a, b) => a.timestampSeconds - b.timestampSeconds);
  }, [activeVideo, videoBookmarks]);

  // Play video handler
  const handlePlayVideo = (vid, startSec = 0) => {
    setActiveVideo(vid);
    setPlayerStartSeconds(startSec);
    setActiveVideoTab('notes');

    // Record in recently watched history
    onLogRecentlyWatchedVideo?.({
      videoId: vid.id,
      title: vid.title,
      subjectId: vid.subjectId,
      subjectCode: vid.subjectCode,
      subjectTitle: vid.subjectTitle,
      channel: vid.channel,
      youtubeId: vid.youtubeId,
      duration: vid.duration,
      level: vid.level,
      watchedAt: new Date().toISOString(),
      progressSeconds: startSec
    });

    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleToggleCompleted = (vid) => {
    onToggleCompleteVideo(vid.id, vid.title);
  };

  const handleToggleWatchLater = (vid) => {
    onToggleWatchLater(vid.id, vid.title);
  };

  // Add Timestamp Bookmark
  const handleSaveBookmark = (e) => {
    e.preventDefault();
    if (!activeVideo) return;
    const secs = parseTimestampToSeconds(bookmarkTimestampInput);

    const newBookmark = {
      id: `bm-${Date.now()}`,
      videoId: activeVideo.id,
      videoTitle: activeVideo.title,
      subjectTitle: activeVideo.subjectTitle,
      timestampFormatted: bookmarkTimestampInput.trim(),
      timestampSeconds: secs,
      note: bookmarkNoteInput.trim() || 'Key concept note',
      createdAt: new Date().toISOString()
    };

    onSaveVideoBookmarks?.([newBookmark, ...videoBookmarks]);
    setBookmarkNoteInput('');
    setIsAddingBookmark(false);
    onShowToast?.(`Saved bookmark at ${bookmarkTimestampInput}`);
  };

  const handleDeleteBookmark = (bookmarkId) => {
    const updated = videoBookmarks.filter((b) => b.id !== bookmarkId);
    onSaveVideoBookmarks?.(updated);
    onShowToast?.('Timestamp bookmark removed.');
  };

  // Save Custom Video Form
  const handleSaveCustomVideo = (e) => {
    e.preventDefault();
    const ytId = extractYouTubeId(customVideoForm.youtubeUrl);
    if (!ytId) {
      onShowToast?.('Please enter a valid YouTube URL or 11-character video ID.');
      return;
    }

    const matchedSub = VIDEO_SUBJECT_CATEGORIES.find((c) => c.id === customVideoForm.subjectId);

    const newVideo = {
      id: `custom-vid-${Date.now()}`,
      subjectId: customVideoForm.subjectId,
      subjectCode: matchedSub?.code || 'GEN',
      subjectTitle: matchedSub?.label || 'Engineering Course',
      unitNumber: parseInt(customVideoForm.unitNumber, 10) || 1,
      unitTitle: `Unit ${customVideoForm.unitNumber || 1}: Custom Selected Topics`,
      topicName: customVideoForm.topicName.trim() || 'Custom Learning Topic',
      title: customVideoForm.title.trim(),
      channel: customVideoForm.channel.trim() || 'Verified Educator',
      instructor: customVideoForm.instructor.trim() || 'YouTube Lecturer',
      youtubeId: ytId,
      duration: customVideoForm.duration.trim() || '15:00',
      durationSeconds: parseTimestampToSeconds(customVideoForm.duration) || 900,
      level: customVideoForm.level,
      views: 'Student Curated',
      popularityScore: 85,
      addedDate: new Date().toISOString().split('T')[0],
      description: customVideoForm.description.trim() || 'Student added engineering lecture resource.',
      relatedNotes: [
        'Custom student-curated lecture resource.',
        'Review syllabus alignment with official college curriculum.'
      ],
      topicsCovered: [customVideoForm.topicName || 'General Engineering']
    };

    onSaveCustomVideos?.([newVideo, ...customVideos]);
    onShowToast?.(`Added "${newVideo.title}" to Video Learning Hub!`);
    setIsAddingCustomVideo(false);
    setCustomVideoForm({
      title: '',
      youtubeUrl: '',
      subjectId: 'math101',
      unitNumber: 1,
      topicName: '',
      instructor: '',
      channel: '',
      duration: '15:00',
      level: 'Intermediate',
      description: ''
    });
  };

  // Save Custom Playlist
  const handleSaveCustomPlaylist = (e) => {
    e.preventDefault();
    if (!playlistForm.title.trim() || playlistForm.selectedVideoIds.length === 0) {
      onShowToast?.('Please enter a playlist title and select at least one video.');
      return;
    }

    const matchedSub = VIDEO_SUBJECT_CATEGORIES.find((c) => c.id === playlistForm.subjectId);

    const newPlaylist = {
      id: `pl-custom-${Date.now()}`,
      title: playlistForm.title.trim(),
      description: playlistForm.description.trim() || 'Custom engineering study playlist.',
      subjectId: playlistForm.subjectId,
      subjectCode: matchedSub?.code || 'GEN',
      videoIds: playlistForm.selectedVideoIds,
      isCustom: true
    };

    onSaveVideoPlaylists?.([...videoPlaylists, newPlaylist]);
    onShowToast?.(`Created playlist "${newPlaylist.title}" with ${newPlaylist.videoIds.length} lectures!`);
    setIsCreatingPlaylist(false);
    setPlaylistForm({
      title: '',
      description: '',
      subjectId: 'math101',
      selectedVideoIds: []
    });
  };

  const handleDeletePlaylist = (playlistId) => {
    const updated = videoPlaylists.filter((p) => p.id !== playlistId);
    onSaveVideoPlaylists?.(updated);
    onShowToast?.('Custom playlist removed.');
  };

  // AI Video Path Recommendation
  const handleAskAIVideoAdvisor = async () => {
    setAiRecLoading(true);
    setAiRecAdvice(null);

    const completedTitles = allVideos
      .filter((v) => completedVideoIds.includes(v.id))
      .map((v) => v.title)
      .join(', ');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `You are an expert engineering video learning advisor for a first-year CSE AI & ML student.
The student has completed the following lectures: ${completedTitles || 'None yet'}.
Available Subjects:
1. Linear Algebra and Calculus (MATH 101)
2. Engineering Physics (PHY 101)
3. Problem Solving and Programming in Python (CSE 101)
4. Fundamentals of Digital Electronics (ECE 101)
5. Digital Skill Workshop (ENG 103)
6. Quantitative Aptitude and Reasoning (ENG 104)
7. English for Technical Communication (HUM 101)

Please provide an optimized 3-step video learning sequence for this week:
- Step 1: Immediate foundational lecture to watch next and why
- Step 2: Practical coding / problem-solving video to interleave
- Step 3: Revision and concept consolidation video
Explain the pedagogical reasoning and highlight key formulas to watch out for.`
            }
          ],
          subject: {
            id: 'video-hub',
            title: 'Engineering Video Learning Hub Advisor',
            code: 'VIDEO-HUB',
            shortName: 'Video Advisor'
          },
          mode: 'intermediate'
        })
      });

      const data = await response.json();
      setAiRecAdvice(data.content || data.error || 'No recommendation received.');
      onShowToast?.('✨ AI Video Learning Path generated!');
    } catch {
      // Heuristic structured fallback
      setAiRecAdvice(`### 🎓 Recommended Engineering Video Learning Path

#### Step 1: Foundational Theory (Watch First)
* **3Blue1Brown: Linear Transformations & Matrices (MATH 101)**
  * **Why**: Establishes spatial geometric intuition for vector mappings before tackling abstract matrix algebra in examinations.
  * **Key takeaway**: Notice how column vectors record where coordinate basis arrows $\\hat{i}$ and $\\hat{j}$ land.

#### Step 2: Hands-On Practical Implementation (Interleaved)
* **freeCodeCamp: Python for Beginners Crash Course (CSE 101)**
  * **Why**: Balances mathematical abstraction with direct keyboard practice in the Python Practice Lab. Focus on dictionary lookups and conditional loops.

#### Step 3: Experimental Physical Intuition (Consolidation)
* **Veritasium: The Original Double Slit Experiment (PHY 101)**
  * **Why**: Connects differential wave equations with real optical interference patterns ($\beta = \frac{\\lambda D}{d}$).`);
    } finally {
      setAiRecLoading(false);
    }
  };

  return (
    <div className="video-learning-hub-container">
      {/* 1. Header Banner & Progress Strip */}
      <div className="section-header-row" style={{ marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-700)', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
            <IconVideo size={18} />
            <span>Academic Media Portal · Verified Open Educational Lectures</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
            Video Learning Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Curated high-yield video lectures across all 7 Semester 1 subjects, Python Masterclass track, timestamp bookmarks, and personalized playlists.
          </p>
        </div>

        {/* Global Video Progress Pill */}
        <div className="term-pill-badge" style={{ backgroundColor: 'var(--forest-850)', color: '#FFFFFF' }}>
          <IconVideo size={15} />
          <span>{completedCount} of {totalVideos} Completed ({progressPercent}%)</span>
        </div>
      </div>

      {/* Academic Disclaimer Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 16px',
        backgroundColor: 'rgba(104, 143, 120, 0.12)',
        borderRadius: '8px',
        border: '1px solid var(--border-sage)',
        fontSize: '12.5px',
        color: 'var(--forest-900)',
        lineHeight: 1.5
      }}>
        <IconSparkles size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{VIDEO_ACADEMIC_DISCLAIMER}</span>
      </div>

      {/* Resume Last Watched Strip (if history exists) */}
      {lastWatched && (
        <div className="video-resume-strip">
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#A5C4AF' }}>
              ▶ Jump Back In · Continue Learning
            </div>
            <div className="resume-video-title">{lastWatched.title}</div>
            <div className="resume-video-meta">
              <span>{lastWatched.subjectCode || lastWatched.subjectTitle}</span>
              <span>• Channel: {lastWatched.channel}</span>
              <span>• Duration: {lastWatched.duration}</span>
              {lastWatched.progressSeconds > 0 && (
                <span>• Resume at {Math.floor(lastWatched.progressSeconds / 60)}:{String(lastWatched.progressSeconds % 60).padStart(2, '0')}</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="add-task-btn"
            style={{ backgroundColor: '#FFFFFF', color: 'var(--forest-950)', border: 'none', padding: '8px 18px', fontWeight: 700 }}
            onClick={() => {
              const fullVid = allVideos.find((v) => v.id === lastWatched.videoId) || lastWatched;
              handlePlayVideo(fullVid, lastWatched.progressSeconds || 0);
            }}
          >
            <IconPlay size={14} />
            <span>Resume Lecture</span>
          </button>
        </div>
      )}

      {/* 2. Top Navigation Tabs */}
      <nav className="video-hub-tabs-nav" aria-label="Video Learning Navigation">
        <button
          type="button"
          className={`video-hub-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <IconVideo size={16} />
          <span>Subject Library</span>
          <span className="video-hub-tab-badge">{totalVideos}</span>
        </button>

        <button
          type="button"
          className={`video-hub-tab-btn ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          <IconTag size={16} />
          <span>Course Playlists</span>
          <span className="video-hub-tab-badge">{videoPlaylists.length}</span>
        </button>

        <button
          type="button"
          className={`video-hub-tab-btn ${activeTab === 'watch-later' ? 'active' : ''}`}
          onClick={() => setActiveTab('watch-later')}
        >
          <IconBookmark size={16} />
          <span>Watch Later</span>
          <span className="video-hub-tab-badge">{watchLaterCount}</span>
        </button>

        <button
          type="button"
          className={`video-hub-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <IconClock size={16} />
          <span>Learning History</span>
          <span className="video-hub-tab-badge">{recentlyWatchedVideos.length}</span>
        </button>

        <button
          type="button"
          className={`video-hub-tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          <IconBookmark size={16} filled />
          <span>Timestamp Bookmarks</span>
          <span className="video-hub-tab-badge">{videoBookmarks.length}</span>
        </button>

        <button
          type="button"
          className={`video-hub-tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <IconSparkles size={16} />
          <span>Recommendations & AI</span>
        </button>
      </nav>

      {/* 3. ACTIVE VIDEO THEATER PLAYER */}
      {activeVideo && (
        <div className="video-theater-card">
          <div className="theater-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="subject-code-badge">
                {activeVideo.subjectTitle} · {activeVideo.unitTitle || `Unit ${activeVideo.unitNumber || 1}`}
              </span>
              <span className="theater-badge-channel">
                Channel: <strong>{activeVideo.channel}</strong>
              </span>
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                Duration: {activeVideo.duration}
              </span>
              {activeVideo.views && (
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  • {activeVideo.views} views
                </span>
              )}
            </div>

            <button
              type="button"
              className="theater-close-btn"
              onClick={() => setActiveVideo(null)}
              title="Close Theater Player"
            >
              <IconX size={18} />
              <span>Close Player</span>
            </button>
          </div>

          <div className="player-layout-container">
            {/* Embedded YouTube Player */}
            <div>
              <div className="video-player-frame-wrap">
                <iframe
                  className="video-iframe"
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0${playerStartSeconds > 0 ? `&start=${playerStartSeconds}` : ''}`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Player Toolbar & Actions */}
              <div className="theater-details-bar">
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 4px' }}>
                    {activeVideo.title}
                  </h2>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Instructor: <strong>{activeVideo.instructor || activeVideo.channel}</strong> · Level: <strong>{activeVideo.level}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Mark Completed Button */}
                  <button
                    type="button"
                    className={`add-task-btn ${completedVideoIds.includes(activeVideo.id) ? 'active' : ''}`}
                    style={{
                      backgroundColor: completedVideoIds.includes(activeVideo.id) ? '#DCFCE7' : 'var(--forest-850)',
                      color: completedVideoIds.includes(activeVideo.id) ? '#166534' : '#FFFFFF',
                      border: completedVideoIds.includes(activeVideo.id) ? '1px solid #86EFAC' : 'none',
                      fontSize: '12.5px'
                    }}
                    onClick={() => handleToggleCompleted(activeVideo)}
                  >
                    {completedVideoIds.includes(activeVideo.id) ? <IconCheckCircle size={15} /> : <IconCircle size={15} />}
                    <span>{completedVideoIds.includes(activeVideo.id) ? 'Watched ✓' : 'Mark as Watched'}</span>
                  </button>

                  {/* Watch Later Button */}
                  <button
                    type="button"
                    className="editor-btn-secondary"
                    style={{
                      color: watchLaterVideoIds.includes(activeVideo.id) ? '#B45309' : 'var(--forest-900)',
                      backgroundColor: watchLaterVideoIds.includes(activeVideo.id) ? '#FEF3C7' : 'var(--bg-card-warm)',
                      borderColor: watchLaterVideoIds.includes(activeVideo.id) ? '#FCD34D' : 'var(--border-subtle)',
                      padding: '6px 12px',
                      fontSize: '12.5px'
                    }}
                    onClick={() => handleToggleWatchLater(activeVideo)}
                  >
                    <IconBookmark size={15} filled={watchLaterVideoIds.includes(activeVideo.id)} />
                    <span>{watchLaterVideoIds.includes(activeVideo.id) ? 'In Watch Later' : 'Watch Later'}</span>
                  </button>

                  {/* Add Timestamp Bookmark */}
                  <button
                    type="button"
                    className="editor-btn-secondary"
                    onClick={() => setIsAddingBookmark((prev) => !prev)}
                    style={{ padding: '6px 12px', fontSize: '12.5px' }}
                  >
                    <IconPlus size={14} />
                    <span>Bookmark Timestamp</span>
                  </button>

                  {/* Official NPTEL Course Link (if available) */}
                  {activeVideo.nptelUrl && (
                    <a
                      href={activeVideo.nptelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editor-btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        textDecoration: 'none',
                        backgroundColor: 'rgba(104, 143, 120, 0.15)',
                        borderColor: 'var(--border-sage)',
                        color: 'var(--forest-900)',
                        fontWeight: 600
                      }}
                      title="View official NPTEL Course 122107035 portal"
                    >
                      <IconExternalLink size={14} />
                      <span>NPTEL 122107035</span>
                    </a>
                  )}

                  {/* External YouTube fallback link */}
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editor-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12.5px', textDecoration: 'none' }}
                    title="Watch externally on YouTube"
                  >
                    <IconExternalLink size={14} />
                    <span>YouTube</span>
                  </a>
                </div>
              </div>

              {/* Bookmark Form Popdown */}
              {isAddingBookmark && (
                <form onSubmit={handleSaveBookmark} style={{ background: 'var(--bg-card-warm)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px 18px', margin: '0 20px 14px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-950)' }}>
                    Save Timestamp:
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="MM:SS (e.g. 05:20)"
                    value={bookmarkTimestampInput}
                    onChange={(e) => setBookmarkTimestampInput(e.target.value)}
                    className="add-task-input"
                    style={{ width: '120px' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Note: e.g. Important derivation of Cayley-Hamilton formula..."
                    value={bookmarkNoteInput}
                    onChange={(e) => setBookmarkNoteInput(e.target.value)}
                    className="add-task-input"
                    style={{ flex: 1, minWidth: '200px' }}
                  />
                  <button type="submit" className="add-task-btn" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                    Save Bookmark
                  </button>
                  <button type="button" className="sem2-action-btn" onClick={() => setIsAddingBookmark(false)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                    Cancel
                  </button>
                </form>
              )}

              {/* Tabs: Related Notes vs Bookmarks vs Overview */}
              <div className="modal-tabs" style={{ padding: '0 20px', margin: '10px 0 0' }}>
                <button
                  type="button"
                  className={`modal-tab-btn ${activeVideoTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveVideoTab('notes')}
                >
                  📝 Notes & Formulas ({activeVideo.relatedNotes?.length || 0})
                </button>
                <button
                  type="button"
                  className={`modal-tab-btn ${activeVideoTab === 'bookmarks' ? 'active' : ''}`}
                  onClick={() => setActiveVideoTab('bookmarks')}
                >
                  📌 Saved Timestamps ({activeVideoBookmarks.length})
                </button>
                <button
                  type="button"
                  className={`modal-tab-btn ${activeVideoTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveVideoTab('overview')}
                >
                  📖 Syllabus Overview & Topics
                </button>
              </div>

              <div style={{ padding: '16px 20px 20px' }}>
                {activeVideoTab === 'notes' && (
                  <div style={{ backgroundColor: 'var(--bg-card-warm)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Core Revision Takeaways & Engineering Notes:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.6 }}>
                      {activeVideo.relatedNotes?.map((note, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeVideoTab === 'bookmarks' && (
                  <div style={{ backgroundColor: 'var(--bg-card-warm)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 10px' }}>
                      Timestamp Bookmarks for this Lecture:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeVideoBookmarks.map((bm) => (
                        <div key={bm.id} className="timestamp-bookmark-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                              type="button"
                              className="timestamp-jump-btn"
                              onClick={() => handlePlayVideo(activeVideo, bm.timestampSeconds)}
                              title={`Jump to ${bm.timestampFormatted}`}
                            >
                              <IconPlay size={10} />
                              <span>{bm.timestampFormatted}</span>
                            </button>
                            <span style={{ fontSize: '13px', color: 'var(--forest-950)', fontWeight: 500 }}>
                              {bm.note}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="task-delete-btn"
                            style={{ opacity: 1 }}
                            onClick={() => handleDeleteBookmark(bm.id)}
                            title="Delete bookmark"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      ))}

                      {activeVideoBookmarks.length === 0 && (
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '12px' }}>
                          No timestamp bookmarks saved yet. Click "Bookmark Timestamp" above to save key moments!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeVideoTab === 'overview' && (
                  <div style={{ backgroundColor: 'var(--bg-card-warm)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.6 }}>
                      {activeVideo.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Curriculum Topics:
                      </span>
                      {activeVideo.topicsCovered?.map((topic, idx) => (
                        <span key={idx} className="subject-distribution-chip" style={{ fontSize: '11.5px' }}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Next Up & Related Lectures */}
            <div style={{ borderLeft: '1px solid var(--border-subtle)', padding: '16px', background: 'var(--bg-card-warm)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Next in Course Sequence
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {relatedVideos.map((rel) => (
                  <div
                    key={rel.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '10px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                    onClick={() => handlePlayVideo(rel)}
                  >
                    <div style={{ fontSize: '11px', color: 'var(--sage-600)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {rel.subjectCode || 'Course'} · {rel.unitTitle?.slice(0, 15)}...
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)', marginTop: '2px', lineHeight: 1.3 }}>
                      {rel.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>{rel.channel}</span>
                      <span>{rel.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: SUBJECT-WISE VIDEO LIBRARY                         */}
      {/* ========================================================= */}
      {activeTab === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Strip: Search + Filters + Add Custom Video Button */}
          <div className="analytics-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '14px' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <IconSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sage-500)' }} />
                <input
                  type="text"
                  className="add-task-input"
                  placeholder="Search by topic, unit, theorem, teacher, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '36px', width: '100%' }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Difficulty Filter */}
              <select
                className="task-filter-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Sorting Filter */}
              <select
                className="task-filter-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="curated">Curated Sequence</option>
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Added</option>
                <option value="short">Shortest First</option>
                <option value="long">Longest First</option>
              </select>

              {/* Add Custom Video Button */}
              <button
                type="button"
                className="add-task-btn"
                onClick={() => setIsAddingCustomVideo((prev) => !prev)}
              >
                <IconPlus size={15} />
                <span>{isAddingCustomVideo ? 'Close Form' : 'Add Custom Lecture'}</span>
              </button>
            </div>

            {/* Subject Category Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-950)', marginRight: '4px' }}>
                Course:
              </span>
              {VIDEO_SUBJECT_CATEGORIES.map((cat) => {
                const isSelected = selectedSubjectFilter === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`editor-btn-secondary ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedSubjectFilter(cat.id)}
                    style={{
                      backgroundColor: isSelected ? 'var(--forest-850)' : 'var(--bg-card-warm)',
                      borderColor: isSelected ? 'var(--forest-850)' : 'var(--border-subtle)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{cat.label}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--border-subtle)',
                        color: isSelected ? '#FFFFFF' : 'var(--forest-850)',
                        fontWeight: 700
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Video In-Page Form */}
          {isAddingCustomVideo && (
            <form onSubmit={handleSaveCustomVideo} className="video-form-card">
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)' }}>
                Add Verified Educational Lecture from YouTube
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                Paste a verified YouTube lecture URL (NPTEL, university lectures, or technical tutorials) to add it to your curriculum.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    YouTube Video URL or Video ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or 11-char ID"
                    className="add-task-input"
                    value={customVideoForm.youtubeUrl}
                    onChange={(e) => setCustomVideoForm({ ...customVideoForm, youtubeUrl: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Lecture Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eigenvalues & Vector Spaces Derivation..."
                    className="add-task-input"
                    value={customVideoForm.title}
                    onChange={(e) => setCustomVideoForm({ ...customVideoForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Course Subject *
                  </label>
                  <select
                    className="add-task-input"
                    value={customVideoForm.subjectId}
                    onChange={(e) => setCustomVideoForm({ ...customVideoForm, subjectId: e.target.value })}
                  >
                    {VIDEO_SUBJECT_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Syllabus Unit Number
                  </label>
                  <select
                    className="add-task-input"
                    value={customVideoForm.unitNumber}
                    onChange={(e) => setCustomVideoForm({ ...customVideoForm, unitNumber: e.target.value })}
                  >
                    <option value={1}>Unit 1</option>
                    <option value={2}>Unit 2</option>
                    <option value={3}>Unit 3</option>
                    <option value={4}>Unit 4</option>
                    <option value={5}>Unit 5</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Specific Curriculum Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cayley-Hamilton Theorem"
                    className="add-task-input"
                    value={customVideoForm.topicName}
                    onChange={(e) => setCustomVideoForm({ ...customVideoForm, topicName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Channel or University Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NPTEL / MIT OpenCourseWare"
                    className="add-task-input"
                    value={customVideoForm.channel}
                    onChange={(e) => setCustomVideoForm({ ...customVideoForm, channel: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Strang"
                    className="add-task-input"
                    value={customVideoForm.instructor}
                    onChange={(e) => setCustomVideoForm({ ...customVideoForm, instructor: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Difficulty Level
                  </label>
                  <select
                    className="add-task-input"
                    value={customVideoForm.level}
                    onChange={(e) => setCustomVideoForm({ ...customVideoForm, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="sem2-action-btn"
                  onClick={() => setIsAddingCustomVideo(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="add-task-btn">
                  <span>Add to Hub</span>
                </button>
              </div>
            </form>
          )}

          {/* Engineering Physics NPTEL 122107035 Curriculum Banner */}
          {selectedSubjectFilter === 'phy101' && (
            <div
              style={{
                marginBottom: '16px',
                padding: '16px 20px',
                backgroundColor: 'rgba(104, 143, 120, 0.08)',
                border: '1px solid var(--border-sage)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      backgroundColor: 'var(--forest-850)',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    NPTEL 122107035
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
                    Official National Engineering Curriculum: Engineering Physics (IIT Roorkee)
                  </span>
                </div>
                <a
                  href="https://nptel.ac.in/courses/122107035"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="editor-btn-secondary"
                  style={{
                    padding: '5px 12px',
                    fontSize: '12px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    backgroundColor: 'var(--forest-850)',
                    color: '#FFFFFF',
                    borderColor: 'var(--forest-850)'
                  }}
                >
                  <IconExternalLink size={13} />
                  <span>Open Official NPTEL Portal</span>
                </a>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Structured syllabus directly aligned with NPTEL Course 122107035 covering oscillations, wave optics, thin film interference, Newton's rings experiment ($D_n^2 = 4n\lambda R$), Fraunhofer diffraction, 1D Schrödinger quantum box, stimulated laser emission, semiconductor carrier statistics, and Maxwell's electromagnetic equations.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  'Oscillations and Waves',
                  'Wave Optics',
                  'Interference',
                  "Newton's Rings",
                  'Diffraction',
                  'Quantum Mechanics',
                  'Lasers',
                  'Semiconductors',
                  'Electromagnetic Theory'
                ].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(104, 143, 120, 0.14)',
                      color: 'var(--forest-900)',
                      fontWeight: 600
                    }}
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Engineering Mathematics Curriculum Banner */}
          {selectedSubjectFilter === 'math101' && (
            <div
              style={{
                marginBottom: '16px',
                padding: '16px 20px',
                backgroundColor: 'rgba(104, 143, 120, 0.08)',
                border: '1px solid var(--border-sage)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      backgroundColor: 'var(--forest-850)',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    MATH 101
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
                    Engineering Mathematics: Core Foundation Track
                  </span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Comprehensive curriculum covering vector spaces, matrix determinants and eigenvalues, differential theorems, Beta & Gamma integrals, partial differentiation with Lagrange multipliers, double/triple integration, and first & second order differential equations.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  'Linear Algebra',
                  'Matrices and Determinants',
                  'Differential Calculus',
                  'Integral Calculus',
                  'Partial Differentiation',
                  'Multiple Integrals',
                  'Differential Equations'
                ].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(104, 143, 120, 0.14)',
                      color: 'var(--forest-900)',
                      fontWeight: 600
                    }}
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unit-Wise Hierarchical Grouping */}
          {groupedVideosByUnit.map((group) => (
            <div key={`${group.subjectId}_${group.unitNumber}`} style={{ marginBottom: '8px' }}>
              <div className="unit-section-heading">
                <div className="unit-title-text">
                  <span className="task-subject-tag">{group.subjectCode || 'Course'}</span>
                  <span>{group.unitTitle}</span>
                </div>
                <span className="unit-lectures-count">
                  {group.videos.length} lecture{group.videos.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Videos Grid for this Unit */}
              <div className="video-cards-grid">
                {group.videos.map((vid) => {
                  const isCompleted = completedVideoIds.includes(vid.id);
                  const isWatchLater = watchLaterVideoIds.includes(vid.id);
                  const isPlaying = activeVideo?.id === vid.id;

                  return (
                    <div
                      key={vid.id}
                      className={`video-lecture-card ${isPlaying ? 'playing' : ''} ${isCompleted ? 'completed' : ''}`}
                    >
                      {/* Thumbnail Header with Play Overlay */}
                      <div
                        className="video-thumb-wrap"
                        onClick={() => handlePlayVideo(vid)}
                        title={`Play: ${vid.title}`}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                          alt={vid.title}
                          className="video-thumb-img"
                          loading="lazy"
                        />
                        <div className="video-thumb-overlay">
                          <div className="video-play-circle">
                            <IconPlay size={18} />
                          </div>
                        </div>

                        <span className="video-duration-badge">
                          <IconClock size={11} />
                          <span>{vid.duration}</span>
                        </span>

                        {isCompleted && (
                          <span className="video-completed-badge">
                            <IconCheckCircle size={12} />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>

                      {/* Card Content Body */}
                      <div className="video-card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span className="subject-code-badge" style={{ fontSize: '10.5px' }}>
                            {vid.topicName || vid.subjectTitle}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '1px 7px',
                              borderRadius: '10px',
                              backgroundColor:
                                vid.level === 'Beginner'
                                  ? '#DCFCE7'
                                  : vid.level === 'Intermediate'
                                  ? '#FEF3C7'
                                  : '#EDE9FE',
                              color:
                                vid.level === 'Beginner'
                                  ? '#166534'
                                  : vid.level === 'Intermediate'
                                  ? '#B45309'
                                  : '#6D28D9'
                            }}
                          >
                            {vid.level}
                          </span>
                        </div>

                        <h3
                          className="video-card-title"
                          onClick={() => handlePlayVideo(vid)}
                        >
                          {vid.title}
                        </h3>

                        <div className="video-card-channel">
                          <span>Channel: <strong>{vid.channel}</strong></span>
                          {vid.instructor && <span> · {vid.instructor}</span>}
                        </div>

                        <p className="video-card-desc">
                          {vid.description}
                        </p>

                        {/* Card Actions Footer */}
                        <div className="video-card-footer">
                          <button
                            type="button"
                            className="add-task-btn"
                            style={{ padding: '5px 12px', fontSize: '12px' }}
                            onClick={() => handlePlayVideo(vid)}
                          >
                            <IconPlay size={13} />
                            <span>{isPlaying ? 'Now Playing' : 'Watch Lecture'}</span>
                          </button>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            {/* Watch Later Bookmark Button */}
                            <button
                              type="button"
                              className={`video-icon-action-btn ${isWatchLater ? 'active' : ''}`}
                              onClick={() => handleToggleWatchLater(vid)}
                              title={isWatchLater ? 'Remove from Watch Later' : 'Save to Watch Later'}
                            >
                              <IconBookmark size={15} filled={isWatchLater} />
                            </button>

                            {/* Checkmark Completed Toggle */}
                            <button
                              type="button"
                              className={`video-icon-action-btn ${isCompleted ? 'completed' : ''}`}
                              onClick={() => handleToggleCompleted(vid)}
                              title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                            >
                              {isCompleted ? <IconCheckCircle size={15} /> : <IconCircle size={15} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {groupedVideosByUnit.length === 0 && (
            <div className="analytics-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <IconVideo size={36} style={{ color: 'var(--sage-400)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 6px' }}>
                No lectures found for this filter
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 16px' }}>
                Try adjusting your search query, or add a custom verified YouTube lecture URL.
              </p>
              <button
                type="button"
                className="sem2-action-btn"
                onClick={() => {
                  setSelectedSubjectFilter('all');
                  setSelectedDifficulty('all');
                  setSearchQuery('');
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: COURSE & CUSTOM PLAYLISTS                          */}
      {/* ========================================================= */}
      {activeTab === 'playlists' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 4px' }}>
                Engineering Course Playlists
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                Curated syllabus tracks and student custom revision sets.
              </p>
            </div>

            <button
              type="button"
              className="add-task-btn"
              onClick={() => setIsCreatingPlaylist((prev) => !prev)}
            >
              <IconPlus size={15} />
              <span>{isCreatingPlaylist ? 'Close Form' : 'Create Custom Playlist'}</span>
            </button>
          </div>

          {/* Create Custom Playlist Form */}
          {isCreatingPlaylist && (
            <form onSubmit={handleSaveCustomPlaylist} className="video-form-card">
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)' }}>
                Create Custom Study Playlist
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Playlist Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid-Semester Exam Crash Sprint..."
                    className="add-task-input"
                    value={playlistForm.title}
                    onChange={(e) => setPlaylistForm({ ...playlistForm, title: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Playlist Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. High-yield video revision set covering Linear Algebra and Physics Unit 1..."
                    className="add-task-input"
                    value={playlistForm.description}
                    onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Target Course Subject
                  </label>
                  <select
                    className="add-task-input"
                    value={playlistForm.subjectId}
                    onChange={(e) => setPlaylistForm({ ...playlistForm, subjectId: e.target.value })}
                  >
                    {VIDEO_SUBJECT_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Video Selection Checkboxes */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-950)', display: 'block', marginBottom: '8px' }}>
                  Select Videos to Include ({playlistForm.selectedVideoIds.length} selected):
                </label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {allVideos.map((vid) => {
                    const isChecked = playlistForm.selectedVideoIds.includes(vid.id);
                    return (
                      <label key={vid.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPlaylistForm({ ...playlistForm, selectedVideoIds: [...playlistForm.selectedVideoIds, vid.id] });
                            } else {
                              setPlaylistForm({ ...playlistForm, selectedVideoIds: playlistForm.selectedVideoIds.filter((id) => id !== vid.id) });
                            }
                          }}
                        />
                        <span style={{ fontWeight: 600 }}>{vid.subjectCode || 'Course'}:</span>
                        <span>{vid.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="sem2-action-btn"
                  onClick={() => setIsCreatingPlaylist(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="add-task-btn">
                  <span>Create Playlist</span>
                </button>
              </div>
            </form>
          )}

          {/* Playlists Grid */}
          <div className="playlists-grid">
            {videoPlaylists.map((pl) => {
              const playlistVideos = allVideos.filter((v) => pl.videoIds.includes(v.id));

              return (
                <div key={pl.id} className="playlist-card">
                  <div>
                    <div className="playlist-card-header">
                      <span className="task-subject-tag">{pl.subjectCode || 'Course Track'}</span>
                      {pl.isCustom && (
                        <span style={{ fontSize: '11px', fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px' }}>
                          Custom
                        </span>
                      )}
                    </div>

                    <h3 className="playlist-title" style={{ marginTop: '8px' }}>{pl.title}</h3>
                    <p className="playlist-desc">{pl.description}</p>
                    <div className="playlist-meta" style={{ marginTop: '10px' }}>
                      <IconVideo size={13} />
                      <span>{pl.videoIds.length} video lectures</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      type="button"
                      className="add-task-btn"
                      style={{ padding: '6px 14px', fontSize: '12.5px' }}
                      onClick={() => {
                        if (playlistVideos.length > 0) {
                          handlePlayVideo(playlistVideos[0]);
                        } else {
                          onShowToast?.('Playlist is currently empty.');
                        }
                      }}
                    >
                      <IconPlay size={13} />
                      <span>Play Sequence</span>
                    </button>

                    {pl.isCustom && (
                      <button
                        type="button"
                        className="task-delete-btn"
                        style={{ opacity: 1 }}
                        onClick={() => handleDeletePlaylist(pl.id)}
                        title="Delete custom playlist"
                      >
                        <IconTrash size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: WATCH LATER                                        */}
      {/* ========================================================= */}
      {activeTab === 'watch-later' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 4px' }}>
              Your Watch Later Queue ({watchLaterCount})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              Saved video lectures for evening study and weekend deep-dives.
            </p>
          </div>

          <div className="video-cards-grid">
            {allVideos
              .filter((v) => watchLaterVideoIds.includes(v.id))
              .map((vid) => (
                <div key={vid.id} className="video-lecture-card">
                  <div className="video-thumb-wrap" onClick={() => handlePlayVideo(vid)}>
                    <img
                      src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                      alt={vid.title}
                      className="video-thumb-img"
                    />
                    <div className="video-thumb-overlay">
                      <div className="video-play-circle">
                        <IconPlay size={18} />
                      </div>
                    </div>
                    <span className="video-duration-badge">{vid.duration}</span>
                  </div>

                  <div className="video-card-body">
                    <span className="subject-code-badge" style={{ fontSize: '10.5px' }}>
                      {vid.subjectTitle}
                    </span>
                    <h3 className="video-card-title" onClick={() => handlePlayVideo(vid)}>
                      {vid.title}
                    </h3>
                    <div className="video-card-channel">
                      {vid.channel} · {vid.level}
                    </div>

                    <div className="video-card-footer" style={{ marginTop: '12px' }}>
                      <button
                        type="button"
                        className="add-task-btn"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                        onClick={() => handlePlayVideo(vid)}
                      >
                        <IconPlay size={13} />
                        <span>Watch Now</span>
                      </button>

                      <button
                        type="button"
                        className="editor-btn-secondary"
                        onClick={() => handleToggleWatchLater(vid)}
                        title="Remove from Watch Later"
                      >
                        <IconTrash size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {watchLaterCount === 0 && (
            <div className="analytics-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <IconBookmark size={36} style={{ color: 'var(--sage-400)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 6px' }}>
                Your Watch Later List is Empty
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 16px' }}>
                Bookmark lectures from the Subject Library by clicking the bookmark ribbon icon on any card.
              </p>
              <button
                type="button"
                className="add-task-btn"
                onClick={() => setActiveTab('library')}
              >
                Browse Subject Library
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: LEARNING HISTORY & RESUME                          */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 4px' }}>
              Recently Watched Lectures ({recentlyWatchedVideos.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              Pick up right where you left off. Stored locally in your StudyNest workspace.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentlyWatchedVideos.map((entry, idx) => (
              <div
                key={idx}
                className="analytics-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--sage-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest-900)' }}>
                    <IconVideo size={20} />
                  </div>

                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--forest-950)' }}>
                      {entry.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {entry.subjectCode || entry.subjectTitle} · Channel: {entry.channel} · Duration: {entry.duration}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    className="add-task-btn"
                    style={{ padding: '7px 16px', fontSize: '12.5px' }}
                    onClick={() => {
                      const full = allVideos.find((v) => v.id === entry.videoId) || entry;
                      handlePlayVideo(full, entry.progressSeconds || 0);
                    }}
                  >
                    <IconPlay size={13} />
                    <span>Watch Again</span>
                  </button>
                </div>
              </div>
            ))}

            {recentlyWatchedVideos.length === 0 && (
              <div className="analytics-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                <IconClock size={36} style={{ color: 'var(--sage-400)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 6px' }}>
                  No Watch History Yet
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 16px' }}>
                  Start watching any video lecture from the library to build your learning log.
                </p>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => setActiveTab('library')}
                >
                  Explore Lectures
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: TIMESTAMP BOOKMARKS                                */}
      {/* ========================================================= */}
      {activeTab === 'bookmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 4px' }}>
              All Saved Timestamp Bookmarks ({videoBookmarks.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              Jump directly to specific derivations, circuit explanations, and algorithmic proofs.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {videoBookmarks.map((bm) => {
              const parentVid = allVideos.find((v) => v.id === bm.videoId);

              return (
                <div key={bm.id} className="timestamp-bookmark-item" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    <button
                      type="button"
                      className="timestamp-jump-btn"
                      onClick={() => {
                        if (parentVid) {
                          handlePlayVideo(parentVid, bm.timestampSeconds);
                        } else {
                          onShowToast?.('Parent video could not be found.');
                        }
                      }}
                      title={`Jump to ${bm.timestampFormatted}`}
                      style={{ marginTop: '2px' }}
                    >
                      <IconPlay size={11} />
                      <span>{bm.timestampFormatted}</span>
                    </button>

                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
                        {bm.note}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Lecture: <strong>{bm.videoTitle}</strong> ({bm.subjectTitle})
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="task-delete-btn"
                    style={{ opacity: 1 }}
                    onClick={() => handleDeleteBookmark(bm.id)}
                    title="Delete timestamp bookmark"
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              );
            })}

            {videoBookmarks.length === 0 && (
              <div className="analytics-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                <IconBookmark size={36} style={{ color: 'var(--sage-400)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 6px' }}>
                  No Timestamp Bookmarks Saved
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 16px' }}>
                  When playing a video, click "Bookmark Timestamp" to save exact formula derivations and study notes!
                </p>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => setActiveTab('library')}
                >
                  Watch a Lecture
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: RECOMMENDATIONS & AI LEARNING PATH                 */}
      {/* ========================================================= */}
      {activeTab === 'recommendations' && (
        <div className="recommendations-split">
          {/* Section A: Curated Syllabus Recommendations */}
          <div className="recommendations-card-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--sage-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest-900)' }}>
                <IconVideo size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                  Curated Syllabus Sequence
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Deterministic university course progression
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              The next recommended foundational lecture for each of your 7 Semester 1 courses:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {VIDEO_SUBJECT_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const subVideos = allVideos.filter((v) => v.subjectId === cat.id);
                const nextUnwatched = subVideos.find((v) => !completedVideoIds.includes(v.id)) || subVideos[0];
                if (!nextUnwatched) return null;

                return (
                  <div
                    key={cat.id}
                    style={{
                      background: 'var(--bg-card-warm)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <span className="task-subject-tag">{cat.code}</span>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-950)', marginTop: '4px' }}>
                        {nextUnwatched.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {nextUnwatched.channel} · {nextUnwatched.duration}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="add-task-btn"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handlePlayVideo(nextUnwatched)}
                    >
                      <IconPlay size={12} />
                      <span>Watch</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: AI Video Learning Advisor */}
          <div className="recommendations-card-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--forest-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <IconBot size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                    AI Video Study Advisor
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Generative sequencing tailored to your learning pace
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="add-task-btn"
                style={{ padding: '6px 14px', fontSize: '12px' }}
                onClick={handleAskAIVideoAdvisor}
                disabled={aiRecLoading}
              >
                {aiRecLoading ? (
                  <>
                    <IconRefreshCw size={13} className="spinning" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <IconSparkles size={13} />
                    <span>{aiRecAdvice ? 'Regenerate' : 'Generate AI Path'}</span>
                  </>
                )}
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              The AI Advisor reviews your watched videos and recommends an optimal interleaving sequence to prevent cognitive overload.
            </p>

            {aiRecAdvice ? (
              <div
                style={{
                  background: 'var(--bg-card-warm)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  maxHeight: '480px',
                  overflowY: 'auto',
                  fontSize: '13.5px',
                  lineHeight: 1.6
                }}
              >
                <MarkdownRenderer content={aiRecAdvice} />
              </div>
            ) : (
              <div
                className="analytics-card"
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'var(--bg-card-warm)',
                  border: '1px dashed var(--border-card)'
                }}
              >
                <IconBot size={36} style={{ color: 'var(--sage-400)', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 6px' }}>
                  Need a targeted video revision sprint?
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 16px', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Click "Generate AI Path" above to receive custom 3-step lecture recommendations based on your actual progress.
                </p>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={handleAskAIVideoAdvisor}
                  disabled={aiRecLoading}
                >
                  <IconSparkles size={14} />
                  <span>Generate AI Path</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
