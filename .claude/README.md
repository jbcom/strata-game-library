# .claude/ Directory

Custom Claude Code configuration for the Strata Game Library.

## Slash Commands

Use these with `/command-name` in Claude Code conversations.

### Adding Code

| Command | Purpose | Usage |
|---------|---------|-------|
| `/add-component` | Add a new R3F/Reactylon component | `/add-component WeatherSystem` |
| `/add-shader` | Add a new GLSL shader | `/add-shader caustics` |
| `/add-preset` | Add a preset configuration | `/add-preset jungle-terrain` |

These commands scaffold the correct file structure, tests, exports, and run validation.

### Quality Assurance

| Command | Purpose | Usage |
|---------|---------|-------|
| `/review-package` | Full package completeness review | `/review-package core` |
| `/audit-docs` | Documentation accuracy audit | `/audit-docs all` |
| `/release-check` | Pre-release validation | `/release-check all` |

## Agents

Specialized agents for different aspects of the framework.

| Agent | File | Specialty |
|-------|------|-----------|
| Game Architect | `agents/game-architect.md` | 4-layer framework architecture, RFC alignment, core/React split |
| Shader Specialist | `agents/shader-specialist.md` | GLSL shaders, material factories, GPU performance |
| R3F Developer | `agents/r3f-developer.md` | React Three Fiber components, hooks, Three.js integration |
| Docs Reviewer | `agents/docs-reviewer.md` | Documentation accuracy, API coverage, cross-reference integrity |

## Directory Structure

```text
.claude/
├── README.md              # This file
├── commands/
│   ├── add-component.md   # Scaffold a new R3F component
│   ├── add-shader.md      # Scaffold a new GLSL shader
│   ├── add-preset.md      # Scaffold a new preset configuration
│   ├── review-package.md  # Package completeness review checklist
│   ├── audit-docs.md      # Documentation accuracy audit
│   └── release-check.md   # Pre-release validation checklist
├── agents/
│   ├── game-architect.md  # Game framework architecture decisions
│   ├── shader-specialist.md # GLSL shader development
│   ├── r3f-developer.md   # React Three Fiber components
│   └── docs-reviewer.md   # Documentation review
└── worktrees/             # Git worktree workspace (auto-managed)
```

## How Commands Work

Commands use `$ARGUMENTS` as a placeholder for user input. When you run `/add-component Water`, the `$ARGUMENTS` variable is replaced with `Water` and the full instructions are provided to Claude.

Each command follows a pattern:

1. **Context** - Read existing code to understand patterns
2. **Steps** - Create files following the established conventions
3. **Validate** - Run build, test, lint, and typecheck

## How Agents Work

Agent definitions provide specialized context and constraints. They are referenced when working on specific domains:

- **Game Architect**: Consult when making framework-level decisions, adding new layers, or modifying the core architecture
- **Shader Specialist**: Consult when writing GLSL, creating material factories, or optimizing GPU code
- **R3F Developer**: Consult when building React components, hooks, or Three.js integrations
- **Docs Reviewer**: Consult when auditing or updating documentation

## Related Files

- `CLAUDE.md` (project root) - Top-level Claude Code instructions
- `AGENTS.md` (project root) - Multi-agent development instructions
- `docs/architecture/AGENTS.md` - Architecture documentation index
- `PUBLIC_API.md` - Stable API surface
- `CONTRACT.md` - Stability guarantees
