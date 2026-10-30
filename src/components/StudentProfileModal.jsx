import React, { useState } from 'react';
import { IconX, IconCheckCircle, IconSparkles } from './Icons';

export default function StudentProfileModal({
  profile,
  onSave,
  onClose,
  onShowToast
}) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    college: profile.college || '',
    branch: profile.branch || 'CSE – Artificial Intelligence and Machine Learning',
    year: profile.year || 'First Year',
    semester: profile.semester || 'Semester 1',
    profilePic: profile.profilePic || null,
    studyGoals: {
      weeklyHoursTarget: profile.studyGoals?.weeklyHoursTarget || 20,
      dailyTargetHours: profile.studyGoals?.dailyTargetHours || 3.5,
      primaryFocus: profile.studyGoals?.primaryFocus || 'Python Academy & Linear Algebra',
      targetGrade: profile.studyGoals?.targetGrade || 'Excellence (Grade A / 9.0+ GPA)',
      personalMotto: profile.studyGoals?.personalMotto || 'Consistent daily problem solving builds mastery.'
    }
  });

  const [imageError, setImageError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
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

    onSave(formData);
    onShowToast?.('Student profile updated successfully!');
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
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-700)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              <IconSparkles size={14} />
              <span>Academic Identity</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: '2px 0 0' }}>
              Student Profile & Study Goals
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
                  Profile Picture
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
                  Supports PNG, JPG, WebP up to 2MB. Stored locally in your browser.
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '12px' }}>
                Academic Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
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

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    College / Institute Name (Optional)
                  </label>
                  <input
                    type="text"
                    className="add-task-input"
                    value={formData.college}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    placeholder="e.g. Engineering College / Institute"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Academic Branch
                  </label>
                  <input
                    type="text"
                    className="add-task-input"
                    value={formData.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Current Year
                    </label>
                    <select
                      className="add-task-input"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                    >
                      <option value="First Year">First Year</option>
                      <option value="Second Year">Second Year</option>
                      <option value="Third Year">Third Year</option>
                      <option value="Final Year">Final Year</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Active Semester
                    </label>
                    <select
                      className="add-task-input"
                      value={formData.semester}
                      onChange={(e) => handleInputChange('semester', e.target.value)}
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2" disabled>Semester 2 (Coming Soon)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Goals Section */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '12px' }}>
                Personal Study Goals & Targets
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
                    onChange={(e) => handleGoalChange('dailyTargetHours', parseFloat(e.target.value) || 0)}
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
                    onChange={(e) => handleGoalChange('weeklyHoursTarget', parseFloat(e.target.value) || 0)}
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
                    placeholder="e.g. Python Academy & Linear Algebra"
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
              <span>Save Profile & Goals</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

