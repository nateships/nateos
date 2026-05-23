'use client'
import { isJobSearchActive } from '@/lib/job-search'
import { ResumeCard } from './ResumeCard'
import { ResumeCV } from './ResumeCV'

export function ResumeApp() {
  if (!isJobSearchActive()) return <ResumeCard />
  return <ResumeCV />
}
