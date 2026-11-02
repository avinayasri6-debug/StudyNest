import React, { useState } from 'react';
import { IconX, IconSparkles, IconCheckCircle } from './Icons';

// Helper to map optical wavelength (nm) to RGB hex
function wavelengthToHex(wavelength) {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0;
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0;
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
    b = 0;
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1;
    g = 0;
    b = 0;
  } else {
    r = 0.5;
    g = 0.8;
    b = 0.5;
  }

  const red = Math.round(r * 230);
  const green = Math.round(g * 230);
  const blue = Math.round(b * 230);
  return `rgb(${red}, ${green}, ${blue})`;
}

export default function EngineeringPlayground({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('optics'); // 'optics' | 'logic' | 'rlc'

  // Module 1: Newton's Rings Simulation State
  const [wavelengthNm, setWavelengthNm] = useState(589); // Sodium D-line ~589nm
  const [lensRadiusCm, setLensRadiusCm] = useState(100);
  const [mediumRefractiveIndex, setMediumRefractiveIndex] = useState(1.0); // Air

  // Module 2: Digital Logic State
  const [selectedGate, setSelectedGate] = useState('XOR');
  const [inputA, setInputA] = useState(1);
  const [inputB, setInputB] = useState(0);

  // Module 3: RLC State
  const [resistorR, setResistorR] = useState(20); // Ohms
  const [inductorL, setInductorL] = useState(0.2); // Henry
  const [capacitorC, setCapacitorC] = useState(100); // MicroFarads

  if (!isOpen) return null;

  // --- Newton's Rings Computations ---
  // Dark ring radius: r_n = sqrt(n * lambda * R / mu)
  const lambdaM = wavelengthNm * 1e-9;
  const radiusM = lensRadiusCm * 1e-2;
  const ringColor = wavelengthToHex(wavelengthNm);

  const calculateRingRadiusMm = (n) => {
    const rM = Math.sqrt((n * lambdaM * radiusM) / mediumRefractiveIndex);
    return (rM * 1000).toFixed(2);
  };

  // --- Logic Gate Computations ---
  const evaluateGate = (gate, a, b) => {
    switch (gate) {
      case 'AND': return (a && b) ? 1 : 0;
      case 'OR': return (a || b) ? 1 : 0;
      case 'NAND': return !(a && b) ? 1 : 0;
      case 'NOR': return !(a || b) ? 1 : 0;
      case 'XOR': return (a ^ b) ? 1 : 0;
      case 'NOT': return a ? 0 : 1;
      default: return 0;
    }
  };
  const gateOutput = evaluateGate(selectedGate, inputA, inputB);

  // --- RLC Computations ---
  const cFarads = capacitorC * 1e-6;
  const omega0 = 1 / Math.sqrt(inductorL * cFarads);
  const alpha = resistorR / (2 * inductorL);
  const zeta = alpha / omega0;

  let dampingClass = 'Underdamped (Oscillatory decay)';
  if (Math.abs(zeta - 1.0) < 0.05) dampingClass = 'Critically Damped (Fastest settling)';
  else if (zeta > 1.0) dampingClass = 'Overdamped (Sluggish return)';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', width: '94%' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-700)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              <IconSparkles size={14} />
              <span>Interactive Engineering Laboratory</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: '2px 0 0' }}>
              Engineering Playground
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close playground"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Experiment Selector Tabs */}
        <div style={{ padding: '0 28px', backgroundColor: 'var(--bg-card-warm)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="modal-tabs" style={{ margin: 0, padding: '12px 0 8px' }}>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'optics' ? 'active' : ''}`}
              onClick={() => setActiveTab('optics')}
            >
              1. Newton's Rings Optics
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'logic' ? 'active' : ''}`}
              onClick={() => setActiveTab('logic')}
            >
              2. Digital Logic Gate Lab
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'rlc' ? 'active' : ''}`}
              onClick={() => setActiveTab('rlc')}
            >
              3. RLC Circuit Damping
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ============================================================== */}
          {/* SIMULATION 1: NEWTON'S RINGS INTERFERENCE                     */}
          {/* ============================================================== */}
          {activeTab === 'optics' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 4px' }}>
                  Wave Interference & Fringe Spacing Simulator
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Adjust wavelength \(\lambda\), lens radius of curvature \(R\), and film refractive index \(\mu\) to observe dynamic fringe compression and dispersion.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
                {/* SVG Visualizer */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#111815',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)'
                }}>
                  <svg
                    viewBox="0 0 260 260"
                    width="220"
                    height="220"
                    style={{ overflow: 'visible' }}
                    aria-label="Newton rings concentric interference pattern"
                  >
                    {/* Dark background plate */}
                    <circle cx="130" cy="130" r="120" fill="#0D1310" stroke="#223328" strokeWidth="2" />

                    {/* Concentric interference rings */}
                    {[5, 4, 3, 2, 1].map((n) => {
                      const baseScale = Math.sqrt((n * (wavelengthNm / 589) * (lensRadiusCm / 100)) / mediumRefractiveIndex);
                      const ringRadius = Math.min(115, Math.max(12, baseScale * 48));
                      return (
                        <g key={n}>
                          {/* Bright band */}
                          <circle
                            cx="130"
                            cy="130"
                            r={ringRadius}
                            fill="none"
                            stroke={ringColor}
                            strokeWidth={Math.max(2, 6 - n * 0.8)}
                            opacity={0.85}
                          />
                          {/* Dark boundary */}
                          <circle
                            cx="130"
                            cy="130"
                            r={ringRadius + 3}
                            fill="none"
                            stroke="#0D1310"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    })}

                    {/* Central dark spot (Stokes phase inversion at contact) */}
                    <circle cx="130" cy="130" r="7" fill="#000000" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  </svg>

                  <div style={{ fontSize: '11px', color: '#9EBAA9', marginTop: '8px', textAlign: 'center' }}>
                    Central Dark Spot (\(t = 0\)) · Ring Color: <strong>{wavelengthNm} nm</strong>
                  </div>
                </div>

                {/* Controls and Physical Equations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Wavelength Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                      <span>Wavelength (\(\lambda\)): {wavelengthNm} nm</span>
                      <span style={{ color: ringColor, fontWeight: 700 }}>● Monochromatic</span>
                    </div>
                    <input
                      type="range"
                      min="420"
                      max="680"
                      step="5"
                      value={wavelengthNm}
                      onChange={(e) => setWavelengthNm(Number.parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: 'var(--forest-700)' }}
                    />
                  </div>

                  {/* Lens Radius Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                      <span>Lens Curvature Radius (\(R\)): {lensRadiusCm} cm</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="200"
                      step="10"
                      value={lensRadiusCm}
                      onChange={(e) => setLensRadiusCm(Number.parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: 'var(--forest-700)' }}
                    />
                  </div>

                  {/* Medium Selector */}
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Film Medium (\(\mu\)):
                    </label>
                    <select
                      className="add-task-input"
                      value={mediumRefractiveIndex}
                      onChange={(e) => setMediumRefractiveIndex(Number.parseFloat(e.target.value))}
                    >
                      <option value={1.0}>Air (\(\mu = 1.00\))</option>
                      <option value={1.33}>Water (\(\mu = 1.33\)) — Fringes Contract</option>
                      <option value={1.47}>Glycerol (\(\mu = 1.47\)) — Further Contraction</option>
                    </select>
                  </div>

                  {/* Real-time Radii Table */}
                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}>
                    <strong>Calculated Dark Ring Radii:</strong>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span>\(r_1 = {calculateRingRadiusMm(1)}\) mm</span>
                      <span>\(r_2 = {calculateRingRadiusMm(2)}\) mm</span>
                      <span>\(r_3 = {calculateRingRadiusMm(3)}\) mm</span>
                      <span>\(r_4 = {calculateRingRadiusMm(4)}\) mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SIMULATION 2: DIGITAL LOGIC GATE LAB                          */}
          {/* ============================================================== */}
          {activeTab === 'logic' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 4px' }}>
                  Interactive Logic Gate & Truth State Simulator
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Toggle input signals A and B to observe binary voltage propagation, Boolean truth transitions, and circuit output.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Gate Schematic */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-card-warm)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <svg viewBox="0 0 280 140" width="260" height="130">
                    {/* Wire A */}
                    <line x1="20" y1="45" x2="90" y2="45" stroke={inputA ? 'var(--forest-700)' : '#A3A3A3'} strokeWidth="4" />
                    {/* Wire B (if not NOT gate) */}
                    {selectedGate !== 'NOT' && (
                      <line x1="20" y1="95" x2="90" y2="95" stroke={inputB ? 'var(--forest-700)' : '#A3A3A3'} strokeWidth="4" />
                    )}

                    {/* Gate Symbol Container */}
                    <rect x="90" y="25" width="90" height="90" rx="8" fill="#FFFFFF" stroke="var(--forest-950)" strokeWidth="2.5" />
                    <text x="135" y="77" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--forest-950)">
                      {selectedGate}
                    </text>

                    {/* Output Wire */}
                    <line x1="180" y1="70" x2="235" y2="70" stroke={gateOutput ? 'var(--forest-700)' : '#A3A3A3'} strokeWidth="4" />

                    {/* Output LED */}
                    <circle cx="245" cy="70" r="14" fill={gateOutput ? 'var(--forest-700)' : '#E5E5E5'} stroke="var(--forest-950)" strokeWidth="2" />
                    <text x="245" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill={gateOutput ? '#FFFFFF' : '#666666'}>
                      {gateOutput}
                    </text>
                  </svg>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
                    <button
                      type="button"
                      className="modal-tab-btn"
                      onClick={() => setInputA(inputA ? 0 : 1)}
                      style={{ backgroundColor: inputA ? 'var(--forest-850)' : '#FFFFFF', color: inputA ? '#FFFFFF' : 'var(--forest-950)' }}
                    >
                      Input A = {inputA}
                    </button>
                    {selectedGate !== 'NOT' && (
                      <button
                        type="button"
                        className="modal-tab-btn"
                        onClick={() => setInputB(inputB ? 0 : 1)}
                        style={{ backgroundColor: inputB ? 'var(--forest-850)' : '#FFFFFF', color: inputB ? '#FFFFFF' : 'var(--forest-950)' }}
                      >
                        Input B = {inputB}
                      </button>
                    )}
                  </div>
                </div>

                {/* Gate Selection and Truth Table */}
                <div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {['AND', 'OR', 'NAND', 'NOR', 'XOR', 'NOT'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={`modal-tab-btn ${selectedGate === g ? 'active' : ''}`}
                        onClick={() => setSelectedGate(g)}
                        style={{ padding: '6px 12px' }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  {/* Truth Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', backgroundColor: '#FFFFFF', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-card-warm)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '6px 10px', textAlign: 'center' }}>A</th>
                        {selectedGate !== 'NOT' && <th style={{ padding: '6px 10px', textAlign: 'center' }}>B</th>}
                        <th style={{ padding: '6px 10px', textAlign: 'center' }}>Output Y</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedGate === 'NOT' ? [[0, 0], [1, 0]] : [[0, 0], [0, 1], [1, 0], [1, 1]]).map(([a, b]) => {
                        const out = evaluateGate(selectedGate, a, b);
                        const isCurrentState = (selectedGate === 'NOT' ? a === inputA : (a === inputA && b === inputB));
                        return (
                          <tr
                            key={`${a}-${b}`}
                            style={{
                              backgroundColor: isCurrentState ? 'rgba(104, 143, 120, 0.2)' : 'transparent',
                              fontWeight: isCurrentState ? 700 : 400
                            }}
                          >
                            <td style={{ padding: '6px 10px', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)' }}>{a}</td>
                            {selectedGate !== 'NOT' && <td style={{ padding: '6px 10px', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)' }}>{b}</td>}
                            <td style={{ padding: '6px 10px', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', color: out ? 'var(--forest-800)' : 'var(--text-muted)' }}>
                              {out} {isCurrentState && '◀'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SIMULATION 3: RLC CIRCUIT DAMPING OSCILLATION                 */}
          {/* ============================================================== */}
          {activeTab === 'rlc' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 4px' }}>
                  Series RLC Transient Step-Response & Damping Lab
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Adjust circuit damping resistance \(R\), inductance \(L\), and capacitance \(C\) to inspect underdamped oscillations vs critical damping.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
                {/* SVG Transient Graph */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid var(--border-card)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <svg viewBox="0 0 280 140" width="100%" height="140">
                    {/* Grid axes */}
                    <line x1="20" y1="120" x2="260" y2="120" stroke="#CCCCCC" strokeWidth="1" />
                    <line x1="20" y1="20" x2="20" y2="120" stroke="#CCCCCC" strokeWidth="1" />
                    <line x1="20" y1="70" x2="260" y2="70" stroke="rgba(0,0,0,0.06)" strokeDasharray="3,3" />

                    {/* Transient Step Response Curve */}
                    <path
                      d={(() => {
                        const points = [];
                        for (let t = 0; t <= 100; t += 2) {
                          const time = t / 20;
                          let v = 0;
                          if (zeta < 1) {
                            // Underdamped
                            const wd = omega0 * Math.sqrt(1 - zeta * zeta);
                            v = 1 - Math.exp(-alpha * time * 0.05) * Math.cos(wd * time * 0.05);
                          } else {
                            // Overdamped
                            v = 1 - Math.exp(-time * (1 / (zeta + 0.1)));
                          }
                          const px = 20 + (t / 100) * 230;
                          const py = 120 - Math.min(95, Math.max(0, v * 50));
                          points.push(`${px},${py}`);
                        }
                        return `M ${points.join(' L ')}`;
                      })()}
                      fill="none"
                      stroke="var(--forest-800)"
                      strokeWidth="2.5"
                    />

                    {/* Target steady-state voltage line */}
                    <line x1="20" y1="70" x2="260" y2="70" stroke="var(--forest-700)" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="262" y="73" fontSize="9" fill="var(--forest-700)">1.0V (V_ss)</text>
                  </svg>

                  <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center', color: 'var(--forest-950)', fontWeight: 700 }}>
                    State: <span style={{ color: 'var(--forest-800)' }}>{dampingClass}</span> (Damping Ratio \(\zeta = {zeta.toFixed(2)}\))
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                      <span>Resistance (R): {resistorR} Ω</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="150"
                      step="2"
                      value={resistorR}
                      onChange={(e) => setResistorR(Number.parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: 'var(--forest-700)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                      <span>Inductance (L): {inductorL} H</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={inductorL}
                      onChange={(e) => setInductorL(Number.parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--forest-700)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                      <span>Capacitance (C): {capacitorC} µF</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={capacitorC}
                      onChange={(e) => setCapacitorC(Number.parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: 'var(--forest-700)' }}
                    />
                  </div>

                  <div style={{ fontSize: '12px', padding: '10px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <strong>Natural Resonant Frequency: </strong> \(\omega_0 = {(omega0).toFixed(1)}\) rad/s ({(omega0 / (2 * Math.PI)).toFixed(1)} Hz)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time interactive engineering simulation powered by vector mathematics.
          </div>
          <button
            type="button"
            className="add-task-btn"
            onClick={onClose}
          >
            <IconCheckCircle size={16} />
            <span>Close Laboratory</span>
          </button>
        </div>
      </div>
    </div>
  );
}

