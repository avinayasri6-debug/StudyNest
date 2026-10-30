import React, { useState } from 'react';
import {
  IconCheckCircle,
  IconCircle,
  IconClock,
  IconTrash,
  IconPlus
} from './Icons';
import { SEMESTER_1_SUBJECTS } from '../data/subjectsData';

export default function TodayTasks({ tasks = [], onSaveTasks, onShowToast }) {
  const [newTitle, setNewTitle] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('CSE 101');

  const toggleTask = (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          onShowToast?.(`Task completed: "${t.title}"`);
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    onSaveTasks(updated);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    const matchedSub = SEMESTER_1_SUBJECTS.find((s) => s.code === selectedSubjectCode);
    const subjectName = matchedSub ? matchedSub.title : 'Engineering Study Session';

    const newTask = {
      id: `task-${Date.now()}`,
      title: trimmed,
      subjectTag: selectedSubjectCode,
      subject: subjectName,
      dueTime: 'Today',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      completed: false
    };

    onSaveTasks([newTask, ...tasks]);
    setNewTitle('');
    onShowToast?.(`Added study task for ${selectedSubjectCode}`);
  };

  const deleteTask = (taskId, e) => {
    e.stopPropagation();
    const updated = tasks.filter((t) => t.id !== taskId);
    onSaveTasks(updated);
    onShowToast?.('Task removed');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="tasks-card">
      <div className="tasks-card-header">
        <div>
          <h2 className="section-title">Today's Tasks</h2>
          <div className="section-subtitle">
            Daily engineering practice & study checklist
          </div>
        </div>
        <span className="tasks-count-pill">
          {completedCount} of {tasks.length} done
        </span>
      </div>

      {/* Task list */}
      <div className="tasks-list" role="list">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
            onClick={() => toggleTask(task.id)}
            role="listitem"
            style={{ cursor: 'pointer' }}
          >
            <button
              type="button"
              className={`task-checkbox-btn ${task.completed ? 'checked' : ''}`}
              aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
              onClick={(e) => {
                e.stopPropagation();
                toggleTask(task.id);
              }}
            >
              {task.completed ? <IconCheckCircle size={18} /> : <IconCircle size={18} />}
            </button>

            <div className="task-content">
              <div className="task-title-text">{task.title}</div>
              <div className="task-meta-row">
                <span className="task-subject-tag">{task.subjectTag || 'General'}</span>
                <span className="task-due-time">
                  <IconClock size={11} />
                  <span>{task.dueTime || 'Today'}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              className="task-delete-btn"
              title="Delete task"
              onClick={(e) => deleteTask(task.id, e)}
              aria-label="Delete task"
            >
              <IconTrash size={14} />
            </button>
          </div>
        ))}

        {tasks.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No tasks scheduled yet. Add your first study target below!
          </div>
        )}
      </div>

      {/* Add Task Input Form */}
      <form className="add-task-form" onSubmit={handleAddTask}>
        <input
          type="text"
          className="add-task-input"
          placeholder="Add today's study task (e.g. Solve 5 limits questions)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <select
          value={selectedSubjectCode}
          onChange={(e) => setSelectedSubjectCode(e.target.value)}
          className="add-task-input"
          style={{ width: '110px', flex: 'none', padding: '6px' }}
        >
          {SEMESTER_1_SUBJECTS.map((s) => (
            <option key={s.id} value={s.code}>
              {s.code}
            </option>
          ))}
        </select>
        <button type="submit" className="add-task-btn">
          <IconPlus size={16} />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}
