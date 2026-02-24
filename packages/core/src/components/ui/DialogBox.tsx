import type React from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getTextDirection } from '../../core/ui';
import type { DialogBoxProps, DialogBoxRef } from './types';

/**
 * Advanced Game Dialogue System.
 *
 * A highly-functional, RPG-ready dialogue system that bridges the gap between your game's
 * narrative and the player. Includes typewriter effects, character portraits, branching
 * choices, and automatic RTL detection for global localization.
 *
 * **Key Features:**
 * - **Narrative Flow:** Typewriter animation with skip and auto-advance support.
 * - **Portraits:** Customizable speaker images with flexible positioning.
 * - **Branching:** Interactive choices with conditional visibility.
 * - **Accessibility:** Keyboard support (Space/Enter) and ARIA attributes.
 *
 * @category UI & Interaction
 *
 * @example
 * ```tsx
 * // Complex branching dialogue example
 * <DialogBox
 *   lines={[
 *     {
 *       speaker: 'Gatekeeper',
 *       text: 'Halt! Who goes there?',
 *       speakerImage: '/portraits/guard.png'
 *     },
 *     {
 *       speaker: 'Gatekeeper',
 *       text: 'The path ahead is dangerous. Are you prepared?',
 *       choices: [
 *         { id: 'yes', text: 'I am ready.' },
 *         { id: 'no', text: 'Not yet...', consequence: 'exit' }
 *       ]
 *     }
 *   ]}
 *   onChoiceSelect={(id) => console.log(`Player chose: ${id}`)}
 *   typewriterSpeed={40}
 * />
 * ```
 *
 * ## Interactive Demos
 * <iframe src="../../demos/ui.html" width="100%" height="400px" style="border-radius: 8px; border: 1px solid #1e293b;"></iframe>
 *
 * - 🎮 [Live UI Demo](../../demos/ui.html)
 */
export const DialogBox = forwardRef<DialogBoxRef, DialogBoxProps>(
  (
    {
      lines = [],
      currentLine = 0,
      typewriterSpeed = 30,
      textColor = '#ffffff',
      backgroundColor = 'rgba(0, 0, 0, 0.85)',
      speakerColor = '#d4af37',
      fontSize = 16,
      fontFamily = 'system-ui, -apple-system, sans-serif',
      textDirection = 'auto',
      showSpeakerImage = true,
      imagePosition = 'left',
      continueIndicator = '▼',
      skipEnabled = true,
      padding = 20,
      maxWidth = 600,
      onLineComplete,
      onDialogComplete,
      onChoiceSelect,
      visible = true,
      className,
      style,
    },
    ref
  ) => {
    const [lineIndex, setLineIndex] = useState(currentLine);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showContinue, setShowContinue] = useState(false);
    const typewriterRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const line = lines[lineIndex];

    useEffect(() => {
      setLineIndex(currentLine);
    }, [currentLine]);

    const advance = useCallback(() => {
      if (isTyping && skipEnabled) {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        setDisplayedText(line?.text || '');
        setIsTyping(false);
        setShowContinue(!line?.choices?.length);
        return;
      }

      if (lineIndex < lines.length - 1) {
        setLineIndex(lineIndex + 1);
      } else {
        onDialogComplete?.();
      }
    }, [isTyping, skipEnabled, line, lineIndex, lines.length, onDialogComplete]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance();
      }
    };

    useEffect(() => {
      if (!line || !visible) return;

      setDisplayedText('');
      setIsTyping(true);
      setShowContinue(false);

      let charIndex = 0;
      const text = line.text;

      typewriterRef.current = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typewriterRef.current);
          setIsTyping(false);
          setShowContinue(!line.choices?.length);
          onLineComplete?.(lineIndex);

          if (line.autoAdvance) {
            setTimeout(() => advance(), line.autoAdvanceDelay || 2000);
          }
        }
      }, 1000 / typewriterSpeed);

      return () => {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
      };
    }, [line, lineIndex, typewriterSpeed, visible, advance, onLineComplete]);

    useImperativeHandle(ref, () => ({
      advance,
      skip: () => {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        setDisplayedText(line?.text || '');
        setIsTyping(false);
      },
      reset: () => {
        setLineIndex(0);
        setDisplayedText('');
      },
      setLine: (index: number) => setLineIndex(index),
    }));

    if (!visible || !line) return null;

    const detectedDirection =
      textDirection === 'auto' ? getTextDirection(line.text) : textDirection;

    const containerStyle: React.CSSProperties = {
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth,
      width: '90%',
      padding,
      backgroundColor,
      borderRadius: 8,
      fontFamily,
      fontSize,
      color: textColor,
      direction: detectedDirection,
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      cursor: 'pointer',
      ...style,
    };

    return (
      <button
        type="button"
        style={{ ...containerStyle, border: 'none', textAlign: 'left' }}
        onClick={advance}
        className={className}
        aria-label="Dialogue - Click or press Enter to advance"
        onKeyDown={handleKeyDown}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: imagePosition === 'right' ? 'row-reverse' : 'row',
            gap: 16,
          }}
        >
          {showSpeakerImage && line.speakerImage && (
            <img
              src={line.speakerImage}
              alt={line.speaker}
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                objectFit: 'cover',
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            {line.speaker && (
              <div style={{ color: speakerColor, fontWeight: 'bold', marginBottom: 8 }}>
                {line.speaker}
              </div>
            )}
            <div style={{ lineHeight: 1.6, minHeight: 48 }}>
              {displayedText}
              {isTyping && <span style={{ animation: 'blink 0.5s infinite' }}>|</span>}
            </div>
            {line.choices && !isTyping && (
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {line.choices.map((choice) => (
                  <button
                    type="button"
                    key={choice.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!choice.disabled && (!choice.condition || choice.condition())) {
                        onChoiceSelect?.(choice.id, lineIndex);
                      }
                    }}
                    disabled={choice.disabled}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: 4,
                      color: choice.disabled ? '#666' : '#fff',
                      cursor: choice.disabled ? 'not-allowed' : 'pointer',
                      textAlign: detectedDirection === 'rtl' ? 'right' : 'left',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            )}
            {showContinue && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 8,
                  animation: 'bounce 0.5s infinite alternate',
                }}
              >
                {continueIndicator}
              </div>
            )}
          </div>
        </div>
        <style>{`
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                @keyframes bounce {
                    from { transform: translateY(0); }
                    to { transform: translateY(4px); }
                }
            `}</style>
      </button>
    );
  }
);

DialogBox.displayName = 'DialogBox';
