import type React from 'react';
import { useGameStatus } from '../../hooks/useGameStatus';
import { useControlHints } from '../../hooks/useInput';
import { useGame, useMode } from '../../StrataGame';
import {
  BASE_PANEL_STYLE,
  formatActionLabel,
  formatBindingLabel,
  formatProfileLabel,
} from './game-ui-shared';
import type { PauseMenuProps } from './types';

export const PauseMenu: React.FC<PauseMenuProps> = ({
  className,
  description = 'Your current mode bindings stay visible while the game is paused.',
  hintLimit = 6,
  resumeLabel = 'Resume',
  showControls = true,
  showMode = true,
  style,
  title = 'Paused',
}) => {
  const game = useGame();
  const mode = useMode();
  const { activeProfileId, isPaused } = useGameStatus();
  const hints = useControlHints().slice(0, hintLimit);

  if (!isPaused) {
    return null;
  }

  return (
    <div
      style={{
        alignItems: 'center',
        background: 'rgba(2, 6, 23, 0.56)',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        padding: 24,
        position: 'absolute',
      }}
    >
      <div
        className={className}
        style={{
          ...BASE_PANEL_STYLE,
          maxWidth: 460,
          padding: 22,
          width: '100%',
          ...style,
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: '0.14em', opacity: 0.72 }}>GAME MENU</div>
        <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{title}</div>
        {showMode && (
          <div style={{ fontSize: 13, marginTop: 10, opacity: 0.82 }}>
            Active mode: <strong>{mode?.config.id ?? 'none'}</strong>
          </div>
        )}
        {activeProfileId && (
          <div style={{ fontSize: 13, marginTop: 6, opacity: 0.82 }}>
            Current profile: <strong>{formatProfileLabel(activeProfileId)}</strong>
          </div>
        )}
        <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10, opacity: 0.88 }}>
          {description}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button
            onClick={() => game.resume()}
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              border: 'none',
              borderRadius: 12,
              color: '#082f49',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 700,
              padding: '12px 16px',
            }}
            type="button"
          >
            {resumeLabel}
          </button>
          <div
            style={{
              alignItems: 'center',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: 12,
              display: 'flex',
              fontSize: 12,
              opacity: 0.84,
              padding: '12px 14px',
            }}
          >
            {formatBindingLabel(mode?.config.inputMap.pause ?? {})} toggles pause
          </div>
        </div>

        {showControls && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.68 }}>
              Active Controls
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {hints.map((hint) => (
                <div
                  key={hint.action}
                  style={{
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                    display: 'flex',
                    fontSize: 12,
                    gap: 12,
                    justifyContent: 'space-between',
                    paddingBottom: 8,
                  }}
                >
                  <strong>{formatActionLabel(hint.action)}</strong>
                  <span style={{ opacity: 0.84 }}>{formatBindingLabel(hint)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function createPauseMenu(options: PauseMenuProps = {}): React.ComponentType {
  function StrataPauseMenu() {
    return <PauseMenu {...options} />;
  }

  StrataPauseMenu.displayName = 'StrataPauseMenu';
  return StrataPauseMenu;
}
