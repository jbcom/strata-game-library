import type React from 'react';
import { useScene } from '../../StrataGame';
import { BASE_PANEL_STYLE, formatProfileLabel } from './game-ui-shared';
import type { SceneCardProps } from './types';

type SceneCardAction = NonNullable<NonNullable<SceneCardProps['actions']>[number]>;
type SceneCardProfile = NonNullable<NonNullable<SceneCardProps['saveProfiles']>[number]>;
type SceneCardSaveInfo = NonNullable<SceneCardProps['saveSlotInfo']>[string];

function getSceneCardSaveSlotRuntimeId(
  slot:
    | NonNullable<SceneCardProps['saveSlots']>[number]
    | NonNullable<NonNullable<SceneCardProps['saveProfiles']>[number]['slots']>[number]
) {
  return slot.storageSlot ?? slot.slot;
}

function getSceneCardDefaultPosition(variant: SceneCardProps['variant'] = 'announcement') {
  if (
    variant === 'title' ||
    variant === 'menu' ||
    variant === 'archive' ||
    variant === 'profiles'
  ) {
    return 'center';
  }

  return 'top-left';
}

function getSceneCardPositionStyle(
  position: NonNullable<SceneCardProps['position']> = 'top-left'
): React.CSSProperties {
  switch (position) {
    case 'top-right':
      return { right: 20, top: 20 };
    case 'bottom-left':
      return { bottom: 20, left: 20 };
    case 'bottom-right':
      return { bottom: 20, right: 20 };
    case 'center':
      return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };
    default:
      return { left: 20, top: 20 };
  }
}

function getSceneCardDefaultSubtitle(variant: SceneCardProps['variant'] = 'announcement') {
  switch (variant) {
    case 'archive':
      return 'SAVE ARCHIVE';
    case 'profiles':
      return 'SAVE PROFILES';
    case 'title':
      return 'GAME READY';
    case 'menu':
      return 'SCENE MENU';
    case 'session':
      return 'SESSION LIVE';
    default:
      return 'SCENE READY';
  }
}

function getSceneCardVariantStyle(
  variant: SceneCardProps['variant'] = 'announcement'
): React.CSSProperties {
  switch (variant) {
    case 'archive':
      return {
        maxWidth: 560,
      };
    case 'profiles':
      return {
        maxWidth: 620,
      };
    case 'title':
      return {
        maxWidth: 460,
        textAlign: 'center',
      };
    case 'menu':
      return {
        maxWidth: 440,
      };
    case 'session':
      return {
        maxWidth: 420,
      };
    default:
      return {
        maxWidth: 380,
      };
  }
}

function getSceneCardActionId(
  action: NonNullable<SceneCardProps['actions']>[number],
  index: number
) {
  return action.id ?? `${action.type}:${index}`;
}

function getSceneCardActionStyle(
  variant: NonNullable<NonNullable<SceneCardProps['actions']>[number]['variant']> = 'secondary',
  disabled = false
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    borderRadius: 12,
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit',
    opacity: disabled ? 0.58 : 1,
    padding: '12px 14px',
    textAlign: 'left',
    transition: 'transform 160ms ease, opacity 160ms ease, background-color 160ms ease',
    width: '100%',
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #38bdf8, #22c55e)',
        border: 'none',
        color: '#082f49',
      };
    case 'ghost':
      return {
        ...baseStyle,
        background: 'transparent',
        border: '1px dashed rgba(148, 163, 184, 0.28)',
        color: 'inherit',
      };
    default:
      return {
        ...baseStyle,
        background: 'rgba(15, 23, 42, 0.42)',
        border: '1px solid rgba(148, 163, 184, 0.22)',
        color: 'inherit',
      };
  }
}

function getSceneCardActionSlot(action: SceneCardAction) {
  switch (action.type) {
    case 'save-game':
    case 'load-game':
    case 'delete-save':
      return action.slot;
    default:
      return undefined;
  }
}

function getSceneCardActionSceneId(action: SceneCardAction) {
  switch (action.type) {
    case 'load-scene':
    case 'push-scene':
      return action.sceneId;
    default:
      return undefined;
  }
}

function getSceneCardActionProfileId(action: SceneCardAction) {
  switch (action.type) {
    case 'load-latest-profile':
    case 'clear-profile':
      return action.profileId;
    default:
      return undefined;
  }
}

