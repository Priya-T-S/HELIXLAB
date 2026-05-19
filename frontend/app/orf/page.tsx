'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Play, RefreshCw, Copy, Download, Search, Dna, File, Lock, User, HelpCircle, BookOpen } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { generateORFReport } from '../../lib/pdfGenerator'

// Types
interface ORF {
  id: string
  frame: string
  start: number
  end: number
  length_nt: number
  length_aa: number
  protein_sequence: string
  gc_content: number
  molecular_weight: number
  isoelectric_point: number
  start_codon: string
  stop_codon: string
}

interface FrameData {
  frame: string
  orfs: ORF[]
  longest_orf: ORF | null
  total_orfs: number
}

interface AnalysisResults {
  sequence: string
  sequence_length: number
  frames: FrameData[]
  total_orfs: number
  longest_orf: ORF | null
  average_length: number
  most_active_frame: string
  analysis_duration: number
  timestamp: string
}

// Constants
const CODON_TABLE: Record<string, string> = {
  'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
  'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
  'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
  'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
  'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
  'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
  'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
  'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
  'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
  'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
  'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
  'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
  'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
  'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
  'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
  'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
}

const AMINO_ACID_WEIGHTS: Record<string, number> = {
  'A': 89.1, 'R': 174.2, 'N': 132.1, 'D': 133.1, 'C': 121.0,
  'E': 147.1, 'Q': 146.1, 'G': 75.1, 'H': 155.2, 'I': 131.2,
  'L': 131.2, 'K': 146.2, 'M': 149.2, 'F': 165.2, 'P': 115.1,
  'S': 105.1, 'T': 119.1, 'W': 204.2, 'Y': 181.2, 'V': 117.1
}

const FRAMES = ['+1', '+2', '+3', '-1', '-2', '-3']

// Helper Functions
function reverseComplement(sequence: string): string {
  const complement: Record<string, string> = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G', 'N': 'N' }
  return sequence.split('').reverse().map(base => complement[base] || base).join('')
}

function translateSequence(sequence: string): string {
  let protein = ''
  for (let i = 0; i < sequence.length - 2; i += 3) {
    const codon = sequence.substring(i, i + 3)
    protein += CODON_TABLE[codon] || 'X'
  }
  return protein
}

function calculateMolecularWeight(protein: string): number {
  let weight = 18.015 // Water molecule weight
  for (const aa of protein) {
    if (aa !== '*') weight += AMINO_ACID_WEIGHTS[aa] || 110
  }
  return Math.round(weight / 1000 * 100) / 100 // Convert to kDa
}

function calculateIsoelectricPoint(protein: string): number {
  const basic = (protein.match(/[RKH]/g) || []).length
  const acidic = (protein.match(/[DE]/g) || []).length
  const pi = 7 + (basic - acidic) * 0.3
  return Math.round(Math.min(Math.max(pi, 3), 12) * 100) / 100
}

function findORFsInFrame(sequence: string, frame: string): ORF[] {
  const frameNum = parseInt(frame.replace('+', '').replace('-', ''))
  const isReverse = frame.startsWith('-')
  const workingSeq = isReverse ? reverseComplement(sequence) : sequence
  const offset = frameNum - 1
  const orfs: ORF[] = []

  for (let i = offset; i < workingSeq.length - 2; i += 3) {
    const startCodon = workingSeq.substring(i, i + 3)
    if (startCodon === 'ATG') {
      for (let j = i + 3; j < workingSeq.length - 2; j += 3) {
        const stopCodon = workingSeq.substring(j, j + 3)
        if (['TAA', 'TAG', 'TGA'].includes(stopCodon)) {
          const orfLength = j - i + 3
          if (orfLength >= 90) { // Minimum ORF length
            const orfSequence = workingSeq.substring(i, j + 3)
            const protein = translateSequence(orfSequence)
            
            const actualStart = isReverse ? sequence.length - (j + 2) : i + 1
            const actualEnd = isReverse ? sequence.length - i : j + 3
            
            const gcContent = Math.round(((orfSequence.match(/[GC]/g) || []).length / orfSequence.length) * 1000) / 10

            orfs.push({
              id: `${frame}_${actualStart}_${actualEnd}`,
              frame,
              start: actualStart,
              end: actualEnd,
              length_nt: orfLength,
              length_aa: protein.replace('*', '').length,
              protein_sequence: protein,
              gc_content: gcContent,
              molecular_weight: calculateMolecularWeight(protein),
              isoelectric_point: calculateIsoelectricPoint(protein),
              start_codon: 'ATG',
              stop_codon: stopCodon
            })
          }
          break
        }
      }
    }
  }

  return orfs
}

function analyzeSequence(sequence: string): AnalysisResults {
  const startTime = Date.now()
  const cleanSeq = sequence.toUpperCase().replace(/[^ATGCN]/g, '')
  
  const frames: FrameData[] = FRAMES.map(frame => {
    const orfs = findORFsInFrame(cleanSeq, frame)
    const longestORF = orfs.length > 0 ? orfs.reduce((a, b) => a.length_nt > b.length_nt ? a : b) : null
    
    return {
      frame,
      orfs,
      longest_orf: longestORF,
      total_orfs: orfs.length
    }
  })

  const allORFs = frames.flatMap(f => f.orfs)
  const longestORF = allORFs.length > 0 ? allORFs.reduce((a, b) => a.length_nt > b.length_nt ? a : b) : null
  const averageLength = allORFs.length > 0 ? Math.round(allORFs.reduce((sum, orf) => sum + orf.length_nt, 0) / allORFs.length) : 0
  const mostActiveFrame = frames.reduce((a, b) => a.total_orfs > b.total_orfs ? a : b).frame

  return {
    sequence: cleanSeq,
    sequence_length: cleanSeq.length,
    frames,
    total_orfs: allORFs.length,
    longest_orf: longestORF,
    average_length: averageLength,
    most_active_frame: mostActiveFrame,
    analysis_duration: Date.now() - startTime,
    timestamp: new Date().toLocaleString()
  }
}

