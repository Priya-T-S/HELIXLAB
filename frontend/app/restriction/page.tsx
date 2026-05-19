'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Play, RefreshCw, Copy, Download, Search, Dna, File, Lock, User, HelpCircle, Scissors, BookOpen } from 'lucide-react'
import { generateRestrictionReport } from '../../lib/pdfGenerator'

// Types
interface RestrictionSite {
  id: string
  enzyme: string
  recognition_sequence: string
  cut_position: number
  start_position: number
  end_position: number
  end_type: 'sticky' | 'blunt'
  overhang: string
}

interface RestrictionEnzyme {
  name: string
  recognition_sequence: string
  cut_offset: number
  end_type: 'sticky' | 'blunt'
  overhang_5: string
  overhang_3: string
}

interface Fragment {
  id: string
  start: number
  end: number
  length: number
  sequence: string
}

interface AnalysisResults {
  sequence: string
  sequence_length: number
  restriction_sites: RestrictionSite[]
  fragments: Fragment[]
  total_sites: number
  total_fragments: number
  largest_fragment: Fragment | null
  smallest_fragment: Fragment | null
  most_active_enzyme: string
  analysis_duration: number
  timestamp: string
}

// Restriction Enzyme Database
const RESTRICTION_ENZYMES: RestrictionEnzyme[] = [
  { name: 'EcoRI', recognition_sequence: 'GAATTC', cut_offset: 1, end_type: 'sticky', overhang_5: 'G', overhang_3: 'AATTC' },
  { name: 'BamHI', recognition_sequence: 'GGATCC', cut_offset: 1, end_type: 'sticky', overhang_5: 'G', overhang_3: 'GATCC' },
  { name: 'HindIII', recognition_sequence: 'AAGCTT', cut_offset: 1, end_type: 'sticky', overhang_5: 'A', overhang_3: 'AGCTT' },
  { name: 'NotI', recognition_sequence: 'GCGGCCGC', cut_offset: 2, end_type: 'sticky', overhang_5: 'GC', overhang_3: 'GGCCGC' },
  { name: 'XhoI', recognition_sequence: 'CTCGAG', cut_offset: 1, end_type: 'sticky', overhang_5: 'C', overhang_3: 'TCGAG' },
  { name: 'PstI', recognition_sequence: 'CTGCAG', cut_offset: 5, end_type: 'sticky', overhang_5: 'CTGCA', overhang_3: 'G' },
  { name: 'SmaI', recognition_sequence: 'CCCGGG', cut_offset: 3, end_type: 'blunt', overhang_5: '', overhang_3: '' },
  { name: 'NdeI', recognition_sequence: 'CATATG', cut_offset: 2, end_type: 'sticky', overhang_5: 'CA', overhang_3: 'TATG' },
  { name: 'SalI', recognition_sequence: 'GTCGAC', cut_offset: 1, end_type: 'sticky', overhang_5: 'G', overhang_3: 'TCGAC' },
  { name: 'KpnI', recognition_sequence: 'GGTACC', cut_offset: 5, end_type: 'sticky', overhang_5: 'GGTAC', overhang_3: 'C' },
  { name: 'SacI', recognition_sequence: 'GAGCTC', cut_offset: 5, end_type: 'sticky', overhang_5: 'GAGCT', overhang_3: 'C' },
  { name: 'XbaI', recognition_sequence: 'TCTAGA', cut_offset: 1, end_type: 'sticky', overhang_5: 'T', overhang_3: 'CTAGA' }
]

// Helper Functions
function findRestrictionSites(sequence: string, selectedEnzymes: string[] = []): RestrictionSite[] {
  const sites: RestrictionSite[] = []
  const enzymesToUse = selectedEnzymes.length > 0 
    ? RESTRICTION_ENZYMES.filter(e => selectedEnzymes.includes(e.name))
    : RESTRICTION_ENZYMES

  enzymesToUse.forEach(enzyme => {
    const pattern = enzyme.recognition_sequence
    let index = 0
    
    while ((index = sequence.indexOf(pattern, index)) !== -1) {
      const cutPosition = index + enzyme.cut_offset
      
      sites.push({
        id: `${enzyme.name}_${index}`,
        enzyme: enzyme.name,
        recognition_sequence: pattern,
        cut_position: cutPosition,
        start_position: index,
        end_position: index + pattern.length - 1,
        end_type: enzyme.end_type,
        overhang: enzyme.end_type === 'sticky' ? `${enzyme.overhang_5}|${enzyme.overhang_3}` : 'blunt'
      })
      
      index++
    }
  })

  return sites.sort((a, b) => a.cut_position - b.cut_position)
}

