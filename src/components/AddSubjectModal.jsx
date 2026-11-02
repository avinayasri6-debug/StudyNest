import React, { useState } from 'react';
import { IconX, IconPlus, IconBook } from './Icons';

export default function AddSubjectModal({
  isOpen,
  onClose,
  onAddSubject,
  activeSemester = 1,
  activeBranch = 'Computer Science',
  onShowToast
}) {
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    shortName: '',
    department: activeBranch || 'Engineering Faculty',
    credits: 4,
    category: 'Core Engineering',
    description: '',
    unitCount: 3
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.code.trim()) {
      alert('Please provide both a Course Code and Course Title.');
      return;
    }

    const units = [];
    const count = Number.parseInt(formData.unitCount, 10) || 3;
    for (let i = 1; i <= count; i++) {
      units.push({
        unitNumber: i,
        unitTitle: `Unit ${i}: Core Syllabus Fundamentals`,
        topics: [
          { id: `top-${Date.now()}-${i}-1`, name: `Foundational Topic ${i}.1` },
          { id: `top-${Date.now()}-${i}-2`, name: `Analytical Principles ${i}.2` }
        ]
      });
    }

    const newSubject = {
      id: `custom-sub-${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      title: formData.title.trim(),
      shortName: formData.shortName.trim() || formData.title.trim().split(' ')[0],
      department: formData.department.trim(),
      credits: Number.parseInt(formData.credits, 10) || 4,
      category: formData.category,
      semester: Number.parseInt(activeSemester, 10) || 1,
      verified: false,
      source: 'custom',
      description: formData.description.trim() || `Student custom course for ${formData.title.trim()}.`,
      units,
      importantQuestions: [],
      initialAssignments: []
    };

    onAddSubject(newSubject);
    onShowToast?.(`Course "${newSubject.code} - ${newSubject.title}" added to Semester ${activeSemester}!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px' }}
      >
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-700)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              <IconBook size={14} />
              <span>Curriculum Expansion · Semester {activeSemester}</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: '2px 0 0' }}>
              Add Course to Semester {activeSemester}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Course Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE 201"
                  className="add-task-input"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design and Analysis of Algorithms"
                  className="add-task-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Academic Credits
                </label>
                <select
                  className="add-task-input"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                >
                  <option value={1}>1 Credit (Lab / Workshop)</option>
                  <option value={2}>2 Credits</option>
                  <option value={3}>3 Credits (Theory)</option>
                  <option value={4}>4 Credits (Core with Tutorial)</option>
                  <option value={5}>5 Credits</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  className="add-task-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Core Engineering">Core Engineering</option>
                  <option value="Computing & Software">Computing & Software</option>
                  <option value="Electronics & Hardware">Electronics & Hardware</option>
                  <option value="Basic Sciences">Basic Sciences</option>
                  <option value="Core Engineering Mathematics">Mathematics</option>
                  <option value="Workshops & Soft Skills">Workshops & Soft Skills</option>
                  <option value="Elective Course">Elective Course</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Course Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Brief overview of course objectives, syllabus scope, and applications..."
                className="add-task-input"
                style={{ resize: 'vertical' }}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Initial Units to Generate
              </label>
              <select
                className="add-task-input"
                value={formData.unitCount}
                onChange={(e) => setFormData({ ...formData, unitCount: e.target.value })}
              >
                <option value={2}>2 Units</option>
                <option value={3}>3 Units</option>
                <option value={4}>4 Units (Standard Semester Structure)</option>
                <option value={5}>5 Units</option>
              </select>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                You can add, edit, or customize individual unit topics at any time inside the course manager.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="sem2-action-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-task-btn"
            >
              <IconPlus size={16} />
              <span>Add Course</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
