'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Play, RefreshCw, Copy, Download, Search, Dna, HelpCircle, BookOpen } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { generateCodonReport } from '../../lib/pdfGenerator'

// ─── CODON TABLES ────────────────────────────────────────────────────────────

const CODON_TABLE: Record<string, string> = {
  'TTT':'F','TTC':'F','TTA':'L','TTG':'L',
  'CTT':'L','CTC':'L','CTA':'L','CTG':'L',
  'ATT':'I','ATC':'I','ATA':'I','ATG':'M',
  'GTT':'V','GTC':'V','GTA':'V','GTG':'V',
  'TCT':'S','TCC':'S','TCA':'S','TCG':'S',
  'CCT':'P','CCC':'P','CCA':'P','CCG':'P',
  'ACT':'T','ACC':'T','ACA':'T','ACG':'T',
  'GCT':'A','GCC':'A','GCA':'A','GCG':'A',
  'TAT':'Y','TAC':'Y','TAA':'*','TAG':'*',
  'CAT':'H','CAC':'H','CAA':'Q','CAG':'Q',
  'AAT':'N','AAC':'N','AAA':'K','AAG':'K',
  'GAT':'D','GAC':'D','GAA':'E','GAG':'E',
  'TGT':'C','TGC':'C','TGA':'*','TGG':'W',
  'CGT':'R','CGC':'R','CGA':'R','CGG':'R',
  'AGT':'S','AGC':'S','AGA':'R','AGG':'R',
  'GGT':'G','GGC':'G','GGA':'G','GGG':'G',
}

// Preferred codons per organism (codon bias tables)
const ORGANISM_CODON_PREFERENCE: Record<string, Record<string, string>> = {
  ecoli: {
    'F':'TTT','L':'CTG','I':'ATT','M':'ATG','V':'GTG','S':'AGC','P':'CCG','T':'ACC',
    'A':'GCG','Y':'TAT','H':'CAT','Q':'CAG','N':'AAC','K':'AAA','D':'GAT','E':'GAA',
    'C':'TGC','W':'TGG','R':'CGT','G':'GGC',
  },
  human: {
    'F':'TTC','L':'CTG','I':'ATC','M':'ATG','V':'GTG','S':'AGC','P':'CCC','T':'ACC',
    'A':'GCC','Y':'TAC','H':'CAC','Q':'CAG','N':'AAC','K':'AAG','D':'GAC','E':'GAG',
    'C':'TGC','W':'TGG','R':'AGG','G':'GGC',
  },
  yeast: {
    'F':'TTC','L':'TTG','I':'ATC','M':'ATG','V':'GTT','S':'TCT','P':'CCA','T':'ACA',
    'A':'GCT','Y':'TAC','H':'CAC','Q':'CAA','N':'AAC','K':'AAG','D':'GAT','E':'GAA',
    'C':'TGT','W':'TGG','R':'AGA','G':'GGT',
  },
  bacillus: {
    'F':'TTT','L':'TTG','I':'ATT','M':'ATG','V':'GTT','S':'TCT','P':'CCA','T':'ACA',
    'A':'GCA','Y':'TAT','H':'CAT','Q':'CAA','N':'AAT','K':'AAA','D':'GAT','E':'GAA',
    'C':'TGT','W':'TGG','R':'CGT','G':'GGT',
  },
  mouse: {
    'F':'TTC','L':'CTG','I':'ATC','M':'ATG','V':'GTG','S':'AGC','P':'CCC','T':'ACC',
    'A':'GCC','Y':'TAC','H':'CAC','Q':'CAG','N':'AAC','K':'AAG','D':'GAC','E':'GAG',
    'C':'TGC','W':'TGG','R':'AGG','G':'GGC',
  },
}

