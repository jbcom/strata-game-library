---
title: Agentic Memory Architecture
version: "1.0"
updated: 2026-03-01
scope: all-agents
priority: critical
---

# Agentic Memory Architecture

**CRITICAL: Every agent MUST read this file before starting work.**

This document defines the 5-layer memory architecture for AI agents working on the Strata Game Library. It ensures continuity across sessions, agents, and tools (Claude Code, Cursor, Jules, Copilot).

## 5-Layer Memory Architecture

### Layer 1: Global Agent Roles (`~/.agents/`)

- 51 predefined agent role definitions managed externally
- Defines capabilities, personas, and behavioral constraints
- NOT checked into any repository -- lives on the developer machine
- Managed by `~/.agents/AGENT_HIERARCHY.md`

### Layer 2: Claude Code Session Memory (`~/.claude/projects/.../memory/`)

- Persistent `MEMORY.md` auto-loaded into every Claude Code conversation
- Machine-local, survives across sessions for the same project
- Contains stable facts: package versions, CI/CD config, technical decisions
- **Write here**: Verified facts that are true across sessions
- **Do NOT write here**: Session-specific work, speculative conclusions

### Layer 3: In-Repo Memory (`memory-bank/`)

- Checked into git, shared across all agents and contributors
- Follows the Cline 6-file specification adapted for multi-agent use
- This is the primary handoff mechanism between agent sessions
- **Write here**: Session state, patterns, progress tracking

### Layer 4: Repository Instructions (`AGENTS.md`, `CLAUDE.md`)

- Root-level instruction files checked into the repository
- `CLAUDE.md` -- Claude Code specific instructions (commands, architecture)
- `AGENTS.md` -- Universal agent instructions (all AI tools)
- Stable, rarely updated. Defines project rules and conventions.

### Layer 5: Enterprise Hierarchy (`~/.agents/AGENT_HIERARCHY.md`)

- Organization-wide agent coordination rules
- Cross-repository conventions and standards
- Team structure and delegation patterns

## Memory Bank Files (Layer 3)

Based on the Cline memory bank specification, adapted for multi-agent workflows:

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `AGENTS.md` | This file -- memory architecture guide | Rarely |
| `projectbrief.md` | What the project is, core requirements | Rarely |
| `productContext.md` | Why the project exists, user needs | Occasionally |
| `systemPatterns.md` | Architecture patterns and conventions | When patterns change |
| `techContext.md` | Tech stack, tools, infrastructure | When stack changes |
| `activeContext.md` | Current session state, recent work | **Every session** |
| `progress.md` | Implementation status, what works/doesn't | After milestones |

## How to READ Memory

When starting a new session, read files in this order:

1. **Root `AGENTS.md`** -- project-wide rules and conventions
2. **`memory-bank/AGENTS.md`** -- this file (memory architecture)
3. **`memory-bank/activeContext.md`** -- what happened recently
4. **`memory-bank/progress.md`** -- what's done, what's left
5. **Specific files as needed** -- `systemPatterns.md`, `techContext.md`, etc.
6. **Root `CLAUDE.md`** -- commands and development workflow

## How to WRITE Memory

### Stable Facts -> Layer 2 (`MEMORY.md`)

Things that are verified true across sessions:

- Package versions and dependency relationships
- CI/CD configuration details
- npm publishing setup
- Build tool choices

### Session State -> `activeContext.md`

Things that change per session:

- What you worked on
- PRs created/merged
- Decisions made
- Current blockers
- Next steps for the following session

### Patterns -> `systemPatterns.md`

Architecture decisions and conventions:

- Design patterns used (ECS, adapter, plugin)
- Code organization rules
- State management approach

### Progress -> `progress.md`

Implementation milestones:

- Feature completion percentages
- Test coverage changes
- What's working vs what's missing

## Multi-Agent Handoff Protocol

### At Session Start

1. Read `activeContext.md` to understand current state
2. Read `progress.md` to understand what's done
3. Check for any blockers or pending decisions

### During Session

- Update `activeContext.md` if you make significant decisions
- Track what you're working on so parallel agents don't duplicate effort

### At Session End (MANDATORY)

Every agent session MUST end with an `activeContext.md` update containing:

```markdown
### [Date] - [Agent/Tool] Session

**What was done**:
- Bullet list of completed work

**Decisions made**:
- Key choices and rationale

**Current state**:
- What's working, what's broken

**Next steps**:
- What the next agent should pick up
```

### Conflict Resolution

If two agents update the same file:

- `activeContext.md` -- append, don't overwrite (chronological log)
- `progress.md` -- merge percentages (take the higher value)
- `systemPatterns.md` -- discuss with maintainer before changing

## File Relationships

```
projectbrief.md          -- Foundation: what we're building
    └── productContext.md    -- Why: user needs, market position
        └── systemPatterns.md    -- How: architecture decisions
            └── techContext.md       -- With what: tools and stack
                └── progress.md          -- Status: what's done
                    └── activeContext.md      -- Now: current session
```

Each file builds on the ones above it. Lower files change more frequently.
