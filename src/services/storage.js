// Central LocalStorage Management for StudyNest
import { INITIAL_TASKS } from '../data/tasksData.js';
import { DEFAULT_VIDEO_PLAYLISTS } from '../data/videosData.js';
import { getBranchByName } from '../data/branchesData.js';

const STORAGE_KEYS = {
  PROFILE: 'studynest_profile_v2',
  SUBJECT_PROGRESS: 'studynest_subject_progress_v2',
  CUSTOM_TOPICS: 'studynest_custom_topics_v2',
  CUSTOM_SUBJECTS: 'studynest_custom_subjects_v2',
  SUBJECT_OVERRIDES: 'studynest_subject_overrides_v2',
  ASSIGNMENTS: 'studynest_assignments_v2',
  PYTHON_COMPLETED: 'studynest_python_completed_v2',
  TASKS: 'studynest_tasks_v2',
  NOTES: 'studynest_notes_v2',
  QUIZ_HISTORY: 'studynest_quiz_history_v2',
  STUDY_SESSIONS: 'studynest_study_sessions_v2',
  PLANNED_SESSIONS: 'studynest_planned_sessions_v2',
  PYTHON_PRACTICE_PROGRESS: 'studynest_python_practice_v2',
  PYTHON_PRACTICE_HISTORY: 'studynest_python_history_v2',
  PYTHON_SAVED_CODE: 'studynest_python_saved_code_v2',
  COMPLETED_VIDEOS: 'studynest_completed_videos_v2',
  WATCH_LATER_VIDEOS: 'studynest_watch_later_videos_v2',
  RECENTLY_WATCHED_VIDEOS: 'studynest_recently_watched_videos_v1',
  CUSTOM_VIDEOS: 'studynest_custom_videos_v1',
  VIDEO_PLAYLISTS: 'studynest_video_playlists_v1',
  VIDEO_BOOKMARKS: 'studynest_video_bookmarks_v1',
  CUSTOM_FOLDERS: 'studynest_custom_folders_v2',
  RECENT_NOTES: 'studynest_recent_notes_v2',
  REVISED_NOTES: 'studynest_revised_notes_v2',
  UPCOMING_EXAMS: 'studynest_upcoming_exams_v2',
  CUSTOM_QUESTIONS: 'studynest_custom_questions_v2',
  MOCK_TEST_RESULTS: 'studynest_mock_test_results_v2',
  BOOKMARKED_QUESTIONS: 'studynest_bookmarked_questions_v2',
  EXAM_REVISION_CHECKLIST: 'studynest_exam_checklist_v2',
  AI_CONVERSATIONS: 'studynest_ai_conversations_v1',
  AI_ACTIVE_CHAT_ID: 'studynest_ai_active_chat_id_v1',
  AI_SETTINGS: 'studynest_ai_settings_v1',
  DAILY_CHALLENGES: 'studynest_daily_challenges_v1'
};

export const DEFAULT_PROFILE = {
  name: 'Engineering Student',
  college: 'Engineering Institute of Technology',
  degree: 'B.Tech',
  branch: 'Computer Science and Engineering',
  branchId: 'cse',
  year: 'First Year',
  semester: 'Semester 1',
  admissionBatch: '2024 - 2028',
  curriculum: 'AICTE 2024 Model Curriculum',
  profilePic: null,
  onboardingCompleted: false,
  studyGoals: {
    weeklyHoursTarget: 20,
    dailyTargetHours: 3.5,
    primaryFocus: 'Python Academy & Linear Algebra',
    targetGrade: 'Excellence (Grade A / 9.0+ GPA)',
    personalMotto: 'Consistent daily problem solving builds mastery.'
  }
};

