import React, { useState, useMemo } from 'react';
import { IconX, IconCheckCircle, IconSparkles, IconBook } from './Icons';
import {
  ENGINEERING_BRANCHES,
  STANDARD_DEGREES,
  STANDARD_REGULATIONS,
  ACADEMIC_SEMESTERS,
  ACADEMIC_YEARS,
  getBranchByName
} from '../data/branchesData';
import { getActiveCurriculumSubjects } from '../data/curriculumData';
import { getCustomSubjects, getSubjectOverrides } from '../services/storage';
import { INDIAN_UNIVERSITIES } from '../data/universitiesData';

export default function StudentProfileModal({
  profile,
  onSave,
  onClose,
  onShowToast
}) {
  const initialBranchName = profile.branch || 'Computer Science and Engineering';
  const matchedBranch = getBranchByName(initialBranchName);
  const isCustomInitial = !matchedBranch && initialBranchName !== '';

  const [formData, setFormData] = useState({
    name: profile.name || '',
    college: profile.college || 'Engineering Institute of Technology',
    degree: profile.degree || 'B.Tech',
    branch: initialBranchName,
    branchId: profile.branchId || matchedBranch?.id || 'cse',
    year: profile.year || 'First Year',
    semester: profile.semester || 'Semester 1',
    admissionBatch: profile.admissionBatch || '2024 - 2028',
    curriculum: profile.curriculum || 'AICTE 2024 Model Curriculum',
    profilePic: profile.profilePic || null,
    studyGoals: {
      weeklyHoursTarget: profile.studyGoals?.weeklyHoursTarget || 20,
      dailyTargetHours: profile.studyGoals?.dailyTargetHours || 3.5,
      primaryFocus: profile.studyGoals?.primaryFocus || 'Core Engineering & Mathematics',
      targetGrade: profile.studyGoals?.targetGrade || 'Excellence (Grade A / 9.0+ GPA)',
      personalMotto: profile.studyGoals?.personalMotto || 'Consistent daily problem solving builds mastery.'
    }
  });

  const [isCustomBranch, setIsCustomBranch] = useState(isCustomInitial);
  const [customBranchText, setCustomBranchText] = useState(isCustomInitial ? initialBranchName : '');
  const [imageError, setImageError] = useState('');

  const semNum = Number.parseInt((formData.semester || 'Semester 1').replace(/\D/g, ''), 10) || 1;
  const currentEnrolledSubjects = useMemo(() => {
    return getActiveCurriculumSubjects({
      university: formData.college,
      branch: formData.branch,
      branchId: formData.branchId || 'cse',
      semester: semNum,
      customSubjects: getCustomSubjects(),
      subjectOverrides: getSubjectOverrides()
    });
  }, [formData.college, formData.branch, formData.branchId, semNum]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBranchSelect = (selectedId) => {
    if (selectedId === 'custom') {
      setIsCustomBranch(true);
      setFormData((prev) => ({
        ...prev,
        branch: customBranchText || 'Specialized Engineering',
        branchId: 'custom'
      }));
    } else {
      setIsCustomBranch(false);
      const b = ENGINEERING_BRANCHES.find((item) => item.id === selectedId);
      if (b) {
        setFormData((prev) => ({
          ...prev,
          branch: b.name,
          branchId: b.id
        }));
      }
    }
  };

  const handleCustomBranchText = (text) => {
    setCustomBranchText(text);
    setFormData((prev) => ({
      ...prev,
      branch: text,
      branchId: 'custom'
    }));
  };

  const handleSemesterSelect = (semLabel) => {
    // Automatically match appropriate academic year based on semester
    const semNum = Number.parseInt(semLabel.replace(/\D/g, ''), 10) || 1;
    let autoYear = 'First Year';
    if (semNum >= 3 && semNum <= 4) autoYear = 'Second Year';
    else if (semNum >= 5 && semNum <= 6) autoYear = 'Third Year';
    else if (semNum >= 7 && semNum <= 8) autoYear = 'Final Year';

    setFormData((prev) => ({
      ...prev,
      semester: semLabel,
      year: autoYear
    }));
  };

  const handleGoalChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      studyGoals: {
        ...prev.studyGoals,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    setImageError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image file is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        profilePic: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profilePic: null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter your name.');
      return;
    }

    onSave({
      ...formData,
      onboardingCompleted: true
    });
    onShowToast?.('Academic profile & curriculum preferences updated!');
    onClose();
  };

  const initials = formData.name
    ? formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SN';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
      >
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-700)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              <IconSparkles size={14} />
              <span>Academic Identity & Specialisation</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: '2px 0 0' }}>
              Student Academic Profile
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close profile modal"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '16px',
              backgroundColor: 'var(--bg-card-warm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ position: 'relative' }}>
                {formData.profilePic ? (
                  <img
                    src={formData.profilePic}
                    alt="Student profile"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--sage-400)'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--forest-850), var(--sage-500))',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 800
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)', display: 'block', marginBottom: '4px' }}>
                  Student Photo / Avatar
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-card)',
                      color: 'var(--forest-900)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-block'
                    }}
                  >
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {formData.profilePic && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        fontSize: '12px',
                        color: '#B91C1C',
                        fontWeight: 600,
                        padding: '4px 8px'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {imageError && (
                  <div style={{ fontSize: '11.5px', color: '#B91C1C', marginTop: '4px' }}>
                    {imageError}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Stored safely in browser local storage.
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                  University & Engineering Program
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--forest-800)', fontWeight: 600 }}>
                  Drives dynamic curriculum & AI assistance
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                {/* Student Full Name */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="add-task-input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                {/* College / Institute */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    University / College / Institute
                  </label>
                  <input
                    type="text"
                    list="colleges-suggestions"
                    className="add-task-input"
                    value={formData.college}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    placeholder="e.g. Autonomous College / Anna Univ / VTU"
                  />
                  <datalist id="colleges-suggestions">
                    {INDIAN_UNIVERSITIES.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.shortName} ({u.location})
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Degree */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Degree Program
                  </label>
                  <select
                    className="add-task-input"
                    value={formData.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                  >
                    {STANDARD_DEGREES.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Engineering Branch */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Engineering Branch / Discipline
                  </label>
                  <select
                    className="add-task-input"
                    value={isCustomBranch ? 'custom' : formData.branchId}
                    onChange={(e) => handleBranchSelect(e.target.value)}
                  >
                    {ENGINEERING_BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                    <option value="custom">Other / Custom Specialisation...</option>
                  </select>
                </div>

                {/* Custom branch text field if chosen */}
                {isCustomBranch && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Specify Custom Branch or Specialisation Name
                    </label>
                    <input
                      type="text"
                      className="add-task-input"
                      value={customBranchText}
                      onChange={(e) => handleCustomBranchText(e.target.value)}
                      placeholder="e.g. Mechatronics Engineering / Aerospace Engineering"
                    />
                  </div>
                )}

                {/* Semester & Year */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Current Semester
                    </label>
                    <select
                      className="add-task-input"
                      value={formData.semester}
                      onChange={(e) => handleSemesterSelect(e.target.value)}
                    >
                      {ACADEMIC_SEMESTERS.map((s) => (
                        <option key={s.id} value={s.label}>
                          {s.label} ({s.year.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Academic Year
                    </label>
                    <select
                      className="add-task-input"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                    >
                      {ACADEMIC_YEARS.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Curriculum / Regulation */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Curriculum / Regulation Scheme
                  </label>
                  <input
                    type="text"
                    list="regulations-list"
                    className="add-task-input"
                    value={formData.curriculum}
                    onChange={(e) => handleInputChange('curriculum', e.target.value)}
                    placeholder="e.g. AICTE 2024 / Autonomous CBCS"
                  />
                  <datalist id="regulations-list">
                    {STANDARD_REGULATIONS.map((r) => (
                      <option key={r.id} value={r.label} />
                    ))}
                  </datalist>
                </div>

                {/* Admission Batch */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Admission Batch
                  </label>
                  <input
                    type="text"
                    list="batches-suggestions"
                    className="add-task-input"
                    value={formData.admissionBatch}
                    onChange={(e) => handleInputChange('admissionBatch', e.target.value)}
                    placeholder="e.g. 2024 - 2028 / 2023 - 2027"
                  />
                  <datalist id="batches-suggestions">
                    <option value="2024 - 2028" />
                    <option value="2023 - 2027" />
                    <option value="2025 - 2029" />
                    <option value="2022 - 2026" />
                    <option value="2021 - 2025" />
                  </datalist>
                </div>
              </div>

              {/* Current Subjects List Display */}
              <div style={{ marginTop: '14px', padding: '14px 16px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconBook size={15} style={{ color: 'var(--forest-800)' }} />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-950)' }}>
                      Current Subjects ({currentEnrolledSubjects.length} Courses enrolled for {formData.semester}):
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Branch: {formData.branch}
                  </span>
                </div>
                {currentEnrolledSubjects.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {currentEnrolledSubjects.map((sub) => (
                      <span
                        key={sub.id}
                        style={{
                          fontSize: '11.5px',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(104, 143, 120, 0.14)',
                          color: 'var(--forest-900)',
                          fontWeight: 600,
                          border: '1px solid var(--border-sage)'
                        }}
                      >
                        <strong>{sub.code}:</strong> {sub.title} ({sub.credits} credits)
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    No subjects configured for {formData.semester} yet. You can upload your university syllabus in PDF format or add courses under My Courses.
                  </div>
                )}
              </div>
            </div>

            {/* Study Goals Section */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '12px' }}>
                Personal Study Targets & Goals
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Daily Study Target (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="16"
                    className="add-task-input"
                    value={formData.studyGoals.dailyTargetHours}
                    onChange={(e) => handleGoalChange('dailyTargetHours', Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Weekly Study Goal (Hours)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="80"
                    className="add-task-input"
                    value={formData.studyGoals.weeklyHoursTarget}
                    onChange={(e) => handleGoalChange('weeklyHoursTarget', Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Primary Focus Subject(s)
                  </label>
                  <input
                    type="text"
                    className="add-task-input"
                    value={formData.studyGoals.primaryFocus}
                    onChange={(e) => handleGoalChange('primaryFocus', e.target.value)}
                    placeholder="e.g. Data Structures & Linear Algebra"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Target Academic Grade / GPA
                  </label>
                  <input
                    type="text"
                    className="add-task-input"
                    value={formData.studyGoals.targetGrade}
                    onChange={(e) => handleGoalChange('targetGrade', e.target.value)}
                    placeholder="e.g. 9.0+ SGPA / Grade A"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Personal Engineering Study Motto
                  </label>
                  <input
                    type="text"
                    className="add-task-input"
                    value={formData.studyGoals.personalMotto}
                    onChange={(e) => handleGoalChange('personalMotto', e.target.value)}
                    placeholder="e.g. Consistent daily problem solving builds mastery."
                  />
                </div>
              </div>
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
              <IconCheckCircle size={16} />
              <span>Save Academic Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
