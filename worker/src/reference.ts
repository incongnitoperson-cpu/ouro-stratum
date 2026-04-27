const REFERENCE_DATA = {
  cognitiveTraps: [
    { name: 'Sunk Cost Fallacy', desc: 'Continuing because of past investment, not future value' },
    { name: 'Confirmation Bias', desc: 'Seeking info that confirms existing beliefs' },
    { name: 'Availability Heuristic', desc: 'Overweighting recent or vivid examples' },
    { name: 'Anchoring', desc: 'Over-relying on the first piece of information encountered' },
    { name: 'Overconfidence Effect', desc: 'Systematically overestimating knowledge and control' },
    { name: 'Planning Fallacy', desc: 'Underestimating time, costs, and risks of future actions' },
    { name: 'Status Quo Bias', desc: 'Preference for the current state over change' },
    { name: 'Optimism Bias', desc: 'Believing bad outcomes are less likely to happen to you' },
  ],
  frameworks: [
    { name: 'Second-Order Thinking', desc: 'Consider consequences of consequences, not just immediate effects' },
    { name: 'Inversion', desc: 'Solve the problem by figuring out what to avoid' },
    { name: 'Expected Value', desc: 'Probability-weighted average of all possible outcomes' },
    { name: 'Regret Minimization', desc: 'Choose what you will regret least looking back at 80' },
    { name: 'Reversibility Test', desc: 'One-way doors need more care than two-way doors' },
    { name: 'Pre-Mortem', desc: 'Imagine failure happened, then work backwards to explain why' },
    { name: 'Circle of Competence', desc: 'Know your edge and act within it' },
    { name: '10/10/10', desc: 'How will you feel about this in 10 mins, 10 months, 10 years?' },
  ],
  riskCategories: [
    { name: 'Financial Risk', desc: 'Monetary loss or gain implications' },
    { name: 'Reputational Risk', desc: 'Impact on how others perceive you' },
    { name: 'Opportunity Risk', desc: 'What you give up by committing to this path' },
    { name: 'Execution Risk', desc: 'Risk of failing to implement correctly' },
    { name: 'Market/Environment Risk', desc: 'External changes that could invalidate the decision' },
    { name: 'Relationship Risk', desc: 'Impact on key relationships' },
    { name: 'Time Risk', desc: 'Opportunity cost of time invested' },
    { name: 'Health/Wellbeing Risk', desc: 'Physical and mental health implications' },
  ],
  timeHorizons: [
    { horizon: '1 week', focus: 'Immediate logistics, quick reversibility, resource availability' },
    { horizon: '1 month', focus: 'Short-term momentum, cash flow, immediate relationships' },
    { horizon: '3 months', focus: 'Quarterly cycles, project timelines, skill building' },
    { horizon: '1 year', focus: 'Annual planning, major market shifts, habit formation' },
    { horizon: '3 years', focus: 'Career trajectory, compounding effects, major milestones' },
    { horizon: '10 years', focus: 'Paradigm shifts, identity formation, what truly matters' },
  ],
  stakeholders: [
    { factor: 'Direct Impact', desc: 'Who is directly affected by this decision' },
    { factor: 'Indirect Impact', desc: 'Who is indirectly affected or influenced' },
    { factor: 'Decision Authority', desc: 'Who has formal authority or veto power' },
    { factor: 'Informal Influencers', desc: 'Who can shape outcomes without formal authority' },
    { factor: 'Beneficiaries', desc: 'Who gains from a successful outcome' },
    { factor: 'Resistors', desc: 'Who loses or would actively resist this decision' },
  ],
  resources: [
    { factor: 'Capital', desc: 'Financial resources required and available' },
    { factor: 'Time', desc: 'Hours and weeks required for execution' },
    { factor: 'Attention', desc: 'Cognitive bandwidth and focus required' },
    { factor: 'Network', desc: 'Relationships and connections needed to execute' },
    { factor: 'Skills', desc: 'Competencies required vs. currently held' },
    { factor: 'Energy', desc: 'Physical and emotional capacity required' },
  ],
  precedents: [
    { pattern: 'Analysis Paralysis', desc: 'Over-analysis causes missed windows of opportunity' },
    { pattern: 'Premature Scaling', desc: 'Expanding before validating core assumptions fails consistently' },
    { pattern: 'Pivoting Too Late', desc: 'Continuing a failing path due to sunk costs compounds losses' },
    { pattern: 'Contrarian Wins', desc: 'Going against consensus at the right time creates outsized returns' },
    { pattern: 'First-Mover Trap', desc: 'Being first is often erased by better-prepared followers' },
    { pattern: 'Consensus Trap', desc: 'Unanimous decisions often hide suppressed dissent' },
  ],
}

const AGENT_RELEVANT_CATEGORIES: Record<string, (keyof typeof REFERENCE_DATA)[]> = {
  Optimist: ['frameworks', 'precedents', 'timeHorizons'],
  Pessimist: ['cognitiveTraps', 'riskCategories', 'precedents'],
  Statistician: ['frameworks', 'riskCategories', 'timeHorizons'],
  "Devil's Advocate": ['cognitiveTraps', 'frameworks', 'precedents'],
  '10-Year Future Self': ['timeHorizons', 'frameworks', 'stakeholders'],
  'Opportunity Cost': ['resources', 'riskCategories', 'frameworks'],
}

export function getRelevantReference(agentName: string): string {
  const categories = AGENT_RELEVANT_CATEGORIES[agentName] ?? ['frameworks', 'riskCategories']
  const lines: string[] = []

  for (const cat of categories) {
    const items = REFERENCE_DATA[cat]
    lines.push(`${cat.toUpperCase()}:`)
    for (const item of items.slice(0, 4)) {
      const label = 'name' in item ? item.name : item.factor ?? item.horizon ?? ''
      const detail = 'desc' in item ? item.desc : item.focus ?? ''
      lines.push(`  - ${label}: ${detail}`)
    }
  }

  return lines.join('\n')
}
