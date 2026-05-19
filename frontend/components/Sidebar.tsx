'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Home,
  Microscope,
  BookOpen,
  Settings,
  ChevronRight,
  Zap,
  Shield,
  Cpu,
  BarChart3,
  Dna,
} from 'lucide-react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: 'Home', href: '/', badge: null },
    { icon: Microscope, label: 'Analyzer', href: '/analyzer', badge: 'New' },
    { icon: BarChart3, label: 'Analysis History', href: '/history', badge: null },
    { icon: BookOpen, label: 'Documentation', href: '/docs', badge: null },
    { icon: Settings, label: 'Settings', href: '/settings', badge: null },
  ]

  const features = [
    { icon: Dna, label: 'Sequence Analysis', desc: 'Nucleotide composition' },
    { icon: Zap, label: 'Six-Frame Translation', desc: 'Protein translation' },
    { icon: Shield, label: 'ORF Detection', desc: 'Open reading frames' },
    { icon: Cpu, label: 'Restriction Mapping', desc: 'Enzyme detection' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 md:hidden bg-gradient-to-r from-accent-purple to-accent-cyan p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/30 z-40 md:z-30 md:translate-x-0 md:static overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/30">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <Dna size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">DSA</h1>
              <p className="text-xs text-slate-400">DNA Analyzer</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-4">
            Menu
          </p>
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                      active
                        ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`transition-colors ${
                        active ? 'text-accent-cyan' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span
                      className={`flex-1 font-medium transition-colors ${
                        active ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold bg-accent-cyan/20 text-accent-cyan rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight size={16} className="text-accent-cyan" />}
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Features Section */}
        <div className="p-4 border-t border-slate-700/30">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-4">
            Features
          </p>
          <div className="space-y-2">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="px-4 py-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Icon size={16} className="text-accent-cyan group-hover:text-accent-purple transition-colors" />
                    <span className="text-sm font-semibold text-slate-200">{feature.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-7">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/30 bg-gradient-to-t from-slate-950 to-transparent">
          <div className="text-center text-xs text-slate-500">
            DNA Sequence Analyzer v1.0
          </div>
        </div>
      </motion.aside>

      {/* Desktop Sidebar Toggle */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-72 pointer-events-none" />
    </>
  )
}
