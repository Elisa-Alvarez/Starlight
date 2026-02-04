import type { NewCategory } from '../schema/categories.js';

export const CATEGORY_SEED: NewCategory[] = [
  {
    id: 'anxiety',
    name: 'Anxiety & Stress',
    description: "For when your mind won't quiet down",
    emoji: '🫂',
    displayOrder: 0,
  },
  {
    id: 'winter',
    name: 'Winter Darkness',
    description: 'For the cold, dark days',
    emoji: '❄️',
    displayOrder: 1,
  },
  {
    id: 'energy',
    name: 'Energy & Motivation',
    description: 'Gentle encouragement to keep going',
    emoji: '✨',
    displayOrder: 2,
  },
  {
    id: 'self-care',
    name: 'Self-Care',
    description: 'Permission to take care of yourself',
    emoji: '🛁',
    displayOrder: 3,
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'For being present right now',
    emoji: '🌿',
    displayOrder: 4,
  },
  {
    id: 'sleep',
    name: 'Sleep & Rest',
    description: 'For winding down',
    emoji: '🌙',
    displayOrder: 5,
  },
  {
    id: 'focus',
    name: 'Focus',
    description: 'One thing at a time',
    emoji: '🎯',
    displayOrder: 6,
  },
  {
    id: 'overthinking',
    name: 'Overthinking',
    description: "For when your brain won't stop",
    emoji: '🧠',
    displayOrder: 7,
  },
  {
    id: 'peace',
    name: 'Peace',
    description: 'Finding calm in the chaos',
    emoji: '🕊️',
    displayOrder: 8,
  },
  {
    id: 'hard-days',
    name: 'Hard Days',
    description: 'For when everything feels heavy',
    emoji: '💙',
    displayOrder: 9,
  },
];
