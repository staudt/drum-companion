import { useState, useEffect, useRef } from 'react';
import { parsePattern } from '../../parser/parsePattern';

const MIN_PATTERN_STEPS = 2;
const MAX_PATTERN_STEPS = 64;
const DEBOUNCE_MS = 500;

interface PatternInputProps {
  id: number;  // Pattern number 1-10
  text: string;
  isActive: boolean;
  isPending: boolean;
  isPlaying: boolean;
  onChange: (text: string) => void;
}

export function PatternInput({ id, text, isActive, isPending, isPlaying, onChange }: PatternInputProps) {
  const [localText, setLocalText] = useState(text);
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const debounceTimerRef = useRef<number | null>(null);

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
      }
    } catch (err) {
      setIsValid(false);
      setValidationError(err instanceof Error ? err.message : 'Invalid');
      setStepCount(0);
    }

    // Debounce the callback to parent
    debounceTimerRef.current = window.setTimeout(() => {
      if (localText !== text) {
        onChange(localText);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localText, onChange, text]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalText(e.target.value);
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
          <span className={`
            px-2 py-0.5 rounded text-xs font-bold
            ${isActive ? 'bg-green-600 text-white' : ''}
            ${isPending ? 'bg-yellow-600 text-white' : ''}
            ${!isActive && !isPending ? 'bg-gray-700 text-gray-400' : ''}
          `}>
            {id}
          </span>
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
      <input
        type="text"
        value={localText}
        onChange={handleChange}
        className={`
          w-full px-3 py-2 rounded font-mono text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all border-2
          ${getBgColor()}
          ${getBorderColor()}
        `}
        placeholder="k h s h k h s h"
      />
    </div>
  );
}