export function getProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    const branchInfo = getBranchByName(parsed.branch);

    // Backward-compatible onboarding detection:
    // If onboardingCompleted is explicitly set (true or false), honor it.
    // Otherwise, if the student already has custom profile data (e.g. customized name,
    // college, or activity), treat them as having completed onboarding so we never disturb existing students.
    let onboardingCompleted = parsed.onboardingCompleted;
    if (typeof onboardingCompleted !== 'boolean') {
      const hasCustomizedName = parsed.name && parsed.name !== 'Engineering Student';
      const hasCustomizedCollege = parsed.college && parsed.college !== 'Engineering Institute of Technology';
      const hasSavedProgress = localStorage.getItem(STORAGE_KEYS.SUBJECT_PROGRESS) || localStorage.getItem(STORAGE_KEYS.TASKS);
      onboardingCompleted = Boolean(hasCustomizedName || hasCustomizedCollege || hasSavedProgress);
    }

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      branchId: parsed.branchId || branchInfo?.id || 'cse',
      degree: parsed.degree || DEFAULT_PROFILE.degree,
      admissionBatch: parsed.admissionBatch || DEFAULT_PROFILE.admissionBatch,
      curriculum: parsed.curriculum || DEFAULT_PROFILE.curriculum,
      onboardingCompleted
    };
  } catch (e) {
    console.error('Error reading profile from localStorage:', e);
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    window.dispatchEvent(new Event('studynest-profile-updated'));
  } catch (e) {
    console.error('Error saving profile to localStorage:', e);
  }
}

export function getCompletedTopics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECT_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCompletedTopics(progressMap) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECT_PROGRESS, JSON.stringify(progressMap));
    window.dispatchEvent(new Event('studynest-progress-updated'));
  } catch (e) {
    console.error('Error saving subject progress:', e);
  }
}

export function getPythonCompletedLessons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PYTHON_COMPLETED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePythonCompletedLessons(moduleIds) {
  try {
    localStorage.setItem(STORAGE_KEYS.PYTHON_COMPLETED, JSON.stringify(moduleIds));
    window.dispatchEvent(new Event('studynest-progress-updated'));
  } catch (e) {
    console.error('Error saving python completed lessons:', e);
  }
}

export function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    const parsed = raw ? JSON.parse(raw) : INITIAL_TASKS;
    return (Array.isArray(parsed) ? parsed : []).map((t) => ({
      ...t,
      status: t.status || (t.completed ? 'completed' : 'pending'),
      type: t.type || 'study',
      description: t.description || '',
      completed: t.status === 'completed' || Boolean(t.completed)
    }));
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    const normalized = (Array.isArray(tasks) ? tasks : []).map((t) => ({
      ...t,
      status: t.status || (t.completed ? 'completed' : 'pending'),
      type: t.type || 'study',
      description: t.description || '',
      completed: t.status === 'completed' || Boolean(t.completed)
    }));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(normalized));
    window.dispatchEvent(new Event('studynest-tasks-updated'));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

export function getNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    window.dispatchEvent(new Event('studynest-notes-updated'));
  } catch (e) {
    console.error('Error saving notes:', e);
  }
}

export function getQuizHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuizAttempt(attempt) {
  try {
    const current = getQuizHistory();
    const updated = [attempt, ...current];
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(updated));
    window.dispatchEvent(new Event('studynest-quiz-updated'));
    return updated;
  } catch (e) {
    console.error('Error saving quiz attempt:', e);
    return [];
  }
}

export function getStudySessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logStudySession(session) {
  try {
    const current = getStudySessions();
    const updated = [session, ...current];
    localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event('studynest-study-sessions-updated'));
    return updated;
  } catch (e) {
    console.error('Error logging study session:', e);
    return [];
  }
}

export function getAssignments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAssignments(assignments) {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    window.dispatchEvent(new Event('studynest-assignments-updated'));
  } catch (e) {
    console.error('Error saving assignments:', e);
  }
}

export function getPythonPracticeProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PYTHON_PRACTICE_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePythonPracticeProgress(progressMap) {
  try {
    localStorage.setItem(STORAGE_KEYS.PYTHON_PRACTICE_PROGRESS, JSON.stringify(progressMap));
    window.dispatchEvent(new Event('studynest-python-practice-updated'));
  } catch (e) {
    console.error('Error saving python practice progress:', e);
  }
}

export function getPythonPracticeHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PYTHON_PRACTICE_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logPythonPracticeHistory(entry) {
  try {
    const current = getPythonPracticeHistory();
    const updated = [entry, ...current].slice(0, 50); // Keep last 50 attempts
    localStorage.setItem(STORAGE_KEYS.PYTHON_PRACTICE_HISTORY, JSON.stringify(updated));
    window.dispatchEvent(new Event('studynest-python-history-updated'));
    return updated;
  } catch (e) {
    console.error('Error logging python practice history:', e);
    return [];
  }
}

export function getPythonSavedCode(exerciseId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PYTHON_SAVED_CODE);
    const map = raw ? JSON.parse(raw) : {};
    return map[exerciseId] || null;
  } catch {
    return null;
  }
}

