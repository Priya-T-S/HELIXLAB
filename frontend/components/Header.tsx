'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/20 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-3xl"
            >
              🧬
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-100">DNA Analyzer</h1>
              <p className="text-xs text-slate-400">Bioinformatics Suite</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-300 hover:text-slate-100 transition-colors text-sm font-medium">
              Home
            </Link>
            <Link href="/#features" className="text-slate-300 hover:text-slate-100 transition-colors text-sm font-medium">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-slate-300 hover:text-slate-100 transition-colors text-sm font-medium">
              How It Works
            </Link>
            <Link href="/docs" className="text-slate-300 hover:text-slate-100 transition-colors text-sm font-medium">
              Documentation
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/analyzer">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-sm"
              >
                Launch Analyzer
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-700/20 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 space-y-2"
          >
            <Link href="/" className="block px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors">
              Home
            </Link>
            <Link href="/#features" className="block px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors">
              Features
            </Link>
            <Link href="/analyzer" className="block px-4 py-2 btn-primary text-center">
              Launch Analyzer
            </Link>
          </motion.div>
        )}
      </div>
    </header>
  )
}

