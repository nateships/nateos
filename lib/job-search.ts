/**
 * Owner-controlled "are we job hunting" switch. Default OFF so unset/preview
 * builds hide the job-hunting surfaces. Set NEXT_PUBLIC_JOBSEARCH=on in the
 * deploy env to show them. Fails closed: only the exact string "on" enables it.
 */
export function isJobSearchActive(
  value: string | undefined = process.env.NEXT_PUBLIC_JOBSEARCH,
): boolean {
  return value === 'on'
}

export const JOB_SEARCH_ACTIVE = isJobSearchActive()
