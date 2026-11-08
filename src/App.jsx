import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import SubjectModal from './components/SubjectModal';
import StudentProfileModal from './components/StudentProfileModal';
import AcademicOnboardingModal from './components/AcademicOnboardingModal';
import EngineeringPlayground from './components/EngineeringPlayground';
import Toast from './components/Toast';

// Primary Section Views
import DashboardView from './views/DashboardView';
import SubjectsView from './views/SubjectsView';
import PythonAcademyView from './views/PythonAcademyView';
import VideoLearningView from './views/VideoLearningView';
import ExamPrepView from './views/ExamPrepView';
import StudyPlannerView from './views/StudyPlannerView';
import AIAssistantView from './views/AIAssistantView';

// Storage Service
import {
  getProfile,
  saveProfile,
  getCompletedTopics,
  saveCompletedTopics,
  getPythonCompletedLessons,
  savePythonCompletedLessons,
  getTasks,
  saveTasks,
  getNotes,
  saveNotes,
  getQuizHistory,
  getStudySessions,
  logStudySession,
  getAssignments,
  saveAssignments,
  getCompletedVideos,
  saveCompletedVideos,
  getWatchLaterVideos,
  saveWatchLaterVideos,
  getAIConversations,
  saveAIConversations,
  getPlannedSessions,
  savePlannedSessions,
  getUpcomingExams,
  saveUpcomingExams,
  getRecentlyWatchedVideos,
  logRecentlyWatchedVideo,
  getCustomVideos,
  saveCustomVideos,
  getVideoPlaylists,
  saveVideoPlaylists,
  getVideoBookmarks,
  saveVideoBookmarks,
  getCustomSubjects,
  saveCustomSubjects,
  getSubjectOverrides,
  updateSubjectOverride
} from './services/storage';

import { SEMESTER_1_SUBJECTS } from './data/subjectsData';
import './App.css';

