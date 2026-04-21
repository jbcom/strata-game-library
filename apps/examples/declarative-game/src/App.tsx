import { createRPGGame } from 'strata-game-library';
import { createGameHUD, createPauseMenu, StrataGame } from 'strata-game-library/r3f';

const DeclarativeGameHud = createGameHUD({
  hintLimit: 5,
  title: 'Explorer HUD',
});

const DeclarativePauseMenu = createPauseMenu({
  description: 'Preset control hints stay visible while paused so you can resume quickly.',
  title: 'Expedition Paused',
});

const myGame = createRPGGame({
  menuScene: {
    backAction: {
      description: 'Return to the generated title scene.',
      label: 'Back to Hub',
    },
    continueAction: {
      description: 'Swap back into the live gameplay scene.',
      label: 'Enter Arena',
    },
    sceneId: 'briefing',
    shell: {
      description:
        'Preset factories can now synthesize a reusable menu scene with built-in continue and back actions.',
      subtitle: 'MISSION MENU',
      title: 'Expedition Briefing',
    },
    settingsAction: {
      description: 'Open the generated settings scene from the mission briefing.',
      label: 'Settings',
    },
    ui: () => <div>Review the current mission shell before resuming play.</div>,
  },
  name: 'My Declarative Game',
  settingsScene: {
    savesAction: {
      description: 'Open the generated expedition profile selector from the settings shell.',
      label: 'Save Profiles',
    },
    shell: {
      description:
        'Preset factories can now synthesize a reusable settings scene on top of the shared shell-flow builder and route into a generated save-profile selector.',
      subtitle: 'MISSION SETTINGS',
      title: 'Expedition Settings',
    },
    ui: () => (
      <div>Adjust shell-level options, then head back into the current expedition flow.</div>
    ),
  },
  saveScene: {
    profileSelector: {
      shell: {
        description:
          'Preset factories can now synthesize a reusable profile selector scene in front of generated archive scenes.',
        subtitle: 'SAVE PROFILES',
        title: 'Expedition Profiles',
      },
      ui: () => <div>Choose which expedition profile archive you want to manage.</div>,
    },
    profiles: [
      {
        description: 'Primary expedition progress with manual and rolling autosave slots.',
        id: 'expedition',
        label: 'Main Expedition',
        slots: [
          {
            label: 'Expedition Slot',
            slot: 'expedition',
          },
          {
            allowDelete: false,
            emptyLabel: 'Ready',
            label: 'Autosave',
            savedLabel: 'Synced',
            slot: 'autosave',
          },
        ],
      },
      {
        description: 'Separate challenge-run archive slots for high-risk variants.',
        id: 'challenge',
        label: 'Challenge Runs',
        sceneId: 'challenge-archive',
        slots: [
          {
            allowDelete: false,
            label: 'Challenge Slot',
            slot: 'challenge',
          },
        ],
      },
    ],
    sceneId: 'profiles',
    shell: {
      description:
        'Generated archive scenes now reuse the shared save-shell scaffold while each profile defines its own slots.',
      subtitle: 'SAVE ARCHIVE',
    },
    ui: () => <div>Manage persistent expedition slots without hand-authoring shell actions.</div>,
  },
  sessionShell: {
    menuAction: {
      description: 'Open the generated mission briefing scene from live play.',
      label: 'Open Briefing',
    },
    pauseAction: {
      description: 'Use the generated session shell to toggle the live pause state.',
      label: 'Pause Expedition',
    },
    settingsAction: {
      description: 'Open the generated settings scene directly from the live gameplay shell.',
      label: 'Field Settings',
    },
    savesAction: {
      description: 'Open the generated save-profile selector from live gameplay.',
      label: 'Field Profiles',
    },
    shell: {
      description:
        'Preset factories can now synthesize a session shell around the live gameplay scene with built-in menu and pause actions.',
      title: 'Arena Online',
    },
    titleAction: {
      description: 'Jump back to the generated title scene.',
      label: 'Return to Hub',
      variant: 'ghost',
    },
  },
  version: '1.0.0',
  titleScene: {
    action: {
      description: 'Swap into the live gameplay scene using the preset title-scene bridge.',
      label: 'Enter Arena',
    },
    menuAction: {
      description: 'Open the generated mission briefing scene.',
      label: 'Mission Briefing',
    },
    settingsAction: {
      description: 'Open the generated expedition settings scene.',
      label: 'Settings',
    },
    savesAction: {
      description: 'Open the generated expedition profile selector.',
      label: 'Save Profiles',
    },
    render: () => (
      <>
        <ambientLight intensity={0.45} />
        <directionalLight intensity={1.1} position={[4, 7, 5]} />
        <mesh position={[0, -1.2, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5, 48]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.45, 0.9, 1.6, 6]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </>
    ),
    sceneId: 'hub',
    shell: {
      description:
        'Preset factories can now synthesize a title scene and route into the default gameplay scene without extra boilerplate.',
      subtitle: 'TITLE SCENE',
      title: 'Expedition Hub',
    },
    ui: () => <div>Choose how you want to enter the current session.</div>,
  },
  world: {
    regions: {
      start: {
        name: 'Start Region',
        center: [0, 0, 0],
        radius: 50,
      },
    },
    connections: [],
  },
  scenes: {
    gameplay: {
      id: 'gameplay',
      render: () => (
        <>
          <ambientLight intensity={0.35} />
          <pointLight intensity={1.25} position={[4, 6, 4]} />
          <mesh position={[0, -1.5, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[14, 14]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh castShadow position={[0, 0.6, 0]}>
            <boxGeometry args={[1.8, 1.8, 1.8]} />
            <meshStandardMaterial color="orange" />
          </mesh>
        </>
      ),
      ui: () => <div>Welcome to the live arena.</div>,
    },
  },
  modes: {
    exploration: {
      systems: [],
      ui: () => <div>Exploration Mode Active</div>,
    },
  },
  ui: {
    hud: DeclarativeGameHud,
    menus: {
      pause: DeclarativePauseMenu,
    },
  },
  initialState: {
    player: {
      name: 'Explorer',
    },
  },
});

export default function App() {
  return <StrataGame game={myGame}>{/* Additional custom components can go here */}</StrataGame>;
}
