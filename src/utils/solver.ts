import { HintStep } from '../types';

export function isTubeComplete(tube: string[], capacity: number = 4): boolean {
  if (tube.length !== capacity) return false;
  const first = tube[0];
  return tube.every((c) => c === first);
}

export function isGameWon(tubes: string[][], capacity: number = 4): boolean {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    if (!isTubeComplete(tube, capacity)) return false;
  }
  return true;
}

export function getTopColor(tube: string[]): string | null {
  if (tube.length === 0) return null;
  return tube[tube.length - 1];
}

export function getTopColorCount(tube: string[]): number {
  if (tube.length === 0) return 0;
  const top = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] === top) count++;
    else break;
  }
  return count;
}

export function canPour(
  tubes: string[][],
  fromIndex: number,
  toIndex: number,
  capacity: number = 4
): { valid: boolean; units: number; reason?: string } {
  if (fromIndex === toIndex) return { valid: false, units: 0, reason: 'Same tube' };
  if (fromIndex < 0 || fromIndex >= tubes.length) return { valid: false, units: 0, reason: 'Invalid source' };
  if (toIndex < 0 || toIndex >= tubes.length) return { valid: false, units: 0, reason: 'Invalid destination' };

  const source = tubes[fromIndex];
  const dest = tubes[toIndex];

  if (source.length === 0) return { valid: false, units: 0, reason: 'Source is empty' };
  if (dest.length >= capacity) return { valid: false, units: 0, reason: 'Destination is full' };

  const sourceTop = getTopColor(source)!;
  const destTop = getTopColor(dest);

  if (destTop !== null && destTop !== sourceTop) {
    return { valid: false, units: 0, reason: 'Colors do not match' };
  }

  // Avoid useless move: pouring a pure single-color tube into an empty tube
  if (dest.length === 0 && source.every((c) => c === sourceTop)) {
    return { valid: false, units: 0, reason: 'No point moving pure tube to empty tube' };
  }

  const sourceTopCount = getTopColorCount(source);
  const destSpace = capacity - dest.length;
  const units = Math.min(sourceTopCount, destSpace);

  return { valid: units > 0, units };
}

export function executePour(
  tubes: string[][],
  fromIndex: number,
  toIndex: number,
  capacity: number = 4
): { newTubes: string[][]; units: number; colorId: string } | null {
  const check = canPour(tubes, fromIndex, toIndex, capacity);
  if (!check.valid || check.units <= 0) return null;

  const newTubes = tubes.map((t) => [...t]);
  const colorId = getTopColor(newTubes[fromIndex])!;

  for (let i = 0; i < check.units; i++) {
    newTubes[fromIndex].pop();
    newTubes[toIndex].push(colorId);
  }

  return { newTubes, units: check.units, colorId };
}

// Canonical state representation for solver cycle detection
function stateHash(tubes: string[][]): string {
  // Sorting tubes canonicalizes symmetric empty/identical tubes
  return tubes
    .map((t) => t.join(','))
    .sort()
    .join('|');
}

/**
 * Breadth-First-Search solver to find the optimal next move / hint or detect deadlocks
 */
export function findNextHint(
  currentTubes: string[][],
  capacity: number = 4,
  maxExplorations: number = 2500
): HintStep | null {
  if (isGameWon(currentTubes, capacity)) return null;

  interface QueueNode {
    tubes: string[][];
    firstMove?: HintStep;
  }

  const queue: QueueNode[] = [{ tubes: currentTubes }];
  const visited = new Set<string>();
  visited.add(stateHash(currentTubes));

  let stepsExplored = 0;

  while (queue.length > 0 && stepsExplored < maxExplorations) {
    const node = queue.shift()!;
    stepsExplored++;

    if (isGameWon(node.tubes, capacity)) {
      return node.firstMove || null;
    }

    // Try all valid pours
    for (let i = 0; i < node.tubes.length; i++) {
      if (node.tubes[i].length === 0) continue;
      // If tube is already complete, do not break it
      if (isTubeComplete(node.tubes[i], capacity)) continue;

      for (let j = 0; j < node.tubes.length; j++) {
        if (i === j) continue;

        const check = canPour(node.tubes, i, j, capacity);
        if (!check.valid) continue;

        const result = executePour(node.tubes, i, j, capacity);
        if (!result) continue;

        const hash = stateHash(result.newTubes);
        if (!visited.has(hash)) {
          visited.add(hash);

          const step: HintStep = node.firstMove || {
            fromIndex: i,
            toIndex: j,
            colorId: result.colorId,
            units: result.units,
            reason: `Pour ${result.colorId} from Flask ${i + 1} into Flask ${j + 1}`,
          };

          // Early exit if this move solves the level
          if (isGameWon(result.newTubes, capacity)) {
            return step;
          }

          queue.push({
            tubes: result.newTubes,
            firstMove: step,
          });
        }
      }
    }
  }

  // Fallback: If BFS was capped or no complete path, suggest any move that merges or cleans a tube
  for (let i = 0; i < currentTubes.length; i++) {
    if (currentTubes[i].length === 0 || isTubeComplete(currentTubes[i], capacity)) continue;
    for (let j = 0; j < currentTubes.length; j++) {
      if (i === j) continue;
      const check = canPour(currentTubes, i, j, capacity);
      if (check.valid && currentTubes[j].length > 0) {
        // Prefer pouring into a matching color rather than an empty tube
        const color = getTopColor(currentTubes[i])!;
        return {
          fromIndex: i,
          toIndex: j,
          colorId: color,
          units: check.units,
          reason: `Pour matching ${color} from Flask ${i + 1} into Flask ${j + 1}`,
        };
      }
    }
  }

  // Any valid pour
  for (let i = 0; i < currentTubes.length; i++) {
    if (currentTubes[i].length === 0 || isTubeComplete(currentTubes[i], capacity)) continue;
    for (let j = 0; j < currentTubes.length; j++) {
      if (i === j) continue;
      const check = canPour(currentTubes, i, j, capacity);
      if (check.valid) {
        const color = getTopColor(currentTubes[i])!;
        return {
          fromIndex: i,
          toIndex: j,
          colorId: color,
          units: check.units,
          reason: `Pour ${color} from Flask ${i + 1} into Flask ${j + 1}`,
        };
      }
    }
  }

  return null;
}

/**
 * Check if the board is in a deadlock state (no valid moves can be made)
 */
export function hasPossibleMoves(tubes: string[][], capacity: number = 4): boolean {
  for (let i = 0; i < tubes.length; i++) {
    if (tubes[i].length === 0) continue;
    for (let j = 0; j < tubes.length; j++) {
      if (i === j) continue;
      if (canPour(tubes, i, j, capacity).valid) return true;
    }
  }
  return false;
}
