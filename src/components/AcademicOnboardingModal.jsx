import React, { useState, useMemo } from 'react';
import {
  StudyNestLogo,
  IconCheckCircle,
  IconSparkles,
  IconBook,
  IconUpload,
  IconPlus,
  IconArrowRight,
  IconArrowLeft
} from './Icons';
import {
  ENGINEERING_BRANCHES,
  STANDARD_DEGREES,
  STANDARD_REGULATIONS,
  ACADEMIC_SEMESTERS
} from '../data/branchesData';
import {
  INDIAN_UNIVERSITIES,
  searchUniversities,
  getUniversityByName
} from '../data/universitiesData';

const CURRENT_CALENDAR_YEAR = new Date().getFullYear();

export default function AcademicOnboardingModal({
  isOpen,
  initialProfile,
  onComplete,
  onOpenSyllabusUpload,
  onShowToast
}) {
  const [currentStep, setCurrentStep] = useState(1); // 1 | 2 | 3 | 4

  // Form State
  const [name, setName] = useState(
    initialProfile?.name && initialProfile.name !== 'Engineering Student'
      ? initialProfile.name
      : ''
  );
  const [college, setCollege] = useState(
    initialProfile?.college && initialProfile.college !== 'Engineering Institute of Technology'
      ? initialProfile.college
      : 'Godavari Global University'
  );
  const [degree, setDegree] = useState(initialProfile?.degree || 'B.Tech');
  const [branch, setBranch] = useState(
    initialProfile?.branch || 'Computer Science and Engineering'
  );
  const [branchId, setBranchId] = useState(initialProfile?.branchId || 'cse');
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [customBranchText, setCustomBranchText] = useState('');

  const [semester, setSemester] = useState(initialProfile?.semester || 'Semester 1');
  const [year, setYear] = useState(initialProfile?.year || 'First Year');
  const [admissionBatch, setAdmissionBatch] = useState(
    initialProfile?.admissionBatch || '2024 - 2028'
  );
  const [curriculum, setCurriculum] = useState(
    initialProfile?.curriculum || 'Autonomous College CBCS Scheme (2023 / 2024)'
  );

  // Curriculum choice in Step 4
  // 'verified' | 'sample' | 'upload_pdf' | 'manual'
  const [curriculumChoice, setCurriculumChoice] = useState('verified');

  // University search state
  const [uniSearchText, setUniSearchText] = useState(college);
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const matchedUniversities = useMemo(
    () => searchUniversities(uniSearchText, 6),
    [uniSearchText]
  );

  // Selected university details
  const activeUni = useMemo(() => getUniversityByName(college), [college]);

  // Validation
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  // Handle Step 1 University Selection
  const handleSelectUniversity = (uni) => {
    setCollege(uni.name);
    setUniSearchText(uni.name);
    setIsUniDropdownOpen(false);
    if (uni.defaultRegulation) {
      setCurriculum(uni.defaultRegulation);
    }
  };

  const handleUniversityInputChange = (e) => {
    const val = e.target.value;
    setUniSearchText(val);
    setCollege(val);
    setIsUniDropdownOpen(true);
  };

  // Handle Step 2 Branch Selection
  const handleSelectBranch = (b) => {
    setIsCustomBranch(false);
    setBranch(b.name);
    setBranchId(b.id);
  };

  const handleSelectCustomBranch = () => {
    setIsCustomBranch(true);
    setBranch(customBranchText || 'Specialized Engineering');
    setBranchId('custom');
  };

  const handleCustomBranchTextChange = (e) => {
    const val = e.target.value;
    setCustomBranchText(val);
    setBranch(val || 'Specialized Engineering');
    setBranchId('custom');
  };

  // Handle Step 3 Semester Selection
  const handleSelectSemester = (semLabel) => {
    setSemester(semLabel);
    const semNum = Number.parseInt(semLabel.replace(/\D/g, ''), 10) || 1;
    let autoYear = 'First Year';
    if (semNum >= 3 && semNum <= 4) autoYear = 'Second Year';
    else if (semNum >= 5 && semNum <= 6) autoYear = 'Third Year';
    else if (semNum >= 7 && semNum <= 8) autoYear = 'Final Year';
    setYear(autoYear);

    // Dynamic admission batch prediction based on current semester
    const startYear = CURRENT_CALENDAR_YEAR - Math.floor((semNum - 1) / 2);
    const endYear = startYear + 4;
    setAdmissionBatch(`${startYear} - ${endYear}`);
  };

  // Step Validation & Navigation
  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 1) {
      if (!name.trim()) {
        stepErrors.name = 'Please enter your name to personalize your workspace.';
      }
      if (!college.trim()) {
        stepErrors.college = 'Please specify your university or college name.';
      }
    }
    if (step === 2) {
      if (isCustomBranch && !customBranchText.trim()) {
        stepErrors.branch = 'Please specify your engineering specialization name.';
      }
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Final Submission
  const handleFinish = () => {
    if (!validateStep(currentStep)) return;

    const finalProfile = {
      ...(initialProfile || {}),
      name: name.trim() || 'Engineering Student',
      college: college.trim() || 'Godavari Global University',
      degree: degree || 'B.Tech',
      branch: branch || 'Computer Science and Engineering',
      branchId: branchId || 'cse',
      year: year || 'First Year',
      semester: semester || 'Semester 1',
      admissionBatch: admissionBatch || '2024 - 2028',
      curriculum: curriculum || 'Autonomous College CBCS Scheme (2023 / 2024)',
      onboardingCompleted: true
    };

    onComplete({
      profile: finalProfile,
      curriculumChoice
    });

    onShowToast?.(`Welcome to Sagevanta, ${finalProfile.name.split(' ')[0]}!`);

    // If student chose to upload syllabus PDF right away, trigger upload modal
    if (curriculumChoice === 'upload_pdf' && onOpenSyllabusUpload) {
      setTimeout(() => {
        onOpenSyllabusUpload();
      }, 350);
    }
  };

  // Has verified sample available for this specific combination
  const isGguCseSem1 =
    college.toLowerCase().includes('godavari') &&
    branch.toLowerCase().includes('computer science') &&
    semester === 'Semester 1';

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 56, 41, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div
        className="onboarding-modal-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: '0 24px 48px -12px rgba(28, 56, 41, 0.25)',
          border: '1px solid var(--border-card, #E3DDCF)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header with Brand & Progress */}
        <div
          style={{
            padding: '24px 28px 20px',
            backgroundColor: 'var(--plaster, #F5F2EA)',
            borderBottom: '1px solid var(--border-card, #E3DDCF)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <StudyNestLogo size={30} />
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: 'var(--forest-800, #496456)',
                    textTransform: 'uppercase'
                  }}
                >
                  Sagevanta 2.0
                </span>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--forest-950, #1C3829)'
                  }}
                >
                  Personalised Academic Setup
                </div>
              </div>
            </div>

            {/* Step Counter Pill */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--forest-900, #2C4D3B)',
                backgroundColor: 'rgba(104, 143, 120, 0.18)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full, 9999px)',
                border: '1px solid var(--border-sage, #B9CDBE)'
              }}
            >
              Step {currentStep} of 4
            </div>
          </div>

          {/* Progress Bar Indicator */}
          <div
            style={{
              width: '100%',
              height: '5px',
              backgroundColor: 'rgba(185, 205, 190, 0.35)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(currentStep / 4) * 100}%`,
                backgroundColor: 'var(--forest-800, #496456)',
                borderRadius: '9999px',
                transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>
        </div>

        {/* Scrollable Step Body */}
        <div
          style={{
            padding: '28px',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {/* ========================================================================= */}
          {/* STEP 1: Name and University / College */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h2
                  id="onboarding-modal-title"
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--forest-950, #1C3829)',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Welcome to Sagevanta.
                </h2>
                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--text-secondary, #526358)',
                    margin: 0,
                    lineHeight: 1.5
                  }}
                >
                  Configure your university identity. Sagevanta adapts syllabus topics, AI tutoring,
                  and practice exercises to your specific engineering program.
                </p>
              </div>

              {/* Student Name */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--forest-950, #1C3829)',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Your Full Name <span style={{ color: '#B91C1C' }}>*</span>
                </label>
                <input
                  type="text"
                  className="add-task-input"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: errors.name ? '1px solid #B91C1C' : '1px solid var(--border-card, #E3DDCF)',
                    backgroundColor: '#FAFAF8'
                  }}
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  autoFocus
                />
                {errors.name && (
                  <p style={{ fontSize: '11.5px', color: '#B91C1C', marginTop: '4px' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* University Autocomplete Input */}
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--forest-950, #1C3829)',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  University / College / Autonomous Institute <span style={{ color: '#B91C1C' }}>*</span>
                </label>
                <input
                  type="text"
                  className="add-task-input"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: errors.college ? '1px solid #B91C1C' : '1px solid var(--border-card, #E3DDCF)',
                    backgroundColor: '#FAFAF8'
                  }}
                  placeholder="Type to search or type custom college name..."
                  value={uniSearchText}
                  onChange={handleUniversityInputChange}
                  onFocus={() => setIsUniDropdownOpen(true)}
                />

                {/* Dropdown suggestions */}
                {isUniDropdownOpen && matchedUniversities.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                      border: '1px solid var(--border-card, #E3DDCF)',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      zIndex: 30
                    }}
                  >
                    {matchedUniversities.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUniversity(u)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #F0EEE6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: college === u.name ? 'rgba(104, 143, 120, 0.1)' : 'transparent'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-950, #1C3829)' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #526358)' }}>
                            {u.type} · {u.location}
                          </div>
                        </div>
                        {u.hasVerifiedCurriculum ? (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: 'var(--forest-800, #496456)',
                              backgroundColor: 'rgba(104, 143, 120, 0.15)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            Verified
                          </span>
                        ) : u.hasSampleTemplate ? (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: 'var(--sage-700, #557562)',
                              backgroundColor: 'rgba(104, 143, 120, 0.12)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            Sample Available
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
                {errors.college && (
                  <p style={{ fontSize: '11.5px', color: '#B91C1C', marginTop: '4px' }}>
                    {errors.college}
                  </p>
                )}
              </div>

              {/* Selected University Badge & Status */}
              {activeUni && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: activeUni.hasVerifiedCurriculum ? 'rgba(104, 143, 120, 0.12)' : 'var(--plaster, #F5F2EA)',
                    border: '1px solid var(--border-sage, #B9CDBE)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <IconCheckCircle
                    size={18}
                    style={{
                      color: activeUni.hasVerifiedCurriculum ? 'var(--forest-800, #496456)' : 'var(--sage-600, #6C8274)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-950, #1C3829)' }}>
                      {activeUni.name} ({activeUni.shortName})
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary, #526358)', marginTop: '2px' }}>
                      {activeUni.syllabusNote}
                    </div>
                  </div>
                </div>
              )}

              {/* Popular Universities Quick Chips */}
              <div>
                <label
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: 'var(--text-muted, #73857B)',
                    display: 'block',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}
                >
                  Quick Selection:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {INDIAN_UNIVERSITIES.slice(0, 6).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUniversity(u)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: college === u.name ? '1px solid var(--forest-800, #496456)' : '1px solid var(--border-card, #E3DDCF)',
                        backgroundColor: college === u.name ? 'rgba(104, 143, 120, 0.15)' : '#FFFFFF',
                        color: college === u.name ? 'var(--forest-950, #1C3829)' : 'var(--forest-900, #2C4D3B)',
                        cursor: 'pointer'
                      }}
                    >
                      {u.shortName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Degree and Engineering Branch */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--forest-950, #1C3829)',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Degree & Engineering Branch.
                </h2>
                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--text-secondary, #526358)',
                    margin: 0,
                    lineHeight: 1.5
                  }}
                >
                  Choose your engineering degree and discipline. Sagevanta covers 10 primary branches
                  and supports custom specialized departments.
                </p>
              </div>

              {/* Degree Selector */}
              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--forest-950, #1C3829)',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  Degree Program
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                  {STANDARD_DEGREES.slice(0, 4).map((deg) => (
                    <button
                      key={deg.id}
                      type="button"
                      onClick={() => setDegree(deg.code)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: degree === deg.code ? '2px solid var(--forest-800, #496456)' : '1px solid var(--border-card, #E3DDCF)',
                        backgroundColor: degree === deg.code ? 'rgba(104, 143, 120, 0.12)' : '#FFFFFF',
                        color: 'var(--forest-950, #1C3829)',
                        fontWeight: 700,
                        fontSize: '13px',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {deg.code}
                      <div style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--text-secondary, #526358)', marginTop: '2px' }}>
                        {deg.id === 'btech' ? '4 Years' : deg.id === 'be' ? '4 Years' : deg.id === 'diploma' ? '3 Years' : '2 Years'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Engineering Branch Selector (10 Disciplines + Custom) */}
              <div>
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--forest-950, #1C3829)',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  Engineering Branch (Discipline)
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '8px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    paddingRight: '4px'
                  }}
                >
                  {ENGINEERING_BRANCHES.map((b) => {
                    const isSelected = !isCustomBranch && branchId === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => handleSelectBranch(b)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--forest-800, #496456)' : '1px solid var(--border-card, #E3DDCF)',
                          backgroundColor: isSelected ? 'rgba(104, 143, 120, 0.12)' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <span
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? 'var(--forest-800, #496456)' : 'var(--plaster, #F5F2EA)',
                            color: isSelected ? '#FFFFFF' : 'var(--forest-900, #2C4D3B)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '10.5px'
                          }}
                        >
                          {b.code}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 700,
                              color: 'var(--forest-950, #1C3829)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {b.name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-secondary, #526358)' }}>
                            {b.category}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Option for Specialized / Custom Branch */}
                  <div
                    onClick={handleSelectCustomBranch}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isCustomBranch ? '2px solid var(--forest-800, #496456)' : '1px dashed var(--border-card, #E3DDCF)',
                      backgroundColor: isCustomBranch ? 'rgba(104, 143, 120, 0.12)' : '#FAFAF8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: isCustomBranch ? 'var(--forest-800, #496456)' : 'var(--plaster, #F5F2EA)',
                        color: isCustomBranch ? '#FFFFFF' : 'var(--forest-900, #2C4D3B)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '12px'
                      }}
                    >
                      +
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-950, #1C3829)' }}>
                        Other Specialized Branch
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary, #526358)' }}>
                        e.g. Aerospace, Robotics, Mechatronics
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom branch input */}
                {isCustomBranch && (
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="text"
                      className="add-task-input"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '13px',
                        borderRadius: '8px',
                        border: errors.branch ? '1px solid #B91C1C' : '1px solid var(--border-card, #E3DDCF)',
                        backgroundColor: '#FFFFFF'
                      }}
                      placeholder="Enter custom branch name (e.g. Aerospace Engineering)"
                      value={customBranchText}
                      onChange={handleCustomBranchTextChange}
                      autoFocus
                    />
                    {errors.branch && (
                      <p style={{ fontSize: '11.5px', color: '#B91C1C', marginTop: '4px' }}>
                        {errors.branch}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Academic Year, Semester, Admission Batch and Regulation */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--forest-950, #1C3829)',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Academic Term & Regulation.
                </h2>
                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--text-secondary, #526358)',
                    margin: 0,
                    lineHeight: 1.5
                  }}
                >
                  Identify your current academic semester and university syllabus regulation.
                </p>
              </div>

              {/* Semester Selector */}
              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--forest-950, #1C3829)',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  Current Semester ({year})
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {ACADEMIC_SEMESTERS.map((sem) => {
                    const isSelected = semester === sem.label;
                    return (
                      <button
                        key={sem.id}
                        type="button"
                        onClick={() => handleSelectSemester(sem.label)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--forest-800, #496456)' : '1px solid var(--border-card, #E3DDCF)',
                          backgroundColor: isSelected ? 'rgba(104, 143, 120, 0.15)' : '#FFFFFF',
                          color: 'var(--forest-950, #1C3829)',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer'
                        }}
                      >
                        {sem.shortLabel}
                        <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-secondary, #526358)', marginTop: '2px' }}>
                          {sem.year.split(' ')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admission Batch & Regulation Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* Admission Batch */}
                <div>
                  <label
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: 'var(--forest-950, #1C3829)',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    Admission Batch
                  </label>
                  <input
                    type="text"
                    list="onboarding-batches"
                    className="add-task-input"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-card, #E3DDCF)',
                      backgroundColor: '#FAFAF8'
                    }}
                    value={admissionBatch}
                    onChange={(e) => setAdmissionBatch(e.target.value)}
                  />
                  <datalist id="onboarding-batches">
                    <option value="2025 - 2029" />
                    <option value="2024 - 2028" />
                    <option value="2023 - 2027" />
                    <option value="2022 - 2026" />
                    <option value="2021 - 2025" />
                  </datalist>
                </div>

                {/* Regulation Scheme */}
                <div>
                  <label
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: 'var(--forest-950, #1C3829)',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    Curriculum / Regulation Scheme
                  </label>
                  <select
                    className="add-task-input"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-card, #E3DDCF)',
                      backgroundColor: '#FAFAF8'
                    }}
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value)}
                  >
                    {STANDARD_REGULATIONS.map((reg) => (
                      <option key={reg.id} value={reg.label}>
                        {reg.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Choose Curriculum Setup Mode */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--forest-950, #1C3829)',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Curriculum Setup Mode.
                </h2>
                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--text-secondary, #526358)',
                    margin: 0,
                    lineHeight: 1.5
                  }}
                >
                  Choose how you would like to initialize your course syllabi for {semester}.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 1. Verified Curriculum (GGU Sem 1) */}
                <div
                  onClick={() => setCurriculumChoice('verified')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: curriculumChoice === 'verified' ? '2px solid var(--forest-800, #496456)' : '1px solid var(--border-card, #E3DDCF)',
                    backgroundColor: curriculumChoice === 'verified' ? 'rgba(104, 143, 120, 0.12)' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <IconSparkles
                    size={20}
                    style={{
                      color: 'var(--forest-800, #496456)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-950, #1C3829)' }}>
                        Start with Standard Curriculum Template
                      </span>
                      {isGguCseSem1 && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            backgroundColor: 'rgba(104, 143, 120, 0.2)',
                            color: 'var(--forest-850, #1E3B2C)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          Sample Template for GGU Sem 1
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #526358)', lineHeight: 1.4 }}>
                      Includes 7 foundational engineering courses (Linear Algebra & Calculus, Physics, Python,
                      Digital Electronics, Workshop, Aptitude, English) with sample learning topics.
                    </div>
                  </div>
                </div>

                {/* 2. Upload University Syllabus PDF */}
                <div
                  onClick={() => setCurriculumChoice('upload_pdf')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: curriculumChoice === 'upload_pdf' ? '2px solid var(--forest-800, #496456)' : '1px solid var(--border-card, #E3DDCF)',
                    backgroundColor: curriculumChoice === 'upload_pdf' ? 'rgba(104, 143, 120, 0.12)' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <IconUpload
                    size={20}
                    style={{
                      color: 'var(--forest-800, #496456)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-950, #1C3829)' }}>
                        Upload College Syllabus PDF / Document
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#EAF0F6',
                          color: '#2B5A8F',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        Client-Side Parser
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #526358)', lineHeight: 1.4 }}>
                      Drag & drop your official university PDF or paste text. Extracts course codes, credits,
                      units, and topics with an interactive preview before saving.
                    </div>
                  </div>
                </div>

                {/* 3. Sample Standard Framework */}
                <div
                  onClick={() => setCurriculumChoice('sample')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: curriculumChoice === 'sample' ? '2px solid var(--forest-800, #496456)' : '1px solid var(--border-card, #E3DDCF)',
                    backgroundColor: curriculumChoice === 'sample' ? 'rgba(104, 143, 120, 0.12)' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <IconBook
                    size={20}
                    style={{
                      color: 'var(--forest-800, #496456)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-950, #1C3829)', marginBottom: '2px' }}>
                      Use AICTE / Autonomous Sample Curriculum
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #526358)', lineHeight: 1.4 }}>
                      Initializes with standard engineering core foundation templates that you can edit anytime.
                    </div>
                  </div>
                </div>

                {/* 4. Add Subjects Manually */}
                <div
                  onClick={() => setCurriculumChoice('manual')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: curriculumChoice === 'manual' ? '2px solid var(--forest-800, #496456)' : '1px solid var(--border-card, #E3DDCF)',
                    backgroundColor: curriculumChoice === 'manual' ? 'rgba(104, 143, 120, 0.12)' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <IconPlus
                    size={20}
                    style={{
                      color: 'var(--forest-800, #496456)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-950, #1C3829)', marginBottom: '2px' }}>
                      Add Subjects Manually
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #526358)', lineHeight: 1.4 }}>
                      Start clean and add your individual course codes, units, and custom topic titles as needed.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '18px 28px',
            backgroundColor: 'var(--plaster, #F5F2EA)',
            borderTop: '1px solid var(--border-card, #E3DDCF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Back button */}
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-card, #E3DDCF)',
                backgroundColor: '#FFFFFF',
                color: 'var(--forest-950, #1C3829)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <IconArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {/* Next / Finish button */}
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--forest-850, #1E3B2C)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm, 0 2px 4px rgba(0,0,0,0.06))'
              }}
            >
              <span>Continue</span>
              <IconArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--forest-850, #1E3B2C)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(28, 56, 41, 0.2)'
              }}
            >
              <IconCheckCircle size={17} />
              <span>Launch Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
