const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface AnalysisRequest {
  sequence: string
  type: 'raw' | 'fasta'
}

export interface AnalysisResponse {
  results: Array<{
    header: string
    stats: {
      length: number
      a_count: number
      t_count: number
      g_count: number
      c_count: number
      ambiguous_count: number
      gc_content: number
      at_content: number
    }
    reverse_complement: string
    translations: Record<string, string>
    orfs: Record<string, any>
  }>
}

export class APIClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE) {
    this.baseURL = baseURL
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await fetch(`${this.baseURL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Analysis failed')
    }

    return response.json()
  }

  async health(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/api/health`)

    if (!response.ok) {
      throw new Error('Health check failed')
    }

    return response.json()
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.health()
      return true
    } catch {
      return false
    }
  }
}

export const apiClient = new APIClient()
