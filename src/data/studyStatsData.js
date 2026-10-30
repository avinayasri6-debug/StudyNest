// Weekly study overview & progress demo data
export const WEEKLY_STUDY_DATA = {
  currentWeek: {
    label: 'This Week',
    totalHours: 26.5,
    goalHours: 28.0,
    completionRate: 94.6,
    activeStreakDays: 14,
    days: [
      { day: 'Mon', shortDate: 'Oct 24', hours: 4.2, target: 4.0, subject: 'Linear Algebra' },
      { day: 'Tue', shortDate: 'Oct 25', hours: 3.8, target: 4.0, subject: 'Python Academy' },
      { day: 'Wed', shortDate: 'Oct 26', hours: 5.1, target: 4.0, subject: 'Physics & Digital Elec' },
      { day: 'Thu', shortDate: 'Oct 27', hours: 4.5, target: 4.0, subject: 'Digital Skills & Math' },
      { day: 'Fri', shortDate: 'Oct 28', hours: 3.5, target: 4.0, subject: 'Aptitude & Technical Eng' },
      { day: 'Sat', shortDate: 'Oct 29', hours: 3.2, target: 3.5, subject: 'Python Code Lab' },
      { day: 'Sun', shortDate: 'Oct 30', hours: 2.2, target: 3.5, subject: 'Weekly Revision (Today)' }
    ]
  },
  subjectDistribution: [
    { subject: 'Problem Solving in Python', hours: 7.5, percentage: 28, color: '#284E3A' },
    { subject: 'Linear Algebra and Calculus', hours: 6.0, percentage: 23, color: '#3B6E52' },
    { subject: 'Engineering Physics', hours: 4.5, percentage: 17, color: '#4B6B58' },
    { subject: 'Fundamentals of Digital Electronics', hours: 3.5, percentage: 13, color: '#52796F' },
    { subject: 'Digital Skill Workshop', hours: 2.5, percentage: 10, color: '#658B6F' },
    { subject: 'Quantitative Aptitude & English', hours: 2.5, percentage: 9, color: '#7D9B86' }
  ]
};

export const DEMO_PROGRESS_METRICS = {
  overallCompletion: 64.8,
  targetCompletion: 60.0,
  termStatus: 'Ahead of Syllabus Pace',
  completedLectures: 48,
  totalLectures: 74,
  quizAccuracy: 88.4,
  quizzesTaken: 12,
  assignmentsSubmitted: 14,
  totalAssignments: 16,
  studyStreakDays: 14,
  longestStreak: 21,
  totalStudyHours: 142.5,
  isDemoNotice: 'Sample academic dataset initialized for demonstration. Live semester tracking updates as assignments and modules are checked off.'
};

export const RECENT_ACTIVITY_LOG = [
  { id: 'act-1', text: 'Completed Python Coding Practice: "Recursive Palindromes"', time: '2 hours ago', icon: 'code' },
  { id: 'act-2', text: 'Reviewed Linear Algebra Unit 3 Formula Cheatsheet', time: '5 hours ago', icon: 'book' },
  { id: 'act-3', text: 'Scored 92% in Fundamentals of Digital Electronics Mini-Quiz', time: 'Yesterday', icon: 'quiz' },
  { id: 'act-4', text: 'Submitted Git Version Control Exercise to Workshop repo', time: '2 days ago', icon: 'check' }
];

