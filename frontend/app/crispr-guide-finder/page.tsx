'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Play, RefreshCw, Copy, Download, Search, Dna, File, Lock, User, HelpCircle, BookOpen } from 'lucide-react'
import { generateCRISPRReport } from '../../lib/pdfGenerator'

// CRISPR-specific Types
interface GuideRNA {
  id: string
  sequence: string
  pam_sequence: string
  strand: '+' | '-'
  position: number
  gc_content: number
  cleavage_position: number
  efficiency_score: number
  off_target_risk: 'low' | 'medium' | 'high'
}

interface PAMSite {
  id: string
  sequence: string
  position: number
  strand: '+' | '-'
}

interface CRISPRAnalysisResults {
  sequence: string
  sequence_length: number
  pam_sites: PAMSite[]
  guide_rnas: GuideRNA[]
  total_guides: number
  best_guide: GuideRNA | null
  lowest_off_target: GuideRNA | null
  analysis_duration: number
  timestamp: string
}

// CRISPR Constants
const PAM_MOTIFS = ['AGG', 'TGG', 'CGG', 'GGG'] // SpCas9 NGG PAM sites

// Helper Functions
function reverseComplement(sequence: string): string {
  const complement: Record<string, string> = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G', 'N': 'N' }
  return sequence.split('').reverse().map(base => complement[base] || base).join('')
}

function calculateGCContent(sequence: string): number {
  const gc = (sequence.match(/[GC]/g) || []).length
  return Math.round((gc / sequence.length) * 1000) / 10
}