export function savePythonSavedCode(exerciseId, code) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PYTHON_SAVED_CODE);
    const map = raw ? JSON.parse(raw) : {};
    map[exerciseId] = code;
    localStorage.setItem(STORAGE_KEYS.PYTHON_SAVED_CODE, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving python draft code:', e);
  }
}

export function getCompletedVideos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_VIDEOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCompletedVideos(videoIds) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_VIDEOS, JSON.stringify(videoIds));
    window.dispatchEvent(new Event('studynest-videos-updated'));
  } catch (e) {
    console.error('Error saving completed videos:', e);
  }
}

export function getWatchLaterVideos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCH_LATER_VIDEOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWatchLaterVideos(videoIds) {
  try {
    localStorage.setItem(STORAGE_KEYS.WATCH_LATER_VIDEOS, JSON.stringify(videoIds));
    window.dispatchEvent(new Event('studynest-watch-later-updated'));
  } catch (e) {
    console.error('Error saving watch later videos:', e);
  }
}

export function getRecentlyWatchedVideos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTLY_WATCHED_VIDEOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logRecentlyWatchedVideo(entry) {
  try {
    const current = getRecentlyWatchedVideos().filter((v) => v.videoId !== entry.videoId);
    const updated = [
      {
        ...entry,
        watchedAt: entry.watchedAt || new Date().toISOString()
      },
      ...current
    ].slice(0, 20); // Keep last 20 watched
    localStorage.setItem(STORAGE_KEYS.RECENTLY_WATCHED_VIDEOS, JSON.stringify(updated));
    window.dispatchEvent(new Event('studynest-recent-videos-updated'));
    return updated;
  } catch (e) {
    console.error('Error logging recently watched video:', e);
    return [];
  }
}

export function getCustomVideos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_VIDEOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomVideos(videos) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_VIDEOS, JSON.stringify(videos));
    window.dispatchEvent(new Event('studynest-custom-videos-updated'));
  } catch (e) {
    console.error('Error saving custom videos:', e);
  }
}

export function getVideoPlaylists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEO_PLAYLISTS);
    if (!raw) return DEFAULT_VIDEO_PLAYLISTS;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return DEFAULT_VIDEO_PLAYLISTS;
    const storedIds = new Set(stored.map((p) => p.id));
    const missingDefaults = DEFAULT_VIDEO_PLAYLISTS.filter((p) => !storedIds.has(p.id));
    return [...stored, ...missingDefaults];
  } catch {
    return DEFAULT_VIDEO_PLAYLISTS;
  }
}

export function saveVideoPlaylists(playlists) {
  try {
    localStorage.setItem(STORAGE_KEYS.VIDEO_PLAYLISTS, JSON.stringify(playlists));
    window.dispatchEvent(new Event('studynest-playlists-updated'));
  } catch (e) {
    console.error('Error saving video playlists:', e);
  }
}

export function getVideoBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEO_BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVideoBookmarks(bookmarks) {
  try {
    localStorage.setItem(STORAGE_KEYS.VIDEO_BOOKMARKS, JSON.stringify(bookmarks));
    window.dispatchEvent(new Event('studynest-video-bookmarks-updated'));
  } catch (e) {
    console.error('Error saving video bookmarks:', e);
  }
}

export function getCustomFolders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOLDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomFolders(folders) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FOLDERS, JSON.stringify(folders));
    window.dispatchEvent(new Event('studynest-folders-updated'));
  } catch (e) {
    console.error('Error saving custom folders:', e);
  }
}

export function getRecentNoteIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logRecentNoteId(noteId) {
  try {
    const current = getRecentNoteIds().filter((id) => id !== noteId);
    const updated = [noteId, ...current].slice(0, 8);
    localStorage.setItem(STORAGE_KEYS.RECENT_NOTES, JSON.stringify(updated));
    window.dispatchEvent(new Event('studynest-recent-notes-updated'));
    return updated;
  } catch (e) {
    console.error('Error logging recent note:', e);
    return [];
  }
}

export function getRevisedNoteIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVISED_NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleRevisedNoteId(noteId) {
  try {
    const current = getRevisedNoteIds();
    const exists = current.includes(noteId);
    const updated = exists ? current.filter((id) => id !== noteId) : [...current, noteId];
    localStorage.setItem(STORAGE_KEYS.REVISED_NOTES, JSON.stringify(updated));
    window.dispatchEvent(new Event('studynest-revised-notes-updated'));
    return updated;
  } catch (e) {
    console.error('Error toggling revised note:', e);
    return [];
  }
}