function getSceneCardActionCapabilityState(
  action: SceneCardAction,
  availableSaveSlots: string[],
  saveSlots: NonNullable<SceneCardProps['saveSlots']>
) {
  const slotId = getSceneCardActionSlot(action);
  const slot = slotId
    ? saveSlots.find((candidate) => getSceneCardSaveSlotRuntimeId(candidate) === slotId)
    : undefined;

  if (action.type === 'save-game' && slot?.allowSave === false) {
    return true;
  }

  if (action.type === 'load-game') {
    if (slot?.allowLoad === false) {
      return true;
    }

    if (action.slot) {
      return !availableSaveSlots.includes(action.slot);
    }
  }

  if (action.type === 'delete-save') {
    if (slot?.allowDelete === false) {
      return true;
    }

    if (action.slot) {
      return !availableSaveSlots.includes(action.slot);
    }
  }

  if (action.type === 'load-latest-profile') {
    const hasSave = action.slots.some((candidate) => availableSaveSlots.includes(candidate));
    return !hasSave && !action.emptySceneId;
  }

  if (action.type === 'clear-profile') {
    return !action.slots.some((candidate) => availableSaveSlots.includes(candidate));
  }

  return false;
}

function getSceneCardProfileSavedCount(
  profile: SceneCardProfile,
  availableSaveSlots: string[]
): number {
  return (profile.slots ?? []).filter((slot) =>
    availableSaveSlots.includes(getSceneCardSaveSlotRuntimeId(slot))
  ).length;
}

function getSceneCardProfileStatusLabel(
  profile: SceneCardProfile,
  availableSaveSlots: string[]
): string {
  const slots = profile.slots ?? [];
  if (slots.length === 0) {
    return 'Archive Ready';
  }

  const savedCount = getSceneCardProfileSavedCount(profile, availableSaveSlots);
  if (savedCount === 0) {
    return 'Empty';
  }

  if (slots.length === 1) {
    return 'Saved';
  }

  return `${savedCount} / ${slots.length} Saved`;
}