// Codon frequencies (relative usage 0-1) per organism
const CODON_FREQUENCY: Record<string, Record<string, number>> = {
  ecoli: {
    'TTT':0.58,'TTC':0.42,'TTA':0.14,'TTG':0.13,'CTT':0.12,'CTC':0.10,'CTA':0.04,'CTG':0.47,
    'ATT':0.51,'ATC':0.39,'ATA':0.10,'ATG':1.00,'GTT':0.28,'GTC':0.20,'GTA':0.17,'GTG':0.35,
    'TCT':0.17,'TCC':0.15,'TCA':0.14,'TCG':0.14,'CCT':0.18,'CCC':0.13,'CCA':0.20,'CCG':0.49,
    'ACT':0.19,'ACC':0.40,'ACA':0.17,'ACG':0.25,'GCT':0.18,'GCC':0.26,'GCA':0.23,'GCG':0.33,
    'TAT':0.59,'TAC':0.41,'TAA':0.61,'TAG':0.09,'CAT':0.57,'CAC':0.43,'CAA':0.34,'CAG':0.66,
    'AAT':0.49,'AAC':0.51,'AAA':0.74,'AAG':0.26,'GAT':0.63,'GAC':0.37,'GAA':0.68,'GAG':0.32,
    'TGT':0.46,'TGC':0.54,'TGA':0.30,'TGG':1.00,'CGT':0.36,'CGC':0.36,'CGA':0.07,'CGG':0.11,
    'AGT':0.16,'AGC':0.25,'AGA':0.07,'AGG':0.04,'GGT':0.35,'GGC':0.37,'GGA':0.13,'GGG':0.15,
  },
  human: {
    'TTT':0.45,'TTC':0.55,'TTA':0.07,'TTG':0.13,'CTT':0.13,'CTC':0.20,'CTA':0.07,'CTG':0.40,
    'ATT':0.36,'ATC':0.47,'ATA':0.17,'ATG':1.00,'GTT':0.18,'GTC':0.24,'GTA':0.11,'GTG':0.47,
    'TCT':0.15,'TCC':0.22,'TCA':0.15,'TCG':0.06,'CCT':0.28,'CCC':0.33,'CCA':0.27,'CCG':0.11,
    'ACT':0.25,'ACC':0.36,'ACA':0.28,'ACG':0.12,'GCT':0.26,'GCC':0.40,'GCA':0.23,'GCG':0.11,
    'TAT':0.43,'TAC':0.57,'TAA':0.28,'TAG':0.20,'CAT':0.41,'CAC':0.59,'CAA':0.25,'CAG':0.75,
    'AAT':0.46,'AAC':0.54,'AAA':0.42,'AAG':0.58,'GAT':0.46,'GAC':0.54,'GAA':0.42,'GAG':0.58,
    'TGT':0.45,'TGC':0.55,'TGA':0.52,'TGG':1.00,'CGT':0.08,'CGC':0.19,'CGA':0.11,'CGG':0.21,
    'AGT':0.15,'AGC':0.24,'AGA':0.20,'AGG':0.20,'GGT':0.16,'GGC':0.34,'GGA':0.25,'GGG':0.25,
  },
  yeast: {
    'TTT':0.59,'TTC':0.41,'TTA':0.28,'TTG':0.29,'CTT':0.13,'CTC':0.06,'CTA':0.14,'CTG':0.11,
    'ATT':0.46,'ATC':0.26,'ATA':0.27,'ATG':1.00,'GTT':0.39,'GTC':0.21,'GTA':0.21,'GTG':0.19,
    'TCT':0.26,'TCC':0.16,'TCA':0.21,'TCG':0.10,'CCT':0.31,'CCC':0.15,'CCA':0.42,'CCG':0.12,
    'ACT':0.35,'ACC':0.22,'ACA':0.30,'ACG':0.14,'GCT':0.38,'GCC':0.22,'GCA':0.29,'GCG':0.11,
    'TAT':0.56,'TAC':0.44,'TAA':0.47,'TAG':0.23,'CAT':0.64,'CAC':0.36,'CAA':0.69,'CAG':0.31,
    'AAT':0.59,'AAC':0.41,'AAA':0.58,'AAG':0.42,'GAT':0.65,'GAC':0.35,'GAA':0.70,'GAG':0.30,
    'TGT':0.63,'TGC':0.37,'TGA':0.30,'TGG':1.00,'CGT':0.14,'CGC':0.06,'CGA':0.07,'CGG':0.04,
    'AGT':0.16,'AGC':0.11,'AGA':0.48,'AGG':0.21,'GGT':0.47,'GGC':0.19,'GGA':0.22,'GGG':0.12,
  },
  bacillus: {
    'TTT':0.60,'TTC':0.40,'TTA':0.20,'TTG':0.25,'CTT':0.18,'CTC':0.10,'CTA':0.08,'CTG':0.19,
    'ATT':0.55,'ATC':0.28,'ATA':0.17,'ATG':1.00,'GTT':0.40,'GTC':0.18,'GTA':0.22,'GTG':0.20,
    'TCT':0.22,'TCC':0.14,'TCA':0.22,'TCG':0.12,'CCT':0.25,'CCC':0.12,'CCA':0.38,'CCG':0.25,
    'ACT':0.30,'ACC':0.22,'ACA':0.30,'ACG':0.18,'GCT':0.30,'GCC':0.20,'GCA':0.32,'GCG':0.18,
    'TAT':0.62,'TAC':0.38,'TAA':0.55,'TAG':0.15,'CAT':0.60,'CAC':0.40,'CAA':0.65,'CAG':0.35,
    'AAT':0.60,'AAC':0.40,'AAA':0.65,'AAG':0.35,'GAT':0.65,'GAC':0.35,'GAA':0.65,'GAG':0.35,
    'TGT':0.55,'TGC':0.45,'TGA':0.25,'TGG':1.00,'CGT':0.30,'CGC':0.18,'CGA':0.12,'CGG':0.10,
    'AGT':0.18,'AGC':0.16,'AGA':0.12,'AGG':0.08,'GGT':0.40,'GGC':0.22,'GGA':0.22,'GGG':0.16,
  },
  mouse: {
    'TTT':0.44,'TTC':0.56,'TTA':0.07,'TTG':0.13,'CTT':0.13,'CTC':0.20,'CTA':0.07,'CTG':0.40,
    'ATT':0.35,'ATC':0.48,'ATA':0.17,'ATG':1.00,'GTT':0.17,'GTC':0.25,'GTA':0.11,'GTG':0.47,
    'TCT':0.15,'TCC':0.22,'TCA':0.15,'TCG':0.06,'CCT':0.28,'CCC':0.33,'CCA':0.27,'CCG':0.12,
    'ACT':0.25,'ACC':0.36,'ACA':0.28,'ACG':0.11,'GCT':0.26,'GCC':0.40,'GCA':0.23,'GCG':0.11,
    'TAT':0.43,'TAC':0.57,'TAA':0.28,'TAG':0.20,'CAT':0.41,'CAC':0.59,'CAA':0.25,'CAG':0.75,
    'AAT':0.46,'AAC':0.54,'AAA':0.42,'AAG':0.58,'GAT':0.46,'GAC':0.54,'GAA':0.42,'GAG':0.58,
    'TGT':0.45,'TGC':0.55,'TGA':0.52,'TGG':1.00,'CGT':0.08,'CGC':0.19,'CGA':0.11,'CGG':0.21,
    'AGT':0.15,'AGC':0.24,'AGA':0.20,'AGG':0.20,'GGT':0.16,'GGC':0.34,'GGA':0.25,'GGG':0.25,
  },
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface CodonInfo {
  codon: string
  aminoAcid: string
  position: number
  frequency: number
  isRare: boolean
  isOptimized: boolean
  optimizedCodon: string
}

interface OptimizationResults {
  originalSequence: string
  optimizedSequence: string
  proteinSequence: string
  organism: string
  originalGC: number
  optimizedGC: number
  caiOriginal: number
  caiOptimized: number
  rareCodonCount: number
  optimizedCodonCount: number
  totalCodons: number
  codonDetails: CodonInfo[]
  proteinPreserved: boolean
  analysisTime: number
  timestamp: string
}


// ─── ALGORITHMS ──────────────────────────────────────────────────────────────

function translateDNA(sequence: string): string {
  let protein = ''
  for (let i = 0; i + 2 < sequence.length; i += 3) {
    const codon = sequence.substring(i, i + 3)
    const aa = CODON_TABLE[codon]
    if (!aa) break
    if (aa === '*') { protein += '*'; break }
    protein += aa
  }
  return protein
}

function calculateGC(sequence: string): number {
  const gc = (sequence.match(/[GC]/g) || []).length
  return sequence.length > 0 ? Math.round((gc / sequence.length) * 1000) / 10 : 0
}

function calculateCAI(sequence: string, organism: string): number {
  const freqTable = CODON_FREQUENCY[organism] || CODON_FREQUENCY.ecoli
  let logSum = 0
  let count = 0
  for (let i = 0; i + 2 < sequence.length; i += 3) {
    const codon = sequence.substring(i, i + 3)
    const aa = CODON_TABLE[codon]
    if (!aa || aa === '*') continue
    const freq = freqTable[codon] || 0.01
    logSum += Math.log(freq)
    count++
  }
  return count > 0 ? Math.round(Math.exp(logSum / count) * 100) / 100 : 0
}

function optimizeSequence(sequence: string, organism: string): OptimizationResults {
  const startTime = Date.now()
  const cleanSeq = sequence.toUpperCase().replace(/[^ATGCN]/g, '')
  const prefTable = ORGANISM_CODON_PREFERENCE[organism] || ORGANISM_CODON_PREFERENCE.ecoli
  const freqTable = CODON_FREQUENCY[organism] || CODON_FREQUENCY.ecoli

  const codonDetails: CodonInfo[] = []
  let optimizedSeq = ''
  let rareCount = 0
  let optimizedCount = 0

  for (let i = 0; i + 2 < cleanSeq.length; i += 3) {
    const codon = cleanSeq.substring(i, i + 3)
    const aa = CODON_TABLE[codon]
    if (!aa) break

    const freq = freqTable[codon] || 0.01
    const isRare = freq < 0.2 && aa !== '*'
    const preferredCodon = aa !== '*' ? (prefTable[aa] || codon) : codon
    const isOptimized = isRare && preferredCodon !== codon

    if (isRare) rareCount++
    if (isOptimized) optimizedCount++

    const finalCodon = isOptimized ? preferredCodon : codon
    optimizedSeq += finalCodon

    codonDetails.push({
      codon,
      aminoAcid: aa,
      position: i / 3 + 1,
      frequency: Math.round(freq * 100),
      isRare,
      isOptimized,
      optimizedCodon: preferredCodon,
    })
  }

  const originalProtein = translateDNA(cleanSeq)
  const optimizedProtein = translateDNA(optimizedSeq)
  const proteinPreserved = originalProtein === optimizedProtein

  return {
    originalSequence: cleanSeq,
    optimizedSequence: optimizedSeq,
    proteinSequence: originalProtein.replace('*', ''),
    organism,
    originalGC: calculateGC(cleanSeq),
    optimizedGC: calculateGC(optimizedSeq),
    caiOriginal: calculateCAI(cleanSeq, organism),
    caiOptimized: calculateCAI(optimizedSeq, organism),
    rareCodonCount: rareCount,
    optimizedCodonCount: optimizedCount,
    totalCodons: codonDetails.length,
    codonDetails,
    proteinPreserved,
    analysisTime: Date.now() - startTime,
    timestamp: new Date().toLocaleString(),
  }
}


// ─── SIDEBAR (exact ORF style) ────────────────────────────────────────────────

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
      <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#00cfff', marginBottom:'2rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2"/>
          <path d="M12 6v6l4 2.5"/>
        </svg>
        HelixLab
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:'transparent', border:'1px solid rgba(0, 207, 255, 0.1)', borderRadius:'8px', color:'#3a6080', fontSize:'0.8rem', fontWeight:600, marginBottom:'10px' }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 8L8 2l6 6"/><path d="M4 10v4h3v-3h2v3h3v-4"/>
        </svg>
        <div style={{ color:'#00cfff' }}>Back to Home</div>
      </div>

      <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#3a6080', margin:'1.5rem 0 1rem 0', fontWeight:600 }}>Analysis Tools</div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        <a href="/analyzer" style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:'transparent', border:'1px solid rgba(0, 207, 255, 0.1)', borderRadius:'8px', color:'#3a6080', fontSize:'0.8rem', fontWeight:600, textDecoration:'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>Nucleotide Analysis</span>
        </a>
        <a href="/orf" style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:'transparent', border:'1px solid rgba(0, 207, 255, 0.1)', borderRadius:'8px', color:'#3a6080', fontSize:'0.8rem', fontWeight:600, textDecoration:'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2.5"/></svg>
          <span>ORF Detection</span>
        </a>
        <a href="/crispr-guide-finder" style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:'transparent', border:'1px solid rgba(0, 207, 255, 0.1)', borderRadius:'8px', color:'#3a6080', fontSize:'0.8rem', fontWeight:600, textDecoration:'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/><path d="M9 12l2 2 4-4"/></svg>
          <span>CRISPR Guide Finder</span>
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:'rgba(0, 207, 255, 0.1)', border:'1px solid rgba(0, 207, 255, 0.4)', borderRadius:'8px', color:'#00cfff', fontSize:'0.8rem', fontWeight:600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2"/><path d="M12 6v6l4 2.5"/></svg>
          <span>Codon Optimization</span>
        </div>
        <a href="/restriction" style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:'transparent', border:'1px solid rgba(0, 207, 255, 0.1)', borderRadius:'8px', color:'#3a6080', fontSize:'0.8rem', fontWeight:600, textDecoration:'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          <span>Restriction Mapping</span>
        </a>
      </div>

      <div style={{ marginTop:'2rem', padding:'1.5rem', background:'rgba(0, 212, 170, 0.05)', border:'1px solid rgba(0, 212, 170, 0.2)', borderRadius:'8px', textAlign:'center' }}>
        <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem', display:'flex', justifyContent:'center', color:'#00d4aa' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#00d4aa', marginBottom:'0.5rem' }}>Unlock Full Potential</div>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.65rem', color:'#3a6080', lineHeight:1.5, marginBottom:'1rem' }}>Download reports, save your analysis and access all features.</div>
        <button style={{ width:'100%', padding:'0.6rem', background:'rgba(0, 212, 170, 0.1)', border:'1px solid rgba(0, 212, 170, 0.3)', borderRadius:'6px', color:'#00d4aa', fontFamily:"'Inter', sans-serif", fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em', cursor:'pointer', textTransform:'uppercase' }}>Download Report</button>
      </div>
    </div>
  )
}