// ==========================================
// EXAM PREPARATION & MOCK TEST STORAGE
// ==========================================

function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekDayDate(dayOffset) {
  const now = new Date();
  const day = now.getDay(); // 0 is Sun, 1 is Mon...
  const diffToMon = (day === 0 ? -6 : 1) - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const target = new Date(mon);
  target.setDate(mon.getDate() + dayOffset);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDefaultUpcomingExams() {
  return [
    {
      id: 'exam-1',
      subjectId: 'math101',
      subjectCode: 'MATH 101',
      subjectName: 'Linear Algebra and Calculus',
      examType: 'Mid-Semester Theory Examination',
      date: getFutureDate(6),
      time: '09:30 AM',
      room: 'Lecture Hall 204',
      syllabusUnits: 'Unit 1 (Matrices & Eigenvalues) & Unit 2 (Calculus of Several Variables)',
      targetScore: '92%'
    },
    {
      id: 'exam-2',
      subjectId: 'cse101',
      subjectCode: 'CSE 101',
      subjectName: 'Problem Solving and Programming in Python',
      examType: 'Mid-Semester Lab Practical Exam',
      date: getFutureDate(11),
      time: '02:00 PM',
      room: 'Computer Lab 3 (Turing Hall)',
      syllabusUnits: 'Data Structures, Functions, List/Dict Comprehensions, Algorithm Problems',
      targetScore: '95%'
    },
    {
      id: 'exam-3',
      subjectId: 'phy101',
      subjectCode: 'PHY 101',
      subjectName: 'Engineering Physics',
      examType: 'Unit Test & Viva Voce',
      date: getFutureDate(16),
      time: '11:00 AM',
      room: 'Physics Seminar Hall',
      syllabusUnits: 'Unit 1 (Lasers & Fiber Optics) & Unit 2 (Quantum Mechanics)',
      targetScore: '88%'
    },
    {
      id: 'exam-4',
      subjectId: 'ece101',
      subjectCode: 'ECE 101',
      subjectName: 'Fundamentals of Digital Electronics',
      examType: 'Internal Assessment Test 2',
      date: getFutureDate(22),
      time: '10:00 AM',
      room: 'Electronics Block Room 102',
      syllabusUnits: 'Boolean Algebra, K-Maps, Combinational Logic Circuits',
      targetScore: '90%'
    }
  ];
}

export function getDefaultPlannedSessions() {
  return [
    {
      id: 'plan-1',
      date: getWeekDayDate(0),
      subjectId: 'math101',
      subjectCode: 'MATH 101',
      subjectName: 'Linear Algebra and Calculus',
      topic: 'Eigenvalues & Diagonalization Practice Problems',
      startTime: '09:30',
      endTime: '11:00',
      priority: 'high',
      completed: true,
      type: 'study'
    },
    {
      id: 'plan-2',
      date: getWeekDayDate(0),
      subjectId: 'cse101',
      subjectCode: 'CSE 101',
      subjectName: 'Problem Solving and Programming in Python',
      topic: 'Module 5 Dictionary Comprehensions & Practice Lab',
      startTime: '14:00',
      endTime: '15:30',
      priority: 'high',
      completed: true,
      type: 'practice'
    },
    {
      id: 'plan-3',
      date: getWeekDayDate(1),
      subjectId: 'phy101',
      subjectCode: 'PHY 101',
      subjectName: 'Engineering Physics',
      topic: 'Ruby Laser Population Inversion & Numerical Aperture',
      startTime: '10:00',
      endTime: '11:30',
      priority: 'medium',
      completed: false,
      type: 'revision'
    },
    {
      id: 'plan-4',
      date: getWeekDayDate(1),
      subjectId: 'ece101',
      subjectCode: 'ECE 101',
      subjectName: 'Fundamentals of Digital Electronics',
      topic: '4-Variable K-Map Minimization & Don\'t Care Conditions',
      startTime: '15:00',
      endTime: '16:30',
      priority: 'medium',
      completed: false,
      type: 'study'
    },
    {
      id: 'plan-5',
      date: getWeekDayDate(2),
      subjectId: 'math101',
      subjectCode: 'MATH 101',
      subjectName: 'Linear Algebra and Calculus',
      topic: 'Cayley-Hamilton Theorem & Matrix Inverse Verification',
      startTime: '09:00',
      endTime: '10:30',
      priority: 'high',
      completed: false,
      type: 'study'
    },
    {
      id: 'plan-6',
      date: getWeekDayDate(2),
      subjectId: 'eng104',
      subjectCode: 'ENG 104',
      subjectName: 'Quantitative Aptitude and Reasoning',
      topic: 'Permutations, Combinations & Probability Drill',
      startTime: '14:30',
      endTime: '16:00',
      priority: 'medium',
      completed: false,
      type: 'practice'
    },
    {
      id: 'plan-7',
      date: getWeekDayDate(3),
      subjectId: 'cse101',
      subjectCode: 'CSE 101',
      subjectName: 'Problem Solving and Programming in Python',
      topic: 'File Handling & Exception Handling Debugging',
      startTime: '11:00',
      endTime: '12:30',
      priority: 'high',
      completed: false,
      type: 'practice'
    },
    {
      id: 'plan-8',
      date: getWeekDayDate(3),
      subjectId: 'eng103',
      subjectCode: 'ENG 103',
      subjectName: 'Digital Skill Workshop',
      topic: 'Git Branching & GitHub Pull Request Workflow',
      startTime: '16:00',
      endTime: '17:00',
      priority: 'low',
      completed: false,
      type: 'lab'
    },
    {
      id: 'plan-9',
      date: getWeekDayDate(4),
      subjectId: 'hum101',
      subjectCode: 'HUM 101',
      subjectName: 'English for Technical Communication',
      topic: 'Technical Report Writing & Abstract Drafting',
      startTime: '10:00',
      endTime: '11:30',
      priority: 'low',
      completed: false,
      type: 'study'
    },
    {
      id: 'plan-10',
      date: getWeekDayDate(4),
      subjectId: 'phy101',
      subjectCode: 'PHY 101',
      subjectName: 'Engineering Physics',
      topic: 'Diffraction Grating & Quantum Mechanics Numerical Problems',
      startTime: '14:00',
      endTime: '15:30',
      priority: 'high',
      completed: false,
      type: 'revision'
    },
    {
      id: 'plan-11',
      date: getWeekDayDate(5),
      subjectId: 'cse101',
      subjectCode: 'CSE 101',
      subjectName: 'Problem Solving and Programming in Python',
      topic: 'Python Practice Lab: Algorithm Challenges Sprint',
      startTime: '10:00',
      endTime: '12:00',
      priority: 'high',
      completed: false,
      type: 'practice'
    },
    {
      id: 'plan-12',
      date: getWeekDayDate(6),
      subjectId: 'math101',
      subjectCode: 'MATH 101',
      subjectName: 'Linear Algebra and Calculus',
      topic: 'Weekly Consolidation & Formula Recall Quiz',
      startTime: '11:00',
      endTime: '12:30',
      priority: 'medium',
      completed: false,
      type: 'revision'
    }
  ];
}

export function getPlannedSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANNED_SESSIONS);
    if (!raw) return getDefaultPlannedSessions();
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePlannedSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANNED_SESSIONS, JSON.stringify(sessions));
    window.dispatchEvent(new Event('studynest-planned-sessions-updated'));
  } catch (e) {
    console.error('Error saving planned sessions:', e);
  }
}

