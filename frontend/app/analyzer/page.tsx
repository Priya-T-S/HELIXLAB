'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnalyzerWorkspace from '@/components/AnalyzerWorkspace'

export default function AnalyzerPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/')
    }
  }, [router])

  return <AnalyzerWorkspace />
}
