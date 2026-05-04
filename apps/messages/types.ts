export type ChatMessage = {
  id: string
  role: 'visitor' | 'system'
  text: string
  ts: number
}

export type SendBody = {
  name: string
  email: string
  context?: 'recruiter' | 'engineer' | 'other'
  body: string
}
