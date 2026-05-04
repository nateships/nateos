import { z } from 'zod'

export const Profile = z.object({
  name: z.string(),
  tagline: z.string(),
  location: z.string(),
  email: z.email(),
  links: z.array(z.object({ label: z.string(), url: z.url() })),
})
export type Profile = z.infer<typeof Profile>

export const ResumeRole = z.object({
  company: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  location: z.string(),
  bullets: z.array(z.string()),
})

export const Resume = z.object({
  summary: z.string(),
  experience: z.array(ResumeRole),
  certifications: z.array(z.string()).default([]),
  education: z.array(z.object({ school: z.string(), program: z.string(), years: z.string() })),
  skills: z.record(z.string(), z.array(z.string())),
})
export type Resume = z.infer<typeof Resume>

export const Project = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string().max(280),
  tech: z.array(z.string()),
  repo: z.url().optional(),
  url: z.url().optional(),
  hero: z.string().optional(),
  order: z.number().default(0),
})
export type Project = z.infer<typeof Project>
