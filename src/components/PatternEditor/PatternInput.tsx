import { useState, useEffect, useRef, useMemo } from 'react';
import { parsePattern } from '../../parser/parsePattern';

const MIN_PATTERN_STEPS = 2;
const MAX_PATTERN_STEPS = 64;
const DEBOUNCE_MS = 200; // Reduced from 500ms for faster live editing

/**
 * Calculate character start position for each step in the pattern text
 * Example: "k h s h" → [0, 2, 4, 6]
 * Example: "kh . sh ." → [0, 3, 5, 8]
 */
function calculateStepPositions(text: string): number[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const positions: number[] = [];
  let charPos = 0;

  for (let i = 0; i < tokens.length; i++) {
    positions.push(charPos);
    charPos += tokens[i].length + 1; // +1 for space after token
  }

  return positions;
}

interface PatternInputProps {
  id: number;  // Pattern number 1-10
  text: string;
  name?: string;  // Optional custom name
  isActive: boolean;
  isPending: boolean;
  isPlaying: boolean;
  currentStepIndex?: number;  // 0-based step index currently playing (undefined when not playing)
  onChange: (text: string) => void;
  onNameChange: (name: string) => void;
}

export function PatternInput({ id, text, name, isActive, isPending, isPlaying, currentStepIndex, onChange, onNameChange }: PatternInputProps) {
  const [localText, setLocalText] = useState(text);
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const debounceTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync overlay scroll with input scroll
  const handleScroll = () => {
    if (inputRef.current && overlayRef.current) {
      overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  // Split text into tokens with step indices and beat colors
  const coloredTokens = useMemo(() => {
    const tokens = localText.trim().split(/\s+/).filter(Boolean);
    return tokens.map((token, stepIndex) => {
      const beatIndex = Math.floor(stepIndex / 4);
      const isEvenBeat = beatIndex % 2 === 0;
      const isCurrentStep = stepIndex === currentStepIndex;

      return {
        token,
        stepIndex,
        isEvenBeat,
        isCurrentStep,
      };
    });
  }, [localText, currentStepIndex]);

  // Sync with external changes
  useEffect(() => {
    setLocalText(text);
  }, [text]);

  // Validate and debounce updates
  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    // Validate immediately for UI feedback
    let isPatternValid = false;
    try {
      const pattern = parsePattern(localText);

      if (pattern.length === 0) {
        setIsValid(false);
        setValidationError('Pattern is empty');
        setStepCount(0);
      } else if (pattern.length < MIN_PATTERN_STEPS) {
        setIsValid(false);
        setValidationError(`Too short (min ${MIN_PATTERN_STEPS})`);
        setStepCount(pattern.length);
      } else if (pattern.length > MAX_PATTERN_STEPS) {
        setIsValid(false);
        setValidationError(`Too long (max ${MAX_PATTERN_STEPS})`);
        setStepCount(pattern.length);
      } else {
        setIsValid(true);
        setValidationError(null);
        setStepCount(pattern.length);
        isPatternValid = true;
      }
    } catch (err) {
      setIsValid(false);
      setValidationError(err instanceof Error ? err.message : 'Invalid');
      setStepCount(0);
    }

    // Only debounce if pattern is valid and different from current
    if (isPatternValid && localText !== text) {
      debounceTimerRef.current = window.setTimeout(() => {
        onChange(localText);
      }, DEBOUNCE_MS);
    }

    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localText, onChange, text]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalText(e.target.value);
    // Sync scroll after text change
    requestAnimationFrame(handleScroll);
  };

  // Border color based on state
  const getBorderColor = () => {
    if (isActive) {
      return isValid ? 'border-green-500' : 'border-red-500';
    }
    if (isPending) {
      return 'border-yellow-500';
    }
    return isValid ? 'border-gray-600' : 'border-red-700';
  };

  // Background color based on state
  const getBgColor = () => {
    if (isActive) return 'bg-gray-700';
    if (isPending) return 'bg-yellow-900/20';
    return 'bg-gray-800';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <input
            type="text"
            value={name || `Pattern ${id}`}
            onChange={(e) => onNameChange(e.target.value)}
            className={`
              px-2 py-0.5 rounded text-xs font-bold
              border-0 focus:outline-none focus:ring-1 focus:ring-blue-500
              w-auto max-w-[150px]
              ${isActive ? 'bg-green-600 text-white placeholder-green-200' : ''}
              ${isPending ? 'bg-yellow-600 text-white placeholder-yellow-200' : ''}
              ${!isActive && !isPending ? 'bg-gray-700 text-gray-300 placeholder-gray-500' : ''}
            `}
            placeholder={`Pattern ${id}`}
          />
          {isActive && isPlaying && (
            <span className="text-xs text-green-400">● Playing</span>
          )}
          {isPending && (
            <span className="text-xs text-yellow-400">⏳ Queued</span>
          )}
        </label>
        <span className="text-xs text-gray-500">
          {isValid ? `${stepCount} steps` : validationError}
        </span>
      </div>
      <div className="relative">
        {/* Colored text overlay - syncs scroll with input */}
        <div
          ref={overlayRef}
          className="absolute inset-0 px-3 py-2 font-mono text-sm pointer-events-none overflow-x-auto overflow-y-hidden whitespace-pre scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          aria-hidden="true"
        >
          {coloredTokens.map((item, idx) => (
            <span key={idx}>
              <span
                className={`
                  ${item.isCurrentStep ? 'text-green-400 font-bold' : item.isEvenBeat ? 'text-white' : 'text-gray-500'}
                `}
              >
                {item.token}
              </span>
              {idx < coloredTokens.length - 1 && ' '}
            </span>
          ))}
        </div>

        {/* Actual input (transparent text) */}
        <input
          ref={inputRef}
          type="text"
          value={localText}
          onChange={handleChange}
          onScroll={handleScroll}
          className={`
            w-full px-3 py-2 rounded font-mono text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-all border-2
            text-transparent caret-white
            selection:bg-blue-500/40 selection:text-transparent
            ${getBgColor()}
            ${getBorderColor()}
          `}
          placeholder="k h s h k h s h"
        />
      </div>
    </div>
  );
}
