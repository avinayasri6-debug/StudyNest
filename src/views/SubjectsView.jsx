import React, { useState } from 'react';
import SubjectCard from '../components/SubjectCard';
import AddSubjectModal from '../components/AddSubjectModal';
import SyllabusUploadModal from '../components/SyllabusUploadModal';
import VisualLearningJourney from '../components/VisualLearningJourney';
import { IconBook, IconSparkles, IconPlus, IconCheckCircle, IconUpload } from '../components/Icons';
import { SAMPLE_SYLLABUS_DISCLAIMER, getActiveCurriculumSubjects, parseSemesterNumber } from '../data/curriculumData';
import { ACADEMIC_SEMESTERS } from '../data/branchesData';

export default function SubjectsView({
  profile,
  onSelectSubject,
  completedTopics = {},
  searchTerm = '',
  onShowToast,
  customSubjects = [],
  onAddCustomSubject,
  onImportCurriculum,
  subjectOverrides = {},
  onOpenPlayground,
  onUpdateSemester
}) {
  const profileSemNum = parseSemesterNumber(profile?.semester);
  const [selectedSemester, setSelectedSemester] = useState(profileSemNum);
  const [prevSemNum, setPrevSemNum] = useState(profileSemNum);

  if (prevSemNum !== profileSemNum) {
    setPrevSemNum(profileSemNum);
    setSelectedSemester(profileSemNum);
  }
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const activeBranchId = profile?.branchId || 'cse';
  const branchName = profile?.branch || 'Computer Science and Engineering';

  // Get combined subjects for the selected semester & branch
  const subjects = getActiveCurriculumSubjects({
    profile,
    branchId: activeBranchId,
    branch: branchName,
    semester: selectedSemester,
    customSubjects,
    subjectOverrides
  });

  const categories = [
    { id: 'ALL', label: `All Courses (${subjects.length})` },
    { id: 'CORE', label: 'Core Engineering' },
    { id: 'COMPUTING', label: 'Computing' },
    { id: 'SCIENCES', label: 'Sciences & Math' },
    { id: 'PRACTICAL', label: 'Labs & Skills' }
  ];

  const filtered = subjects.filter((s) => {
    // category filter
    if (activeCategory === 'CORE' && !s.category?.includes('Core') && !s.category?.includes('Mathematics')) return false;
    if (activeCategory === 'COMPUTING' && !s.category?.includes('Computing') && !s.category?.includes('Software')) return false;
    if (activeCategory === 'SCIENCES' && !s.category?.includes('Sciences') && !s.category?.includes('Basic') && !s.category?.includes('Chemistry') && !s.category?.includes('Physics')) return false;
    if (activeCategory === 'PRACTICAL' && !s.category?.includes('Practical') && !s.category?.includes('Communication') && !s.category?.includes('Analytical') && !s.category?.includes('Workshop')) return false;

    // search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = s.title?.toLowerCase().includes(q);
      const matchCode = s.code?.toLowerCase().includes(q);
      const matchCat = s.category?.toLowerCase().includes(q);
      const matchTopic = (s.units || []).some((u) => (u.topics || []).some((t) => t.name?.toLowerCase().includes(q)));
      return matchTitle || matchCode || matchCat || matchTopic;
    }
    return true;
  });

  return (
    <div>
      {/* Header Row */}
      <div className="section-header-row" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sage-600)', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
            <IconBook size={16} />
            <span>Curriculum Directory · {branchName}</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
            My Courses & Syllabi
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Curriculum for {profile?.degree || 'B.Tech'} in {branchName} under {profile?.curriculum || 'Standard Academic Regulations'}.
          </p>
        </div>

        {/* Actions Button Row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {onOpenPlayground && (
            <button
              type="button"
              className="sem2-action-btn"
              onClick={onOpenPlayground}
              style={{
                backgroundColor: 'rgba(104, 143, 120, 0.15)',
                color: 'var(--forest-900)',
                borderColor: 'var(--border-sage)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <IconSparkles size={15} />
              <span>Interactive Lab</span>
            </button>
          )}

          <button
            type="button"
            className="editor-btn-secondary"
            onClick={() => setIsUploadModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              backgroundColor: 'var(--bg-card-warm)',
              color: 'var(--forest-900)'
            }}
          >
            <IconUpload size={15} />
            <span>Upload Syllabus (PDF)</span>
          </button>

          <button
            type="button"
            className="add-task-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            <IconPlus size={16} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Visual Learning Journey Map */}
      <VisualLearningJourney
        subjects={subjects}
        completedTopics={completedTopics}
        onSelectSubject={onSelectSubject}
        profile={profile}
      />

      {/* Semester Switcher Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '18px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {ACADEMIC_SEMESTERS.map((sem) => {
          const isSelected = selectedSemester === sem.id;
          const isProfileActive = profileSemNum === sem.id;
          return (
            <button
              key={sem.id}
              type="button"
              className={`modal-tab-btn ${isSelected ? 'active' : ''}`}
              onClick={() => {
                setSelectedSemester(sem.id);
                onUpdateSemester?.(sem.label);
              }}
              style={{
                position: 'relative',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px'
              }}
            >
              <span>{sem.label}</span>
              {isProfileActive && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: isSelected ? '#FFFFFF' : 'var(--forest-850)',
                    color: isSelected ? 'var(--forest-950)' : '#FFFFFF',
                    padding: '1px 5px',
                    borderRadius: '10px'
                  }}
                  title="Your Current Active Semester"
                >
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Syllabus Disclaimer / Status Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: 'rgba(104, 143, 120, 0.12)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-sage)',
        marginBottom: '20px',
        fontSize: '13px',
        color: 'var(--forest-900)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconSparkles size={16} style={{ flexShrink: 0 }} />
          <span>
            {subjects.some((s) => s.source === 'sample_template') ? (
              <>
                <strong>Sample Curriculum: </strong>
                Godavari Global University · CSE-AIML Template (Semester 1) — Not default for all students. {SAMPLE_SYLLABUS_DISCLAIMER}
              </>
            ) : subjects.length > 0 ? (
              <>
                <strong>Semester {selectedSemester} Curriculum: </strong>
                Showing {subjects.length} courses enrolled for {branchName}. All items verified by student.
              </>
            ) : (
              <>
                <strong>Semester {selectedSemester}: </strong>
                No courses registered yet. Never silently invent missing courses. Upload your official university syllabus PDF or add courses manually.
              </>
            )}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
          {subjects.some((s) => s.source === 'sample_template') ? (
            <span style={{ color: 'var(--forest-800)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <IconCheckCircle size={13} /> Sample GGU Template
            </span>
          ) : subjects.length > 0 ? (
            <span style={{ color: 'var(--forest-800)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <IconCheckCircle size={13} /> Student Curriculum
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              Awaiting Syllabus Upload
            </span>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`modal-tab-btn ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Cards Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="subjects-grid">
          {filtered.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              completedTopicIds={completedTopics[subject.id] || []}
              onClick={onSelectSubject}
            />
          ))}
        </div>
      ) : (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card-warm)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-subtle)'
        }}>
          <IconBook size={36} style={{ color: 'var(--forest-700)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 6px' }}>
            No Courses Configured for Semester {selectedSemester}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Sagevanta does not invent artificial subjects for your semester. Upload your university syllabus in PDF format to automatically extract your real courses, or add them manually.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="add-task-btn"
              onClick={() => setIsUploadModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconUpload size={16} />
              <span>Upload University Syllabus (PDF)</span>
            </button>
            <button
              type="button"
              className="sem2-action-btn"
              onClick={() => setIsAddModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconPlus size={15} />
              <span>Add Course Manually</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Subject Modal */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSubject={onAddCustomSubject}
        activeSemester={selectedSemester}
        activeBranch={branchName}
        onShowToast={onShowToast}
      />

      {/* Syllabus Upload Modal */}
      <SyllabusUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        activeSemester={selectedSemester}
        activeBranch={branchName}
        onSaveCurriculum={onImportCurriculum}
        onShowToast={onShowToast}
      />
    </div>
  );
}
