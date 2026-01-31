/**
 * Utility functions for pattern management
 */

/**
 * Convert keyboard key to pattern ID
 * Keys 1-9 map to patterns 1-9
 * Key 0 maps to pattern 10
 */
export function keyToPatternId(key: string): number | null {
  if (key === '0') return 10;
  const num = parseInt(key, 10);
  if (num >= 1 && num <= 9) return num;
  return null;
}

/**
 * Convert pattern ID to keyboard key
 * Patterns 1-9 map to keys 1-9
 * Pattern 10 maps to key 0
 */
export function patternIdToKey(id: number): string | null {
  if (id === 10) return '0';
  if (id >= 1 && id <= 9) return id.toString();
  return null;
}

/**
 * Check if pattern ID is valid for given pattern count
 */
export function isValidPatternId(id: number, patternCount: number): boolean {
  return id >= 1 && id <= patternCount;
}

/**
 * Get pattern by ID from patterns array
 */
export function getPatternById(patterns: any[], id: number) {
  return patterns.find(p => p.id === id);
}
