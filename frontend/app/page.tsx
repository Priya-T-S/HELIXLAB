'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CompactDNAAnimation } from '@/components/CompactDNAAnimation'
import '@/styles/landing.css'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderTicker = () => {
    const b = 'ATGCATGCGCATTAGCGGATCCTGAATTCAAGCTTGGTACCGGATCCTCTAGAGTCGACCTGCAGGCATGCAAGCTT'
    const cm: Record<string, string> = { A: 'A', T: 'T', G: 'G', C: 'C' }
    const r = b + b + b + b
    return (
      <>
        <span>
          {r.split('').map((ch, i) => (
            <span key={`a-${i}`} className={cm[ch] || ''}>{ch}</span>
          ))}
        </span>
        <span>
          {r.split('').map((ch, i) => (
            <span key={`b-${i}`} className={cm[ch] || ''}>{ch}</span>
          ))}
        </span>
      </>
    )
  }

  const handleGetStarted = () => {
    router.push('/analyzer')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">

      <div className="atm-layer" id="atm-vignette"></div>
      <div className="atm-layer" id="atm-top"></div>
      <div className="atm-layer" id="atm-bottom"></div>
      <div className="atm-layer" id="atm-grain"></div>

      <div className="page">
        <nav>
          <div className="nav-logo">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M7 2Q13 7 19 13Q13 19 7 24" stroke="#00cfff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M19 2Q13 7 7 13Q13 19 19 24" stroke="#00ffbe" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <circle cx="7" cy="6.5" r="1.4" fill="#00cfff" />
              <circle cx="19" cy="6.5" r="1.4" fill="#00ffbe" />
              <circle cx="13" cy="13" r="1.8" fill="white" opacity="0.5" />
              <circle cx="7" cy="19.5" r="1.4" fill="#00cfff" />
              <circle cx="19" cy="19.5" r="1.4" fill="#00ffbe" />
            </svg>
            HelixLab
          </div>
          <div className="nav-links">
            <a href="#analyzer">Analyzer</a>
            <a href="#features">Features</a>
            <a href="#docs">Docs</a>
            <a href="#pricing">Pricing</a>
          </div>
          <button className="nav-cta" onClick={handleGetStarted}>
            Launch App
          </button>
        </nav>

        <div className="ticker-wrap">
          <div className="ticker" id="ticker">
            {mounted && renderTicker()}
          </div>
        </div>

        <section className="hero">
          <div className="hero-pill">
            <div className="pill-dot"></div>
            Molecular Biology · Real-time Analysis
          </div>
          <h1 className="hero-title">
            <span className="l1">Decode Every</span>
            <span className="l2">Sequence.</span>
          </h1>
          <p className="hero-sub">
            Professional-grade DNA analysis in your browser. GC content, ORF detection, restriction mapping, CRISPR guides — all instant. No installs.
          </p>
          <div className="hero-btns">
            <button className="btn-p" onClick={handleGetStarted}>
              Analyze a Sequence
            </button>
            <button className="btn-g" onClick={() => router.push('/docs')}>
              View Documentation
            </button>
          </div>
          <div className="scroll-ind">
            <div className="scroll-line"></div>
            Scroll
          </div>
        </section>

        <div className="stats">
          <div className="stat">
            <div className="stat-n">6</div>
            <div className="stat-l">Reading frames</div>
          </div>
          <div className="stat">
            <div className="stat-n">200+</div>
            <div className="stat-l">Restriction enzymes</div>
          </div>
          <div className="stat">
            <div className="stat-n">&lt;1s</div>
            <div className="stat-l">Analysis time</div>
          </div>
          <div className="stat">
            <div className="stat-n">3</div>
            <div className="stat-l">CRISPR systems</div>
          </div>
          <div className="stat">
            <div className="stat-n">Free</div>
            <div className="stat-l">No account needed</div>
          </div>
        </div>

        <section className="features" id="features">
          <div className="feat-hd">
            <h2>Everything a Bench<br />Scientist Needs</h2>
            <p>// Built for speed. Designed for real lab workflows.</p>
          </div>
          <div className="feat-grid">
            <div className="feat-card">
              <div className="feat-ico">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 20C16 20 20 16 32 16C44 16 48 20 48 20M16 44C16 44 20 48 32 48C44 48 48 44 48 44M20 24L24 32M20 40L24 32M44 24L40 32M44 40L40 32M32 16V48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="feat-title">Nucleotide Analysis</div>
              <div className="feat-desc">A/T/G/C counts, GC%, AT skew, dinucleotide heatmaps, CpG island detection, linguistic complexity score.</div>
              <span className="feat-tag">Core</span>
            </div>
            <div className="feat-card">
              <div className="feat-ico">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2"/>
                  <path d="M32 12V52M12 32H52M22 22L42 42M42 22L22 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="32" cy="32" r="4" fill="currentColor"/>
                </svg>
              </div>
              <div className="feat-title">ORF Detection</div>
              <div className="feat-desc">All 6 reading frames visualized. Kozak scoring, signal peptide hints, minimum length filter, protein translation.</div>
              <span className="feat-tag">Gene Analysis</span>
            </div>
            <div className="feat-card">
              <div className="feat-ico">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 16H44V48H20Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M24 24H40M24 32H40M24 40H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="16" cy="20" r="3" fill="currentColor"/>
                  <circle cx="48" cy="20" r="3" fill="currentColor"/>
                  <circle cx="16" cy="44" r="3" fill="currentColor"/>
                  <circle cx="48" cy="44" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div className="feat-title">Restriction Mapping</div>
              <div className="feat-desc">200+ NEB enzymes. Filter by cut count. Linear & circular visual map. Isochizomer grouping.</div>
              <span className="feat-tag">Cloning</span>
            </div>
            <div className="feat-card">
              <div className="feat-ico">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 12L44 20V44L32 52L20 44V20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M32 28L40 32L32 36L24 32Z" fill="currentColor"/>
                  <path d="M32 20V28M32 36V44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="feat-title">CRISPR Guide Finder</div>
              <div className="feat-desc">SpCas9, SaCas9, Cas12a PAM detection. Efficiency scoring. Off-target seed region flagging. HDR template generator.</div>
              <span className="feat-tag">Genome Editing</span>
            </div>
            <div className="feat-card">
              <div className="feat-ico">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 48L24 24L32 36L40 20L48 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="12" y="16" width="40" height="36" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="20" cy="24" r="2" fill="currentColor"/>
                  <circle cx="44" cy="28" r="2" fill="currentColor"/>
                </svg>
              </div>
              <div className="feat-title">Codon Optimization</div>
              <div className="feat-desc">CAI score vs E. coli, yeast, human, CHO. Rare codon highlighting. Synonymous substitution suggestions.</div>
              <span className="feat-tag">Expression</span>
            </div>
          </div>
        </section>

        <section className="cta">
          <h2>Start Analyzing<br />Right Now</h2>
          <p>Paste any DNA sequence — FASTA or raw — and get your full report in under a second.</p>
          <button className="btn-p" onClick={handleGetStarted}>
            Open the Analyzer →
          </button>
        </section>

        <footer>
          <p>© 2025 HelixLab · Built for molecular biologists</p>
          <div className="fbadges">
            <span className="fbadge">Open Source</span>
            <span className="fbadge">No Data Stored</span>
            <span className="fbadge">Browser-only</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
