'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Dna, Scissors, Search, ArrowLeft, ExternalLink } from 'lucide-react'

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

      <a href="/" style={{
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
        marginBottom: '10px',
        textDecoration: 'none'
      }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 8L8 2l6 6"/>
          <path d="M4 10v4h3v-3h2v3h3v-4"/>
        </svg>
        <div style={{ color: '#00cfff' }}>Back to Home</div>
      </a>

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
        marginTop: '1rem'
      }}>
        <BookOpen size={16} />
        <span>Documentation</span>
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
        Documentation
      </h1>
    </div>
  )
}

export default function DocumentationPage() {
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

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
      <Sidebar />
      <TopHeader />

      <div style={{ marginLeft: '200px', paddingTop: '80px', minHeight: '100vh' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Navigation */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { id: 'overview', label: 'Overview', icon: <BookOpen size={16} /> },
                { id: 'orf', label: 'ORF Detection', icon: <Dna size={16} /> },
                { id: 'restriction', label: 'Restriction Mapping', icon: <Scissors size={16} /> },
                { id: 'crispr', label: 'CRISPR Guide Finder', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg> },
                { id: 'codon', label: 'Codon Optimizer', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2"/>
                  <path d="M12 6v6l4 2.5"/>
                </svg> }
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeSection === section.id ? 'rgba(0, 207, 255, 0.2)' : 'rgba(4, 20, 44, 0.6)',
                    color: activeSection === section.id ? '#00cfff' : '#93a4c3',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(4, 20, 44, 0.6)',
                border: '1px solid rgba(0, 207, 255, 0.15)',
                borderRadius: '12px',
                padding: '2rem',
                backdropFilter: 'blur(12px)'
              }}
            >
              {activeSection === 'overview' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#00cfff' }}>
                    HelixLab Documentation
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: '#93a4c3', marginBottom: '2rem', lineHeight: 1.6 }}>
                    Welcome to HelixLab, a professional-grade DNA sequence analysis platform designed for molecular biology research, 
                    genetic engineering, and bioinformatics workflows.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{
                      background: 'rgba(1, 8, 16, 0.5)',
                      border: '1px solid rgba(0, 212, 170, 0.3)',
                      borderRadius: '8px',
                      padding: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Dna style={{ color: '#00d4aa' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00d4aa' }}>ORF Detection</h3>
                      </div>
                      <p style={{ color: '#93a4c3', lineHeight: 1.5 }}>
                        Identify open reading frames across all six translation frames. Analyze protein-coding regions, 
                        calculate molecular properties, and export detailed reports.
                      </p>
                    </div>

                    <div style={{
                      background: 'rgba(1, 8, 16, 0.5)',
                      border: '1px solid rgba(0, 207, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Scissors style={{ color: '#00cfff' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00cfff' }}>Restriction Mapping</h3>
                      </div>
                      <p style={{ color: '#93a4c3', lineHeight: 1.5 }}>
                        Map restriction enzyme cut sites, simulate DNA digestion, and analyze fragment patterns. 
                        Essential for cloning and genetic engineering workflows.
                      </p>
                    </div>

                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                    Getting Started
                  </h3>
                  <ol style={{ color: '#93a4c3', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>Input your DNA sequence</strong> - Paste directly or upload FASTA files
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>Choose your analysis</strong> - Select ORF Detection, Restriction Mapping, or CRISPR Guide Finder
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>Review results</strong> - Explore interactive visualizations and detailed data
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>Export reports</strong> - Download professional PDF reports for your research
                    </li>
                  </ol>
                </div>
              )}

              {activeSection === 'orf' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#00d4aa' }}>
                    ORF Detection Mechanism
                  </h2>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      What are Open Reading Frames?
                    </h3>
                    <p style={{ color: '#93a4c3', lineHeight: 1.6, marginBottom: '1rem' }}>
                      Open Reading Frames (ORFs) are continuous stretches of DNA that begin with a start codon (ATG) 
                      and end with a stop codon (TAA, TAG, or TGA). They represent potential protein-coding regions in the genome.
                    </p>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      Analysis Process
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 207, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00cfff', marginBottom: '0.5rem' }}>Step 1: Six-Frame Translation</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          The algorithm analyzes DNA in all six possible reading frames:
                          <br />• Forward frames: +1, +2, +3 (starting from positions 0, 1, 2)
                          <br />• Reverse frames: -1, -2, -3 (reverse complement sequence)
                        </p>
                      </div>

                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 207, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00cfff', marginBottom: '0.5rem' }}>Step 2: Codon Recognition</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          • <strong>Start Codon:</strong> ATG (Methionine)
                          <br />• <strong>Stop Codons:</strong> TAA (Ochre), TAG (Amber), TGA (Opal)
                          <br />• <strong>Minimum Length:</strong> 90 base pairs (30 amino acids)
                        </p>
                      </div>

                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 207, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00cfff', marginBottom: '0.5rem' }}>Step 3: Protein Translation</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Each ORF is translated using the standard genetic code to produce amino acid sequences.
                          Molecular properties are calculated including GC content, molecular weight, and isoelectric point.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      Calculated Properties
                    </h3>
                    <ul style={{ color: '#93a4c3', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
                      <li><strong>Nucleotide Length:</strong> Total base pairs in the ORF</li>
                      <li><strong>Amino Acid Length:</strong> Number of amino acids in translated protein</li>
                      <li><strong>GC Content:</strong> Percentage of G and C nucleotides</li>
                      <li><strong>Molecular Weight:</strong> Calculated protein mass in kDa</li>
                      <li><strong>Isoelectric Point:</strong> pH at which protein has no net charge</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === 'restriction' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#00cfff' }}>
                    Restriction Mapping Mechanism
                  </h2>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      What is Restriction Mapping?
                    </h3>
                    <p style={{ color: '#93a4c3', lineHeight: 1.6, marginBottom: '1rem' }}>
                      Restriction mapping identifies locations where restriction enzymes cut DNA. These enzymes recognize 
                      specific DNA sequences and cleave the double helix at precise positions, creating fragments essential 
                      for molecular cloning and genetic engineering.
                    </p>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      Enzyme Database
                    </h3>
                    <p style={{ color: '#93a4c3', lineHeight: 1.6, marginBottom: '1rem' }}>
                      HelixLab includes 12 commonly used restriction enzymes:
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      {[
                        { name: 'EcoRI', seq: 'GAATTC', type: 'Sticky' },
                        { name: 'BamHI', seq: 'GGATCC', type: 'Sticky' },
                        { name: 'HindIII', seq: 'AAGCTT', type: 'Sticky' },
                        { name: 'SmaI', seq: 'CCCGGG', type: 'Blunt' }
                      ].map(enzyme => (
                        <div key={enzyme.name} style={{
                          background: 'rgba(1, 8, 16, 0.5)',
                          border: '1px solid rgba(0, 207, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '0.75rem',
                          fontSize: '0.8rem'
                        }}>
                          <div style={{ color: '#00cfff', fontWeight: 'bold' }}>{enzyme.name}</div>
                          <div style={{ color: '#93a4c3', fontFamily: "'DM Mono', monospace" }}>{enzyme.seq}</div>
                          <div style={{ color: enzyme.type === 'Sticky' ? '#00d4aa' : '#4f8ef7', fontSize: '0.7rem' }}>
                            {enzyme.type} ends
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      Analysis Process
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 207, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00cfff', marginBottom: '0.5rem' }}>Step 1: Sequence Scanning</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          The algorithm scans the entire DNA sequence for enzyme recognition sites using exact string matching.
                          Each enzyme's recognition sequence is searched across the full length of the input DNA.
                        </p>
                      </div>

                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 207, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00cfff', marginBottom: '0.5rem' }}>Step 2: Cut Site Calculation</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          For each recognition site found, the precise cut position is calculated based on the enzyme's 
                          specific cleavage pattern. This determines where the DNA backbone will be broken.
                        </p>
                      </div>

                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 207, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00cfff', marginBottom: '0.5rem' }}>Step 3: Fragment Generation</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          DNA fragments are generated by simulating complete digestion. Fragment sizes and positions 
                          are calculated to predict the results of restriction enzyme treatment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      End Types
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 212, 170, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00d4aa', marginBottom: '0.5rem' }}>Sticky Ends</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Create overhanging single-stranded DNA ends that can base-pair with complementary sequences. 
                          Ideal for directional cloning and ligation reactions.
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(79, 142, 247, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#4f8ef7', marginBottom: '0.5rem' }}>Blunt Ends</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Create flush cuts with no overhanging bases. Require T4 DNA ligase and higher concentrations 
                          for efficient ligation but allow non-directional cloning.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'crispr' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#00d4aa' }}>
                    CRISPR Guide Finder Mechanism
                  </h2>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      What is CRISPR-Cas9?
                    </h3>
                    <p style={{ color: '#93a4c3', lineHeight: 1.6, marginBottom: '1rem' }}>
                      CRISPR-Cas9 is a revolutionary gene editing system that allows precise modification of DNA sequences. 
                      It consists of two main components: a guide RNA (gRNA) that specifies the target location, and the 
                      Cas9 nuclease that cuts the DNA at the specified site.
                    </p>
                    <p style={{ color: '#93a4c3', lineHeight: 1.6 }}>
                      The system requires a Protospacer Adjacent Motif (PAM) sequence immediately downstream of the target 
                      site for Cas9 recognition and binding. For SpCas9, the PAM sequence is NGG (where N is any nucleotide).
                    </p>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      Guide RNA Design Process
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 207, 255, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00cfff', marginBottom: '0.5rem' }}>1. PAM Site Detection</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Scan the DNA sequence for NGG motifs (AGG, TGG, CGG, GGG) on both forward and reverse strands. 
                          These PAM sites are essential for Cas9 binding and cleavage activity.
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 212, 170, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00d4aa', marginBottom: '0.5rem' }}>2. Guide RNA Generation</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Extract 20 nucleotides immediately upstream (5') of each PAM site. These sequences become 
                          the guide RNAs that direct Cas9 to the target location.
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(79, 142, 247, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#4f8ef7', marginBottom: '0.5rem' }}>3. Efficiency Scoring</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Calculate efficiency scores based on GC content (optimal 40-60%), avoid poly-T stretches, 
                          and prefer guanine at position 20 for improved cutting efficiency.
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(199, 125, 255, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#c77dff', marginBottom: '0.5rem' }}>4. Off-Target Assessment</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Evaluate potential off-target effects based on sequence composition. High GC content 
                          (&gt;70%) increases off-target risk, while moderate GC content (40-60%) is preferred.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      Key Metrics Explained
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 207, 255, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00cfff', marginBottom: '0.5rem' }}>Efficiency Score</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Predicts cutting efficiency based on sequence features. Scores &gt;70% indicate high-efficiency guides. 
                          Factors include GC content, nucleotide composition, and structural features.
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(0, 212, 170, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#00d4aa', marginBottom: '0.5rem' }}>Off-Target Risk</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Estimates likelihood of unintended cuts at similar sequences. Low risk guides are preferred 
                          for therapeutic applications. High GC content increases off-target potential.
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(1, 8, 16, 0.5)',
                        border: '1px solid rgba(79, 142, 247, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <h4 style={{ color: '#4f8ef7', marginBottom: '0.5rem' }}>Cleavage Position</h4>
                        <p style={{ color: '#93a4c3', fontSize: '0.9rem' }}>
                          Cas9 cuts 3 base pairs upstream of the PAM site, creating a blunt-ended double-strand break. 
                          This position determines where DNA repair mechanisms will act.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      CRISPR Applications
                    </h3>
                    <ul style={{ color: '#93a4c3', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
                      <li><strong>Gene Knockout:</strong> Disrupt gene function by introducing frameshift mutations</li>
                      <li><strong>Gene Correction:</strong> Fix disease-causing mutations with homology-directed repair</li>
                      <li><strong>Gene Insertion:</strong> Add new genetic elements at specific locations</li>
                      <li><strong>Epigenome Editing:</strong> Modify gene expression without changing DNA sequence</li>
                      <li><strong>Base Editing:</strong> Make precise single nucleotide changes</li>
                      <li><strong>Prime Editing:</strong> Insert, delete, or replace DNA sequences with high precision</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>
                      Design Guidelines
                    </h3>
                    <ul style={{ color: '#93a4c3', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
                      <li><strong>Target Efficiency:</strong> Choose guides with efficiency scores &gt;70%</li>
                      <li><strong>Off-Target Safety:</strong> Prefer guides with low off-target risk</li>
                      <li><strong>Multiple Guides:</strong> Design 2-3 guides per target for redundancy</li>
                      <li><strong>Experimental Validation:</strong> Always test guides in your specific system</li>
                      <li><strong>Population Variants:</strong> Check for SNPs that might affect guide binding</li>
                      <li><strong>Cut Site Position:</strong> Consider desired edit location relative to cut site</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Back to Analysis */}
              {activeSection === 'codon' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#00d4aa' }}>
                    Codon Optimizer
                  </h2>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>What are Codons?</h3>
                    <p style={{ color: '#93a4c3', lineHeight: 1.6, marginBottom: '1rem' }}>
                      A codon is a sequence of three nucleotides (triplet) in DNA or RNA that encodes a specific amino acid or a stop signal during protein synthesis. The genetic code maps 64 possible codons to 20 amino acids plus 3 stop signals.
                    </p>
                    <p style={{ color: '#93a4c3', lineHeight: 1.6 }}>
                      Because most amino acids are encoded by multiple synonymous codons, organisms have evolved preferences for specific codons — a phenomenon called <strong style={{ color: '#00cfff' }}>codon bias</strong>.
                    </p>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>Codon Optimization</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                      {[
                        { title: 'Synonymous Mutations', desc: 'Replacing a codon with another that encodes the same amino acid. The protein sequence is preserved while the DNA sequence changes.', color: '#00cfff' },
                        { title: 'Codon Bias', desc: 'Different organisms prefer different synonymous codons. Rare codons slow ribosome translation and reduce protein yield.', color: '#00d4aa' },
                        { title: 'CAI Score', desc: 'Codon Adaptation Index (0–1) measures how well a sequence matches the preferred codon usage of a target organism. Higher = better expression.', color: '#4f8ef7' },
                        { title: 'GC Optimization', desc: 'Adjusting GC content through synonymous substitutions can improve mRNA stability and translation efficiency.', color: '#c77dff' },
                      ].map((card, i) => (
                        <div key={i} style={{ background: 'rgba(1, 8, 16, 0.5)', border: '1px solid rgba(0, 207, 255, 0.15)', borderRadius: '8px', padding: '1rem' }}>
                          <h4 style={{ color: card.color, marginBottom: '0.5rem' }}>{card.title}</h4>
                          <p style={{ color: '#93a4c3', fontSize: '0.9rem', lineHeight: 1.5 }}>{card.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>Optimization Workflow</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { step: '1', title: 'Parse & Clean', desc: 'Remove non-ATGC characters, validate the sequence is a multiple of 3.' },
                        { step: '2', title: 'Translate Protein', desc: 'Convert the DNA sequence to amino acids using the standard genetic code.' },
                        { step: '3', title: 'Analyze Codon Bias', desc: 'Compare each codon against the target organism\'s frequency table to identify rare codons (frequency < 20%).' },
                        { step: '4', title: 'Replace Rare Codons', desc: 'Substitute rare codons with the most preferred synonymous codon for the target organism.' },
                        { step: '5', title: 'Calculate CAI', desc: 'Compute the Codon Adaptation Index for both original and optimized sequences.' },
                        { step: '6', title: 'Verify Protein', desc: 'Translate the optimized sequence and confirm it produces an identical protein.' },
                      ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', background: 'rgba(1, 8, 16, 0.5)', border: '1px solid rgba(0, 207, 255, 0.15)', borderRadius: '8px', padding: '1rem' }}>
                          <div style={{ width: '28px', height: '28px', background: 'rgba(0, 207, 255, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00cfff', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0 }}>{s.step}</div>
                          <div>
                            <h4 style={{ color: '#e6f1ff', margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>{s.title}</h4>
                            <p style={{ color: '#93a4c3', fontSize: '0.875rem', margin: 0 }}>{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e6f1ff' }}>Supported Organisms</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      {[
                        { name: 'E. coli', use: 'Prokaryotic expression, high-yield recombinant proteins' },
                        { name: 'Human', use: 'Therapeutic proteins, gene therapy vectors' },
                        { name: 'Yeast', use: 'Eukaryotic expression with post-translational modifications' },
                        { name: 'Bacillus subtilis', use: 'Industrial enzyme production, secreted proteins' },
                        { name: 'Mouse', use: 'Mammalian cell expression, in vivo studies' },
                      ].map((org, i) => (
                        <div key={i} style={{ background: 'rgba(1, 8, 16, 0.5)', border: '1px solid rgba(0, 212, 170, 0.2)', borderRadius: '8px', padding: '1rem' }}>
                          <h4 style={{ color: '#00d4aa', marginBottom: '0.4rem', fontSize: '0.95rem' }}>{org.name}</h4>
                          <p style={{ color: '#93a4c3', fontSize: '0.8rem', lineHeight: 1.4 }}>{org.use}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/analyzer'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(120deg, #00cfff, #00ffbe)',
                  color: '#010810',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft />
                <span>Back to Analysis</span>
              </motion.button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}