function TopHeader() {
  return (
    <div style={{ position:'fixed', top:0, left:'200px', right:0, height:'80px', background:'rgba(4, 20, 44, 0.4)', borderBottom:'1px solid rgba(0, 207, 255, 0.1)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', paddingLeft:'2rem', zIndex:40, fontFamily:"'Inter', sans-serif" }}>
      <h1 style={{ fontSize:'1.5rem', fontWeight:'bold', background:'linear-gradient(to right, #00cfff, #00ffbe)', backgroundClip:'text', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:0 }}>
        Codon Optimizer
      </h1>
    </div>
  )
}


// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const ORGANISMS = [
  { value: 'ecoli',    label: 'E. coli' },
  { value: 'human',   label: 'Human' },
  { value: 'yeast',   label: 'Yeast (S. cerevisiae)' },
  { value: 'bacillus',label: 'Bacillus subtilis' },
  { value: 'mouse',   label: 'Mouse' },
]

const LOADING_STAGES = [
  'Parsing DNA sequence...',
  'Validating coding sequence...',
  'Translating protein...',
  'Analyzing codon bias...',
  'Optimizing rare codons...',
  'Calculating CAI score...',
  'Finalizing optimization...',
]

const CHART_COLORS = ['#00cfff','#00d4aa','#4f8ef7','#c77dff','#ff6b6b','#ffa500','#00ffbe','#ff69b4']

