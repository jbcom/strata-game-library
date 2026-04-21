import type React from 'react';
import { useGameStatus } from '../../hooks/useGameStatus';
import { useControlHints, useInput } from '../../hooks/useInput';
import { useMode } from '../../StrataGame';
import {
  BASE_PANEL_STYLE,
  formatActionLabel,
  formatBindingLabel,
  formatProfileLabel,
} from './game-ui-shared';
import type { GameHUDProps } from './types';

export const GameHUD: React.FC<GameHUDProps> = ({
  className,
  hintLimit = 6,
  showControls = true,
  showMode = true,
  showPressedActions = true,
  style,
  title = 'Game HUD',
}) => {
  const mode = useMode();
  const input = useInput();
  const { activeProfileId, isPaused } = useGameStatus();
  const hints = useControlHints().slice(0, hintLimit);

  return (
    <div
      className={className}
      style={{
        ...BASE_PANEL_STYLE,
        bottom: 20,
        left: 20,
        maxWidth: 340,
        padding: 14,
        position: 'absolute',
        ...style,
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', opacity: 0.7 }}>{title}</div>
          {showMode && (
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
              {mode?.config.id ?? 'No Active Mode'}
            </div>
          )}
        </div>
        <div
          style={{
            backgroundColor: isPaused ? 'rgba(248, 113, 113, 0.18)' : 'rgba(74, 222, 128, 0.14)',
            border: `1px solid ${isPaused ? 'rgba(248, 113, 113, 0.28)' : 'rgba(74, 222, 128, 0.24)'}`,
            borderRadius: 999,
            fontSize: 11,
            letterSpacing: '0.08em',
            padding: '6px 10px',
            textTransform: 'uppercase',
          }}
        >
          {isPaused ? 'Paused' : 'Live'}
        </div>
      </div>

      {showPressedActions && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.68 }}>
            Pressed Actions
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
            {input.activeActions.length > 0
              ? input.activeActions.map(formatActionLabel).join(', ')
              : 'None'}
          </div>
        </div>
      )}

      {activeProfileId && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.68 }}>
            Current Profile
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
            {formatProfileLabel(activeProfileId)}
          </div>
        </div>
      )}

      {showControls && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.68 }}>Control Hints</div>
          <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
            {hints.map((hint) => (
              <div
                key={hint.action}
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  fontSize: 12,
                  gap: 12,
                  justifyContent: 'space-between',
                  opacity: input.activeActions.includes(hint.action) ? 1 : 0.82,
                }}
              >
                <strong style={{ fontWeight: 600 }}>{formatActionLabel(hint.action)}</strong>
                <span style={{ opacity: 0.86 }}>{formatBindingLabel(hint)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function createGameHUD(options: GameHUDProps = {}): React.ComponentType {
  function StrataPresetHUD() {
    return <GameHUD {...options} />;
  }

  StrataPresetHUD.displayName = 'StrataPresetHUD';
  return StrataPresetHUD;
}
