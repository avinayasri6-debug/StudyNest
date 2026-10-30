import React from 'react';
import { IconChevronRight, IconSparkles, IconPlay } from './Icons';
import { PYTHON_MODULES } from '../data/pythonCurriculum';
import { PRACTICE_EXERCISES } from '../data/practiceExercises';
import { getPythonPracticeProgress } from '../services/storage';

export default function PythonAcademyCard({ completedModuleIds = [], onOpenAcademy }) {
  const total = PYTHON_MODULES.length; // 15
  const completed = completedModuleIds.length;
  const pct = Math.round((completed / total) * 100);

  const practiceProgress = getPythonPracticeProgress();
  const solvedCount = Object.values(practiceProgress).filter((p) => p?.solved).length;
  const totalExercises = PRACTICE_EXERCISES.length; // 20

  return (
    <div className="python-hero-card">
      <div className="python-hero-glow" aria-hidden="true" />

      <div className="python-hero-content">
        <div className="python-hero-badge">
          <IconSparkles size={13} />
          <span>Complete 15-Module Curriculum & Pyodide Practice Lab</span>
        </div>

        <h2 className="python-hero-title">
          Python Academy — Core Programming & Problem Solving
        </h2>

        <p className="python-hero-desc">
          Beginner-friendly engineering curriculum: from Variables, Functions, and OOP to File Handling and
          Algorithms. Practice live Python coding inside your browser with automated test case execution.
        </p>

        <div className="python-stats-pills">
          <div className="python-stat-pill">
            <span className="python-stat-val">{pct}%</span>
            <span className="python-stat-lbl">Theory Track</span>
          </div>
          <div className="python-stat-pill">
            <span className="python-stat-val">
              {completed} / {total}
            </span>
            <span className="python-stat-lbl">Modules Mastered</span>
          </div>
          <div className="python-stat-pill">
            <span className="python-stat-val">
              {solvedCount} / {totalExercises}
            </span>
            <span className="python-stat-lbl">Exercises Solved</span>
          </div>
          <div className="python-stat-pill">
            <span className="python-stat-val">Pyodide WebAssembly</span>
            <span className="python-stat-lbl">Live In-Browser Runtime</span>
          </div>
        </div>
      </div>

      <div className="python-hero-actions">
        <button
          type="button"
          className="python-cta-btn"
          onClick={onOpenAcademy}
        >
          <IconPlay size={16} />
          <span>Launch Practice Lab</span>
          <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
