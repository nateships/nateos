export type Op = '+' | '-' | '*' | '/' | '=' | 'AC' | '±' | '%' | '.'

export type Action = { kind: 'digit'; d: number } | { kind: 'op'; op: Op }

export type CalcState = {
  display: string
  acc: number | null
  pendingOp: '+' | '-' | '*' | '/' | null
  freshDigit: boolean
}

export function initialState(): CalcState {
  return { display: '0', acc: null, pendingOp: null, freshDigit: true }
}

function toNum(s: string): number {
  return Number(s)
}
function fmt(n: number): string {
  if (!Number.isFinite(n)) return 'Error'
  return Number(n.toPrecision(12)).toString()
}

function applyPending(state: CalcState): CalcState {
  if (state.pendingOp === null || state.acc === null) {
    return { ...state, acc: toNum(state.display) }
  }
  const a = state.acc
  const b = toNum(state.display)
  let r = a
  switch (state.pendingOp) {
    case '+':
      r = a + b
      break
    case '-':
      r = a - b
      break
    case '*':
      r = a * b
      break
    case '/':
      r = b === 0 ? NaN : a / b
      break
  }
  return { ...state, acc: r, display: fmt(r) }
}

export function calc(state: CalcState, action: Action): CalcState {
  if (action.kind === 'digit') {
    if (state.freshDigit) {
      return { ...state, display: String(action.d), freshDigit: false }
    }
    if (state.display === '0') return { ...state, display: String(action.d) }
    return { ...state, display: state.display + String(action.d) }
  }
  const op = action.op
  if (op === 'AC') return initialState()
  if (op === '.') {
    if (state.freshDigit) return { ...state, display: '0.', freshDigit: false }
    if (state.display.includes('.')) return state
    return { ...state, display: `${state.display}.` }
  }
  if (op === '±') {
    if (state.display === '0') return state
    const flipped = state.display.startsWith('-') ? state.display.slice(1) : `-${state.display}`
    return { ...state, display: flipped }
  }
  if (op === '%') {
    const v = toNum(state.display) / 100
    return { ...state, display: fmt(v), freshDigit: true }
  }
  if (op === '=') {
    const next = applyPending(state)
    return { ...next, pendingOp: null, freshDigit: true }
  }
  // Arithmetic operator
  const next = applyPending(state)
  return { ...next, pendingOp: op, freshDigit: true }
}
