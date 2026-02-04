import type { NewAffirmation } from '../schema/affirmations.js';

// Unsplash photo IDs per category (5 per category, cycled via modulo)
const PHOTOS: Record<string, string[]> = {
  anxiety: [
    'photo-1507525428034-b723cf961d3e',
    'photo-1470071459604-3b5ec3a7fe05',
    'photo-1518837695005-2083093ee35b',
    'photo-1476673160081-cf065bc4e00e',
    'photo-1504701954957-2010ec3bcec1',
  ],
  winter: [
    'photo-1491002052546-bf38f186af56',
    'photo-1457269449834-928af64c684d',
    'photo-1516483638261-f4dbaf036963',
    'photo-1478265409131-1f65c88f965c',
    'photo-1418985991508-e47386d96a71',
  ],
  energy: [
    'photo-1506905925346-21bda4d32df4',
    'photo-1465146344425-f00d5f5c8f07',
    'photo-1504198322253-cfa87a0ff25f',
    'photo-1501854140801-50d01698950b',
    'photo-1470252649378-9c29740c9fa8',
  ],
  'self-care': [
    'photo-1499002238440-d264edd596ec',
    'photo-1509316975850-ff9c5deb0cd9',
    'photo-1518495973542-4542c06a5843',
    'photo-1490750967868-88aa4f44baee',
    'photo-1507003211169-0a1dd7228f2d',
  ],
  mindfulness: [
    'photo-1441974231531-c6227db76b6e',
    'photo-1448375240586-882707db888b',
    'photo-1502082553048-f009c37129b9',
    'photo-1426604966848-d7adac402bff',
    'photo-1433086966358-54859d0ed716',
  ],
  sleep: [
    'photo-1507400492013-162706c8c05e',
    'photo-1475274047050-1d0c55b0bbc1',
    'photo-1444703686981-a3abbc4d4fe3',
    'photo-1532978379173-523e16f371f2',
    'photo-1419242902214-272b3f66ee7a',
  ],
  focus: [
    'photo-1494438639946-1ebd1d20bf85',
    'photo-1485470733090-0aae1788d668',
    'photo-1464822759023-fed622ff2c3b',
    'photo-1506744038136-46273834b3fb',
    'photo-1505144808419-1957a94ca61e',
  ],
  overthinking: [
    'photo-1513002749550-c59d786b8e6c',
    'photo-1534088568595-a066f410bcda',
    'photo-1517483000871-1dbf64a6e1c6',
    'photo-1500534623283-312aade213eb',
    'photo-1484950763426-56b5bf172dbb',
  ],
  peace: [
    'photo-1439066615861-d1af74d74000',
    'photo-1510784722466-f2aa9c52fff6',
    'photo-1498036882173-b41c28a8ba34',
    'photo-1431794062232-2a99a5431c6c',
    'photo-1469474968028-56623f02e42e',
  ],
  'hard-days': [
    'photo-1505118380757-91f5f5632de0',
    'photo-1495616811223-4d98c6e9c869',
    'photo-1519681393784-d120267933ba',
    'photo-1517483000871-1dbf64a6e1c6',
    'photo-1470252649378-9c29740c9fa8',
  ],
};

const GRADIENTS: Record<string, [string, string]> = {
  anxiety: ['#1a1a2e', '#16213e'],
  winter: ['#1B1464', '#2c2c54'],
  energy: ['#FF6B35', '#F7C59F'],
  'self-care': ['#E8A0BF', '#BA90C6'],
  mindfulness: ['#1B4332', '#2D6A4F'],
  sleep: ['#0D1B2A', '#1B2838'],
  focus: ['#2B2D42', '#8D99AE'],
  overthinking: ['#3D405B', '#81B29A'],
  peace: ['#264653', '#2A9D8F'],
  'hard-days': ['#22223B', '#4A4E69'],
};

function imageUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?w=1080&h=1920&fit=crop&q=80&auto=format`;
}

function thumbnailUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?w=50&h=88&fit=crop&q=30&auto=format`;
}

// Track per-category index to cycle through photos
const categoryCounters: Record<string, number> = {};

function makeAffirmation(id: string, text: string, categoryId: string): NewAffirmation {
  const idx = categoryCounters[categoryId] ?? 0;
  categoryCounters[categoryId] = idx + 1;

  const photos = PHOTOS[categoryId]!;
  const photoId = photos[idx % photos.length];
  const [primary, secondary] = GRADIENTS[categoryId]!;

  return {
    id,
    text,
    categoryId,
    backgroundUrl: imageUrl(photoId),
    backgroundThumbnailUrl: thumbnailUrl(photoId),
    backgroundColorPrimary: primary,
    backgroundColorSecondary: secondary,
    displayColor: '#FFFFFF',
  };
}

export const AFFIRMATION_SEED: NewAffirmation[] = [
  // Anxiety & Stress (20)
  makeAffirmation('anx1', "It's okay to not be okay today", 'anxiety'),
  makeAffirmation('anx2', "Your anxiety is lying to you", 'anxiety'),
  makeAffirmation('anx3', "You don't have to have it all figured out", 'anxiety'),
  makeAffirmation('anx4', "Breathing is enough right now", 'anxiety'),
  makeAffirmation('anx5', "This feeling will pass. It always does.", 'anxiety'),
  makeAffirmation('anx6', "You've survived every bad day so far", 'anxiety'),
  makeAffirmation('anx7', "Your worst-case scenario is rarely the real one", 'anxiety'),
  makeAffirmation('anx8', "You don't have to solve everything today", 'anxiety'),
  makeAffirmation('anx9', "It's okay to ask for help", 'anxiety'),
  makeAffirmation('anx10', "You are not your anxious thoughts", 'anxiety'),
  makeAffirmation('anx11', "Worrying doesn't change the outcome", 'anxiety'),
  makeAffirmation('anx12', "Your nervous system is just trying to protect you", 'anxiety'),
  makeAffirmation('anx13', "You can feel afraid and still be brave", 'anxiety'),
  makeAffirmation('anx14', "Not everything that feels urgent is urgent", 'anxiety'),
  makeAffirmation('anx15', "You're allowed to take things slow", 'anxiety'),
  makeAffirmation('anx16', "The anxiety will ease. Give it time.", 'anxiety'),
  makeAffirmation('anx17', "You don't have to respond to every thought", 'anxiety'),
  makeAffirmation('anx18', "Ground yourself. You're safe right now.", 'anxiety'),
  makeAffirmation('anx19', "It's okay to need a moment", 'anxiety'),
  makeAffirmation('anx20', "Your feelings are valid, even the hard ones", 'anxiety'),

  // Winter Darkness (15)
  makeAffirmation('win1', "The sun will return, and so will you", 'winter'),
  makeAffirmation('win2', "Rest is not giving up", 'winter'),
  makeAffirmation('win3', "Spring always comes, even when it feels impossible", 'winter'),
  makeAffirmation('win4', "It's okay to move slower in the dark months", 'winter'),
  makeAffirmation('win5', "You're not lazy. It's literally darker outside.", 'winter'),
  makeAffirmation('win6', "Hibernating is a natural response", 'winter'),
  makeAffirmation('win7', "The light will come back", 'winter'),
  makeAffirmation('win8', "You don't have to be productive. Just survive.", 'winter'),
  makeAffirmation('win9', "Warmth exists, even in the cold", 'winter'),
  makeAffirmation('win10', "This season will end", 'winter'),
  makeAffirmation('win11', "Seek small comforts. They matter.", 'winter'),
  makeAffirmation('win12', "Your body knows what it needs right now", 'winter'),
  makeAffirmation('win13', "Darkness makes the light more precious", 'winter'),
  makeAffirmation('win14', "You're allowed to need more rest in winter", 'winter'),
  makeAffirmation('win15', "Keep going. Spring is on its way.", 'winter'),

  // Energy & Motivation (20)
  makeAffirmation('eng1', "Small steps still move you forward", 'energy'),
  makeAffirmation('eng2', "You're doing better than you think", 'energy'),
  makeAffirmation('eng3', "Progress isn't always visible", 'energy'),
  makeAffirmation('eng4', "Just showing up is enough some days", 'energy'),
  makeAffirmation('eng5', "You don't need to be perfect to begin", 'energy'),
  makeAffirmation('eng6', "Momentum builds slowly. Keep going.", 'energy'),
  makeAffirmation('eng7', "Done is better than perfect", 'energy'),
  makeAffirmation('eng8', "You've done hard things before", 'energy'),
  makeAffirmation('eng9', "Start where you are", 'energy'),
  makeAffirmation('eng10', "Every expert was once a beginner", 'energy'),
  makeAffirmation('eng11', "Your effort counts, even when results are slow", 'energy'),
  makeAffirmation('eng12', "You're capable of more than you know", 'energy'),
  makeAffirmation('eng13', "One small thing today is enough", 'energy'),
  makeAffirmation('eng14', "Keep the faith in yourself", 'energy'),
  makeAffirmation('eng15', "You're still here. That's strength.", 'energy'),
  makeAffirmation('eng16', "Your pace is valid", 'energy'),
  makeAffirmation('eng17', "Slow progress is still progress", 'energy'),
  makeAffirmation('eng18', "You can start again anytime", 'energy'),
  makeAffirmation('eng19', "Rest first if you need to", 'energy'),
  makeAffirmation('eng20', "You're allowed to try again tomorrow", 'energy'),

  // Self-Care (18)
  makeAffirmation('sc1', "Rest is productive", 'self-care'),
  makeAffirmation('sc2', "Saying no is okay", 'self-care'),
  makeAffirmation('sc3', "You matter, even when you're not producing", 'self-care'),
  makeAffirmation('sc4', "Your needs are valid", 'self-care'),
  makeAffirmation('sc5', "You don't have to earn rest", 'self-care'),
  makeAffirmation('sc6', "It's not selfish to take care of yourself", 'self-care'),
  makeAffirmation('sc7', "Your worth isn't tied to your productivity", 'self-care'),
  makeAffirmation('sc8', "Take the break. You've earned it.", 'self-care'),
  makeAffirmation('sc9', "You can't pour from an empty cup", 'self-care'),
  makeAffirmation('sc10', "Being kind to yourself isn't weakness", 'self-care'),
  makeAffirmation('sc11', "You deserve gentleness", 'self-care'),
  makeAffirmation('sc12', "Boundaries protect your peace", 'self-care'),
  makeAffirmation('sc13', "It's okay to put yourself first sometimes", 'self-care'),
  makeAffirmation('sc14', "You're allowed to cancel plans", 'self-care'),
  makeAffirmation('sc15', "Listen to what your body needs", 'self-care'),
  makeAffirmation('sc16', "Taking care of yourself helps you take care of others", 'self-care'),
  makeAffirmation('sc17', "You don't owe anyone your energy", 'self-care'),
  makeAffirmation('sc18', "Choosing yourself isn't abandoning others", 'self-care'),

  // Mindfulness (15)
  makeAffirmation('mf1', "This moment is enough", 'mindfulness'),
  makeAffirmation('mf2', "Be here, now", 'mindfulness'),
  makeAffirmation('mf3', "You don't have to be anywhere else", 'mindfulness'),
  makeAffirmation('mf4', "Notice what's good right now", 'mindfulness'),
  makeAffirmation('mf5', "Breathe. Just breathe.", 'mindfulness'),
  makeAffirmation('mf6', "This moment won't last forever", 'mindfulness'),
  makeAffirmation('mf7', "Feel your feet on the ground", 'mindfulness'),
  makeAffirmation('mf8', "You're here. That's enough.", 'mindfulness'),
  makeAffirmation('mf9', "Let the moment be what it is", 'mindfulness'),
  makeAffirmation('mf10', "Notice without judging", 'mindfulness'),
  makeAffirmation('mf11', "Come back to your breath", 'mindfulness'),
  makeAffirmation('mf12', "Right now is all there is", 'mindfulness'),
  makeAffirmation('mf13', "Pause and feel what you feel", 'mindfulness'),
  makeAffirmation('mf14', "You don't have to figure it all out right now", 'mindfulness'),
  makeAffirmation('mf15', "Let go of the next moment for a second", 'mindfulness'),

  // Sleep & Rest (15)
  makeAffirmation('sl1', "Tomorrow is a new chance", 'sleep'),
  makeAffirmation('sl2', "Let today go. It's done.", 'sleep'),
  makeAffirmation('sl3', "Your body deserves rest", 'sleep'),
  makeAffirmation('sl4', "The worries can wait until morning", 'sleep'),
  makeAffirmation('sl5', "You did enough today", 'sleep'),
  makeAffirmation('sl6', "Sleep is healing", 'sleep'),
  makeAffirmation('sl7', "Release the day", 'sleep'),
  makeAffirmation('sl8', "You're safe to rest now", 'sleep'),
  makeAffirmation('sl9', "Tomorrow will handle itself", 'sleep'),
  makeAffirmation('sl10', "Let your mind quiet", 'sleep'),
  makeAffirmation('sl11', "Nothing needs your attention right now", 'sleep'),
  makeAffirmation('sl12', "You can think about that tomorrow", 'sleep'),
  makeAffirmation('sl13', "Rest well. You've earned it.", 'sleep'),
  makeAffirmation('sl14', "The night is for letting go", 'sleep'),
  makeAffirmation('sl15', "Close your eyes. Tomorrow will wait.", 'sleep'),

  // Focus (15)
  makeAffirmation('fc1', "One thing at a time is enough", 'focus'),
  makeAffirmation('fc2', "You don't have to do everything", 'focus'),
  makeAffirmation('fc3', "What's the one thing that matters most?", 'focus'),
  makeAffirmation('fc4', "Multitasking is a myth", 'focus'),
  makeAffirmation('fc5', "Start with one small step", 'focus'),
  makeAffirmation('fc6', "You can only do what you can do", 'focus'),
  makeAffirmation('fc7', "Focus on what you can control", 'focus'),
  makeAffirmation('fc8', "The rest can wait", 'focus'),
  makeAffirmation('fc9', "Single-tasking is a superpower", 'focus'),
  makeAffirmation('fc10', "Do one thing well", 'focus'),
  makeAffirmation('fc11', "It's okay to ignore everything else for now", 'focus'),
  makeAffirmation('fc12', "Protect your attention", 'focus'),
  makeAffirmation('fc13', "You don't need to respond to everything", 'focus'),
  makeAffirmation('fc14', "Finish one thing before starting another", 'focus'),
  makeAffirmation('fc15', "Your attention is precious. Guard it.", 'focus'),

  // Overthinking (18)
  makeAffirmation('ot1', "Your thoughts aren't facts", 'overthinking'),
  makeAffirmation('ot2', "You can't think your way out of everything", 'overthinking'),
  makeAffirmation('ot3', "Not every thought deserves your attention", 'overthinking'),
  makeAffirmation('ot4', "Let it go. You can't control it.", 'overthinking'),
  makeAffirmation('ot5', "Your brain is just doing its job. It's okay.", 'overthinking'),
  makeAffirmation('ot6', "Analysis paralysis is real. Just pick one.", 'overthinking'),
  makeAffirmation('ot7', "You've already thought about this enough", 'overthinking'),
  makeAffirmation('ot8', "Thinking more won't change the outcome", 'overthinking'),
  makeAffirmation('ot9', "Trust yourself. You know more than you think.", 'overthinking'),
  makeAffirmation('ot10', "Stop replaying. It's over.", 'overthinking'),
  makeAffirmation('ot11', "You don't need more information. You need to decide.", 'overthinking'),
  makeAffirmation('ot12', "Your gut knows. Listen to it.", 'overthinking'),
  makeAffirmation('ot13', "Done thinking? Good. Now rest.", 'overthinking'),
  makeAffirmation('ot14', "The answer won't come from more worrying", 'overthinking'),
  makeAffirmation('ot15', "Let your mind rest. The solution might find you.", 'overthinking'),
  makeAffirmation('ot16', "You don't have to solve it right now", 'overthinking'),
  makeAffirmation('ot17', "Uncertainty is uncomfortable, not dangerous", 'overthinking'),
  makeAffirmation('ot18', "Sometimes there is no right answer", 'overthinking'),

  // Peace (15)
  makeAffirmation('pc1', "You deserve calm", 'peace'),
  makeAffirmation('pc2', "Not everything needs your attention right now", 'peace'),
  makeAffirmation('pc3', "Peace is possible, even in chaos", 'peace'),
  makeAffirmation('pc4', "Stillness is strength", 'peace'),
  makeAffirmation('pc5', "You're allowed to step back", 'peace'),
  makeAffirmation('pc6', "Find the quiet in the noise", 'peace'),
  makeAffirmation('pc7', "You don't have to fix everything", 'peace'),
  makeAffirmation('pc8', "Let go of what you can't control", 'peace'),
  makeAffirmation('pc9', "Create space for silence", 'peace'),
  makeAffirmation('pc10', "It's okay to do nothing", 'peace'),
  makeAffirmation('pc11', "Peace begins within", 'peace'),
  makeAffirmation('pc12', "You can choose calm", 'peace'),
  makeAffirmation('pc13', "Let the noise fade", 'peace'),
  makeAffirmation('pc14', "Protect your peace fiercely", 'peace'),
  makeAffirmation('pc15', "Calm is always available to you", 'peace'),

  // Hard Days (20)
  makeAffirmation('hd1', "Struggling doesn't mean failing", 'hard-days'),
  makeAffirmation('hd2', "You're allowed to have a bad day", 'hard-days'),
  makeAffirmation('hd3', "Tomorrow is a new chance, but today can just be today", 'hard-days'),
  makeAffirmation('hd4', "Surviving is enough sometimes", 'hard-days'),
  makeAffirmation('hd5', "It's okay to just exist today", 'hard-days'),
  makeAffirmation('hd6', "You don't have to be strong all the time", 'hard-days'),
  makeAffirmation('hd7', "This too shall pass", 'hard-days'),
  makeAffirmation('hd8', "You're not alone, even when it feels that way", 'hard-days'),
  makeAffirmation('hd9', "Bad days don't make a bad life", 'hard-days'),
  makeAffirmation('hd10', "You're doing the best you can", 'hard-days'),
  makeAffirmation('hd11', "It's okay to not have it together", 'hard-days'),
  makeAffirmation('hd12', "You've survived 100% of your worst days", 'hard-days'),
  makeAffirmation('hd13', "Gentle with yourself today", 'hard-days'),
  makeAffirmation('hd14', "You don't have to pretend to be okay", 'hard-days'),
  makeAffirmation('hd15', "Hard times don't last. Neither will this.", 'hard-days'),
  makeAffirmation('hd16', "It's okay to feel what you feel", 'hard-days'),
  makeAffirmation('hd17', "You're still here. That matters.", 'hard-days'),
  makeAffirmation('hd18', "One moment at a time", 'hard-days'),
  makeAffirmation('hd19', "The darkness will lift", 'hard-days'),
  makeAffirmation('hd20', "You're braver than you believe", 'hard-days'),
];
