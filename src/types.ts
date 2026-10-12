export interface ColorDef {
  id: string;
  nameEn: string;
  nameHi: string;
  primary: string; // Hex
  secondary: string; // Hex for gradient bottom
  highlight: string; // Hex for sheen
  glow: string; // RGBA for drop shadow
  particle: string;
}

export type TubeStyle = 'test-tube' | 'potion' | 'beaker';
export type ThemeId = 'ocean' | 'zen' | 'sunset' | 'laboratory' | 'midnight';
export type Language = 'en' | 'hi';

export interface PourAnimationState {
  sourceIndex: number;
  targetIndex: number;
  colorId: string;
  unitsPoured: number;
  sourceRect?: DOMRect;
  targetRect?: DOMRect;
  phase: 'lifting' | 'pouring' | 'settling';
}

export interface MoveRecord {
  fromTube: number;
  toTube: number;
  colorId: string;
  units: number;
  previousState: string[][]; // snapshot of tubes
}

export interface LevelConfig {
  id: number;
  name?: string;
  tubes: string[][]; // array of tube contents (each tube is array of color IDs from bottom to top)
  capacity: number;
  difficulty: 'tutorial' | 'easy' | 'medium' | 'hard' | 'expert';
  optimalMoves?: number;
}

export interface HintStep {
  fromIndex: number;
  toIndex: number;
  colorId: string;
  units: number;
  reason: string;
}