function generateFragments(sequence: string, sites: RestrictionSite[]): Fragment[] {
  if (sites.length === 0) {
    return [{
      id: 'fragment_1',
      start: 0,
      end: sequence.length - 1,
      length: sequence.length,
      sequence: sequence
    }]
  }

  const fragments: Fragment[] = []
  const cutPositions = [0, ...sites.map(site => site.cut_position), sequence.length]
  
  for (let i = 0; i < cutPositions.length - 1; i++) {
    const start = cutPositions[i]
    const end = cutPositions[i + 1]
    const fragmentSequence = sequence.substring(start, end)
    
    fragments.push({
      id: `fragment_${i + 1}`,
      start,
      end: end - 1,
      length: end - start,
      sequence: fragmentSequence
    })
  }

  return fragments
}

function analyzeRestrictionMapping(sequence: string, selectedEnzymes: string[] = []): AnalysisResults {
  const startTime = Date.now()
  const cleanSeq = sequence.toUpperCase().replace(/[^ATGCN]/g, '')
  
  const sites = findRestrictionSites(cleanSeq, selectedEnzymes)
  const fragments = generateFragments(cleanSeq, sites)
  
  const largestFragment = fragments.length > 0 ? fragments.reduce((a, b) => a.length > b.length ? a : b) : null
  const smallestFragment = fragments.length > 0 ? fragments.reduce((a, b) => a.length < b.length ? a : b) : null
  
  // Find most active enzyme
  const enzymeCount: Record<string, number> = {}
  sites.forEach(site => {
    enzymeCount[site.enzyme] = (enzymeCount[site.enzyme] || 0) + 1
  })
  const mostActiveEnzyme = Object.keys(enzymeCount).reduce((a, b) => 
    enzymeCount[a] > enzymeCount[b] ? a : b, Object.keys(enzymeCount)[0] || 'None'
  )

  return {
    sequence: cleanSeq,
    sequence_length: cleanSeq.length,
    restriction_sites: sites,
    fragments,
    total_sites: sites.length,
    total_fragments: fragments.length,
    largest_fragment: largestFragment,
    smallest_fragment: smallestFragment,
    most_active_enzyme: mostActiveEnzyme,
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
          background: 'rgba(0, 207, 255, 0.1)',
          border: '1px solid rgba(0, 207, 255, 0.4)',
          borderRadius: '8px',
          color: '#00cfff',
          fontSize: '0.8rem',
          fontWeight: 600,
          textDecoration: 'none'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <span>Restriction Mapping</span>
        </a>

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
        Restriction Mapping
      </h1>
    </div>
  )
}

