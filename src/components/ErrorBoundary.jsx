import React from 'react';
import { StudyNestLogo, IconReset, IconSparkles } from './Icons';
import { resetAllStudentData } from '../services/storage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StudyNest captured runtime render exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    if (window.confirm('Reset all local data and reload StudyNest? This clears corrupted local storage caches.')) {
      resetAllStudentData();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF8F5',
            padding: '24px',
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '36px 32px',
              boxShadow: '0 10px 30px -4px rgba(20, 34, 26, 0.08)',
              border: '1px solid #E8E2D7',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
              <StudyNestLogo size={44} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#507761', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              <IconSparkles size={14} />
              <span>Workspace Recovery</span>
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0E1B13', margin: '0 0 10px 0' }}>
              Something interrupted StudyNest
            </h1>

            <p style={{ fontSize: '14px', color: '#586B60', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              A rendering exception was caught. Your workspace can be restored immediately without losing project code.
            </p>

            {this.state.error && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '12.5px',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  marginBottom: '20px',
                  overflowX: 'auto'
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#14281E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <IconReset size={15} />
                <span>Reload StudyNest</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetAndReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F4EFEB',
                  color: '#0E1B13',
                  border: '1px solid #E8E2D7',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>Reset Cached Data & Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

