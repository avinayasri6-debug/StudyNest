import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import SubjectModal from './components/SubjectModal';
import StudentProfileModal from './components/StudentProfileModal';
import Toast from './components/Toast';

// Views
import DashboardView from './views/DashboardView';
import SubjectsView from './views/SubjectsView';
import PythonAcademyView from './views/PythonAcademyView';
import StudyPlannerView from './views/StudyPlannerView';
import NotesView from './views/NotesView';
import QuizzesView from './views/QuizzesView';
import ProgressView from './views/ProgressView';
import VideoLearningView from './views/VideoLearningView';
import ExamPrepView from './views/ExamPrepView';
import AIAssistantView from './views/AIAssistantView';
import AINotesGeneratorView from './views/AINotesGeneratorView';

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
  saveQuizAttempt,
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
  getMockTestResults,
  resetAllStudentData
} from './services/storage';

import { SEMESTER_1_SUBJECTS } from './data/subjectsData';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [quizInitialSubject, setQuizInitialSubject] = useState('math101');

  // ==========================================
  // PERSISTENT DATA STATES
  // ==========================================
  const [profile, setProfileState] = useState(() => getProfile());
  const [completedTopics, setCompletedTopicsState] = useState(() => getCompletedTopics());
  const [completedModuleIds, setCompletedModuleIdsState] = useState(() => getPythonCompletedLessons());
  const [tasks, setTasksState] = useState(() => getTasks());
  const [notes, setNotesState] = useState(() => getNotes());
  const [quizHistory, setQuizHistoryState] = useState(() => getQuizHistory());
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
  const [mockTestResults, setMockTestResultsState] = useState(() => getMockTestResults());

  // Keep storage states in sync with external events
  useEffect(() => {
    const handlePlannedSessionsUpdate = () => setPlannedSessionsState(getPlannedSessions());
    const handleExamsUpdate = () => setUpcomingExamsState(getUpcomingExams());
    const handleRecentVideosUpdate = () => setRecentlyWatchedVideosState(getRecentlyWatchedVideos());
    const handleCustomVideosUpdate = () => setCustomVideosState(getCustomVideos());
    const handlePlaylistsUpdate = () => setVideoPlaylistsState(getVideoPlaylists());
    const handleBookmarksUpdate = () => setVideoBookmarksState(getVideoBookmarks());
    const handleMockResultsUpdate = () => setMockTestResultsState(getMockTestResults());

    window.addEventListener('studynest-planned-sessions-updated', handlePlannedSessionsUpdate);
    window.addEventListener('studynest-exams-updated', handleExamsUpdate);
    window.addEventListener('studynest-recent-videos-updated', handleRecentVideosUpdate);
    window.addEventListener('studynest-custom-videos-updated', handleCustomVideosUpdate);
    window.addEventListener('studynest-playlists-updated', handlePlaylistsUpdate);
    window.addEventListener('studynest-video-bookmarks-updated', handleBookmarksUpdate);
    window.addEventListener('studynest-mock-results-updated', handleMockResultsUpdate);

    return () => {
      window.removeEventListener('studynest-planned-sessions-updated', handlePlannedSessionsUpdate);
      window.removeEventListener('studynest-exams-updated', handleExamsUpdate);
      window.removeEventListener('studynest-recent-videos-updated', handleRecentVideosUpdate);
      window.removeEventListener('studynest-custom-videos-updated', handleCustomVideosUpdate);
      window.removeEventListener('studynest-playlists-updated', handlePlaylistsUpdate);
      window.removeEventListener('studynest-video-bookmarks-updated', handleBookmarksUpdate);
      window.removeEventListener('studynest-mock-results-updated', handleMockResultsUpdate);
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
  };

  const handleSaveQuizAttempt = (attempt) => {
    const updated = saveQuizAttempt(attempt);
    setQuizHistoryState(updated);
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

  const handleResetAllData = () => {
    resetAllStudentData();
    setCompletedTopicsState({});
    setCompletedModuleIdsState([]);
    setTasksState([]);
    setNotesState([]);
    setQuizHistoryState([]);
    setStudySessionsState([]);
    setAssignmentsState([]);
    setCompletedVideoIdsState([]);
    setWatchLaterVideoIdsState([]);
    setAiConversationsState([]);
    setPlannedSessionsState([]);
    setUpcomingExamsState([]);
    setRecentlyWatchedVideosState([]);
    setCustomVideosState([]);
    setVideoBookmarksState([]);
    showToast('All progress, tasks, notes, chats, and video history reset to clean slate.');
  };

  const handleNavigate = (viewId) => {
    setActiveView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubjectQuiz = (subjectId) => {
    setQuizInitialSubject(subjectId);
    handleNavigate('quizzes');
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
    } else if (target.type === 'note') {
      handleNavigate('notes');
    } else if (target.type === 'assignment') {
      handleNavigate('planner');
    } else if (target.type === 'ai') {
      handleNavigate('ai-assistant');
    }
  };

  // Study streak calculation: unique dates in the last 7 days with study or tasks
  const studyDates = new Set(studySessions.map((s) => s.date));
  const studyStreakDays = studyDates.size;

  return (
    <div className="app-shell">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrap">
        {/* Top Navigation Header with Search & Profile */}
        <TopNav
          profile={profile}
          onOpenProfile={() => setIsProfileOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          notes={notes}
          assignments={assignments}
          onNavigateToResult={handleNavigateToResult}
          studyStreakDays={studyStreakDays}
          onShowToast={showToast}
        />

        {/* Scrollable Page Container */}
        <main className={`page-scroll-area ${activeView === 'ai-assistant' ? 'page-scroll-area-ai' : ''}`}>
          {activeView === 'dashboard' && (
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
            />
          )}

          {activeView === 'ai-assistant' && (
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
            />
          )}

          {activeView === 'ai-notes' && (
            <AINotesGeneratorView
              notes={notes}
              onSaveNotes={handleSaveNotes}
              profile={profile}
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          )}

          {activeView === 'subjects' && (
            <SubjectsView
              onSelectSubject={(sub) => setSelectedSubject(sub)}
              completedTopics={completedTopics}
              searchTerm={searchTerm}
              onShowToast={showToast}
            />
          )}

          {activeView === 'python' && (
            <PythonAcademyView
              completedModuleIds={completedModuleIds}
              onToggleModuleCompletion={handleTogglePythonModule}
              onShowToast={showToast}
            />
          )}

          {activeView === 'videos' && (
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
            />
          )}

          {activeView === 'exam-prep' && (
            <ExamPrepView
              profile={profile}
              completedTopics={completedTopics}
              quizHistory={quizHistory}
              onShowToast={showToast}
              onNavigateToPython={() => handleNavigate('python')}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'planner' && (
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
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              notes={notes}
              onSaveNotes={handleSaveNotes}
              onShowToast={showToast}
              onNavigateToPython={() => handleNavigate('python')}
              onNavigateToAINotes={() => handleNavigate('ai-notes')}
            />
          )}

          {activeView === 'quizzes' && (
            <QuizzesView
              quizHistory={quizHistory}
              onSaveQuizAttempt={handleSaveQuizAttempt}
              initialSubjectId={quizInitialSubject}
              onShowToast={showToast}
            />
          )}

          {activeView === 'progress' && (
            <ProgressView
              profile={profile}
              completedTopics={completedTopics}
              completedModuleIds={completedModuleIds}
              quizHistory={quizHistory}
              mockTestResults={mockTestResults}
              assignments={assignments}
              tasks={tasks}
              notes={notes}
              studySessions={studySessions}
              completedVideoIds={completedVideoIds}
              upcomingExams={upcomingExams}
              studyStreakDays={studyStreakDays}
              onNavigate={handleNavigate}
              onSelectSubject={(sub) => setSelectedSubject(sub)}
              onResetAllData={handleResetAllData}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          activeView={activeView}
          onNavigate={handleNavigate}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>

      {/* Clickable Subject Detail Modal with Checkboxes, Assignments, Questions & Notes */}
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
          onOpenQuiz={handleOpenSubjectQuiz}
          onOpenPythonAcademy={() => handleNavigate('python')}
          onOpenVideos={() => handleNavigate('videos')}
          onOpenAIAssistant={() => handleNavigate('ai-assistant')}
          onClose={() => setSelectedSubject(null)}
          onShowToast={showToast}
        />
      )}

      {/* Editable Student Profile Modal */}
      {isProfileOpen && (
        <StudentProfileModal
          profile={profile}
          onSave={handleUpdateProfile}
          onClose={() => setIsProfileOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Feedback Toast Notification */}
      <Toast
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />
    </div>
  );
}