// Supporting Components
function Sidebar() {
  return (
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
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2.5"/>
          </svg>
          <span>ORF Detection</span>
        </div>

        <a href="/crispr-guide-finder" style={{
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
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span>CRISPR Guide Finder</span>
        </a>

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
  )
}

function TopHeader() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '200px',
      right: 0,
      height: '80px',
      background: 'rgba(4, 20, 44, 0.4)',
      borderBottom: '1px solid rgba(0, 207, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '2rem',
      zIndex: 40,
      fontFamily: "'Inter', sans-serif"
    }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        background: 'linear-gradient(to right, #00cfff, #00ffbe)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0
      }}>
        ORF Detection
      </h1>
    </div>
  )
}

function SummaryCard({ title, value, subtitle, icon, color }: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: 'cyan' | 'green' | 'blue' | 'purple'
}) {
  const colorClasses = {
    cyan: { color: '#00cfff', background: 'rgba(0, 207, 255, 0.1)', border: 'rgba(0, 207, 255, 0.3)' },
    green: { color: '#00d4aa', background: 'rgba(0, 212, 170, 0.1)', border: 'rgba(0, 212, 170, 0.3)' },
    blue: { color: '#4f8ef7', background: 'rgba(79, 142, 247, 0.1)', border: 'rgba(79, 142, 247, 0.3)' },
    purple: { color: '#c77dff', background: 'rgba(199, 125, 255, 0.1)', border: 'rgba(199, 125, 255, 0.3)' }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        background: 'rgba(4, 20, 44, 0.6)',
        border: '1px solid rgba(0, 207, 255, 0.15)',
        borderRadius: '12px',
        padding: '1.5rem',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.9rem', color: '#93a4c3', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e6f1ff', marginBottom: '0.25rem' }}>{value}</p>
          <p style={{ fontSize: '0.75rem', color: '#93a4c3' }}>{subtitle}</p>
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: '8px',
          background: colorClasses[color].background,
          border: `1px solid ${colorClasses[color].border}`,
          color: colorClasses[color].color
        }}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

