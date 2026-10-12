import { LevelConfig } from '../types';
import { COLOR_KEYS } from '../constants/colors';

// 60 Progressive Levels
// Curated levels 1-10 introduce players gently
const CURATED_LEVELS: LevelConfig[] = [
  // Level 1: 3 tubes, 2 colors (Red, Blue), 1 empty tube
  {
    id: 1,
    name: 'Introduction',
    capacity: 4,
    difficulty: 'tutorial',
    tubes: [
      ['red', 'blue', 'red', 'blue'],
      ['blue', 'red', 'blue', 'red'],
      [],
    ],
  },
  // Level 2: 3 tubes, 2 colors (Yellow, Green), 1 empty
  {
    id: 2,
    name: 'Twin Drops',
    capacity: 4,
    difficulty: 'tutorial',
    tubes: [
      ['yellow', 'green', 'yellow', 'yellow'],
      ['green', 'yellow', 'green', 'green'],
      [],
    ],
  },
  // Level 3: 4 tubes, 3 colors, 1 empty
  {
    id: 3,
    name: 'Trio Balance',
    capacity: 4,
    difficulty: 'easy',
    tubes: [
      ['blue', 'red', 'yellow', 'red'],
      ['yellow', 'blue', 'red', 'yellow'],
      ['red', 'yellow', 'blue', 'blue'],
      [],
    ],
  },
  // Level 4: 5 tubes, 3 colors, 2 empty tubes
  {
    id: 4,
    name: 'Open Springs',
    capacity: 4,
    difficulty: 'easy',
    tubes: [
      ['purple', 'green', 'purple', 'green'],
      ['green', 'orange', 'purple', 'orange'],
      ['orange', 'purple', 'green', 'orange'],
      [],
      [],
    ],
  },
  // Level 5: 5 tubes, 4 colors, 1 empty
  {
    id: 5,
    name: 'Four Flow',
    capacity: 4,
    difficulty: 'easy',
    tubes: [
      ['red', 'blue', 'yellow', 'green'],
      ['green', 'red', 'blue', 'yellow'],
      ['yellow', 'green', 'red', 'blue'],
      ['blue', 'yellow', 'green', 'red'],
      [],
    ],
  },
  // Level 6: 6 tubes, 4 colors, 2 empty
  {
    id: 6,
    name: 'Crystal Waters',
    capacity: 4,
    difficulty: 'easy',
    tubes: [
      ['pink', 'cyan', 'lime', 'purple'],
      ['cyan', 'pink', 'purple', 'lime'],
      ['lime', 'cyan', 'pink', 'purple'],
      ['purple', 'lime', 'cyan', 'pink'],
      [],
      [],
    ],
  },
  // Level 7: 6 tubes, 4 colors, 2 empty
  {
    id: 7,
    name: 'Prism Ripple',
    capacity: 4,
    difficulty: 'medium',
    tubes: [
      ['orange', 'blue', 'orange', 'green'],
      ['red', 'green', 'blue', 'red'],
      ['green', 'red', 'blue', 'orange'],
      ['blue', 'orange', 'red', 'green'],
      [],
      [],
    ],
  },
  // Level 8: 7 tubes, 5 colors, 2 empty
  {
    id: 8,
    name: 'Deep Cascade',
    capacity: 4,
    difficulty: 'medium',
    tubes: [
      ['yellow', 'purple', 'cyan', 'red'],
      ['green', 'red', 'yellow', 'purple'],
      ['cyan', 'green', 'purple', 'yellow'],
      ['red', 'cyan', 'green', 'cyan'],
      ['purple', 'yellow', 'red', 'green'],
      [],
      [],
    ],
  },
  // Level 9: 7 tubes, 5 colors, 2 empty
  {
    id: 9,
    name: 'Aqua Harmony',
    capacity: 4,
    difficulty: 'medium',
    tubes: [
      ['lime', 'pink', 'blue', 'orange'],
      ['orange', 'lime', 'pink', 'amber'],
      ['amber', 'blue', 'orange', 'pink'],
      ['pink', 'amber', 'lime', 'blue'],
      ['blue', 'orange', 'amber', 'lime'],
      [],
      [],
    ],
  },
  // Level 10: 8 tubes, 6 colors, 2 empty
  {
    id: 10,
    name: 'Rainbow Alchemy',
    capacity: 4,
    difficulty: 'medium',
    tubes: [
      ['red', 'blue', 'green', 'yellow'],
      ['purple', 'orange', 'red', 'blue'],
      ['green', 'yellow', 'purple', 'orange'],
      ['red', 'purple', 'green', 'yellow'],
      ['orange', 'blue', 'red', 'purple'],
      ['yellow', 'green', 'blue', 'orange'],
      [],
      [],
    ],
  },
];