export default function RestrictionMappingPage() {
  const [mounted, setMounted] = useState(false)
  const [sequence, setSequence] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [selectedEnzymes, setSelectedEnzymes] = useState<string[]>([])
  const [selectedSite, setSelectedSite] = useState<RestrictionSite | null>(null)
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    // Auto-load sequence from localStorage if available
    const savedSequence = localStorage.getItem('helixlab_dna_sequence')
    if (savedSequence && savedSequence.length > 0) {
      setSequence(savedSequence)
      // Auto-analyze the sequence like ORF page does
      handleAnalyze(savedSequence)
    }
  }, [])

  const handleAnalyze = async (inputSequence?: string) => {
    const seqToAnalyze = inputSequence || sequence
    if (!seqToAnalyze.trim()) return

    setIsAnalyzing(true)
    
    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const analysisResults = analyzeRestrictionMapping(seqToAnalyze, selectedEnzymes)
    setResults(analysisResults)
    
    // Auto-select first restriction site
    if (analysisResults.restriction_sites.length > 0) {
      setSelectedSite(analysisResults.restriction_sites[0])
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
    
    generateRestrictionReport({
      sequence: results.sequence,
      sequence_length: results.sequence_length,
      restriction_sites: results.restriction_sites,
      fragments: results.fragments,
      total_sites: results.total_sites,
      total_fragments: results.total_fragments,
      largest_fragment: results.largest_fragment,
      smallest_fragment: results.smallest_fragment,
      most_active_enzyme: results.most_active_enzyme,
      timestamp: results.timestamp
    })
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
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Restriction Mapping</h1>
                <p style={{ color: '#93a4c3' }}>Identify restriction enzyme cut sites and simulate DNA digestion.</p>
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
                      <Scissors />
                      <span>Analyze Restriction Sites</span>
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
                    const sampleSequence = 'GAATTCGGATCCAAGCTTGCGGCCGCCTCGAGCTGCAGCCCGGGATATCGTCGACGGTACCGAGCTCTCTAGATGCATGCAAGCTTGGCGTAATCATGGTCATAGCTGTTTCCTGTGTGAAATTGTTATCCGCTCACAATTCCACACAACATACGAGCCGGAAGCATAAAGTGTAAAGCCTGGGGTGCCTAATGAGTGAGCTAACTCACATTAATTGCGTTGCGCTCACTGCCCGCTTTCCAGTCGGGAAACCTGTCGTGCCAGCTGCATTAATGAATCGGCCAACGCGCGGGGAGAGGCGGTTTGCGTATTGGGCGCTCTTCCGCTTCCTCGCTCACTGACTCGCTGCGCTCGGTCGTTCGGCTGCGGCGAGCGGTATCAGCTCACTCAAAGGCGGTAATACGGTTATCCACAGAATCAGGGGATAACGCAGGAAAGAACATGTGAGCAAAAGGCCAGCAAAAGGCCAGGAACCGTAAAAAGGCCGCGTTGCTGGCGTTTTTCCATAGGCTCCGCCCCCCTGACGAGCATCACAAAAATCGACGCTCAAGTCAGAGGTGGCGAAACCCGACAGGACTATAAAGATACCAGGCGTTTCCCCCTGGAAGCTCCCTCGTGCGCTCTCCTGTTCCGACCCTGCCGCTTACCGGATACCTGTCCGCCTTTCTCCCTTCGGGAAGCGTGGCGCTTTCTCATAGCTCACGCTGTAGGTATCTCAGTTCGGTGTAGGTCGTTCGCTCCAAGCTGGGCTGTGTGCACGAACCCCCCGTTCAGCCCGACCGCTGCGCCTTATCCGGTAACTATCGTCTTGAGTCCAACCCGGTAAGACACGACTTATCGCCACTGGCAGCAGCCACTGGTAACAGGATTAGCAGAGCGAGGTATGTAGGCGGTGCTACAGAGTTCTTGAAGTGGTGGCCTAACTACGGCTACACTAGAAGAACAGTATTTGGTATCTGCGCTCTGCTGAAGCCAGTTACCTTCGGAAAAAGAGTTGGTAGCTCTTGATCCGGCAAACAAACCACCGCTGGTAGCGGTGGTTTTTTTGTTTGCAAGCAGCAGATTACGCGCAGAAAAAAAGGATCTCAAGAAGATCCTTTGATCTTTTCTACGGGGTCTGACGCTCAGTGGAACGAAAACTCACGTTAAGGGATTTTGGTCATGAGATTATCAAAAAGGATCTTCACCTAGATCCTTTTAAATTAAAAATGAAGTTTTAAATCAATCTAAAGTATATATGAGTAAACTTGGTCTGACAGTTACCAATGCTTAATCAGTGAGGCACCTATCTCAGCGATCTGTCTATTTCGTTCATCCATAGTTGCCTGACTCCCCGTCGTGTAGATAACTACGATACGGGAGGGCTTACCATCTGGCCCCAGTGCTGCAATGATACCGCGAGACCCACGCTCACCGGCTCCAGATTTATCAGCAATAAACCAGCCAGCCGGAAGGGCCGAGCGCAGAAGTGGTCCTGCAACTTTATCCGCCTCCATCCAGTCTATTAATTGTTGCCGGGAAGCTAGAGTAAGTAGTTCGCCAGTTAATAGTTTGCGCAACGTTGTTGCCATTGCTACAGGCATCGTGGTGTCACGCTCGTCGTTTGGTATGGCTTCATTCAGCTCCGGTTCCCAACGATCAAGGCGAGTTACATGATCCCCCATGTTGTGCAAAAAAGCGGTTAGCTCCTTCGGTCCTCCGATCGTTGTCAGAAGTAAGTTGGCCGCAGTGTTATCACTCATGGTTATGGCAGCACTGCATAATTCTCTTACTGTCATGCCATCCGTAAGATGCTTTTCTGTGACTGGTGAGTACTCAACCAAGTCATTCTGAGAATAGTGTATGCGGCGACCGAGTTGCTCTTGCCCGGCGTCAACAC'
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
                  Load Sample Plasmid Sequence
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
                    <Scissors style={{ fontSize: '2rem', color: '#00cfff', animation: 'spin 2s linear infinite' }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Analyzing Restriction Sites</h3>
                  <div style={{ color: '#93a4c3', textAlign: 'center' }}>
                    <p>Parsing DNA sequence...</p>
                    <p>Loading enzyme database...</p>
                    <p>Scanning recognition sites...</p>
                    <p>Simulating digestion...</p>
                    <p>Generating fragments...</p>
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
                            {results.sequence_length.toLocaleString()} bp • {RESTRICTION_ENZYMES.length} enzymes scanned • {results.analysis_duration}ms
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
                      title="Total Restriction Sites"
                      value={results.total_sites}
                      subtitle="Across all enzymes"
                      icon={<Scissors />}
                      color="cyan"
                    />
                    <SummaryCard
                      title="Total Fragments"
                      value={results.total_fragments}
                      subtitle="After digestion"
                      icon={<Dna />}
                      color="green"
                    />
                    <SummaryCard
                      title="Largest Fragment"
                      value={`${results.largest_fragment?.length || 0} bp`}
                      subtitle={results.largest_fragment ? `Position ${results.largest_fragment.start}-${results.largest_fragment.end}` : 'None'}
                      icon={<File />}
                      color="blue"
                    />
                    <SummaryCard
                      title="Most Active Enzyme"
                      value={results.most_active_enzyme}
                      subtitle={`${results.restriction_sites.filter(s => s.enzyme === results.most_active_enzyme).length} sites`}
                      icon={<Search />}
                      color="purple"
                    />
                  </div>

                  {/* Restriction Sites Table */}
                  <div style={{
                    background: 'rgba(4, 20, 44, 0.6)',
                    border: '1px solid rgba(0, 207, 255, 0.15)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0, 207, 255, 0.15)' }}>
                      <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Restriction Sites Found</h4>
                      <p style={{ fontSize: '0.9rem', color: '#93a4c3' }}>Click on a site to view details</p>
                    </div>
                    
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {results.restriction_sites.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#93a4c3' }}>
                          <Scissors style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
                          <p>No restriction sites detected in this sequence.</p>
                          <p style={{ fontSize: '0.8rem' }}>Try a different sequence or check for common restriction sites.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
                          {results.restriction_sites.map((site, index) => (
                            <motion.div
                              key={site.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setSelectedSite(site)}
                              style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: selectedSite?.id === site.id ? 'rgba(0, 212, 170, 0.2)' : 'rgba(1, 8, 16, 0.5)',
                                border: selectedSite?.id === site.id ? '1px solid rgba(0, 212, 170, 0.5)' : '1px solid rgba(0, 207, 255, 0.1)',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div>
                                    <span style={{ fontWeight: 'bold', color: '#00cfff' }}>{site.enzyme}</span>
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#93a4c3' }}>
                                      {site.recognition_sequence}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#93a4c3' }}>
                                    Position: {site.cut_position}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{
                                    fontSize: '0.7rem',
                                    background: site.end_type === 'sticky' ? 'rgba(0, 212, 170, 0.2)' : 'rgba(79, 142, 247, 0.2)',
                                    color: site.end_type === 'sticky' ? '#00d4aa' : '#4f8ef7',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px'
                                  }}>
                                    {site.end_type}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

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
                      <span>Download Restriction Report (PDF)</span>
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
                <Scissors style={{ fontSize: '4rem', margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ready for Restriction Analysis</h3>
                <p>Enter a DNA sequence above to identify restriction enzyme cut sites and simulate digestion.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}