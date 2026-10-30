export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Solve Linear Algebra Problem Set 3: Eigenvalues & Cayley-Hamilton',
    subject: 'Linear Algebra and Calculus',
    subjectTag: 'MATH 101',
    dueTime: '2:30 PM',
    estimatedMinutes: 45,
    completed: true,
    priority: 'high'
  },
  {
    id: 'task-2',
    title: 'Python Academy: Complete Module 5 Practice on Dictionary Comprehensions',
    subject: 'Problem Solving and Programming in Python',
    subjectTag: 'CSE 101',
    dueTime: '4:00 PM',
    estimatedMinutes: 30,
    completed: true,
    priority: 'high'
  },
  {
    id: 'task-3',
    title: 'Review Engineering Physics: Population Inversion & Ruby Laser notes',
    subject: 'Engineering Physics',
    subjectTag: 'PHY 101',
    dueTime: '6:15 PM',
    estimatedMinutes: 40,
    completed: false,
    priority: 'medium'
  },
  {
    id: 'task-4',
    title: 'Complete 3-variable K-Map practice sheet for Digital Electronics',
    subject: 'Fundamentals of Digital Electronics',
    subjectTag: 'ECE 101',
    dueTime: '7:45 PM',
    estimatedMinutes: 35,
    completed: false,
    priority: 'medium'
  },
  {
    id: 'task-5',
    title: 'Push today\'s Git workshop branch and create pull request demo',
    subject: 'Digital Skill Workshop',
    subjectTag: 'ENG 103',
    dueTime: '9:00 PM',
    estimatedMinutes: 20,
    completed: false,
    priority: 'low'
  }
];

const STORAGE_KEY = 'studynest_today_tasks_v1';

export function getStoredTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch (err) {
    console.warn('Could not read tasks from localStorage, falling back to default:', err);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn('Could not save tasks to localStorage:', err);
  }
}

export function resetStoredTasks() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return INITIAL_TASKS;
}