export function getUpcomingExams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UPCOMING_EXAMS);
    if (!raw) return getDefaultUpcomingExams();
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUpcomingExams(exams) {
  try {
    localStorage.setItem(STORAGE_KEYS.UPCOMING_EXAMS, JSON.stringify(exams));
    window.dispatchEvent(new Event('studynest-exams-updated'));
  } catch (e) {
    console.error('Error saving upcoming exams:', e);
  }
}

export function getCustomQuestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomQuestions(questions) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(questions));
    window.dispatchEvent(new Event('studynest-questions-updated'));
  } catch (e) {
    console.error('Error saving custom questions:', e);
  }
}

export function getMockTestResults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOCK_TEST_RESULTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMockTestResult(result) {
  try {
    const current = getMockTestResults();
    const updated = [result, ...current];
    localStorage.setItem(STORAGE_KEYS.MOCK_TEST_RESULTS, JSON.stringify(updated));
    window.dispatchEvent(new Event('studynest-mock-results-updated'));
    return updated;
  } catch (e) {
    console.error('Error saving mock test result:', e);
    return [];
  }
}

export function getBookmarkedQuestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKED_QUESTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmarkedQuestion(questionId) {
  try {
    const current = getBookmarkedQuestions();
    const exists = current.includes(questionId);
    const updated = exists ? current.filter((id) => id !== questionId) : [...current, questionId];
    localStorage.setItem(STORAGE_KEYS.BOOKMARKED_QUESTIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event('studynest-bookmarks-updated'));
    return updated;
  } catch (e) {
    console.error('Error toggling bookmarked question:', e);
    return [];
  }
}