const VALID_VIEWS = ['dashboard', 'ai-assistant', 'subjects', 'python', 'videos', 'exam-prep', 'planner'];

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // ==========================================
  // PERSISTENT DATA STATES
  // ==========================================
  const [profile, setProfileState] = useState(() => getProfile());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    const p = getProfile();
    return !p.onboardingCompleted;
  });
  const [completedTopics, setCompletedTopicsState] = useState(() => getCompletedTopics());
  const [completedModuleIds, setCompletedModuleIdsState] = useState(() => getPythonCompletedLessons());
  const [tasks, setTasksState] = useState(() => getTasks());
  const [notes, setNotesState] = useState(() => getNotes());
  const [quizHistory] = useState(() => getQuizHistory());
  const [studySessions, setStudySessionsState] = useState(() => getStudySessions());
  const [completedVideoIds, setCompletedVideoIdsState] = useState(() => getCompletedVideos());
  const [watchLaterVideoIds, setWatchLaterVideoIdsState] = useState(() => getWatchLaterVideos());
  const [aiConversations, setAiConversationsState] = useState(() => getAIConversations());
  const [plannedSessions, setPlannedSessionsState] = useState(() => getPlannedSessions());
  const [upcomingExams, setUpcomingExamsState] = useState(() => getUpcomingExams());
  const [recentlyWatchedVideos, setRecentlyWatchedVideosState] = useState(() => getRecentlyWatchedVideos());
  const [customVideos, setCustomVideosState] = useState(() => getCustomVideos());
  const [videoPlaylists, setVideoPlaylistsState] = useState(() => getVideoPlaylists());
  const [videoBookmarks, setVideoBookmarksState] = useState(() => getVideoBookmarks());
  const [customSubjects, setCustomSubjectsState] = useState(() => getCustomSubjects());
  const [subjectOverrides, setSubjectOverridesState] = useState(() => getSubjectOverrides());

  // Keep storage states in sync with external events
  useEffect(() => {
    const handlePlannedSessionsUpdate = () => setPlannedSessionsState(getPlannedSessions());
    const handleExamsUpdate = () => setUpcomingExamsState(getUpcomingExams());
    const handleRecentVideosUpdate = () => setRecentlyWatchedVideosState(getRecentlyWatchedVideos());
    const handleCustomVideosUpdate = () => setCustomVideosState(getCustomVideos());
    const handlePlaylistsUpdate = () => setVideoPlaylistsState(getVideoPlaylists());
    const handleBookmarksUpdate = () => setVideoBookmarksState(getVideoBookmarks());
    const handleCustomSubjectsUpdate = () => setCustomSubjectsState(getCustomSubjects());
    const handleSubjectOverridesUpdate = () => setSubjectOverridesState(getSubjectOverrides());

    window.addEventListener('studynest-planned-sessions-updated', handlePlannedSessionsUpdate);
    window.addEventListener('studynest-exams-updated', handleExamsUpdate);
    window.addEventListener('studynest-recent-videos-updated', handleRecentVideosUpdate);
    window.addEventListener('studynest-custom-videos-updated', handleCustomVideosUpdate);
    window.addEventListener('studynest-playlists-updated', handlePlaylistsUpdate);
    window.addEventListener('studynest-video-bookmarks-updated', handleBookmarksUpdate);
    window.addEventListener('studynest-custom-subjects-updated', handleCustomSubjectsUpdate);
    window.addEventListener('studynest-subject-overrides-updated', handleSubjectOverridesUpdate);

    return () => {
      window.removeEventListener('studynest-planned-sessions-updated', handlePlannedSessionsUpdate);
      window.removeEventListener('studynest-exams-updated', handleExamsUpdate);
      window.removeEventListener('studynest-recent-videos-updated', handleRecentVideosUpdate);
      window.removeEventListener('studynest-custom-videos-updated', handleCustomVideosUpdate);
      window.removeEventListener('studynest-playlists-updated', handlePlaylistsUpdate);
      window.removeEventListener('studynest-video-bookmarks-updated', handleBookmarksUpdate);
      window.removeEventListener('studynest-custom-subjects-updated', handleCustomSubjectsUpdate);
      window.removeEventListener('studynest-subject-overrides-updated', handleSubjectOverridesUpdate);
    };
  }, []);

  // Initialize assignments from subjects if empty
  const [assignments, setAssignmentsState] = useState(() => {
    const stored = getAssignments();
    if (stored && stored.length > 0) return stored;
    // Default initial seed
    const initialList = [];
    SEMESTER_1_SUBJECTS.forEach((s) => {
      if (s.initialAssignments) {
        s.initialAssignments.forEach((a) => {
          initialList.push({ ...a, subjectId: s.id, subjectCode: s.code });
        });
      }
    });
    return initialList;
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  // Save changes to localStorage
  const handleUpdateProfile = (newProfile) => {
    setProfileState(newProfile);
    saveProfile(newProfile);
  };

  const handleUpdateSemester = (newSemLabel) => {
    const semNum = Number.parseInt(String(newSemLabel).replace(/\D/g, ''), 10) || 1;
    let autoYear = 'First Year';
    if (semNum >= 3 && semNum <= 4) autoYear = 'Second Year';
    else if (semNum >= 5 && semNum <= 6) autoYear = 'Third Year';
    else if (semNum >= 7 && semNum <= 8) autoYear = 'Final Year';

    const updatedProfile = {
      ...profile,
      semester: newSemLabel,
      year: autoYear
    };
    setProfileState(updatedProfile);
    saveProfile(updatedProfile);
    showToast(`Active term switched to ${newSemLabel} (${autoYear})`);
  };

  const handleCompleteOnboarding = ({ profile: newProfile, curriculumChoice }) => {
    setProfileState(newProfile);
    saveProfile(newProfile);
    setIsOnboardingOpen(false);

    if (curriculumChoice === 'upload_pdf') {
      setActiveView('subjects');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleTopic = (topicId) => {
    if (!selectedSubject) return;
    const subId = selectedSubject.id;
    const currentList = completedTopics[subId] || [];
    const isDone = currentList.includes(topicId);
    const updatedList = isDone
      ? currentList.filter((id) => id !== topicId)
      : [...currentList, topicId];

    const updatedMap = {
      ...completedTopics,
      [subId]: updatedList
    };
    setCompletedTopicsState(updatedMap);
    saveCompletedTopics(updatedMap);
    showToast(isDone ? 'Topic marked pending' : 'Topic marked completed!');
  };

  const handleTogglePythonModule = (moduleId, title) => {
    const isDone = completedModuleIds.includes(moduleId);
    const updated = isDone
      ? completedModuleIds.filter((id) => id !== moduleId)
      : [...completedModuleIds, moduleId];

    setCompletedModuleIdsState(updated);
    savePythonCompletedLessons(updated);
    showToast(isDone ? `Module marked pending: ${title}` : `🎉 Module mastered: ${title}!`);
  };

  const handleSaveTasks = (newTasks) => {
    setTasksState(newTasks);
    saveTasks(newTasks);
  };

  const handleSaveNotes = (newNotes) => {
    setNotesState(newNotes);
    saveNotes(newNotes);
  };

  const handleAddNoteFromSubject = (note) => {
    const updated = [note, ...notes];
    setNotesState(updated);
    saveNotes(updated);
    showToast('Note added to course notes!');
  };

  const handleLogStudySession = (session) => {
    const updated = logStudySession(session);
    setStudySessionsState(updated);
  };

  const handleSaveAssignments = (newAsgs) => {
    setAssignmentsState(newAsgs);
    saveAssignments(newAsgs);
  };

  const handleToggleCompleteVideo = (videoId, title) => {
    const isDone = completedVideoIds.includes(videoId);
    const updated = isDone
      ? completedVideoIds.filter((id) => id !== videoId)
      : [...completedVideoIds, videoId];

    setCompletedVideoIdsState(updated);
    saveCompletedVideos(updated);
    showToast(isDone ? `Marked uncompleted: ${title}` : `🎉 Watched lecture: ${title}!`);
  };

  const handleToggleWatchLater = (videoId, title) => {
    const isSaved = watchLaterVideoIds.includes(videoId);
    const updated = isSaved
      ? watchLaterVideoIds.filter((id) => id !== videoId)
      : [...watchLaterVideoIds, videoId];

    setWatchLaterVideoIdsState(updated);
    saveWatchLaterVideos(updated);
    showToast(isSaved ? `Removed from Watch Later: ${title}` : `🔖 Added to Watch Later: ${title}`);
  };

  const handleLogRecentlyWatchedVideo = (entry) => {
    const updated = logRecentlyWatchedVideo(entry);
    setRecentlyWatchedVideosState(updated);
  };

  const handleSaveCustomVideos = (videos) => {
    setCustomVideosState(videos);
    saveCustomVideos(videos);
  };

  const handleSaveVideoPlaylists = (playlists) => {
    setVideoPlaylistsState(playlists);
    saveVideoPlaylists(playlists);
  };

  const handleSaveVideoBookmarks = (bookmarks) => {
    setVideoBookmarksState(bookmarks);
    saveVideoBookmarks(bookmarks);
  };

  const handleSaveAIConversations = (newConvs) => {
    setAiConversationsState(newConvs);
    saveAIConversations(newConvs);
  };

  const handleSavePlannedSessions = (newSessions) => {
    setPlannedSessionsState(newSessions);
    savePlannedSessions(newSessions);
  };

  const handleSaveUpcomingExams = (newExams) => {
    setUpcomingExamsState(newExams);
    saveUpcomingExams(newExams);
  };

  const handleAddCustomSubject = (newSub) => {
    const updated = [newSub, ...customSubjects];
    setCustomSubjectsState(updated);
    saveCustomSubjects(updated);
  };

  const handleImportCurriculum = ({ metadata = {}, subjects: newSubs = [] }) => {
    // Prevent duplicate subjects by checking code and semester
    const existingKeys = new Set(
      customSubjects.map((s) => `${s.semester}_${(s.code || '').toUpperCase().trim()}`)
    );
    const nonDuplicates = newSubs.filter(
      (s) => !existingKeys.has(`${s.semester}_${(s.code || '').toUpperCase().trim()}`)
    );
    const updated = [...nonDuplicates, ...customSubjects];
    setCustomSubjectsState(updated);
    saveCustomSubjects(updated);

    if (metadata.university || metadata.degree || metadata.regulation) {
      const updatedProfile = {
        ...profile,
        ...(metadata.university ? { college: metadata.university } : {}),
        ...(metadata.degree ? { degree: metadata.degree } : {}),
        ...(metadata.regulation ? { curriculum: metadata.regulation } : {})
      };
      setProfileState(updatedProfile);
      saveProfile(updatedProfile);
    }
  };

  const handleUpdateSubject = (subjectId, updates) => {
    const isCustom = customSubjects.some((cs) => cs.id === subjectId);
    if (isCustom) {
      const updated = customSubjects.map((cs) => (cs.id === subjectId ? { ...cs, ...updates } : cs));
      setCustomSubjectsState(updated);
      saveCustomSubjects(updated);
    } else {
      const updatedOverrides = updateSubjectOverride(subjectId, updates);
      setSubjectOverridesState(updatedOverrides);
    }
    setSelectedSubject((prev) => (prev && prev.id === subjectId ? { ...prev, ...updates } : prev));
  };

  const handleNavigate = (viewId) => {
    setActiveView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global search result navigation handler
  const handleNavigateToResult = (target) => {
    if (target.type === 'subject') {
      setSelectedSubject(target.data);
    } else if (target.type === 'topic') {
      setSelectedSubject(target.subject);
    } else if (target.type === 'python') {
      handleNavigate('python');
    } else if (target.type === 'video') {
      handleNavigate('videos');
    } else if (target.type === 'exam-prep' || target.type === 'exam') {
      handleNavigate('exam-prep');
    } else if (target.type === 'planner' || target.type === 'assignment') {
      handleNavigate('planner');
    } else if (target.type === 'ai' || target.type === 'ai-assistant') {
      handleNavigate('ai-assistant');
    }
  };

  // Ensure currentView is strictly one of the valid active sections
  const currentView = VALID_VIEWS.includes(activeView) ? activeView : 'dashboard';

  return (
    <div className="app-shell">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeView={currentView}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrap">
        {/* Top Navigation Header with Single Global Search & Profile */}
        <TopNav
          profile={profile}
          onOpenProfile={() => setIsProfileOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          assignments={assignments}
          onNavigateToResult={handleNavigateToResult}
          onShowToast={showToast}
          onUpdateSemester={handleUpdateSemester}
          customSubjects={customSubjects}
          subjectOverrides={subjectOverrides}
        />

        {/* Scrollable Page Container */}
        <main className={`page-scroll-area ${currentView === 'ai-assistant' ? 'page-scroll-area-ai' : ''}`}>
          {currentView === 'dashboard' && (
            <DashboardView
              profile={profile}
              completedTopics={completedTopics}
              completedModuleIds={completedModuleIds}
              tasks={tasks}
              onSaveTasks={handleSaveTasks}
              quizHistory={quizHistory}
              assignments={assignments}
              studySessions={studySessions}
              plannedSessions={plannedSessions}
              upcomingExams={upcomingExams}
              recentlyWatchedVideos={recentlyWatchedVideos}
              watchLaterVideoIds={watchLaterVideoIds}
              completedVideoIds={completedVideoIds}
              onSelectSubject={(sub) => setSelectedSubject(sub)}
              onNavigate={handleNavigate}
              searchTerm={searchTerm}
              onShowToast={showToast}
              onOpenPlayground={() => setIsPlaygroundOpen(true)}
              customSubjects={customSubjects}
              subjectOverrides={subjectOverrides}
            />
          )}

          {currentView === 'ai-assistant' && (
            <AIAssistantView
              profile={profile}
              conversations={aiConversations}
              onSaveConversations={handleSaveAIConversations}
              onNavigate={handleNavigate}
              onShowToast={showToast}
              onSaveNote={(note) => {
                const updatedNotes = [note, ...notes];
                handleSaveNotes(updatedNotes);
              }}
              customSubjects={customSubjects}
              subjectOverrides={subjectOverrides}
            />
          )}

          {currentView === 'subjects' && (
            <SubjectsView
              profile={profile}
              onSelectSubject={(sub) => setSelectedSubject(sub)}
              completedTopics={completedTopics}
              searchTerm={searchTerm}
              onShowToast={showToast}
              customSubjects={customSubjects}
              onAddCustomSubject={handleAddCustomSubject}
              onImportCurriculum={handleImportCurriculum}
              subjectOverrides={subjectOverrides}
              onOpenPlayground={() => setIsPlaygroundOpen(true)}
              onUpdateSemester={handleUpdateSemester}
            />
          )}

          {currentView === 'python' && (
            <PythonAcademyView
              completedModuleIds={completedModuleIds}
              onToggleModuleCompletion={handleTogglePythonModule}
              onShowToast={showToast}
            />
          )}

          {currentView === 'videos' && (
            <VideoLearningView
              completedVideoIds={completedVideoIds}
              onToggleCompleteVideo={handleToggleCompleteVideo}
              watchLaterVideoIds={watchLaterVideoIds}
              onToggleWatchLater={handleToggleWatchLater}
              recentlyWatchedVideos={recentlyWatchedVideos}
              onLogRecentlyWatchedVideo={handleLogRecentlyWatchedVideo}
              customVideos={customVideos}
              onSaveCustomVideos={handleSaveCustomVideos}
              videoPlaylists={videoPlaylists}
              onSaveVideoPlaylists={handleSaveVideoPlaylists}
              videoBookmarks={videoBookmarks}
              onSaveVideoBookmarks={handleSaveVideoBookmarks}
              profile={profile}
              onNavigate={handleNavigate}
              onShowToast={showToast}
              customSubjects={customSubjects}
              subjectOverrides={subjectOverrides}
            />
          )}

          {currentView === 'exam-prep' && (
            <ExamPrepView
              profile={profile}
              completedTopics={completedTopics}
              quizHistory={quizHistory}
              onShowToast={showToast}
              onNavigateToPython={() => handleNavigate('python')}
              onNavigate={handleNavigate}
              customSubjects={customSubjects}
              subjectOverrides={subjectOverrides}
            />
          )}

          {currentView === 'planner' && (
            <StudyPlannerView
              tasks={tasks}
              onSaveTasks={handleSaveTasks}
              assignments={assignments}
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              studySessions={studySessions}
              onLogStudySession={handleLogStudySession}
              plannedSessions={plannedSessions}
              onSavePlannedSessions={handleSavePlannedSessions}
              upcomingExams={upcomingExams}
              onSaveUpcomingExams={handleSaveUpcomingExams}
              completedTopics={completedTopics}
              onNavigate={handleNavigate}
              onShowToast={showToast}
              customSubjects={customSubjects}
              subjectOverrides={subjectOverrides}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          activeView={currentView}
          onNavigate={handleNavigate}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>

      {/* Clickable Subject Detail Modal with Checkboxes, Assignments, Questions & Video Lectures */}
      {selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          completedTopicIds={completedTopics[selectedSubject.id] || []}
          onToggleTopic={handleToggleTopic}
          assignments={assignments.filter((a) => a.subjectId === selectedSubject.id)}
          onSaveAssignments={(newSubAsgs) => {
            const others = assignments.filter((a) => a.subjectId !== selectedSubject.id);
            handleSaveAssignments([...newSubAsgs, ...others]);
          }}
          subjectNotes={notes.filter((n) => n.subjectCode === selectedSubject.code)}
          onAddNote={handleAddNoteFromSubject}
          onOpenExam={() => handleNavigate('exam-prep')}
          onOpenVideos={() => handleNavigate('videos')}
          onOpenPythonAcademy={() => handleNavigate('python')}
          onOpenAIAssistant={() => handleNavigate('ai-assistant')}
          onClose={() => setSelectedSubject(null)}
          onShowToast={showToast}
          onUpdateSubject={handleUpdateSubject}
        />
      )}

      {/* First-Time Academic Onboarding Modal */}
      <AcademicOnboardingModal
        isOpen={isOnboardingOpen}
        initialProfile={profile}
        onComplete={handleCompleteOnboarding}
        onOpenSyllabusUpload={() => {
          setActiveView('subjects');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onShowToast={showToast}
      />

      {/* Editable Student Profile Modal */}
      {isProfileOpen && (
        <StudentProfileModal
          profile={profile}
          onSave={handleUpdateProfile}
          onClose={() => setIsProfileOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Interactive Engineering Playground Modal */}
      <EngineeringPlayground
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
