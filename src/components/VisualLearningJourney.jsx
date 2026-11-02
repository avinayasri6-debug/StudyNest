import React from 'react';
import { IconCheckCircle, IconChevronRight, IconSparkles } from './Icons';
import { getAllSubjectTopics } from '../data/curriculumData';

export default function VisualLearningJourney({
  subjects = [],
  completedTopics = {},
  onSelectSubject,
  profile
}) {
  if (!subjects || subjects.length === 0) return null;

  const subjectProgressList = subjects.map((sub) => {
    const allTopics = getAllSubjectTopics(sub);
    const completedList = completedTopics[sub.id] || [];
    const count = allTopics.filter((t) => completedList.includes(t.id)).length;
    const total = allTopics.length;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    const nextTopic = allTopics.find((t) => !completedList.includes(t.id));

    return {
      subject: sub,
      total,
      completed: count,
      percent,
      nextTopic: nextTopic ? nextTopic.name : 'All topics mastered!'
    };
  });

  const totalSyllabusTopics = subjectProgressList.reduce((acc, item) => acc + item.total, 0);
  const totalCompletedTopics = subjectProgressList.reduce((acc, item) => acc + item.completed, 0);

  const overallPercent = totalSyllabusTopics > 0
    ? Math.round((totalCompletedTopics / totalSyllabusTopics) * 100)
    : 0;

  // Filter next 3 real upcoming study milestones
  const upcomingMilestones = subjectProgressList
    .filter((sp) => sp.percent < 100)
    .slice(0, 3);

  return (
    <section
      className="visual-learning-journey"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-card)',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-sm)'
      }}
      aria-labelledby="journey-heading"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--forest-700)', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <IconSparkles size={14} />
            <span>Academic Learning Journey</span>
          </div>
          <h2 id="journey-heading" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--forest-950)', margin: '2px 0 0' }}>
            {profile?.semester || 'Semester 1'} Milestone Map
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
            Real-time visual map tracking {totalCompletedTopics} of {totalSyllabusTopics} syllabus milestones completed.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-900)' }}>
            {overallPercent}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Semester Readiness
          </div>
        </div>
      </div>

      {/* Visual Progress Node Rail */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          {/* Background connecting bar */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '12px',
              right: '12px',
              height: '4px',
              backgroundColor: 'var(--bg-card-warm)',
              transform: 'translateY(-50%)',
              zIndex: 0,
              borderRadius: '2px'
            }}
          />
          {/* Active progress fill on bar */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '12px',
              width: `calc(${overallPercent}% * 0.94)`,
              height: '4px',
              backgroundColor: 'var(--forest-700)',
              transform: 'translateY(-50%)',
              zIndex: 1,
              borderRadius: '2px',
              transition: 'width 0.4s ease'
            }}
          />

          {/* Subject Milestone Nodes */}
          {subjectProgressList.map((sp) => {
            const isFinished = sp.percent === 100;
            const isInProgress = sp.percent > 0 && sp.percent < 100;

            let nodeBg = '#FFFFFF';
            let nodeBorder = 'var(--border-subtle)';
            let nodeColor = 'var(--text-secondary)';

            if (isFinished) {
              nodeBg = 'var(--forest-850)';
              nodeBorder = 'var(--forest-850)';
              nodeColor = '#FFFFFF';
            } else if (isInProgress) {
              nodeBg = 'rgba(104, 143, 120, 0.2)';
              nodeBorder = 'var(--forest-700)';
              nodeColor = 'var(--forest-950)';
            }

            return (
              <div
                key={sp.subject.id}
                onClick={() => onSelectSubject?.(sp.subject)}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                title={`${sp.subject.code}: ${sp.percent}% completed (${sp.completed}/${sp.total} topics)`}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: nodeBg,
                    border: `2px solid ${nodeBorder}`,
                    color: nodeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {isFinished ? (
                    <IconCheckCircle size={14} />
                  ) : (
                    <span>{sp.subject.code.split(' ')[0]}</span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isInProgress ? 'var(--forest-950)' : 'var(--text-muted)',
                    marginTop: '6px',
                    maxWidth: '64px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {sp.subject.shortName || sp.subject.code}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--forest-800)', fontWeight: 700 }}>
                  {sp.percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Recommended Milestones */}
      {upcomingMilestones.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-950)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Next Learning Targets
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {upcomingMilestones.map((um) => (
              <div
                key={um.subject.id}
                onClick={() => onSelectSubject?.(um.subject)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card-warm)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-700)' }}>
                    {um.subject.code} · {um.subject.shortName}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-950)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {um.nextTopic}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--forest-800)' }}>
                  <IconChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