export function getExamRevisionChecklist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_REVISION_CHECKLIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExamRevisionChecklist(checklist) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAM_REVISION_CHECKLIST, JSON.stringify(checklist));
    window.dispatchEvent(new Event('studynest-exam-checklist-updated'));
  } catch (e) {
    console.error('Error saving exam revision checklist:', e);
  }
}

export function getAIConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading AI conversations from localStorage:', e);
    return [];
  }
}

export function saveAIConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_CONVERSATIONS, JSON.stringify(conversations));
    window.dispatchEvent(new Event('studynest-ai-chats-updated'));
  } catch (e) {
    console.error('Error saving AI conversations to localStorage:', e);
  }
}

export function getAIActiveChatId() {
  try {
    return localStorage.getItem(STORAGE_KEYS.AI_ACTIVE_CHAT_ID) || null;
  } catch {
    return null;
  }
}

export function saveAIActiveChatId(chatId) {
  try {
    if (chatId) {
      localStorage.setItem(STORAGE_KEYS.AI_ACTIVE_CHAT_ID, chatId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AI_ACTIVE_CHAT_ID);
    }
  } catch (e) {
    console.error('Error saving AI active chat ID:', e);
  }
}

export function getAISettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
    return raw ? JSON.parse(raw) : { defaultSubjectId: 'math101', defaultMode: 'intermediate' };
  } catch {
    return { defaultSubjectId: 'math101', defaultMode: 'intermediate' };
  }
}

export function saveAISettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving AI settings:', e);
  }
}

// ==========================================
// DYNAMIC CURRICULUM & CUSTOM SUBJECTS
// ==========================================
export function getCustomSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SUBJECTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomSubjects(subjects) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SUBJECTS, JSON.stringify(subjects));
    window.dispatchEvent(new Event('studynest-custom-subjects-updated'));
  } catch (e) {
    console.error('Error saving custom subjects to localStorage:', e);
  }
}

export function addCustomSubject(newSubject) {
  const current = getCustomSubjects();
  const updated = [newSubject, ...current];
  saveCustomSubjects(updated);
  return updated;
}

export function deleteCustomSubject(subjectId) {
  const current = getCustomSubjects();
  const updated = current.filter((s) => s.id !== subjectId);
  saveCustomSubjects(updated);
  return updated;
}

export function getSubjectOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECT_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSubjectOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECT_OVERRIDES, JSON.stringify(overrides));
    window.dispatchEvent(new Event('studynest-subject-overrides-updated'));
  } catch (e) {
    console.error('Error saving subject overrides to localStorage:', e);
  }
}

export function updateSubjectOverride(subjectId, updates) {
  const current = getSubjectOverrides();
  const existing = current[subjectId] || {};
  const updated = {
    ...current,
    [subjectId]: {
      ...existing,
      ...updates
    }
  };
  saveSubjectOverrides(updated);
  return updated;
}

export function resetSubjectOverride(subjectId) {
  const current = getSubjectOverrides();
  const { [subjectId]: _removed, ...rest } = current;
  saveSubjectOverrides(rest);
  return rest;
}

// ==========================================
// DAILY ENGINEERING CHALLENGE TRACKING
// ==========================================
export function getDailyChallengeCompletions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDailyChallengeCompletion(challengeId, optionChosen, isCorrect) {
  try {
    const current = getDailyChallengeCompletions();
    const updated = {
      ...current,
      [challengeId]: {
        completedAt: new Date().toISOString(),
        optionChosen,
        isCorrect
      }
    };
    localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGES, JSON.stringify(updated));
    window.dispatchEvent(new Event('studynest-daily-challenges-updated'));
    return updated;
  } catch (e) {
    console.error('Error saving daily challenge completion:', e);
    return {};
  }
}

export function resetAllStudentData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
  window.dispatchEvent(new Event('studynest-reset-all'));
}