function calculateEfficiencyScore(guide: string): number {
  // Simplified efficiency scoring based on GC content and sequence features
  const gcContent = calculateGCContent(guide)
  let score = 50 // Base score
  
  // Optimal GC content is 40-60%
  if (gcContent >= 40 && gcContent <= 60) {
    score += 20
  } else {
    score -= Math.abs(gcContent - 50) * 0.5
  }
  
  // Penalize poly-T stretches (problematic for transcription)
  const polyT = guide.match(/T{4,}/g)
  if (polyT) score -= polyT.length * 10
  
  // Bonus for G at position 20 (improves efficiency)
  if (guide[19] === 'G') score += 10
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

function assessOffTargetRisk(guide: string): 'low' | 'medium' | 'high' {
  // Simplified off-target risk assessment
  const gcContent = calculateGCContent(guide)
  
  // High GC content increases off-target risk
  if (gcContent > 70) return 'high'
  if (gcContent > 55) return 'medium'
  return 'low'
}

function findPAMSites(sequence: string): PAMSite[] {
  const sites: PAMSite[] = []
  const cleanSeq = sequence.toUpperCase().replace(/[^ATGCN]/g, '')
  
  // Search forward strand
  for (let i = 0; i < cleanSeq.length - 2; i++) {
    const motif = cleanSeq.substring(i, i + 3)
    if (PAM_MOTIFS.includes(motif)) {
      sites.push({
        id: `pam_${i}_+`,
        sequence: motif,
        position: i,
        strand: '+'
      })
    }
  }
  
  // Search reverse strand
  const revComp = reverseComplement(cleanSeq)
  for (let i = 0; i < revComp.length - 2; i++) {
    const motif = revComp.substring(i, i + 3)
    if (PAM_MOTIFS.includes(motif)) {
      sites.push({
        id: `pam_${cleanSeq.length - i - 3}_-`,
        sequence: motif,
        position: cleanSeq.length - i - 3,
        strand: '-'
      })
    }
  }
  
  return sites
}

function generateGuideRNAs(sequence: string, pamSites: PAMSite[]): GuideRNA[] {
  const guides: GuideRNA[] = []
  const cleanSeq = sequence.toUpperCase().replace(/[^ATGCN]/g, '')
  
  pamSites.forEach(pam => {
    let guideSequence = ''
    let guidePosition = 0
    
    if (pam.strand === '+') {
      // Guide is 20 bp upstream of PAM
      if (pam.position >= 20) {
        guidePosition = pam.position - 20
        guideSequence = cleanSeq.substring(guidePosition, pam.position)
      }
    } else {
      // Guide is 20 bp downstream of PAM (reverse complement)
      if (pam.position + 23 <= cleanSeq.length) {
        guidePosition = pam.position + 3
        const forwardSeq = cleanSeq.substring(guidePosition, guidePosition + 20)
        guideSequence = reverseComplement(forwardSeq)
      }
    }
    
    if (guideSequence.length === 20) {
      const guide: GuideRNA = {
        id: `guide_${guidePosition}_${pam.strand}`,
        sequence: guideSequence,
        pam_sequence: pam.sequence,
        strand: pam.strand,
        position: guidePosition,
        gc_content: calculateGCContent(guideSequence),
        cleavage_position: pam.strand === '+' ? pam.position - 3 : pam.position + 6,
        efficiency_score: calculateEfficiencyScore(guideSequence),
        off_target_risk: assessOffTargetRisk(guideSequence)
      }
      guides.push(guide)
    }
  })
  
  return guides.sort((a, b) => b.efficiency_score - a.efficiency_score)
}

function analyzeCRISPRSequence(sequence: string): CRISPRAnalysisResults {
  const startTime = Date.now()
  const cleanSeq = sequence.toUpperCase().replace(/[^ATGCN]/g, '')
  
  const pamSites = findPAMSites(cleanSeq)
  const guideRNAs = generateGuideRNAs(cleanSeq, pamSites)
  
  const bestGuide = guideRNAs.length > 0 ? guideRNAs[0] : null
  const lowestOffTarget = guideRNAs.length > 0 
    ? guideRNAs.reduce((prev, curr) => {
        const prevRisk = prev.off_target_risk === 'low' ? 0 : prev.off_target_risk === 'medium' ? 1 : 2
        const currRisk = curr.off_target_risk === 'low' ? 0 : curr.off_target_risk === 'medium' ? 1 : 2
        return currRisk < prevRisk ? curr : prev
      })
    : null
  
  return {
    sequence: cleanSeq,
    sequence_length: cleanSeq.length,
    pam_sites: pamSites,
    guide_rnas: guideRNAs,
    total_guides: guideRNAs.length,
    best_guide: bestGuide,
    lowest_off_target: lowestOffTarget,
    analysis_duration: Date.now() - startTime,
    timestamp: new Date().toLocaleString()
  }
}

export default function CRISPRGuideFinderPage() {
  const [mounted, setMounted] = useState(false)
  const [sequence, setSequence] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<CRISPRAnalysisResults | null>(null)
  const [selectedGuide, setSelectedGuide] = useState<GuideRNA | null>(null)
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste')

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
    
    const analysisResults = analyzeCRISPRSequence(seqToAnalyze)
    setResults(analysisResults)
    
    // Auto-select best guide
    if (analysisResults.guide_rnas.length > 0) {
      setSelectedGuide(analysisResults.guide_rnas[0])
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

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Supporting Components
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

  function GuideDetailPanel({ guide, sequence, copyToClipboard }: {
    guide: GuideRNA
    sequence: string
    copyToClipboard: (text: string) => void
  }) {
    const formatSequence = (seq: string, chunkSize: number = 10) => {
      return seq.match(new RegExp(`.{1,${chunkSize}}`, 'g'))?.join(' ') || seq
    }

    return (
      <div>
        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Guide RNA Details: {guide.id}</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.25rem' }}>Strand</label>
              <div style={{ fontWeight: 'bold', color: '#00cfff' }}>{guide.strand}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.25rem' }}>Position</label>
              <div style={{ fontWeight: 'bold' }}>{guide.position}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.25rem' }}>PAM Sequence</label>
              <div style={{ fontWeight: 'bold', color: '#00d4aa' }}>{guide.pam_sequence}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.25rem' }}>Cleavage Position</label>
              <div style={{ fontWeight: 'bold' }}>{guide.cleavage_position}</div>
            </div>
          </div>

          {/* Guide RNA Sequence */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#93a4c3', display: 'block', marginBottom: '0.5rem' }}>Guide RNA Sequence (20 nt)</label>
            <div style={{
              background: 'rgba(1, 8, 16, 0.8)',
              border: '1px solid rgba(0, 207, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.9rem',
              color: '#00cfff',
              wordBreak: 'break-all'
            }}>
              {formatSequence(guide.sequence)}
            </div>
            <button
              onClick={() => copyToClipboard(guide.sequence)}
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
              Copy Guide RNA
            </button>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{
              background: 'rgba(1, 8, 16, 0.5)',
              border: '1px solid rgba(0, 207, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.75rem'
            }}>
              <p style={{ fontSize: '0.75rem', color: '#93a4c3', marginBottom: '0.25rem' }}>GC Content</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e6f1ff' }}>{guide.gc_content}%</p>
            </div>
            <div style={{
              background: 'rgba(1, 8, 16, 0.5)',
              border: '1px solid rgba(0, 207, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.75rem'
            }}>
              <p style={{ fontSize: '0.75rem', color: '#93a4c3', marginBottom: '0.25rem' }}>Efficiency Score</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e6f1ff' }}>{guide.efficiency_score}%</p>
            </div>
            <div style={{
              background: 'rgba(1, 8, 16, 0.5)',
              border: '1px solid rgba(0, 207, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.75rem'
            }}>
              <p style={{ fontSize: '0.75rem', color: '#93a4c3', marginBottom: '0.25rem' }}>Off-Target Risk</p>
              <p style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                color: guide.off_target_risk === 'low' ? '#00d4aa' : 
                       guide.off_target_risk === 'medium' ? '#ffc107' : '#ef4444'
              }}>
                {guide.off_target_risk.toUpperCase()}
              </p>
            </div>
            <div style={{
              background: 'rgba(1, 8, 16, 0.5)',
              border: '1px solid rgba(0, 207, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.75rem'
            }}>
              <p style={{ fontSize: '0.75rem', color: '#93a4c3', marginBottom: '0.25rem' }}>Cut Site</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ef4444' }}>Position {guide.cleavage_position}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function CRISPRSequenceOverview({ sequence, guide, allGuides, pamSites }: {
    sequence: string
    guide: GuideRNA
    allGuides: GuideRNA[]
    pamSites: PAMSite[]
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
          <h4 style={{ fontWeight: 'bold', color: '#e6f1ff' }}>CRISPR Target Map</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#00cfff', borderRadius: '2px' }}></div>
              <span style={{ color: '#93a4c3' }}>Guide RNA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#00d4aa', borderRadius: '2px' }}></div>
              <span style={{ color: '#93a4c3' }}>PAM Site</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
              <span style={{ color: '#93a4c3' }}>Cut Site</span>
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
            
            {/* Guide RNA regions */}
            {allGuides.map((g, index) => {
              const startX = (g.position / sequenceLength) * viewportWidth
              const endX = ((g.position + 20) / sequenceLength) * viewportWidth
              const isSelected = g.id === guide.id
              
              return (
                <g key={g.id}>
                  <rect
                    x={startX}
                    y="30"
                    width={endX - startX}
                    height="20"
                    fill={isSelected ? "#00cfff" : "#4f8ef7"}
                    opacity={isSelected ? "0.8" : "0.4"}
                    rx="2"
                  />
                  
                  {/* Cut site marker */}
                  <circle
                    cx={(g.cleavage_position / sequenceLength) * viewportWidth}
                    cy="40"
                    r="3"
                    fill="#ef4444"
                  />
                </g>
              )
            })}
            
            {/* PAM sites */}
            {pamSites.map((pam, index) => (
              <circle
                key={pam.id}
                cx={(pam.position / sequenceLength) * viewportWidth}
                cy="40"
                r="2"
                fill="#00d4aa"
              />
            ))}
            
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
          CRISPR Guide Finder
        </h1>
      </div>
    )
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>CRISPR Guide Finder</h1>
                <p style={{ color: '#93a4c3' }}>Design optimal guide RNAs for CRISPR-Cas9 gene editing.</p>
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
                      <span>Finding Guides...</span>
                    </>
                  ) : (
                    <>
                      <Play />
                      <span>Find CRISPR Guides</span>
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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00cfff" strokeWidth="2" style={{ animation: 'spin 2s linear infinite' }}>
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Finding CRISPR Guides</h3>
                  <div style={{ color: '#93a4c3', textAlign: 'center' }}>
                    <p>Parsing DNA sequence...</p>
                    <p>Detecting PAM sites...</p>
                    <p>Generating guide RNAs...</p>
                    <p>Calculating efficiency scores...</p>
                    <p>Checking off-target risks...</p>
                    <p>Finalizing analysis...</p>
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
                          <h3 style={{ fontWeight: 'bold', color: '#e6f1ff', margin: 0 }}>CRISPR Analysis Complete</h3>
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
                      title="Total Guides Found"
                      value={results.total_guides}
                      subtitle="Across both strands"
                      icon={<Search />}
                      color="cyan"
                    />
                    <SummaryCard
                      title="Best Efficiency"
                      value={`${results.best_guide?.efficiency_score || 0}%`}
                      subtitle={results.best_guide ? `Guide ${results.best_guide.id}` : 'None found'}
                      icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>}
                      color="green"
                    />
                    <SummaryCard
                      title="Lowest Off-Target"
                      value={results.lowest_off_target?.off_target_risk || 'N/A'}
                      subtitle={results.lowest_off_target ? `Guide ${results.lowest_off_target.id}` : 'None found'}
                      icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2.5"/>
                      </svg>}
                      color="blue"
                    />
                    <SummaryCard
                      title="Total PAM Sites"
                      value={results.pam_sites.length}
                      subtitle="NGG motifs detected"
                      icon={<Dna />}
                      color="purple"
                    />
                  </div>

                  {/* Guide RNA Table and Details */}
                  <div style={{
                    background: 'rgba(4, 20, 44, 0.6)',
                    border: '1px solid rgba(0, 207, 255, 0.15)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0, 207, 255, 0.15)' }}>
                      <h4 style={{ fontWeight: 'bold', color: '#e6f1ff', margin: 0 }}>Guide RNA Analysis</h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', padding: '1.5rem' }}>
                      {/* Guide RNA List */}
                      <div>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Guide RNAs ({results.guide_rnas.length})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                          {results.guide_rnas.length === 0 ? (
                            <p style={{ color: '#93a4c3', textAlign: 'center', padding: '2rem' }}>No guide RNAs found</p>
                          ) : (
                            results.guide_rnas.map((guide, index) => (
                              <motion.div
                                key={guide.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedGuide(guide)}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  background: selectedGuide?.id === guide.id ? 'rgba(0, 212, 170, 0.2)' : 'rgba(1, 8, 16, 0.5)',
                                  border: selectedGuide?.id === guide.id ? '1px solid rgba(0, 212, 170, 0.5)' : '1px solid rgba(0, 207, 255, 0.1)',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <span style={{ fontWeight: 'bold' }}>Guide #{index + 1}</span>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {guide === results.best_guide && (
                                      <span style={{
                                        fontSize: '0.75rem',
                                        background: 'rgba(0, 212, 170, 0.2)',
                                        color: '#00d4aa',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px'
                                      }}>Best</span>
                                    )}
                                    <span style={{
                                      fontSize: '0.75rem',
                                      background: guide.off_target_risk === 'low' ? 'rgba(0, 212, 170, 0.2)' : 
                                                 guide.off_target_risk === 'medium' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                                      color: guide.off_target_risk === 'low' ? '#00d4aa' : 
                                             guide.off_target_risk === 'medium' ? '#ffc107' : '#dc3545',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '4px'
                                    }}>
                                      {guide.off_target_risk}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#93a4c3' }}>
                                  <div>Strand: {guide.strand} • Position: {guide.position}</div>
                                  <div>Efficiency: {guide.efficiency_score}% • GC: {guide.gc_content}%</div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Guide Details */}
                      <div>
                        {selectedGuide ? (
                          <GuideDetailPanel guide={selectedGuide} sequence={results.sequence} copyToClipboard={copyToClipboard} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#93a4c3' }}>
                            Select a guide RNA to view details
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sequence Overview */}
                  {selectedGuide && (
                    <CRISPRSequenceOverview 
                      sequence={results.sequence} 
                      guide={selectedGuide} 
                      allGuides={results.guide_rnas}
                      pamSites={results.pam_sites}
                    />
                  )}

                  {/* Export Section */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!results) return
                        generateCRISPRReport({
                          sequence: results.sequence,
                          sequence_length: results.sequence_length,
                          total_guides: results.total_guides,
                          best_guide: results.best_guide,
                          lowest_off_target: results.lowest_off_target,
                          pam_sites: results.pam_sites,
                          guide_rnas: results.guide_rnas,
                          timestamp: results.timestamp
                        })
                      }}
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
                      <span>Download CRISPR Report (PDF)</span>
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
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ready for CRISPR Analysis</h3>
                <p>Enter a DNA sequence above to find optimal guide RNAs for CRISPR-Cas9 gene editing.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}