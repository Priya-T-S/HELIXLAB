'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/Button'
import { Settings, Bell, Shield, Palette, Save } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoSave: true,
    exportFormat: 'csv',
  })

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <Sidebar />
      <Toaster position="top-right" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:ml-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="text-accent-cyan" size={32} />
            <h1 className="text-4xl font-bold text-slate-100">Settings</h1>
          </div>
          <p className="text-slate-400">Customize your DNA Sequence Analyzer experience</p>
        </motion.div>

        <div className="space-y-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-accent-cyan" size={24} />
              <h2 className="text-xl font-bold text-slate-100">Notifications</h2>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-slate-300">Enable notifications for analysis completion</span>
            </label>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <Palette className="text-accent-purple" size={24} />
              <h2 className="text-xl font-bold text-slate-100">Appearance</h2>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-slate-300">Dark mode (always enabled)</span>
            </label>
          </motion.div>

          {/* Export Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-accent-teal" size={24} />
              <h2 className="text-xl font-bold text-slate-100">Export Settings</h2>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-slate-300 mb-2 block">Default export format</span>
                <select
                  value={settings.exportFormat}
                  onChange={(e) => setSettings({ ...settings, exportFormat: e.target.value })}
                  className="input-premium w-full"
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                  <option value="fasta">FASTA</option>
                </select>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-slate-300">Auto-save analysis results</span>
              </label>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" onClick={handleSave} className="w-full sm:w-auto">
              <Save size={20} />
              Save Settings
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
