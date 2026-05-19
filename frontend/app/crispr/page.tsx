'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dna, User, BookOpen, Search, Target, Scissors } from 'lucide-react'

export default function CRISPRGuidePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1422 100%)',
      color: 'white',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{
        width: '200px',
        background: 'rgba(4, 20, 44, 0.4)',
        borderRight: '1px solid rgba(0, 207, 255, 0.1)',
        padding: '2rem 1.5rem',
        backdropFilter: 'blur(12px)',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        fontFamily: "'Inter', sans-serif",
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#00cfff',
          marginBottom: '2rem'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2"/>
            <path d="M12 6v6l4 2.5"/>
          </svg>
          HelixLab
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'transparent',
          border: '1px solid rgba(0, 207, 255, 0.1)',
          borderRadius: '8px',
          color: '#3a6080',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '10px'
        }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 8L8 2l6 6"/>
            <path d="M4 10v4h3v-3h2v3h3v-4"/>
          </svg>
          <div style={{ color: '#00cfff' }}>Back to Home</div>
        </div>

        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#3a6080',
          margin: '1.5rem 0 1rem 0',
          fontWeight: 600
        }}>Analysis Tools</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/analyzer" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'transparent',
            border: '1px solid rgba(0, 207, 255, 0.1)',
            borderRadius: '8px',
            color: '#3a6080',
            fontSize: '0.8rem',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Nucleotide Analysis</span>
          </a>

          <a href="/orf" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'transparent',
            border: '1px solid rgba(0, 207, 255, 0.1)',
            borderRadius: '8px',
            color: '#3a6080',
            fontSize: '0.8rem',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2.5"/>
            </svg>
            <span>ORF Detection</span>
          </a>

          <a href="/restriction" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'transparent',
            border: '1px solid rgba(0, 207, 255, 0.1)',
            borderRadius: '8px',
            color: '#3a6080',
            fontSize: '0.8rem',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <span>Restriction Mapping</span>
          </a>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(0, 207, 255, 0.1)',
            border: '1px solid rgba(0, 207, 255, 0.4)',
            borderRadius: '8px',
            color: '#00cfff',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>CRISPR Guide Finder</span>
          </div>

          <a href="/codon" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'transparent',
            border: '1px solid rgba(0, 207, 255, 0.1)',
            borderRadius: '8px',
            color: '#3a6080',
            fontSize: '0.8rem',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2"/>
              <path d="M12 6v6l4 2.5"/>
            </svg>
            <span>Codon Optimization</span>
          </a>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(0, 212, 170, 0.05)',
          border: '1px solid rgba(0, 212, 170, 0.2)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            marginBottom: '0.5rem',
            display: 'flex',
            justifyContent: 'center',
            color: '#00d4aa'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#00d4aa',
            marginBottom: '0.5rem'
          }}>Unlock Full Potential</div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.65rem',
            color: '#3a6080',
            lineHeight: 1.5,
            marginBottom: '1rem'
          }}>Download reports, save your analysis and access all features.</div>
          <button style={{
            width: '100%',
            padding: '0.6rem',
            background: 'rgba(0, 212, 170, 0.1)',
            border: '1px solid rgba(0, 212, 170, 0.3)',
            borderRadius: '6px',
            color: '#00d4aa',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}>Download Report</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '280px', minHeight: '100vh' }}>
        {/* Top Header */}
        <div style={{
          background: 'rgba(13, 20, 34, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 212, 170, 0.1)',
          padding: '1.5rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                background: 'linear-gradient(135deg, #00d4aa 0%, #00cfff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                CRISPR Guide Finder
              </h1>
              <p style={{
                margin: '0.25rem 0 0 0',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem'
              }}>
                Design optimal guide RNAs for CRISPR-Cas9 gene editing
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => window.open('/docs', '_blank')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0, 212, 170, 0.1)',
                  border: '1px solid rgba(0, 212, 170, 0.2)',
                  borderRadius: '8px',
                  color: '#00d4aa',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <BookOpen size={16} />
                View Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(13, 20, 34, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 212, 170, 0.1)',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 2rem',
              background: 'rgba(0, 212, 170, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 0 1rem 0',
              background: 'linear-gradient(135deg, #00d4aa 0%, #00cfff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              CRISPR Guide Finder
            </h2>
            
            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: '0 0 2rem 0',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6
            }}>
              Design optimal guide RNAs for CRISPR-Cas9 gene editing. Find target sites, predict off-targets, 
              and optimize cutting efficiency for precise genome editing.
            </p>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'rgba(255, 165, 0, 0.1)',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              borderRadius: '8px',
              color: '#ffa500',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              Coming Soon - Under Development
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}