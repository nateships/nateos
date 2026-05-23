import type { Resume } from './schema'

export const EMPTY_RESUME: Resume = {
  summary: '',
  experience: [],
  certifications: [],
  education: [],
  skills: {},
}

/** Full resume when job-searching; an empty resume otherwise so the CV never ships. */
export function buildResumeData(active: boolean, full: Resume): Resume {
  return active ? full : EMPTY_RESUME
}
