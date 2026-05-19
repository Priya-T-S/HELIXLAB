'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/Button'
import { Clock, Trash2, RotateCcw } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface HistoryItem {
  id: string
  sequence: string
  header: string
  timestamp: string
  gcContent: number
  length: number
}

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('analysisHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleDelete = (id: string) => {
    setHistory(history.filter((item) => item.id !== id))
    toast.success('Item deleted')
  }

  const handleClearAll = () => {
    setHistory([])
    localStorage.removeItem('analysisHistory')
    toast.success('History cleared')
  }

  const handleReanalyze = (item: HistoryItem) => {
    localStorage.setItem('lastSequence', item.sequence)
    router.push('/analyzer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <Sidebar />
      <Toaster position="top-right" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:ml-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-accent-cyan" size={32} />
              <h1 className="text-4xl font-bold text-slate-100">Analysis History</h1>
            </div>
            <p className="text-slate-400">View and manage your previous analyses</p>
          </div>
          {history.length > 0 && (
            <Button variant="outline" onClick={handleClearAll} className="text-red-400 hover:text-red-300">
              Clear All
            </Button>
          )}
        </motion.div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <Clock size={48} className="mx-auto text-slate-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-300 mb-2">No analysis history yet</h2>
            <p className="text-slate-400 mb-6">Start analyzing DNA sequences to build your history</p>
            <Button onClick={() => router.push('/analyzer')}>Go to Analyzer</Button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{item.header}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Length</p>
                      <p className="text-accent-cyan font-semibold">{item.length} bp</p>
                    </div>
                    <div>
                      <p className="text-slate-400">GC Content</p>
                      <p className="text-accent-purple font-semibold">{item.gcContent}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Analyzed</p>
                      <p className="text-accent-teal font-semibold">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReanalyze(item)}
                    className="gap-2"
                  >
                    <RotateCcw size={16} />
                    Reanalyze
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
