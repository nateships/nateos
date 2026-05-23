/**
 * Owner-controlled "are we job hunting" switch. Default ON so unset/preview
 * builds keep the full job-search experience. Set NEXT_PUBLIC_JOBSEARCH=off
 * in the deploy env to hide the job-hunting surfaces. Fails open: only the
 * exact string "off" disables it.
 */
export function isJobSearchActive(
  value: string | undefined = process.env.NEXT_PUBLIC_JOBSEARCH,
): boolean {
  return value !== 'off'
}

export const JOB_SEARCH_ACTIVE = isJobSearchActive()
