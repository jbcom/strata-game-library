

export const rpgPreset = {
    initialState: {
        player: {
            name: 'Hero',
            level: 1,
            experience: 0,
            health: 100,
            maxHealth: 100,
            stats: {
                strength: 10,
                agility: 10,
                intelligence: 10,
            },
        },
        inventory: [],
        equipment: {},
        quests: [],
        discoveredRegions: [],
        flags: {},
        playtime: 0,
    },
};

export function createRPGState(overrides = {}) {
    return {
        ...rpgPreset.initialState,
        ...overrides,
    };
}