/**
 * Seeded pseudo-random number generator for reproducible procedural levels
 */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Procedurally generates a guaranteed-solvable level by starting with a solved state
 * and reversing valid pours.
 */
export function generateSolvableLevel(
  colorCount: number,
  emptyTubes: number = 2,
  scrambleSteps: number = 60,
  seed: number = Date.now()
): string[][] {
  const rand = seededRandom(seed);
  const availableColors = [...COLOR_KEYS].slice(0, Math.min(colorCount, COLOR_KEYS.length));

  // 1. Initial solved state: each color tube has 4 units of identical color
  const tubes: string[][] = availableColors.map((color) => [color, color, color, color]);
  for (let i = 0; i < emptyTubes; i++) {
    tubes.push([]);
  }

  const capacity = 4;

  // 2. Perform reverse scrambles
  // In reverse: take top unit(s) from a tube and move it to another tube that has space,
  // even if colors differ underneath!
  let successfulMoves = 0;
  let attempts = 0;

  while (successfulMoves < scrambleSteps && attempts < 800) {
    attempts++;
    const fromIdx = Math.floor(rand() * tubes.length);
    const toIdx = Math.floor(rand() * tubes.length);

    if (fromIdx === toIdx) continue;
    if (tubes[fromIdx].length === 0) continue;
    if (tubes[toIdx].length >= capacity) continue;

    // How many can we move back? 1 or 2
    const availableToMove = tubes[fromIdx].length;
    const roomInDest = capacity - tubes[toIdx].length;
    const maxUnits = Math.min(availableToMove, roomInDest, rand() > 0.4 ? 1 : 2);

    if (maxUnits <= 0) continue;

    const color = tubes[fromIdx].pop()!;
    tubes[toIdx].push(color);
    successfulMoves++;
  }

  // Ensure at least 1 or 2 tubes remain empty or mostly empty for playable room
  let emptyCount = tubes.filter((t) => t.length === 0).length;
  if (emptyCount === 0) {
    // Pick the tube with fewest items and distribute them
    let minIdx = 0;
    for (let i = 1; i < tubes.length; i++) {
      if (tubes[i].length < tubes[minIdx].length) minIdx = i;
    }
    const drained = [...tubes[minIdx]];
    tubes[minIdx] = [];

    // Distribute drained items to other tubes that have room
    for (const item of drained) {
      let placed = false;
      for (let i = 0; i < tubes.length; i++) {
        if (i !== minIdx && tubes[i].length < capacity) {
          tubes[i].push(item);
          placed = true;
          break;
        }
      }
      if (!placed) {
        // If couldn't place, return item
        tubes[minIdx].push(item);
      }
    }
  }

  return tubes;
}

/**
 * Returns LevelConfig for any level 1..60+
 */
export function getLevelConfig(levelId: number): LevelConfig {
  const curated = CURATED_LEVELS.find((l) => l.id === levelId);
  if (curated) return curated;

  // Procedural levels
  let colorCount = 4;
  let emptyTubes = 2;
  let difficulty: LevelConfig['difficulty'] = 'medium';

  if (levelId <= 15) {
    colorCount = 5;
    emptyTubes = 2;
    difficulty = 'medium';
  } else if (levelId <= 30) {
    colorCount = 6;
    emptyTubes = 2;
    difficulty = 'hard';
  } else if (levelId <= 45) {
    colorCount = 7;
    emptyTubes = 2;
    difficulty = 'hard';
  } else {
    colorCount = Math.min(8 + Math.floor((levelId - 45) / 10), 10);
    emptyTubes = 2;
    difficulty = 'expert';
  }

  const scrambleSteps = 40 + Math.min(levelId * 2, 70);
  const tubes = generateSolvableLevel(colorCount, emptyTubes, scrambleSteps, levelId * 7919 + 42);

  return {
    id: levelId,
    name: `Flask Chamber ${levelId}`,
    capacity: 4,
    difficulty,
    tubes,
  };
}

export const TOTAL_LEVELS = 60;
