import React, { useState } from 'react';
import { IconClock } from './Icons';

function computeDaysData(studySessions) {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Find sessions within the recent window
  return dayNames.map((name) => {
    // Collect all sessions matching day prefix or recent days
    const daySessions = studySessions.filter((s) => {
      if (!s.date) return false;
      const d = new Date(s.date + 'T00:00:00');
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      return dayNames[dayIdx] === name;
    });

    const minutes = daySessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    const hours = parseFloat((minutes / 60).toFixed(1));

    return {
      day: name,
      hours,
      sessionsCount: daySessions.length
    };
  });
}

export default function WeeklyStudyOverview({ studySessions = [] }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const daysData = computeDaysData(studySessions);
  const totalWeekHours = parseFloat(daysData.reduce((acc, d) => acc + d.hours, 0).toFixed(1));
  const maxHours = Math.max(...daysData.map((d) => d.hours), 4.0);
  const selectedDay = daysData[selectedDayIndex] || daysData[0];

  return (
    <div className="analytics-card">
      <div className="section-header-row" style={{ marginBottom: '14px' }}>
        <div>
          <h2 className="section-title">Weekly Focus Overview</h2>
          <div className="section-subtitle">
            Calculated from your active focus timer sessions this week
          </div>
        </div>
        <span className="term-pill-badge">
          This Week: {totalWeekHours} hrs
        </span>
      </div>

      {/* Summary statistics row */}
      <div className="weekly-stats-summary">
        <div>
          <div className="total-hours-big">
            {totalWeekHours} <span className="hours-unit">hrs</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Logged study time this week
          </div>
        </div>

        <div className="hours-trend-badge">
          <IconClock size={14} />
          <span>{studySessions.length} Focus Sessions Completed</span>
        </div>

        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Selected Day:</div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-900)' }}>
            {selectedDay.day} ({selectedDay.hours} hrs logged)
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="chart-bars-container" role="img" aria-label="Weekly study bar chart">
        {daysData.map((d, idx) => {
          const heightPercent = d.hours > 0 ? Math.round((d.hours / maxHours) * 100) : 4;
          const isSelected = selectedDayIndex === idx;

          return (
            <div
              key={d.day}
              className={`chart-day-column ${isSelected ? 'active-today' : ''}`}
              onClick={() => setSelectedDayIndex(idx)}
              style={{ cursor: 'pointer' }}
              title={`${d.day}: ${d.hours} hrs (${d.sessionsCount} sessions)`}
            >
              <div className="chart-bar-hover-wrap">
                {isSelected && (
                  <span className="chart-tooltip-hours">
                    {d.hours}h
                  </span>
                )}
                <div
                  className="chart-bar-fill"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: isSelected
                      ? 'var(--forest-850)'
                      : d.hours > 0
                      ? 'var(--sage-500)'
                      : 'var(--sage-200)'
                  }}
                />
              </div>
              <span className="chart-day-label">
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      {studySessions.length === 0 && (
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', padding: '6px 0' }}>
          No study sessions logged yet this week. Start a focus timer session in Study Planner to track study time!
        </div>
      )}
    </div>
  );
}