function getSceneCardSaveInfoTimestampLabel(timestamp: number) {
  return `${new Date(timestamp).toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

function getSceneCardSaveInfoSummary(saveInfo: SceneCardSaveInfo) {
  if (!saveInfo) {
    return undefined;
  }

  return `Saved ${getSceneCardSaveInfoTimestampLabel(saveInfo.timestamp)} • v${saveInfo.version}`;
}

function getSceneCardProfileLatestSaveInfo(
  profile: SceneCardProfile,
  saveSlotInfo: NonNullable<SceneCardProps['saveSlotInfo']>
) {
  return (profile.slots ?? []).reduce<SceneCardSaveInfo>((latest, slot) => {
    const saveInfo = saveSlotInfo[getSceneCardSaveSlotRuntimeId(slot)];
    if (!saveInfo) {
      return latest;
    }

    if (!latest || saveInfo.timestamp > latest.timestamp) {
      return saveInfo;
    }

    return latest;
  }, undefined);
}

function getSceneCardProfileActionLabel(
  profile: SceneCardProfile,
  action: SceneCardAction,
  availableSaveSlots: string[]
) {
  if (action.label === profile.label) {
    return getSceneCardProfileSavedCount(profile, availableSaveSlots) > 0
      ? (profile.occupiedActionLabel ?? `Continue ${profile.label ?? profile.id}`)
      : (profile.emptyActionLabel ?? `Start ${profile.label ?? profile.id}`);
  }

  return action.label;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  activeProfileId,
  actions = [],
  availableSaveSlots = [],
  className,
  description,
  onAction,
  pendingActionId,
  position,
  sceneId: explicitSceneId,
  saveProfiles,
  saveSlotInfo = {},
  saveSlots,
  showSceneId = false,
  style,
  subtitle,
  title = 'Scene Ready',
  variant = 'announcement',
  visible = true,
}) => {
  const scene = useScene();
  const sceneId = explicitSceneId ?? scene?.id;
  const resolvedPosition = position ?? getSceneCardDefaultPosition(variant);
  const resolvedSubtitle = subtitle ?? getSceneCardDefaultSubtitle(variant);
  const indexedActions = actions.map((action, index) => ({
    action,
    actionId: getSceneCardActionId(action, index),
    index,
  }));
  const resolvedSaveSlots = saveSlots ?? [];
  const resolvedSaveProfiles = [...(saveProfiles ?? [])].sort((left, right) => {
    const leftIsActive = activeProfileId === left.id;
    const rightIsActive = activeProfileId === right.id;

    if (leftIsActive === rightIsActive) {
      return 0;
    }

    return leftIsActive ? -1 : 1;
  });
  const saveSlotIds = new Set(resolvedSaveSlots.map((slot) => getSceneCardSaveSlotRuntimeId(slot)));
  const saveProfileSceneIds = new Set(resolvedSaveProfiles.map((profile) => profile.sceneId));
  const saveProfileIds = new Set(resolvedSaveProfiles.map((profile) => profile.id));
  const standaloneActions = indexedActions.filter(({ action }) => {
    const slot = getSceneCardActionSlot(action);
    if (slot && saveSlotIds.has(slot)) {
      return false;
    }

    const targetSceneId = getSceneCardActionSceneId(action);
    if (targetSceneId && saveProfileSceneIds.has(targetSceneId)) {
      return false;
    }

    const profileId = getSceneCardActionProfileId(action);
    if (profileId && saveProfileIds.has(profileId)) {
      return false;
    }

    return true;
  });

  const renderActionButton = (action: SceneCardAction, actionId: string, compact = false) => {
    const disabled =
      !onAction ||
      pendingActionId === actionId ||
      getSceneCardActionCapabilityState(action, availableSaveSlots, resolvedSaveSlots);

    return (
      <button
        aria-busy={pendingActionId === actionId}
        disabled={disabled}
        key={actionId}
        onClick={() => {
          void onAction?.(action);
        }}
        style={{
          ...getSceneCardActionStyle(action.variant, disabled),
          padding: compact ? '10px 12px' : undefined,
        }}
        type="button"
      >
        <div style={{ fontSize: compact ? 12 : 13, fontWeight: 700 }}>{action.label}</div>
        {action.description && (
          <div
            style={{
              fontSize: compact ? 11 : 12,
              lineHeight: 1.45,
              marginTop: 4,
              opacity: 0.8,
            }}
          >
            {action.description}
          </div>
        )}
      </button>
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        ...BASE_PANEL_STYLE,
        ...getSceneCardPositionStyle(resolvedPosition),
        ...getSceneCardVariantStyle(variant),
        padding: 18,
        position: 'absolute',
        ...style,
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: '0.14em', opacity: 0.72 }}>{resolvedSubtitle}</div>
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 8 }}>{title}</div>
      {description && (
        <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10, opacity: 0.88 }}>
          {description}
        </div>
      )}
      {resolvedSaveProfiles.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gap: 12,
            marginTop: 16,
          }}
        >
          {resolvedSaveProfiles.map((profile) => {
            const isActiveProfile = activeProfileId === profile.id;
            const profileActions = indexedActions.filter(
              ({ action }) =>
                getSceneCardActionSceneId(action) === profile.sceneId ||
                getSceneCardActionProfileId(action) === profile.id
            );
            const slotLabels = (profile.slots ?? []).map((slot) => slot.label ?? slot.slot);
            const statusLabel = getSceneCardProfileStatusLabel(profile, availableSaveSlots);
            const latestSaveInfo = getSceneCardProfileLatestSaveInfo(profile, saveSlotInfo);
            const latestSaveSummary = getSceneCardSaveInfoSummary(latestSaveInfo);

            return (
              <div
                key={profile.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.42)',
                  border: isActiveProfile
                    ? '1px solid rgba(56, 189, 248, 0.36)'
                    : '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 14,
                  boxShadow: isActiveProfile ? '0 0 0 1px rgba(56, 189, 248, 0.12)' : undefined,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>
                      {profile.label ?? profile.id}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.08em',
                        marginTop: 4,
                        opacity: 0.62,
                      }}
                    >
                      {formatProfileLabel(profile.id)}
                    </div>
                  </div>
                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      justifyContent: 'flex-end',
                    }}
                  >
                    {isActiveProfile && (
                      <div
                        style={{
                          backgroundColor: 'rgba(56, 189, 248, 0.16)',
                          border: '1px solid rgba(56, 189, 248, 0.28)',
                          borderRadius: 999,
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          padding: '6px 10px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Current Profile
                      </div>
                    )}
                    <div
                      style={{
                        backgroundColor:
                          statusLabel === 'Empty'
                            ? 'rgba(148, 163, 184, 0.14)'
                            : 'rgba(34, 197, 94, 0.16)',
                        border: `1px solid ${
                          statusLabel === 'Empty'
                            ? 'rgba(148, 163, 184, 0.24)'
                            : 'rgba(34, 197, 94, 0.26)'
                        }`,
                        borderRadius: 999,
                        fontSize: 11,
                        letterSpacing: '0.08em',
                        padding: '6px 10px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {statusLabel}
                    </div>
                  </div>
                </div>
                {profile.description && (
                  <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 10, opacity: 0.82 }}>
                    {profile.description}
                  </div>
                )}
                {slotLabels.length > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.06em',
                      marginTop: 10,
                      opacity: 0.68,
                      textTransform: 'uppercase',
                    }}
                  >
                    Slots: {slotLabels.join(' • ')}
                  </div>
                )}
                {latestSaveSummary && (
                  <div style={{ fontSize: 11, lineHeight: 1.5, marginTop: 8, opacity: 0.72 }}>
                    Latest save: {latestSaveSummary}
                  </div>
                )}
                {profileActions.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gap: 8,
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      marginTop: 12,
                    }}
                  >
                    {profileActions.map(({ action, actionId }) =>
                      renderActionButton(
                        {
                          ...action,
                          label: getSceneCardProfileActionLabel(
                            profile,
                            action,
                            availableSaveSlots
                          ),
                        },
                        actionId,
                        true
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {standaloneActions.length > 0 && (
            <div
              style={{
                display: 'grid',
                gap: 10,
              }}
            >
              {standaloneActions.map(({ action, actionId }) =>
                renderActionButton(action, actionId)
              )}
            </div>
          )}
        </div>
      ) : resolvedSaveSlots.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gap: 12,
            marginTop: 16,
          }}
        >
          {resolvedSaveSlots.map((slot) => {
            const hasSave = availableSaveSlots.includes(getSceneCardSaveSlotRuntimeId(slot));
            const slotSaveSummary = getSceneCardSaveInfoSummary(
              saveSlotInfo[getSceneCardSaveSlotRuntimeId(slot)]
            );
            const slotActions = indexedActions.filter(
              ({ action }) => getSceneCardActionSlot(action) === getSceneCardSaveSlotRuntimeId(slot)
            );
            const slotStatusLabel = hasSave
              ? (slot.savedLabel ?? 'Saved')
              : (slot.emptyLabel ?? 'Empty');

            return (
              <div
                key={slot.slot}
                style={{
                  background: 'rgba(15, 23, 42, 0.42)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{slot.label ?? slot.slot}</div>
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: '0.08em',
                          marginTop: 4,
                          opacity: 0.62,
                        }}
                      >
                        {slot.slot}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: hasSave
                        ? 'rgba(34, 197, 94, 0.16)'
                        : 'rgba(148, 163, 184, 0.14)',
                      border: `1px solid ${
                        hasSave ? 'rgba(34, 197, 94, 0.26)' : 'rgba(148, 163, 184, 0.24)'
                      }`,
                      borderRadius: 999,
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      padding: '6px 10px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {slotStatusLabel}
                  </div>
                </div>
                {slot.description && (
                  <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 10, opacity: 0.82 }}>
                    {slot.description}
                  </div>
                )}
                {slotSaveSummary && (
                  <div style={{ fontSize: 11, lineHeight: 1.5, marginTop: 8, opacity: 0.72 }}>
                    {slotSaveSummary}
                  </div>
                )}
                {slotActions.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gap: 8,
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      marginTop: 12,
                    }}
                  >
                    {slotActions.map(({ action, actionId }) =>
                      renderActionButton(action, actionId, true)
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {standaloneActions.length > 0 && (
            <div
              style={{
                display: 'grid',
                gap: 10,
              }}
            >
              {standaloneActions.map(({ action, actionId }) =>
                renderActionButton(action, actionId)
              )}
            </div>
          )}
        </div>
      ) : actions.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gap: 10,
            marginTop: 16,
          }}
        >
          {indexedActions.map(({ action, actionId }) => renderActionButton(action, actionId))}
        </div>
      ) : null}
      {showSceneId && sceneId && (
        <div
          style={{
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 12,
            fontSize: 12,
            letterSpacing: '0.04em',
            marginTop: 14,
            padding: '10px 12px',
          }}
        >
          Scene: <strong>{sceneId}</strong>
        </div>
      )}
    </div>
  );
};

export function createSceneCard(options: SceneCardProps = {}): React.ComponentType {
  function StrataSceneCard() {
    return <SceneCard {...options} />;
  }

  StrataSceneCard.displayName = 'StrataSceneCard';
  return StrataSceneCard;
}
