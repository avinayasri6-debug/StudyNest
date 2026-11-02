import React, { useState } from 'react';
import { getTodayChallenge } from '../data/dailyChallengesData';
import { getDailyChallengeCompletions, saveDailyChallengeCompletion } from '../services/storage';
import { IconSparkles, IconCheckCircle } from './Icons';

export default function DailyChallengeCard({ onShowToast }) {
  const challenge = getTodayChallenge();
  const [completions, setCompletions] = useState(() => getDailyChallengeCompletions());
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const existingAttempt = completions[challenge.id];
  const isAnswered = Boolean(existingAttempt) || selectedOption !== null;
  const userChoice = existingAttempt ? existingAttempt.optionChosen : selectedOption;
  const isCorrect = existingAttempt ? existingAttempt.isCorrect : selectedOption === challenge.correctIndex;

  const handleSelectOption = (idx) => {
    if (existingAttempt) return;
    setSelectedOption(idx);
    const correct = idx === challenge.correctIndex;
    const updated = saveDailyChallengeCompletion(challenge.id, idx, correct);
    setCompletions(updated);
    if (correct) {
      onShowToast?.('Correct reasoning! Daily challenge completed.');
    } else {
      onShowToast?.('Review the conceptual explanation below to reinforce your understanding.');
    }
  };

  const completedCount = Object.keys(completions).length;

  return (
    <section
      className="daily-challenge-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-card)',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease'
      }}
      aria-labelledby="daily-challenge-title"
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(104, 143, 120, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--forest-850)'
            }}
          >
            <IconSparkles size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--forest-700)' }}>
                Daily Engineering Problem
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card-warm)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  color: 'var(--text-secondary)'
                }}
              >
                {challenge.domain}
              </span>
            </div>
            <h2 id="daily-challenge-title" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: '2px 0 0' }}>
              {challenge.title}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {completedCount > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--forest-800)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <IconCheckCircle size={14} /> {completedCount} solved
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            {isCollapsed ? 'Show Question' : 'Collapse'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div>
          {/* Problem Statement */}
          <p style={{ fontSize: '14.5px', color: 'var(--forest-950)', lineHeight: 1.6, margin: '0 0 16px', fontWeight: 500 }}>
            {challenge.question}
          </p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {challenge.options.map((opt, idx) => {
              const isSelected = userChoice === idx;
              const isOptionCorrect = idx === challenge.correctIndex;

              let optionBg = 'var(--bg-card-warm)';
              let optionBorder = 'var(--border-subtle)';
              let textColor = 'var(--forest-950)';

              if (isAnswered) {
                if (isOptionCorrect) {
                  optionBg = 'rgba(104, 143, 120, 0.18)';
                  optionBorder = 'var(--forest-700)';
                  textColor = 'var(--forest-950)';
                } else if (isSelected) {
                  optionBg = 'rgba(239, 68, 68, 0.08)';
                  optionBorder = '#EF4444';
                  textColor = '#991B1B';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(existingAttempt)}
                  onClick={() => handleSelectOption(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: optionBg,
                    border: `1px solid ${optionBorder}`,
                    color: textColor,
                    textAlign: 'left',
                    cursor: existingAttempt ? 'default' : 'pointer',
                    fontSize: '13.5px',
                    lineHeight: 1.5,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--forest-850)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Pedagogical Explanation Reveal */}
          {isAnswered && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: isCorrect ? 'rgba(104, 143, 120, 0.12)' : 'var(--bg-card-warm)',
                border: `1px solid ${isCorrect ? 'var(--border-sage)' : 'var(--border-subtle)'}`,
                fontSize: '13px',
                color: 'var(--forest-950)',
                lineHeight: 1.6
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, color: isCorrect ? 'var(--forest-900)' : '#B45309' }}>
                  {isCorrect ? '✓ Correct Solution' : 'ℹ️ Conceptual Solution & Insight'}
                </span>
              </div>
              <p style={{ margin: '0 0 10px', color: 'var(--forest-900)' }}>{challenge.explanation}</p>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                <strong>Key Takeaway: </strong>{challenge.keyTakeaway}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