export default function CodonOptimizerPage() {
  const [mounted, setMounted] = useState(false)
  const [sequence, setSequence] = useState('')
  const [organism, setOrganism] = useState('ecoli')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [results, setResults] = useState<OptimizationResults | null>(null)
  const [activeTab, setActiveTab] = useState<'paste'|'upload'>('paste')
  const [activeResultTab, setActiveResultTab] = useState<'comparison'|'protein'|'charts'|'sequence'>('comparison')
  const [isLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('helixlab_dna_sequence')
    if (saved && saved.length > 0) {
      setSequence(saved)
      runAnalysis(saved, 'ecoli')
    }
  }, [])

  const runAnalysis = async (seq: string, org: string) => {
    if (!seq.trim()) return
    setIsAnalyzing(true)
    setLoadingStage(0)
    for (let i = 0; i < LOADING_STAGES.length; i++) {
      await new Promise(r => setTimeout(r, 300))
      setLoadingStage(i)
    }
    const res = optimizeSequence(seq, org)
    setResults(res)
    setIsAnalyzing(false)
  }

  const handleAnalyze = () => runAnalysis(sequence, organism)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      let content = ev.target?.result as string
      if (content.startsWith('>')) {
        content = content.split('\n').slice(1).join('').replace(/\s/g, '')
      }
      setSequence(content)
    }
    reader.readAsText(file)
  }

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

  const handleDownload = () => {
    if (!results) return
    if (!isLoggedIn) { setShowLoginModal(true); return }
    generateCodonReport(results)
  }

  if (!mounted) return null

  // ── Codon frequency chart data
  const freqData = results
    ? Object.entries(
        results.codonDetails.reduce((acc, c) => {
          acc[c.aminoAcid] = (acc[c.aminoAcid] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([aa, count]) => ({ name: aa, count }))
    : []

  const gcData = results
    ? [
        { name: 'Original GC', value: results.originalGC },
        { name: 'Optimized GC', value: results.optimizedGC },
      ]
    : []

  const rareVsOptimized = results
    ? [
        { name: 'Rare Codons', value: results.rareCodonCount },
        { name: 'Optimized', value: results.optimizedCodonCount },
        { name: 'Unchanged', value: results.totalCodons - results.rareCodonCount },
      ]
    : []

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #0a0f1a 0%, #0d1422 100%)', color:'white', fontFamily:"'Inter', sans-serif" }}>
      <Sidebar />
      <TopHeader />

      <div style={{ marginLeft:'200px', paddingTop:'80px', minHeight:'100vh' }}>
        <div style={{ padding:'2rem' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>


            {/* ── INPUT SECTION ── */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ background:'rgba(4, 20, 44, 0.6)', border:'1px solid rgba(0, 207, 255, 0.15)', borderRadius:'12px', padding:'1.5rem', backdropFilter:'blur(12px)', marginBottom:'2rem' }}>
              <h3 style={{ margin:'0 0 1rem 0', fontSize:'1.125rem', fontWeight:600, color:'#e6f1ff' }}>DNA Sequence Input</h3>

              {/* Tabs */}
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
                {(['paste','upload'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'0.5rem 1rem', background: activeTab===tab ? 'rgba(0, 207, 255, 0.2)' : 'transparent', border:'none', borderRadius:'8px', color: activeTab===tab ? '#00cfff' : '#93a4c3', fontSize:'0.875rem', cursor:'pointer' }}>
                    {tab === 'paste' ? 'Paste Sequence' : 'Upload FASTA'}
                  </button>
                ))}
              </div>

              {activeTab === 'paste' ? (
                <div>
                  <textarea value={sequence} onChange={e => setSequence(e.target.value)} placeholder="Paste your DNA coding sequence here (ATG...stop codon)..." style={{ width:'100%', height:'150px', background:'rgba(1, 8, 16, 0.8)', border:'1px solid rgba(0, 207, 255, 0.1)', borderRadius:'8px', padding:'1rem', fontFamily:"'DM Mono', monospace", fontSize:'0.8rem', color:'white', resize:'none', marginBottom:'0.5rem', boxSizing:'border-box' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#93a4c3', marginBottom:'1rem' }}>
                    <span>{sequence.length} characters · {Math.floor(sequence.length / 3)} codons</span>
                    <span>GC: {calculateGC(sequence.toUpperCase().replace(/[^ATGCN]/g,''))}%</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div onClick={() => fileInputRef.current?.click()} style={{ border:'2px dashed rgba(0, 207, 255, 0.3)', borderRadius:'8px', padding:'2rem', textAlign:'center', cursor:'pointer', marginBottom:'1rem' }}>
                    <Upload style={{ margin:'0 auto 1rem', color:'#00cfff' }} />
                    <p style={{ color:'#93a4c3' }}>Click to upload FASTA file</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".fasta,.fa,.txt" onChange={handleFileUpload} style={{ display:'none' }} />
                </div>
              )}

              {/* Organism selector */}
              <div style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block', fontSize:'0.8rem', color:'#93a4c3', marginBottom:'0.5rem' }}>Target Organism</label>
                <select value={organism} onChange={e => setOrganism(e.target.value)} style={{ width:'100%', padding:'0.6rem 1rem', background:'rgba(1, 8, 16, 0.8)', border:'1px solid rgba(0, 207, 255, 0.2)', borderRadius:'8px', color:'white', fontSize:'0.875rem', cursor:'pointer' }}>
                  {ORGANISMS.map(o => <option key={o.value} value={o.value} style={{ background:'#0d1422' }}>{o.label}</option>)}
                </select>
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', gap:'1rem' }}>
                <button onClick={handleAnalyze} disabled={!sequence.trim() || isAnalyzing} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', background: sequence.trim() && !isAnalyzing ? 'linear-gradient(120deg, #00cfff, #00ffbe)' : 'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px', color: sequence.trim() && !isAnalyzing ? '#010810' : 'white', fontSize:'0.875rem', fontWeight:600, cursor: sequence.trim() && !isAnalyzing ? 'pointer' : 'not-allowed', opacity: sequence.trim() && !isAnalyzing ? 1 : 0.5 }}>
                  {isAnalyzing ? <><RefreshCw size={16} style={{ animation:'spin 1s linear infinite' }} />Optimizing...</> : <><Play size={16} />Optimize Codons</>}
                </button>
                <button onClick={() => { setSequence(''); setResults(null) }} style={{ padding:'0.75rem 1.5rem', background:'rgba(0, 207, 255, 0.05)', color:'#00cfff', border:'1px solid rgba(0, 207, 255, 0.2)', borderRadius:'8px', cursor:'pointer', fontSize:'0.875rem' }}>Clear</button>
              </div>

              {/* Sample sequence */}
              <div style={{ textAlign:'center', marginTop:'1rem' }}>
                <button onClick={() => { const s='ATGAAACGCATTAGCACCACCATTACCACCACCATCACCATTACCACAGGTAACGGTGCGGGCTGACGCGTACAGGAAACACAGAAAAAAGCCCGCACCTGACAGTGCGGGCTTTTTTTTTCGACCAAAGGTAACGAGGTAACAACCATGCGAGTGTTGAAGTTCGGCGGTACATCAGTGGCAAATGCAGAACGTTTTCTGCGTGTTGCCGATATTCTGGAAAGCAATGCCAGGCAGGGGCAGGTGGCCACCGTCCTCTCTGCCCCCGCCAAAATCACCAACCACCTGGTGGCGATGATTGAAAAAACCATTAGCGGCCAGGATGCTTTACCCAATATCAGCGATGCCGAACGTATTTTTGCCGAACTTTTGACGGGACTCGCCGCCGCCCAGCCGGGGTTCCCGCTGGCGCAATTGAAAACTTTCGTCGATCAGGAATTTGCCCAAATAAAACATGTCCTGCATGGCATTAGTTTGTTGGTTCAGTGGTTCGTAGGGCTTTGCCCCGACTGTTTGGCTGCGCTCCCTCGGGCCGTTGCTCGGTAA'; setSequence(s) }} style={{ padding:'0.5rem 1rem', background:'rgba(0, 212, 170, 0.1)', border:'1px solid rgba(0, 212, 170, 0.3)', borderRadius:'6px', color:'#00d4aa', fontSize:'0.8rem', cursor:'pointer' }}>
                  Load Sample Sequence
                </button>
              </div>
            </motion.div>


            {/* ── LOADING STATE ── */}
            {isAnalyzing && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ background:'rgba(4, 20, 44, 0.6)', border:'1px solid rgba(0, 207, 255, 0.15)', borderRadius:'12px', padding:'2rem', textAlign:'center', backdropFilter:'blur(12px)', marginBottom:'2rem' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
                  <div style={{ width:'4rem', height:'4rem', background:'rgba(0, 207, 255, 0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <RefreshCw size={28} color="#00cfff" style={{ animation:'spin 1s linear infinite' }} />
                  </div>
                  <h3 style={{ fontSize:'1.5rem', fontWeight:'bold' }}>Optimizing Codons</h3>
                  <div style={{ color:'#93a4c3' }}>
                    {LOADING_STAGES.map((stage, i) => (
                      <p key={i} style={{ opacity: i <= loadingStage ? 1 : 0.3, transition:'opacity 0.3s', margin:'0.25rem 0', fontSize:'0.9rem' }}>
                        {i < loadingStage ? '✓' : i === loadingStage ? '▶' : '○'} {stage}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── RESULTS ── */}
            {results && !isAnalyzing && (
              <AnimatePresence>
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

                  {/* Status bar */}
                  <div style={{ background:'rgba(4, 20, 44, 0.6)', border:'1px solid rgba(0, 207, 255, 0.15)', borderRadius:'12px', padding:'1.5rem', backdropFilter:'blur(12px)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <div style={{ width:'12px', height:'12px', background: results.proteinPreserved ? '#00d4aa' : '#ff6b6b', borderRadius:'50%', animation:'pulse 2s infinite' }}></div>
                        <div>
                          <h3 style={{ fontWeight:'bold', color:'#e6f1ff', margin:0 }}>Codon Optimization Complete</h3>
                          <p style={{ fontSize:'0.9rem', color:'#93a4c3', margin:0 }}>
                            {results.originalSequence.length} bp · {ORGANISMS.find(o=>o.value===results.organism)?.label} · {results.analysisTime}ms · {results.timestamp}
                          </p>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.75rem' }}>
                        <button onClick={() => window.open('/docs','_blank')} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 1rem', background:'rgba(0, 207, 255, 0.1)', border:'1px solid rgba(0, 207, 255, 0.3)', borderRadius:'8px', color:'#00cfff', cursor:'pointer', fontSize:'0.8rem' }}>
                          <HelpCircle size={14} />Docs
                        </button>
                        <button onClick={handleDownload} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 1rem', background:'rgba(0, 212, 170, 0.1)', border:'1px solid rgba(0, 212, 170, 0.3)', borderRadius:'8px', color:'#00d4aa', cursor:'pointer', fontSize:'0.8rem' }}>
                          <Download size={14} />Download Report
                        </button>
                        <button onClick={() => setResults(null)} style={{ padding:'0.5rem 1rem', background:'rgba(0, 212, 170, 0.1)', border:'1px solid rgba(0, 212, 170, 0.3)', borderRadius:'8px', color:'#00d4aa', cursor:'pointer', fontSize:'0.8rem' }}>New Analysis</button>
                      </div>
                    </div>
                    {!results.proteinPreserved && (
                      <div style={{ marginTop:'1rem', padding:'0.75rem 1rem', background:'rgba(255, 107, 107, 0.1)', border:'1px solid rgba(255, 107, 107, 0.3)', borderRadius:'8px', color:'#ff6b6b', fontSize:'0.875rem' }}>
                        ⚠ Protein sequence mismatch detected. Please verify the input is a valid coding sequence starting with ATG.
                      </div>
                    )}
                  </div>

                  {/* Summary cards */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1rem' }}>
                    {[
                      { title:'CAI Improvement', value:`${results.caiOriginal} → ${results.caiOptimized}`, sub:'Codon Adaptation Index', color:'#00cfff', bg:'rgba(0,207,255,0.1)', border:'rgba(0,207,255,0.3)', icon:<Search size={20}/> },
                      { title:'GC Optimization', value:`${results.originalGC}% → ${results.optimizedGC}%`, sub:'GC content change', color:'#00d4aa', bg:'rgba(0,212,170,0.1)', border:'rgba(0,212,170,0.3)', icon:<Dna size={20}/> },
                      { title:'Rare Codons Reduced', value:`${results.rareCodonCount} → ${results.rareCodonCount - results.optimizedCodonCount}`, sub:`${results.optimizedCodonCount} codons replaced`, color:'#4f8ef7', bg:'rgba(79,142,247,0.1)', border:'rgba(79,142,247,0.3)', icon:<RefreshCw size={20}/> },
                      { title:'Protein Preserved', value: results.proteinPreserved ? '✓ Identical' : '✗ Mismatch', sub:`${results.proteinSequence.length} amino acids`, color: results.proteinPreserved ? '#00d4aa' : '#ff6b6b', bg: results.proteinPreserved ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)', border: results.proteinPreserved ? 'rgba(0,212,170,0.3)' : 'rgba(255,107,107,0.3)', icon:<BookOpen size={20}/> },
                    ].map((card, i) => (
                      <motion.div key={i} whileHover={{ y:-2 }} style={{ background:'rgba(4, 20, 44, 0.6)', border:'1px solid rgba(0, 207, 255, 0.15)', borderRadius:'12px', padding:'1.5rem', backdropFilter:'blur(12px)' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                          <div>
                            <p style={{ fontSize:'0.9rem', color:'#93a4c3', marginBottom:'0.5rem' }}>{card.title}</p>
                            <p style={{ fontSize:'1.2rem', fontWeight:'bold', color:'#e6f1ff', marginBottom:'0.25rem' }}>{card.value}</p>
                            <p style={{ fontSize:'0.75rem', color:'#93a4c3' }}>{card.sub}</p>
                          </div>
                          <div style={{ padding:'0.75rem', borderRadius:'8px', background:card.bg, border:`1px solid ${card.border}`, color:card.color }}>{card.icon}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>


                  {/* Result tabs */}
                  <div style={{ background:'rgba(4, 20, 44, 0.6)', border:'1px solid rgba(0, 207, 255, 0.15)', borderRadius:'12px', overflow:'hidden', backdropFilter:'blur(12px)' }}>
                    <div style={{ display:'flex', borderBottom:'1px solid rgba(0, 207, 255, 0.15)', padding:'0 1.5rem' }}>
                      {([
                        { id:'comparison', label:'Sequence Comparison' },
                        { id:'protein',    label:'Protein Viewer' },
                        { id:'charts',     label:'Codon Charts' },
                        { id:'sequence',   label:'Codon Map' },
                      ] as const).map(tab => (
                        <button key={tab.id} onClick={() => setActiveResultTab(tab.id)} style={{ padding:'1rem 1.25rem', background:'transparent', border:'none', borderBottom: activeResultTab===tab.id ? '2px solid #00cfff' : '2px solid transparent', color: activeResultTab===tab.id ? '#00cfff' : '#93a4c3', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ padding:'1.5rem' }}>

                      {/* ── COMPARISON TAB ── */}
                      {activeResultTab === 'comparison' && (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                          {[
                            { label:'Original Sequence', seq:results.originalSequence, color:'#00cfff', gc:results.originalGC, cai:results.caiOriginal },
                            { label:'Optimized Sequence', seq:results.optimizedSequence, color:'#00d4aa', gc:results.optimizedGC, cai:results.caiOptimized },
                          ].map((panel, pi) => (
                            <div key={pi}>
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                                <h4 style={{ color:panel.color, margin:0, fontSize:'0.95rem', fontWeight:700 }}>{panel.label}</h4>
                                <button onClick={() => copyToClipboard(panel.seq)} style={{ display:'flex', alignItems:'center', gap:'0.25rem', padding:'0.25rem 0.5rem', background:'rgba(0,212,170,0.1)', border:'1px solid rgba(0,212,170,0.3)', borderRadius:'4px', color:'#00d4aa', fontSize:'0.75rem', cursor:'pointer' }}>
                                  <Copy size={12} />Copy
                                </button>
                              </div>
                              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.75rem', color:panel.color, background:'rgba(1, 8, 16, 0.8)', border:'1px solid rgba(0, 207, 255, 0.1)', borderRadius:'8px', padding:'1rem', maxHeight:'200px', overflowY:'auto', wordBreak:'break-all', lineHeight:1.8 }}>
                                {panel.seq.match(/.{1,3}/g)?.map((codon, ci) => {
                                  const detail = results.codonDetails[ci]
                                  const bg = detail?.isOptimized ? 'rgba(0,212,170,0.25)' : detail?.isRare ? 'rgba(255,107,107,0.25)' : 'transparent'
                                  const col = detail?.isOptimized ? '#00d4aa' : detail?.isRare ? '#ff6b6b' : panel.color
                                  return <span key={ci} title={detail ? `${detail.aminoAcid} · freq ${detail.frequency}%` : ''} style={{ background:bg, color:col, borderRadius:'2px', padding:'0 1px', marginRight:'2px' }}>{codon}</span>
                                })}
                              </div>
                              <div style={{ display:'flex', gap:'1rem', marginTop:'0.75rem', fontSize:'0.8rem', color:'#93a4c3' }}>
                                <span>GC: <strong style={{ color:panel.color }}>{panel.gc}%</strong></span>
                                <span>CAI: <strong style={{ color:panel.color }}>{panel.cai}</strong></span>
                                <span>Length: <strong style={{ color:panel.color }}>{panel.seq.length} bp</strong></span>
                              </div>
                            </div>
                          ))}
                          <div style={{ gridColumn:'1/-1', display:'flex', gap:'1.5rem', padding:'1rem', background:'rgba(1, 8, 16, 0.4)', borderRadius:'8px', fontSize:'0.85rem' }}>
                            <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}><span style={{ width:'12px', height:'12px', background:'rgba(0,212,170,0.4)', borderRadius:'2px', display:'inline-block' }}></span>Optimized codon</span>
                            <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}><span style={{ width:'12px', height:'12px', background:'rgba(255,107,107,0.4)', borderRadius:'2px', display:'inline-block' }}></span>Rare codon (original)</span>
                            <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}><span style={{ width:'12px', height:'12px', background:'transparent', border:'1px solid #3a6080', borderRadius:'2px', display:'inline-block' }}></span>Unchanged</span>
                          </div>
                        </div>
                      )}

                      {/* ── PROTEIN TAB ── */}
                      {activeResultTab === 'protein' && (
                        <div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                            <h4 style={{ margin:0, color:'#e6f1ff' }}>Translated Protein Sequence</h4>
                            <button onClick={() => copyToClipboard(results.proteinSequence)} style={{ display:'flex', alignItems:'center', gap:'0.25rem', padding:'0.25rem 0.75rem', background:'rgba(0,212,170,0.1)', border:'1px solid rgba(0,212,170,0.3)', borderRadius:'4px', color:'#00d4aa', fontSize:'0.8rem', cursor:'pointer' }}>
                              <Copy size={12} />Copy Protein
                            </button>
                          </div>
                          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.8rem', color:'#00ffbe', background:'rgba(1, 8, 16, 0.8)', border:'1px solid rgba(0, 207, 255, 0.1)', borderRadius:'8px', padding:'1rem', maxHeight:'200px', overflowY:'auto', wordBreak:'break-all', lineHeight:2 }}>
                            {results.proteinSequence.match(/.{1,10}/g)?.join(' ')}
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginTop:'1rem' }}>
                            {[
                              { label:'Amino Acids', value:results.proteinSequence.length },
                              { label:'Protein Preserved', value: results.proteinPreserved ? 'Yes ✓' : 'No ✗' },
                              { label:'Codons Optimized', value:`${results.optimizedCodonCount} / ${results.totalCodons}` },
                            ].map((m,i) => (
                              <div key={i} style={{ background:'rgba(1, 8, 16, 0.5)', border:'1px solid rgba(0, 207, 255, 0.15)', borderRadius:'8px', padding:'0.75rem' }}>
                                <p style={{ fontSize:'0.75rem', color:'#93a4c3', marginBottom:'0.25rem' }}>{m.label}</p>
                                <p style={{ fontSize:'1.1rem', fontWeight:'bold', color:'#e6f1ff' }}>{m.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* ── CHARTS TAB ── */}
                      {activeResultTab === 'charts' && (
                        <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
                          <div>
                            <h4 style={{ color:'#e6f1ff', marginBottom:'1rem' }}>GC Content Comparison</h4>
                            <ResponsiveContainer width="100%" height={180}>
                              <BarChart data={gcData} margin={{ top:5, right:20, left:0, bottom:5 }}>
                                <XAxis dataKey="name" tick={{ fill:'#93a4c3', fontSize:12 }} />
                                <YAxis tick={{ fill:'#93a4c3', fontSize:12 }} domain={[0,100]} />
                                <Bar dataKey="value" radius={[4,4,0,0]}>
                                  {gcData.map((_,i) => <Cell key={i} fill={i===0 ? '#00cfff' : '#00d4aa'} />)}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div>
                            <h4 style={{ color:'#e6f1ff', marginBottom:'1rem' }}>Codon Optimization Breakdown</h4>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                              <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                  <Pie data={rareVsOptimized} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                    {rareVsOptimized.map((_,i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', gap:'0.75rem' }}>
                                {rareVsOptimized.map((d,i) => (
                                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                                    <div style={{ width:'12px', height:'12px', borderRadius:'2px', background:CHART_COLORS[i], flexShrink:0 }}></div>
                                    <span style={{ fontSize:'0.85rem', color:'#93a4c3' }}>{d.name}: <strong style={{ color:'#e6f1ff' }}>{d.value}</strong></span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 style={{ color:'#e6f1ff', marginBottom:'1rem' }}>Amino Acid Frequency</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={freqData} margin={{ top:5, right:20, left:0, bottom:5 }}>
                                <XAxis dataKey="name" tick={{ fill:'#93a4c3', fontSize:11 }} />
                                <YAxis tick={{ fill:'#93a4c3', fontSize:11 }} />
                                <Bar dataKey="count" radius={[4,4,0,0]}>
                                  {freqData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* ── CODON MAP TAB ── */}
                      {activeResultTab === 'sequence' && (
                        <div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                            <h4 style={{ margin:0, color:'#e6f1ff' }}>Codon-by-Codon Map</h4>
                            <span style={{ fontSize:'0.8rem', color:'#93a4c3' }}>{results.codonDetails.length} codons total</span>
                          </div>
                          <div style={{ maxHeight:'350px', overflowY:'auto', display:'flex', flexWrap:'wrap', gap:'4px', padding:'1rem', background:'rgba(1, 8, 16, 0.6)', borderRadius:'8px', border:'1px solid rgba(0, 207, 255, 0.1)' }}>
                            {results.codonDetails.map((c, i) => (
                              <div key={i} title={`Pos ${c.position}: ${c.codon} → ${c.aminoAcid} (freq ${c.frequency}%)${c.isOptimized ? ` → optimized to ${c.optimizedCodon}` : ''}`} style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', padding:'2px 4px', borderRadius:'3px', background: c.isOptimized ? 'rgba(0,212,170,0.25)' : c.isRare ? 'rgba(255,107,107,0.2)' : 'rgba(0,207,255,0.05)', border: c.isOptimized ? '1px solid rgba(0,212,170,0.4)' : c.isRare ? '1px solid rgba(255,107,107,0.3)' : '1px solid rgba(0,207,255,0.1)', color: c.isOptimized ? '#00d4aa' : c.isRare ? '#ff6b6b' : '#93a4c3', cursor:'default' }}>
                                {c.isOptimized ? c.optimizedCodon : c.codon}
                              </div>
                            ))}
                          </div>
                          <div style={{ display:'flex', gap:'1.5rem', marginTop:'0.75rem', fontSize:'0.8rem', color:'#93a4c3' }}>
                            <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}><span style={{ width:'10px', height:'10px', background:'rgba(0,212,170,0.4)', borderRadius:'2px', display:'inline-block' }}></span>Optimized</span>
                            <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}><span style={{ width:'10px', height:'10px', background:'rgba(255,107,107,0.3)', borderRadius:'2px', display:'inline-block' }}></span>Rare (original)</span>
                            <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}><span style={{ width:'10px', height:'10px', background:'rgba(0,207,255,0.1)', borderRadius:'2px', display:'inline-block' }}></span>Unchanged</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>
            )}

            {/* ── EMPTY STATE ── */}
            {!results && !isAnalyzing && (
              <div style={{ textAlign:'center', padding:'4rem', color:'#93a4c3' }}>
                <div style={{ width:'64px', height:'64px', margin:'0 auto 1rem', background:'rgba(0,207,255,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00cfff" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2"/><path d="M12 6v6l4 2.5"/></svg>
                </div>
                <h3 style={{ fontSize:'1.5rem', marginBottom:'1rem', color:'#e6f1ff' }}>Ready for Codon Optimization</h3>
                <p>Enter a DNA coding sequence above to optimize codon usage for your target organism.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── LOGIN MODAL ── */}
      {showLoginModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setShowLoginModal(false)}>
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} onClick={e => e.stopPropagation()} style={{ background:'rgba(4, 20, 44, 0.95)', border:'1px solid rgba(0, 207, 255, 0.3)', borderRadius:'16px', padding:'2rem', width:'400px', textAlign:'center' }}>
            <div style={{ width:'48px', height:'48px', margin:'0 auto 1rem', background:'rgba(0,212,170,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 style={{ fontSize:'1.25rem', fontWeight:'bold', marginBottom:'0.5rem' }}>Login Required</h3>
            <p style={{ color:'#93a4c3', marginBottom:'1.5rem', fontSize:'0.9rem' }}>Sign in to download PDF reports and save your analysis.</p>
            <div style={{ display:'flex', gap:'1rem' }}>
              <button onClick={() => setShowLoginModal(false)} style={{ flex:1, padding:'0.75rem', background:'transparent', border:'1px solid rgba(0,207,255,0.3)', borderRadius:'8px', color:'#93a4c3', cursor:'pointer' }}>Cancel</button>
              <button onClick={() => setShowLoginModal(false)} style={{ flex:1, padding:'0.75rem', background:'linear-gradient(120deg, #00cfff, #00ffbe)', border:'none', borderRadius:'8px', color:'#010810', fontWeight:700, cursor:'pointer' }}>Login / Sign Up</button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}
