'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { CompactDNAAnimation } from './CompactDNAAnimation'
import '@/styles/landing.css'

interface AnalysisResult {
  length: number
  gc: number
  at: number
  a: number
  t: number
  g: number
  c: number
  n: number
}

export default function AnalyzerWorkspace() {
  const [sequence, setSequence] = useState('')
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [mounted, setMounted] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const analyzeSequence = (seq: string) => {
    const clean = seq.toUpperCase().replace(/[^ATGCN]/g, '')
    const len = clean.length
    const a = (clean.match(/A/g) || []).length
    const t = (clean.match(/T/g) || []).length
    const g = (clean.match(/G/g) || []).length
    const c = (clean.match(/C/g) || []).length
    const n = (clean.match(/N/g) || []).length
    const gc = ((g + c) / (len - n)) * 100
    const at = ((a + t) / (len - n)) * 100

    setResults({
      length: len,
      gc: Math.round(gc * 100) / 100,
      at: Math.round(at * 100) / 100,
      a,
      t,
      g,
      c,
      n,
    })

    // Save sequence to file
    const blob = new Blob([clean], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const aTag = document.createElement('a')
    aTag.href = url
    aTag.download = 'dna_sequence.txt'
    document.body.appendChild(aTag)
    aTag.click()
    document.body.removeChild(aTag)
    URL.revokeObjectURL(url)

    // Save sequence to localStorage for ORF page
    localStorage.setItem('helixlab_dna_sequence', clean)
  }

  const getReverseComplement = (seq: string): string => {
    const comp: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G', N: 'N' }
    return seq
      .toUpperCase()
      .replace(/[^ATGCN]/g, '')
      .split('')
      .reverse()
      .map(ch => comp[ch] || ch)
      .join('')
  }

  if (!mounted) return null

  const nucleotideData = results
    ? [
        { name: 'Adenine (A)', value: results.a },
        { name: 'Thymine (T)', value: results.t },
        { name: 'Guanine (G)', value: results.g },
        { name: 'Cytosine (C)', value: results.c },
      ]
    : []

  const gcAtData = results
    ? [
        { name: 'GC Content', value: results.gc },
        { name: 'AT Content', value: results.at },
      ]
    : []

  const COLORS = ['#4f8ef7', '#f76f4f', '#00d4aa', '#c77dff']
  const GC_COLORS = ['#00d4aa', '#f7a84f']

  return (
    <div className="analyzer-workspace">
      <style>{`
        .analyzer-workspace {
          font-family: var(--font);
          background: linear-gradient(135deg, #0a0f1a 0%, #0d1422 100%);
          color: var(--white);
          min-height: 100vh;
          display: flex;
        }

        .workspace-sidebar {
          width: 200px;
          background: rgba(4, 20, 44, 0.4);
          border-right: 1px solid rgba(0, 207, 255, 0.1);
          padding: 2rem 1.5rem;
          backdrop-filter: blur(12px);
          overflow-y: auto;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 2rem;
        }

        .si-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid rgba(0, 207, 255, 0.1);
          border-radius: 8px;
          color: var(--muted);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-family: var(--font);
        }

        .si-item:hover {
          background: rgba(0, 207, 255, 0.05);
          border-color: rgba(0, 207, 255, 0.3);
          color: var(--cyan);
        }

        .si-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          color: var(--cyan);
        }

        .si-info {
          flex: 1;
        }

        .si-label {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .section-label {
          font-family: var(--mono);
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 1.5rem 0 1rem 0;
          font-weight: 600;
        }

        .sidebar-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid rgba(0, 207, 255, 0.1);
          border-radius: 8px;
          color: var(--muted);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-family: var(--font);
        }

        .sidebar-item:hover {
          background: rgba(0, 207, 255, 0.05);
          border-color: rgba(0, 207, 255, 0.3);
          color: var(--cyan);
        }

        .sidebar-item.active {
          background: rgba(0, 207, 255, 0.1);
          border-color: rgba(0, 207, 255, 0.4);
          color: var(--cyan);
        }

        .sidebar-item-icon {
          font-size: 1rem;
          min-width: 20px;
        }

        .sidebar-item-label {
          flex: 1;
        }

        .sidebar-item-status {
          font-family: 'DM Mono', monospace;
          font-size: 0.6rem;
          color: #3a6080;
        }

        .sidebar-unlock {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(0, 212, 170, 0.05);
          border: 1px solid rgba(0, 212, 170, 0.2);
          border-radius: 8px;
          text-align: center;
        }

        .unlock-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: center;
          color: #00d4aa;
        }

        .unlock-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #00d4aa;
          margin-bottom: 0.5rem;
        }

        .unlock-desc {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          color: #3a6080;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .unlock-btn {
          width: 100%;
          padding: 0.6rem;
          background: rgba(0, 212, 170, 0.1);
          border: 1px solid rgba(0, 212, 170, 0.3);
          border-radius: 6px;
          color: #00d4aa;
          font-family: var(--font);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }

        .unlock-btn:hover {
          background: rgba(0, 212, 170, 0.2);
          border-color: rgba(0, 212, 170, 0.5);
        }

        .workspace-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .workspace-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .workspace-header {
          margin-bottom: 2rem;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 200px;
        }

        .workspace-header-content {
          flex: 1;
        }

        .workspace-header-animation {
          position: absolute;
          right: 0;
          top: 0;
          width: 400px;
          height: 200px;
          opacity: 0.6;
        }

        .workspace-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          background: linear-gradient(120deg, var(--cyan), var(--teal));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .workspace-subtitle {
          font-family: var(--mono);
          font-size: 0.85rem;
          color: var(--muted);
          letter-spacing: 0.05em;
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .input-card {
          background: rgba(4, 20, 44, 0.6);
          border: 1px solid rgba(0, 207, 255, 0.15);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
        }

        .input-label {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .input-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 207, 255, 0.1);
          padding-bottom: 0.75rem;
        }

        .input-tab {
          font-family: var(--mono);
          font-size: 0.75rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .input-tab.active {
          color: var(--cyan);
          border-bottom: 2px solid var(--cyan);
          margin-bottom: -0.75rem;
        }

        .input-textarea {
          width: 100%;
          height: 150px;
          background: rgba(1, 8, 16, 0.8);
          border: 1px solid rgba(0, 207, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          font-family: var(--mono);
          font-size: 0.8rem;
          color: var(--white);
          resize: none;
          margin-bottom: 1rem;
          transition: border-color 0.2s;
        }

        .input-textarea:focus {
          outline: none;
          border-color: rgba(0, 207, 255, 0.4);
          box-shadow: 0 0 20px rgba(0, 207, 255, 0.1);
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--mono);
          font-size: 0.7rem;
          color: var(--muted);
          margin-bottom: 1rem;
        }

        .input-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .btn-analyze {
          flex: 1;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(120deg, var(--cyan), var(--teal));
          color: #010810;
          border: none;
          border-radius: 8px;
          font-family: var(--font);
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }

        .btn-analyze:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 207, 255, 0.3);
        }

        .btn-clear {
          padding: 0.75rem 1.5rem;
          background: rgba(0, 207, 255, 0.05);
          color: var(--cyan);
          border: 1px solid rgba(0, 207, 255, 0.2);
          border-radius: 8px;
          font-family: var(--font);
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }

        .btn-clear:hover {
          background: rgba(0, 207, 255, 0.1);
          border-color: rgba(0, 207, 255, 0.4);
        }

        .how-to-card {
          background: rgba(4, 20, 44, 0.6);
          border: 1px solid rgba(0, 207, 255, 0.15);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
        }

        .how-to-title {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--cyan);
        }

        .how-to-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .how-to-step {
          display: flex;
          gap: 0.75rem;
          font-family: var(--mono);
          font-size: 0.75rem;
          line-height: 1.6;
          color: var(--muted);
        }

        .step-number {
          min-width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 207, 255, 0.1);
          border: 1px solid rgba(0, 207, 255, 0.3);
          border-radius: 50%;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--cyan);
        }

        .security-note {
          background: rgba(0, 212, 170, 0.05);
          border: 1px solid rgba(0, 212, 170, 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          font-family: var(--mono);
          font-size: 0.7rem;
          color: #00d4aa;
          line-height: 1.6;
        }

        .results-section {
          margin-bottom: 2rem;
        }

        .results-title {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(4, 20, 44, 0.6);
          border: 1px solid rgba(0, 207, 255, 0.15);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
          text-align: center;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(120deg, #00cfff, #00ffbe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-family: var(--mono);
          font-size: 0.7rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          background: rgba(4, 20, 44, 0.6);
          border: 1px solid rgba(0, 207, 255, 0.15);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
        }

        .chart-title {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .collapsible-section {
          background: rgba(4, 20, 44, 0.6);
          border: 1px solid rgba(0, 207, 255, 0.15);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .collapsible-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: rgba(1, 8, 16, 0.5);
          border-bottom: 1px solid rgba(0, 207, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s;
        }

        .collapsible-header:hover {
          background: rgba(1, 8, 16, 0.8);
          border-bottom-color: rgba(0, 207, 255, 0.2);
        }

        .collapsible-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .collapsible-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .collapsible-icon.open {
          transform: rotate(90deg);
        }

        .collapsible-content {
          padding: 1.5rem;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .collapsible-content.open {
          max-height: 500px;
        }

        .content-text {
          font-family: var(--mono);
          font-size: 0.75rem;
          color: var(--muted);
          line-height: 1.8;
          word-break: break-all;
          background: rgba(1, 8, 16, 0.5);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(0, 207, 255, 0.1);
        }

        @media (max-width: 1024px) {
          .workspace-grid {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .analyzer-workspace {
            padding: 1rem;
          }

          .workspace-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="workspace-sidebar">
        <div className="sidebar-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6v6l4 2.5"/>
          </svg>
          HelixLab
        </div>

        <div className="sidebar-section">
          <div className="si-item" style={{ marginBottom: '10px' }}>
            <span className="si-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8L8 2l6 6"/>
                <path d="M4 10v4h3v-3h2v3h3v-4"/>
              </svg>
            </span>
            <div className="si-info">
              <div className="si-label" style={{ color: 'var(--cyan)' }}>Back to Home</div>
            </div>
          </div>
          <div className="section-label">Analysis Tools</div>
          <div className="sidebar-items">
            <button className="sidebar-item active">
              <span className="sidebar-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </span>
              <span className="sidebar-item-label">Nucleotide Analysis</span>
            </button>
            <a href="/orf" className="sidebar-item">
              <span className="sidebar-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2.5"/>
                </svg>
              </span>
              <span className="sidebar-item-label">ORF Detection</span>
            </a>
            <a href="/restriction" className="sidebar-item">
              <span className="sidebar-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </span>
              <span className="sidebar-item-label">Restriction Mapping</span>
            </a>
            <a href="/crispr-guide-finder" className="sidebar-item">
              <span className="sidebar-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </span>
              <span className="sidebar-item-label">CRISPR Guide Finder</span>
            </a>
            <a href="/codon" className="sidebar-item">
              <span className="sidebar-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2"/>
                  <path d="M12 6v6l4 2.5"/>
                </svg>
              </span>
              <span className="sidebar-item-label">Codon Optimization</span>
            </a>
          </div>
        </div>

        <div className="sidebar-unlock">
          <div className="unlock-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="unlock-title">Unlock Full Potential</div>
          <div className="unlock-desc">Download reports, save your analysis and access all features.</div>
          <button className="unlock-btn">Download Report</button>
        </div>
      </div>

      <div className="workspace-main">
        <div className="workspace-container">
          <div className="workspace-header">
            <div className="workspace-header-content">
              <div className="workspace-title">DNA Analysis Workspace</div>
              <div className="workspace-subtitle">Powerful tools for decoding life at the molecular level.</div>
            </div>
            <div className="workspace-header-animation">
              <CompactDNAAnimation />
            </div>
          </div>

        <div className="workspace-grid">
          <div className="input-card">
            <div className="input-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Input DNA Sequence
            </div>
            <div className="input-tabs">
              <button className="input-tab active">Paste Sequence</button>
              <button className="input-tab">Upload FASTA File</button>
            </div>
            <textarea
              className="input-textarea"
              placeholder="Paste your DNA sequence here (A, T, G, C)..."
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
            />
            <div className="input-footer">
              <span>{sequence.length} characters</span>
              <span>{Math.ceil(sequence.length / 3)} bases</span>
            </div>
            <div className="input-buttons">
              <button
                className="btn-analyze"
                onClick={() => analyzeSequence(sequence)}
              >
                ▶ Analyze Sequence
              </button>
              <button
                className="btn-clear"
                onClick={() => {
                  setSequence('')
                  setResults(null)
                }}
              >
                Clear
              </button>
            </div>
            <div className="security-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '0.5rem' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="12 9 12 13 16 17"/>
              </svg>
              Your data is secure. Your sequences are processed securely and never stored or transmitted.
            </div>
          </div>

          <div className="how-to-card">
            <div className="how-to-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              How to use
            </div>
            <div className="how-to-steps">
              <div className="how-to-step">
                <div className="step-number">1</div>
                <div>Paste your DNA sequence in the input area or upload a FASTA file.</div>
              </div>
              <div className="how-to-step">
                <div className="step-number">2</div>
                <div>Click "Analyze Sequence" to process.</div>
              </div>
              <div className="how-to-step">
                <div className="step-number">3</div>
                <div>View results in different sections below.</div>
              </div>
              <div className="how-to-step">
                <div className="step-number">4</div>
                <div>Download detailed reports.</div>
              </div>
            </div>
          </div>
        </div>

        {results && (
          <>
            <div className="results-section">
              <div className="results-title">Analysis Results</div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{results.length}</div>
                  <div className="stat-label">Sequence Length</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{results.gc.toFixed(1)}%</div>
                  <div className="stat-label">GC Content</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{results.at.toFixed(1)}%</div>
                  <div className="stat-label">AT Content</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{results.n}</div>
                  <div className="stat-label">N Count</div>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Nucleotide Composition
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={nucleotideData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,207,255,0.1)" />
                    <XAxis dataKey="name" stroke="#3a6080" style={{ fontSize: '0.7rem' }} />
                    <YAxis stroke="#3a6080" style={{ fontSize: '0.7rem' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(1,8,16,0.9)',
                        border: '1px solid rgba(0,207,255,0.2)',
                        borderRadius: '8px',
                        fontFamily: 'var(--mono)',
                        color: '#ffffff',
                      }}
                      labelStyle={{ color: '#ffffff', fontFamily: 'var(--mono)' }}
                      formatter={(value) => [value, '']}
                      itemStyle={{ color: '#ffffff', fontFamily: 'var(--mono)' }}
                    />
                    <Bar dataKey="value" fill="#00cfff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  GC vs AT Content
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={gcAtData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {GC_COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(1,8,16,0.9)',
                        border: '1px solid rgba(0,207,255,0.2)',
                        borderRadius: '8px',
                        fontFamily: 'var(--mono)',
                        color: '#ffffff',
                      }}
                      labelStyle={{ color: '#ffffff', fontFamily: 'var(--mono)' }}
                      formatter={(value, name, props) => [`${props.payload.name} ${Number(value).toFixed(1)}%`, '']}
                      itemStyle={{ color: '#ffffff', fontFamily: 'var(--mono)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="collapsible-section">
              <div className="collapsible-header" style={{ cursor: 'default', borderBottom: 'none' }}>
                <div className="collapsible-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64M3.51 15A9 9 0 0 0 18.36 18.36"/>
                  </svg>
                  Reverse Complement
                </div>
              </div>
              <div className="collapsible-content" style={{ maxHeight: 'none', overflow: 'visible', padding: '1.5rem' }}>
                <div className="content-text">
                  {getReverseComplement(sequence)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingRight: '2rem' }}>
              <button
                onClick={() => window.open('/docs', '_blank')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(0, 207, 255, 0.1)',
                  border: '1px solid rgba(0, 207, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#00cfff',
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                View Documentation
              </button>
            </div>



          </>
        )}
        </div>
      </div>
    </div>
  )
}