function ORFDetailPanel({ orf, sequence, copyToClipboard }: {
  orf: ORF
  sequence: string
  copyToClipboard: (text: string) => void
}) {
  const getORFSequence = () => {
    return sequence.substring(orf.start - 1, orf.end)
  }

  const formatSequence = (seq: string, chunkSize: number = 10) => {
    return seq.match(new RegExp(`.{1,${chunkSize}}`, 'g'))?.join(' ') || seq
  }

  return (
    <div>
      <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>ORF Details: {orf.id}</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.25rem' }}>Frame</label>
            <div style={{ fontWeight: 'bold', color: '#00cfff' }}>{orf.frame}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.25rem' }}>Position</label>
            <div style={{ fontWeight: 'bold' }}>{orf.start} - {orf.end}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.25rem' }}>Length</label>
            <div style={{ fontWeight: 'bold' }}>{orf.length_nt} bp</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.25rem' }}>Protein Length</label>
            <div style={{ fontWeight: 'bold' }}>{orf.length_aa} aa</div>
          </div>
        </div>

        {/* DNA Sequence */}
        <div>
          <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.5rem' }}>DNA Sequence</label>
          <div style={{
            background: 'rgba(1, 8, 16, 0.8)',
            border: '1px solid rgba(0, 207, 255, 0.1)',
            borderRadius: '8px',
            padding: '0.75rem',
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.8rem',
            color: '#00cfff',
            wordBreak: 'break-all',
            maxHeight: '100px',
            overflowY: 'auto'
          }}>
            {formatSequence(getORFSequence())}
          </div>
          <button
            onClick={() => copyToClipboard(getORFSequence())}
            style={{
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              background: 'rgba(0, 212, 170, 0.1)',
              border: '1px solid rgba(0, 212, 170, 0.3)',
              borderRadius: '4px',
              color: '#00d4aa',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <Copy size={12} />
            Copy DNA
          </button>
        </div>

        {/* Protein Sequence */}
        <div>
          <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.5rem' }}>Protein Sequence</label>
          <div style={{
            background: 'rgba(1, 8, 16, 0.8)',
            border: '1px solid rgba(0, 207, 255, 0.1)',
            borderRadius: '8px',
            padding: '0.75rem',
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.8rem',
            color: '#00ffbe',
            wordBreak: 'break-all',
            maxHeight: '100px',
            overflowY: 'auto'
          }}>
            {orf.protein_sequence.replace('*', '')}
          </div>
          <button
            onClick={() => copyToClipboard(orf.protein_sequence.replace('*', ''))}
            style={{
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              background: 'rgba(0, 212, 170, 0.1)',
              border: '1px solid rgba(0, 212, 170, 0.3)',
              borderRadius: '4px',
              color: '#00d4aa',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <Copy size={12} />
            Copy Protein
          </button>
        </div>

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{
            background: 'rgba(1, 8, 16, 0.5)',
            border: '1px solid rgba(0, 207, 255, 0.15)',
            borderRadius: '8px',
            padding: '0.75rem'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#93a4c3', marginBottom: '0.25rem' }}>GC Content</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e6f1ff' }}>{orf.gc_content}%</p>
          </div>
          <div style={{
            background: 'rgba(1, 8, 16, 0.5)',
            border: '1px solid rgba(0, 207, 255, 0.15)',
            borderRadius: '8px',
            padding: '0.75rem'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#93a4c3', marginBottom: '0.25rem' }}>Molecular Weight</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e6f1ff' }}>{orf.molecular_weight} kDa</p>
          </div>
          <div style={{
            background: 'rgba(1, 8, 16, 0.5)',
            border: '1px solid rgba(0, 207, 255, 0.15)',
            borderRadius: '8px',
            padding: '0.75rem'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#93a4c3', marginBottom: '0.25rem' }}>Isoelectric Point</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e6f1ff' }}>{orf.isoelectric_point}</p>
          </div>
          <div style={{
            background: 'rgba(1, 8, 16, 0.5)',
            border: '1px solid rgba(0, 207, 255, 0.15)',
            borderRadius: '8px',
            padding: '0.75rem'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#93a4c3', marginBottom: '0.25rem' }}>Stop Codon</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ef4444' }}>{orf.stop_codon}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SequenceOverview({ sequence, orf, allORFs }: {
  sequence: string
  orf: ORF
  allORFs: ORF[]
}) {
  const sequenceLength = sequence.length
  const viewportWidth = 800 // SVG viewport width
  
  return (
    <div style={{
      background: 'rgba(4, 20, 44, 0.6)',
      border: '1px solid rgba(0, 207, 255, 0.15)',
      borderRadius: '12px',
      padding: '1.5rem',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h4 style={{ fontWeight: 'bold', color: '#e6f1ff' }}>Sequence Overview</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#00d4aa', borderRadius: '2px' }}></div>
            <span style={{ color: '#93a4c3' }}>Start Codon (ATG)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
            <span style={{ color: '#93a4c3' }}>Stop Codon</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#4f8ef7', borderRadius: '2px' }}></div>
            <span style={{ color: '#93a4c3' }}>ORF Region</span>
          </div>
        </div>
      </div>
      
      <div style={{
        background: 'rgba(1, 8, 16, 0.5)',
        border: '1px solid rgba(0, 207, 255, 0.15)',
        borderRadius: '8px',
        padding: '1rem',
        overflowX: 'auto'
      }}>
        <svg width={viewportWidth} height="80" style={{ width: '100%' }}>
          {/* Background line */}
          <line x1="0" y1="40" x2={viewportWidth} y2="40" stroke="#93a4c3" strokeWidth="2" opacity="0.3" />
          
          {/* ORF regions */}
          {allORFs.map((orfs, index) => {
            const startX = (orfs.start / sequenceLength) * viewportWidth
            const endX = (orfs.end / sequenceLength) * viewportWidth
            const isSelected = orfs.id === orf.id
            
            return (
              <g key={orfs.id}>
                <rect
                  x={startX}
                  y="30"
                  width={endX - startX}
                  height="20"
                  fill={isSelected ? "#00d4aa" : "#4f8ef7"}
                  opacity={isSelected ? "0.8" : "0.4"}
                  rx="2"
                />
                {/* Start codon marker */}
                <circle
                  cx={startX}
                  cy="40"
                  r="3"
                  fill="#00d4aa"
                />
                
                {/* Stop codon marker */}
                <circle
                  cx={endX}
                  cy="40"
                  r="3"
                  fill="#ef4444"
                />
              </g>
            )
          })}
          
          {/* Scale markers */}
          {Array.from({ length: 6 }, (_, i) => {
            const fraction = i / 5
            const x = fraction * viewportWidth
            const position = Math.round(fraction * sequenceLength)
            
            return (
              <g key={fraction}>
                <line x1={x} y1="60" x2={x} y2="65" stroke="#93a4c3" strokeWidth="1" />
                <text x={x} y="75" textAnchor="middle" className="text-xs fill-[#93a4c3]">
                  {position.toLocaleString()}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default function ORFDetectionPage() {
  const [mounted, setMounted] = useState(false)
  const [sequence, setSequence] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [selectedFrame, setSelectedFrame] = useState('+1')
  const [selectedORF, setSelectedORF] = useState<ORF | null>(null)
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    // Auto-load sequence from localStorage if available
    const savedSequence = localStorage.getItem('helixlab_dna_sequence')
    if (savedSequence && savedSequence.length > 0) {
      setSequence(savedSequence)
      handleAnalyze(savedSequence)
    }
  }, [])

  const handleAnalyze = async (inputSequence?: string) => {
    const seqToAnalyze = inputSequence || sequence
    if (!seqToAnalyze.trim()) return

    setIsAnalyzing(true)
    
    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const analysisResults = analyzeSequence(seqToAnalyze)
    setResults(analysisResults)
    
    // Auto-select first frame with ORFs
    const frameWithORFs = analysisResults.frames.find(f => f.total_orfs > 0)
    if (frameWithORFs) {
      setSelectedFrame(frameWithORFs.frame)
      setSelectedORF(frameWithORFs.longest_orf)
    }
    
    setIsAnalyzing(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      let content = e.target?.result as string
      
      // Handle FASTA format
      if (content.startsWith('>')) {
        const lines = content.split('\n')
        content = lines.slice(1).join('').replace(/\s/g, '')
      }
      
      setSequence(content)
    }
    reader.readAsText(file)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleDownloadReport = () => {
    if (!results) return
    
    const allORFs = results.frames.flatMap(f => f.orfs)
    generateORFReport({
      sequence: results.sequence,
      sequence_length: results.sequence_length,
      total_orfs: results.total_orfs,
      longest_orf: results.longest_orf,
      average_length: results.average_length,
      most_active_frame: results.most_active_frame,
      orfs: allORFs,
      timestamp: results.timestamp
    })
  }

  const formatSequence = (seq: string, chunkSize: number = 10) => {
    return seq.match(new RegExp(`.{1,${chunkSize}}`, 'g'))?.join(' ') || seq
  }

  if (!mounted) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1422 100%)',
      color: 'white',
      fontFamily: "'Inter', sans-serif"
    }}>
      <Sidebar />
      <TopHeader />

      <div style={{ marginLeft: '200px', paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Page Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>ORF Detection</h1>
                <p style={{ color: '#93a4c3' }}>Identify open reading frames across all six translation frames.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(0, 212, 170, 0.1)',
                  border: '1px solid rgba(0, 212, 170, 0.3)',
                  borderRadius: '8px',
                  color: '#00d4aa',
                  cursor: 'pointer'
                }}
              >
                New Analysis
              </motion.button>
            </div>

            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(4, 20, 44, 0.6)',
                border: '1px solid rgba(0, 207, 255, 0.15)',
                borderRadius: '12px',
                padding: '1.5rem',
                backdropFilter: 'blur(12px)',
                marginBottom: '2rem'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  onClick={() => setActiveTab('paste')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'paste' ? 'rgba(0, 207, 255, 0.2)' : 'transparent',
                    color: activeTab === 'paste' ? '#00cfff' : '#93a4c3',
                    cursor: 'pointer'
                  }}
                >
                  Paste Sequence
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'upload' ? 'rgba(0, 207, 255, 0.2)' : 'transparent',
                    color: activeTab === 'upload' ? '#00cfff' : '#93a4c3',
                    cursor: 'pointer'
                  }}
                >
                  Upload FASTA
                </button>
              </div>

              {activeTab === 'paste' ? (
                <div>
                  <textarea
                    value={sequence}
                    onChange={(e) => setSequence(e.target.value.toUpperCase())}
                    placeholder="Paste your DNA sequence here (A, T, G, C)..."
                    style={{
                      width: '100%',
                      height: '150px',
                      background: 'rgba(1, 8, 16, 0.8)',
                      border: '1px solid rgba(0, 207, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '1rem',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.8rem',
                      color: 'white',
                      resize: 'none',
                      marginBottom: '1rem'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#93a4c3', marginBottom: '1rem' }}>
                    <span>{sequence.length} characters</span>
                    <span>GC: {sequence.length > 0 ? Math.round(((sequence.match(/[GC]/g) || []).length / sequence.length) * 100) : 0}%</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed rgba(0, 207, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      marginBottom: '1rem'
                    }}
                  >
                    <Upload style={{ margin: '0 auto 1rem', fontSize: '2rem', color: '#00cfff' }} />
                    <p style={{ color: '#93a4c3' }}>Click to upload FASTA file or drag and drop</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".fasta,.fa,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnalyze()}
                  disabled={!sequence.trim() || isAnalyzing}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(120deg, #00cfff, #00ffbe)',
                    color: '#010810',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: sequence.trim() && !isAnalyzing ? 'pointer' : 'not-allowed',
                    opacity: sequence.trim() && !isAnalyzing ? 1 : 0.5
                  }}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Play />
                      <span>Analyze Sequence</span>
                    </>
                  )}
                </motion.button>
                <button
                  onClick={() => setSequence('')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(0, 207, 255, 0.05)',
                    color: '#00cfff',
                    border: '1px solid rgba(0, 207, 255, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>

              {/* Sample Sequence Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => {
                    const sampleSequence = 'ATGAAACGCATTAGCACCACCATTACCACCACCATCACCATTACCACAGGTAACGGTGCGGGCTGACGCGTACAGGAAACACAGAAAAAAGCCCGCACCTGACAGTGCGGGCTTTTTTTTTCGACCAAAGGTAACGAGGTAACAACCATGCGAGTGTTGAAGTTCGGCGGTACATCAGTGGCAAATGCAGAACGTTTTCTGCGTGTTGCCGATATTCTGGAAAGCAATGCCAGGCAGGGGCAGGTGGCCACCGTCCTCTCTGCCCCCGCCAAAATCACCAACCACCTGGTGGCGATGATTGAAAAAACCATTAGCGGCCAGGATGCTTTACCCAATATCAGCGATGCCGAACGTATTTTTGCCGAACTTTTGACGGGACTCGCCGCCGCCCAGCCGGGGTTCCCGCTGGCGCAATTGAAAACTTTCGTCGATCAGGAATTTGCCCAAATAAAACATGTCCTGCATGGCATTAGTTTGTTGGTTCAGTGGTTCGTAGGGCTTTGCCCCGACTGTTTGGCTGCGCTCCCTCGGGCCGTTGCTCGGTGGCGGCTCTGAGGGTGGTGGCTCTGAGGGTGGCGGTTCTGAGGGTGGCGGCTCTGAGGGAGGCGGTTCCGGTGGTGGCTCTGGTTCCGGTGATTTTGATTATGAAAAGATGGCAAACGCTAATAAGGGGGCTATGACCGAAAATGCCGATGAAAACGCGCTACAGTCTGACGCTAAAGGCAAACTTGATTCTGTCGCTACTGATTACGGTGCTGCTATCGATGGTTTCATTGGTGACGTTTCCGGCCTTGCTAATGGTAATGGTGCTACTGGTGATTTTGCTGGCTCTAATTCCCAAATGGCTCAAGTCGGTGACGGTGATAATTCACCTTTAATGAATAATTTCCGTCAATATTTACCTTCCCTCCCTCAATCGGTTGAATGTCGCCCTTTTGTCTTTGGCGCTGGTAAACCATATGAATTTTCTATTGATTGTGACAAAATAAACTTATTCCGTGGTGTCTTTGCGTTTCTTTTATATGTTGCCACCTTTATGTATGTATTTTCTACGTTTGCTAACATACTGCGTAATAAGGAGTCTTAATCATGCCAGTTCTTTTGGGTATTCCGTTATTATTGCGTTTCCTCGGTTTCCTTCTGGTAACTTTGTTCGGCTATCTGCTTACTTTTCTTAAAAAGGGCTTCGGTAAGATAGCTATTGCTATTTCATTGTTTCTTGCTCTTATTATTGGGCTTAACTCAATTCTTGTGGGTTATCTCTCTGATATTAGCGCTCAATTACCCTCTGACTTTGTTCAGGGTGTTCAGTTAATTCTCCCGTCTAATGCGCTTCCCTGTTTTTATGTTATTCTCTCTGTAAAGGCTGCTATTTTCATTTTTGACGTTAAACAAAAAATCGTTTCTTATTTGGATTGGGATAAATAATATGGCTGTTTATTTTGTAACTGGCAAATTAGGCTCTGGAAAGACGCTCGTTAGCGTTGGTAAGATTCAGGATAAAATTGTAGCTGGGTGCAAAATAGCAACTAATCTTGATTTAAGGCTTCAAAACCTCCCGCAAGTCGGGAGGTTCGCTAAAACGCCTCGCGTTCTTAGAATACCGGATAAGCCTTCTATATCTGATTTGCTTGCTATTGGGCGCGGTAATGATTCCTACGATGAAAATAAAAACGGCTTGCTTGTTCTCGATGAGTGCGGTACTTGGTTTAATACCCGTTCTTGGAATGATAAGGAAAGACAGCCGATTATTGATTGGTTTCTACATGCTCGTAAATTAGGATGGGATATTATTTTTCTTGTTCAGGACTTATCTATTGTTGATAAACAGGCGCGTTCTGCATTAGCTGAACATGTTGTTTATTGTCGTCGTCTGGACAGAATTACTTTACCTTTTGTCGGTACTTTATATTCTCTTATTACTGGCTCGAAAATGCCTCTGCCTAAATTACATGTTGGCGTTGTTAAATATGGCGATTCTCAATTAAGCCCTACTGTTGAGCGTTGGCTTTATACTGGTAAGAATTTGTATAACGCATATGATACTAAACAGGCTTTTTCTAGTAATTATGATTCCGGTGTTTATTCTTATTTAACGCCTTATTTATCACACGGTCGGTATTTCAAACCATTAAATTTAGGTCAGAAGATGAAATTAACTAAAATATATTTGAAAAAGTTTTCTCGCGTTCTTTGTCTTGCGATTGGATTTGCATCAGCATTTACATATAGTTATATAACCCAACCTAAGCCGGAGGTTAAAAAGGTAGTCTCTCAGACCTATGATTTTGATAAATTCACTATTGACTCTTCTCAGCGTCTTAATCTAAGCTATCGCTATGTTTTCAAGGATTCTAAGGGAAAATTAATTAATAGCGACGATTTACAGAAGCAAGGTTATTCACTCACATATATTGATTTATGTACTGTTTCCATTAAAAAAGGTAATTCAAATGAAATTGTTAAATGTAATTAATTTTGTTTTCTTGATGTTTGTTTCATCATCTTCTTTTGCTCAGGTAATTGAAATGAATAATTCGCCTCTGCGCGATTTTGTAACTTGGTATTCAAAGCAATCAGGCGAATCCGTTATTGTTTCTCCCGATGTAAAAGGTACTGTTACTGTATATTCATCTGACGTTAAACCTGAAAATCTACGCAATTTCTTTATTTCTGTTTTACGTGCAAATAATTTTGATATGGTAGGTTCTAACCCTTCCATTATTCAGAAGTATAATCCAAACAATCAGGATTATATTGATGAATTGCCATCATCTGATAATCAGGAATATGATGATAATTCCGCTCCTTCTGGTGGTTTCTTTGTTCCGCAAAATGATAATGTTACTCAAACTTTTAAAATTAATAACGTTCGGGCAAAGGATTTAATACGAGTTGTCGAATTGTTTGTAAAGTCTAATACTTCTAAATCCTCAAATGTATTATCTATTGACGGCTCTAATCTATTAGTTGTTAGTGCTCCTAAAGATATTTTAGATAACCTTCCTCAATTCCTTTCAACTGTTGATTTGCCAACTGACCAGATATTGATTGAGGGTTTGATATTTGAGGTTCAGCAAGGTGATGCTTTAGATTTTTCATTTGCTGCTGGCTCTCAGCGTGGCACTGTTGCAGGCGGTGTTAATACTGACCGCCTCACCTCTGTTTTATCTTCTGCTGGTGGTTCGTTCGGTATTTTTAATGGCGATGTTTTAGGGCTATCAGTTCGCGCATTAAAGACTAATAGCCATTCAAAAATATTGTCTGTGCCACGTATTCTTACGCTTTCAGGTCAGAAGGGTTCTATCTCTGTTGGCCAGAATGTCCCTTTTATTACTGGTCGTGTGACTGGTGAATCTGCCAATGTAAATAATCCATTTCAGACGATTGAGCGTCAAAATGTAGGTATTTCCATGAGCGTTTTTCCTGTTAAACAGATGATGACATCCCCGCAATTAACATCTTCAGAGGCTGCTGGTTTCTATAAAGATTCAATCTTCCAACCTTCTTATTCCTTGCTTGGTCAATTTCTTCAAATACGAGGTTTCCAATGATGAGCACTTTTAAAGTTCTGCTATGTGGCGCGGTATTATCCCGTGTTGACGCCGGGCAAGAGCAACTCGGTCGCCGCATACACTATTCTCAGAATGACTTGGTTGAGTACTCACCAGTCACAGAAAAGCATCTTACGGATGGCATGACAGTAAGAGAATTATGCAGTGCTGCCATAACCATGAGTGATAACACTGCGGCCAACTTACTTCTGACAACGATCGGAGGACCGAAGGAGCTAACCGCTTTTTTGCACAACATGGGGGATCATGTAACTCGCCTTGATCGTTGGGAACCGGAGCTGAATGAAGCCATACCAAACGACGAGCGTGACACCACGATGCCTGTAGCAATGGCAACAACGTTGCGCAAACTATTAACTGGCGAACTACTTACTCTAGCTTCCCGGCAACAATTAATAGACTGGATGGAGGCGGATAAAGTTGCAGGACCACTTCTGCGCTCGGCCCTTCCGGCTGGCTGGTTTATTGCTGATAAATCTGGAGCCGGTGAGCGTGGGTCTCGCGGTATCATTGCAGCACTGGGGCCAGATGGTAAGCCCTCCCGTATCGTAGTTATCTACACGACGGGGAGTCAGGCAACTATGGATGAACGAAATAGACAGATCGCTGAGATAGGTGCCTCACTGATTAAGCATTGGTAACTGTCAGACCAAGTTTACTCATATATACTTTAGATTGATTTAAAACTTCATTTTTAATTTAAAAGGATCTAGGTGAAGATCCTTTTTGATAATCTCATGACCAAAATCCCTTAACGTGAGTTTTCGTTCCACTGAGCGTCAGACCCCGTAGAAAAGATCAAAGGATCTTCTTGAGATCCTTTTTTTCTGCGCGTAATCTGCTGCTTGCAAACAAAAAAACCACCGCTACCAGCGGTGGTTTGTTTGCCGGATCAAGAGCTACCAACTCTTTTTCCGAAGGTAACTGGCTTCAGCAGAGCGCAGATACCAAATACTGTCCTTCTAGTGTAGCCGTAGTTAGGCCACCACTTCAAGAACTCTGTAGCACCGCCTACATACCTCGCTCTGCTAATCCTGTTACCAGTGGCTGCTGCCAGTGGCGATAAGTCGTGTCTTACCGGGTTGGACTCAAGACGATAGTTACCGGATAAGGCGCAGCGGTCGGGCTGAACGGGGGGTTCGTGCACACAGCCCAGCTTGGAGCGAACGACCTACACCGAACTGAGATACCTACAGCGTGAGCTATGAGAAAGCGCCACGCTTCCCGAAGGGAGAAAGGCGGACAGGTATCCGGTAAGCGGCAGGGTCGGAACAGGAGAGCGCACGAGGGAGCTTCCAGGGGGAAACGCCTGGTATCTTTATAGTCCTGTCGGGTTTCGCCACCTCTGACTTGAGCGTCGATTTTTGTGATGCTCGTCAGGGGGGCGGAGCCTATGGAAAAACGCCAGCAACGCGGCCTTTTTACGGTTCCTGGCCTTTTGCTGGCCTTTTGCTCACATGTTCTTTCCTGCGTTATCCCCTGATTCTGTGGATAACCGTATTACCGCCTTTGAGTGAGCTGATACCGCTCGCCGCAGCCGAACGACCGAGCGCAGCGAGTCAGTGAGCGAGGAAGCGGAAGAGCGCCCAATACGCAAACCGCCTCTCCCCGCGCGTTGGCCGATTCATTAATGCAGCTGGCACGACAGGTTTCCCGACTGGAAAGCGGGCAGTGAGCGCAACGCAATTAATGTGAGTTAGCTCACTCATTAGGCACCCCAGGCTTTACACTTTATGCTTCCGGCTCGTATGTTGTGTGGAATTGTGAGCGGATAACAATTTCACACAGGAAACAGCTATGACCATGATTACGCCAAGCGCGCAATTAACCCTCACTAAAGGGAACAAAAGCTGGAGCTCCACCGCGGTGGCGGCCGCTCTAGAACTAGTGGATCCCCCGGGCTGCAGGAATTCGATATCAAGCTTATCGATACCGTCGACCTCGAGGGGGGGCCCGGTACCCAGCTTTTGTTCCCTTTAGTGAGGGTTAATTGCGCGCTTGGCGTAATCATGGTCATAGCTGTTTCCTGTGTGAAATTGTTATCCGCTCACAATTCCACACAACATACGAGCCGGAAGCATAAAGTGTAAAGCCTGGGGTGCCTAATGAGTGAGCTAACTCACATTAATTGCGTTGCGCTCACTGCCCGCTTTCCAGTCGGGAAACCTGTCGTGCCAGCTGCATTAATGAATCGGCCAACGCGCGGGGAGAGGCGGTTTGCGTATTGGGCGCTCTTCCGCTTCCTCGCTCACTGACTCGCTGCGCTCGGTCGTTCGGCTGCGGCGAGCGGTATCAGCTCACTCAAAGGCGGTAATACGGTTATCCACAGAATCAGGGGATAACGCAGGAAAGAACATGTGAGCAAAAGGCCAGCAAAAGGCCAGGAACCGTAAAAAGGCCGCGTTGCTGGCGTTTTTCCATAGGCTCCGCCCCCCTGACGAGCATCACAAAAATCGACGCTCAAGTCAGAGGTGGCGAAACCCGACAGGACTATAAAGATACCAGGCGTTTCCCCCTGGAAGCTCCCTCGTGCGCTCTCCTGTTCCGACCCTGCCGCTTACCGGATACCTGTCCGCCTTTCTCCCTTCGGGAAGCGTGGCGCTTTCTCATAGCTCACGCTGTAGGTATCTCAGTTCGGTGTAGGTCGTTCGCTCCAAGCTGGGCTGTGTGCACGAACCCCCCGTTCAGCCCGACCGCTGCGCCTTATCCGGTAACTATCGTCTTGAGTCCAACCCGGTAAGACACGACTTATCGCCACTGGCAGCAGCCACTGGTAACAGGATTAGCAGAGCGAGGTATGTAGGCGGTGCTACAGAGTTCTTGAAGTGGTGGCCTAACTACGGCTACACTAGAAGAACAGTATTTGGTATCTGCGCTCTGCTGAAGCCAGTTACCTTCGGAAAAAGAGTTGGTAGCTCTTGATCCGGCAAACAAACCACCGCTGGTAGCGGTGGTTTTTTTGTTTGCAAGCAGCAGATTACGCGCAGAAAAAAAGGATCTCAAGAAGATCCTTTGATCTTTTCTACGGGGTCTGACGCTCAGTGGAACGAAAACTCACGTTAAGGGATTTTGGTCATGAGATTATCAAAAAGGATCTTCACCTAGATCCTTTTAAATTAAAAATGAAGTTTTAAATCAATCTAAAGTATATATGAGTAAACTTGGTCTGACAGTTACCAATGCTTAATCAGTGAGGCACCTATCTCAGCGATCTGTCTATTTCGTTCATCCATAGTTGCCTGACTCCCCGTCGTGTAGATAACTACGATACGGGAGGGCTTACCATCTGGCCCCAGTGCTGCAATGATACCGCGAGACCCACGCTCACCGGCTCCAGATTTATCAGCAATAAACCAGCCAGCCGGAAGGGCCGAGCGCAGAAGTGGTCCTGCAACTTTATCCGCCTCCATCCAGTCTATTAATTGTTGCCGGGAAGCTAGAGTAAGTAGTTCGCCAGTTAATAGTTTGCGCAACGTTGTTGCCATTGCTACAGGCATCGTGGTGTCACGCTCGTCGTTTGGTATGGCTTCATTCAGCTCCGGTTCCCAACGATCAAGGCGAGTTACATGATCCCCCATGTTGTGCAAAAAAGCGGTTAGCTCCTTCGGTCCTCCGATCGTTGTCAGAAGTAAGTTGGCCGCAGTGTTATCACTCATGGTTATGGCAGCACTGCATAATTCTCTTACTGTCATGCCATCCGTAAGATGCTTTTCTGTGACTGGTGAGTACTCAACCAAGTCATTCTGAGAATAGTGTATGCGGCGACCGAGTTGCTCTTGCCCGGCGTCAACAC'
                    setSequence(sampleSequence)
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(0, 212, 170, 0.1)',
                    border: '1px solid rgba(0, 212, 170, 0.3)',
                    borderRadius: '6px',
                    color: '#00d4aa',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Load Sample Sequence
                </button>
              </div>
            </motion.div>

            {/* Loading State */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(4, 20, 44, 0.6)',
                  border: '1px solid rgba(0, 207, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'rgba(0, 207, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Dna style={{ fontSize: '2rem', color: '#00cfff', animation: 'spin 2s linear infinite' }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Analyzing Sequence</h3>
                  <div style={{ color: '#93a4c3', textAlign: 'center' }}>
                    <p>Parsing DNA sequence...</p>
                    <p>Generating reading frames...</p>
                    <p>Detecting ORFs...</p>
                    <p>Translating proteins...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Section */}
            {results && !isAnalyzing && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  {/* Analysis Status */}
                  <div style={{
                    background: 'rgba(4, 20, 44, 0.6)',
                    border: '1px solid rgba(0, 207, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          background: '#00d4aa',
                          borderRadius: '50%',
                          animation: 'pulse 2s infinite'
                        }}></div>
                        <div>
                          <h3 style={{ fontWeight: 'bold', color: '#e6f1ff', margin: 0 }}>Analysis Complete</h3>
                          <p style={{ fontSize: '0.9rem', color: '#93a4c3', margin: 0 }}>
                            {results.sequence_length.toLocaleString()} bp • {results.analysis_duration}ms • {results.timestamp}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setResults(null)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(0, 212, 170, 0.1)',
                          border: '1px solid rgba(0, 212, 170, 0.3)',
                          borderRadius: '8px',
                          color: '#00d4aa',
                          cursor: 'pointer'
                        }}
                      >
                        New Analysis
                      </button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <SummaryCard
                      title="Total ORFs Found"
                      value={results.total_orfs}
                      subtitle="Across all frames"
                      icon={<Search />}
                      color="cyan"
                    />
                    <SummaryCard
                      title="Longest ORF"
                      value={`${results.longest_orf?.length_nt || 0} bp`}
                      subtitle={results.longest_orf ? `Frame ${results.longest_orf.frame}` : 'None found'}
                      icon={<Dna />}
                      color="green"
                    />
                    <SummaryCard
                      title="Average Length"
                      value={`${results.average_length} bp`}
                      subtitle="Mean ORF size"
                      icon={<File />}
                      color="blue"
                    />
                    <SummaryCard
                      title="Most Active Frame"
                      value={results.most_active_frame}
                      subtitle={`${results.frames.find(f => f.frame === results.most_active_frame)?.total_orfs || 0} ORFs`}
                      icon={<RefreshCw />}
                      color="purple"
                    />
                  </div>

                  {/* Frame Tabs */}
                  <div style={{
                    background: 'rgba(4, 20, 44, 0.6)',
                    border: '1px solid rgba(0, 207, 255, 0.15)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 207, 255, 0.15)' }}>
                      {FRAMES.map(frame => {
                        const frameData = results.frames.find(f => f.frame === frame)
                        return (
                          <button
                            key={frame}
                            onClick={() => {
                              setSelectedFrame(frame)
                              setSelectedORF(frameData?.longest_orf || null)
                            }}
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              textAlign: 'center',
                              border: 'none',
                              background: selectedFrame === frame ? 'rgba(0, 207, 255, 0.2)' : 'transparent',
                              color: selectedFrame === frame ? '#00cfff' : '#93a4c3',
                              borderBottom: selectedFrame === frame ? '2px solid #00cfff' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>{frame}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>{frameData?.total_orfs || 0} ORFs</div>
                          </button>
                        )
                      })}
                    </div>

                    {/* ORF Content */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', padding: '1.5rem' }}>
                      {/* ORF List */}
                      <div>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>ORFs in {selectedFrame} Frame</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                          {results.frames.find(f => f.frame === selectedFrame)?.orfs.length === 0 ? (
                            <p style={{ color: '#93a4c3', textAlign: 'center', padding: '2rem' }}>No ORFs found in this frame</p>
                          ) : (
                            results.frames.find(f => f.frame === selectedFrame)?.orfs.map((orf, index) => (
                              <motion.div
                                key={orf.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedORF(orf)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  background: selectedORF?.id === orf.id ? 'rgba(0, 212, 170, 0.2)' : 'rgba(1, 8, 16, 0.5)',
                                  border: selectedORF?.id === orf.id ? '1px solid rgba(0, 212, 170, 0.5)' : '1px solid rgba(0, 207, 255, 0.1)',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <span style={{ fontWeight: 'bold' }}>ORF #{index + 1}</span>
                                  {orf === results.frames.find(f => f.frame === selectedFrame)?.longest_orf && (
                                    <span style={{
                                      fontSize: '0.75rem',
                                      background: 'rgba(0, 212, 170, 0.2)',
                                      color: '#00d4aa',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '4px'
                                    }}>Longest</span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#93a4c3' }}>
                                  <div>Start: {orf.start} • End: {orf.end}</div>
                                  <div>{orf.length_nt} bp • {orf.length_aa} aa</div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* ORF Details */}
                      <div>
                        {selectedORF ? (
                          <ORFDetailPanel orf={selectedORF} sequence={results.sequence} copyToClipboard={copyToClipboard} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#93a4c3' }}>
                            Select an ORF to view details
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sequence Overview */}
                  {selectedORF && (
                    <SequenceOverview 
                      sequence={results.sequence} 
                      orf={selectedORF} 
                      allORFs={results.frames.find(f => f.frame === selectedFrame)?.orfs || []} 
                    />
                  )}

                  {/* Export Section */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadReport}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(0, 212, 170, 0.1)',
                        border: '1px solid rgba(0, 212, 170, 0.3)',
                        borderRadius: '8px',
                        color: '#00d4aa',
                        cursor: 'pointer'
                      }}
                    >
                      <Download />
                      <span>Download ORF Report (PDF)</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                        cursor: 'pointer'
                      }}
                    >
                      <BookOpen />
                      <span>View Documentation</span>
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Placeholder for empty state */}
            {!results && !isAnalyzing && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#93a4c3' }}>
                <Dna style={{ fontSize: '4rem', margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ready for ORF Analysis</h3>
                <p>Enter a DNA sequence above to detect open reading frames across all six translation frames.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}