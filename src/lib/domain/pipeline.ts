const validTransitions: Record<string, string[]> = {
  researching: ['applied', 'withdrawn'],
  applied: [
    'recruiter_screen',
    'rejected',
    'ghosted',
    'withdrawn',
    'on_hold'
  ],
  recruiter_screen: [
    'phone_interview',
    'rejected',
    'ghosted',
    'withdrawn',
    'on_hold'
  ],
  phone_interview: [
    'onsite',
    'rejected',
    'ghosted',
    'withdrawn',
    'on_hold'
  ],
  onsite: [
    'final_round',
    'offer',
    'rejected',
    'ghosted',
    'withdrawn',
    'on_hold'
  ],
  final_round: ['offer', 'rejected', 'ghosted', 'withdrawn', 'on_hold'],
  offer: ['negotiating', 'accepted', 'rejected', 'withdrawn'],
  negotiating: ['accepted', 'rejected', 'withdrawn'],
  on_hold: [
    'applied',
    'recruiter_screen',
    'phone_interview',
    'withdrawn',
    'ghosted'
  ]
};

const terminalStates = ['accepted', 'rejected', 'withdrawn', 'ghosted'];

export function canTransition(from: string, to: string): boolean {
  if (terminalStates.includes(from)) return false;
  return validTransitions[from]?.includes(to) ?? false;
}

export function isTerminalState(status: string): boolean {
  return terminalStates.includes(status);
}

export { validTransitions, terminalStates };
