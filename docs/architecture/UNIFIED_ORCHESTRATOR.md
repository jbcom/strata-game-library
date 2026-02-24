# Unified Multi-Agent Orchestrator

> **EPIC**: [control-center#422](https://github.com/jbcom/control-center/issues/422)

## Vision

A **fully self-contained autonomous development loop** that combines multiple AI coding agents to handle the complete software development lifecycle without human intervention for routine changes.

## The Autonomous Development Loop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     UNIFIED MULTI-AGENT ORCHESTRATOR                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         ISSUE / PR INTAKE                           │   │
│  │  • GitHub Issues with labels                                        │   │
│  │  • PR comments with /commands                                       │   │
│  │  • Scheduled repository scans                                       │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      TASK ROUTER (Ollama)                           │   │
│  │  Analyzes task complexity and routes to appropriate agent           │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│         ┌────────────────────┼────────────────────┐                        │
│         ▼                    ▼                    ▼                        │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                │
│  │   OLLAMA    │      │   JULES     │      │   CURSOR    │                │
│  │             │      │             │      │   CLOUD     │                │
│  │ • <5 lines  │      │ • Async     │      │ • Long-run  │                │
│  │ • Quick fix │      │ • Multi-file│      │ • Complex   │                │
│  │ • Review    │      │ • Refactor  │      │ • Background│                │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘                │
│         │                    │                    │                        │
│         └────────────────────┼────────────────────┘                        │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         PR CREATED                                   │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AI REVIEWER SWARM                               │   │
│  │  • Gemini Code Assist    • GitHub Copilot                           │   │
│  │  • Amazon Q Developer    • CodeRabbit                               │   │
│  │  • Cursor Bugbot         • Ollama (self-review)                     │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    FEEDBACK PROCESSOR (Ollama)                       │   │
│  │  • Aggregates all AI feedback                                        │   │
│  │  • Generates fixes                                                   │   │
│  │  • Resolves comment threads                                          │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AUTO-MERGE                                      │   │
│  │  When: CI ✅ + Reviews ✅ + Threads resolved                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Agents

### 1. Ollama Cloud

**Role**: Fast inline changes, code review, task routing

**Strengths**:
- Sub-second response times
- Structured JSON output
- Cost-effective for high volume
- Good for deterministic tasks

**Use Cases**:
- Quick fixes (<5 lines)
- Dependency updates
- Code review analysis
- Task classification/routing
- Comment thread resolution

**API**:
```bash
curl -X POST '$OLLAMA_HOST/api/chat' \
  -H 'Authorization: Bearer $OLLAMA_API_KEY' \
  -d '{
    "model": "glm-4.6:cloud",
    "messages": [{"role": "user", "content": "Fix this bug..."}],
    "format": {"type": "object", "properties": {...}},
    "stream": false
  }'
```

### 2. Google Jules

**Role**: Async complex refactoring, multi-file changes

**Strengths**:
- Full repository context
- Async operation (doesn't block)
- AUTO_CREATE_PR mode
- Good for large changes

**Use Cases**:
- Multi-file refactoring
- Feature implementation
- Documentation generation
- Migration tasks

**API**:
```bash
curl -X POST 'https://jules.googleapis.com/v1alpha/sessions' \
  -H 'X-Goog-Api-Key: $GOOGLE_JULES_API_KEY' \
  -d '{
    "prompt": "Refactor the ECS system...",
    "sourceContext": {
      "source": "sources/github/jbcom/strata-game-library",
      "githubRepoContext": { "startingBranch": "main" }
    },
    "automationMode": "AUTO_CREATE_PR",
    "title": "Refactor ECS"
  }'
```

### 3. Cursor Cloud Agents

**Role**: Long-running background processes, complex debugging

**Strengths**:
- Full IDE context
- Debugging capability
- Multi-step reasoning
- MCP tool integration

**Use Cases**:
- Complex bug fixes
- Large features (>100 lines)
- Architectural changes
- Performance optimization

**API**:
```bash
curl -X POST 'https://api.cursor.com/agents/launch' \
  -u "$CURSOR_API_KEY:" \
  -H 'Content-Type: application/json' \
  -d '{
    "repository": "jbcom/strata-game-library",
    "task": "Implement WebGPU rendering backend",
    "branch": "main"
  }'
```

### 4. AI Reviewer Swarm

**Role**: PR quality gates

**Available Reviewers**:
| Reviewer | Trigger | Strengths |
|----------|---------|-----------|
| Gemini Code Assist | Auto on PR | Deep analysis |
| GitHub Copilot | `@copilot` | Context-aware |
| Amazon Q Developer | Label | AWS/security |
| CodeRabbit | Auto on PR | Comprehensive |
| Cursor Bugbot | Auto on PR | Bug detection |

## Task Routing Matrix

| Criteria | Agent | Reason |
|----------|-------|--------|
| Quick fix (<5 lines, single file) | Ollama | Inline, fast |
| Code review | Ollama | Structured JSON output |
| Multi-file refactor | Jules | Async, AUTO_CREATE_PR |
| Large feature (>100 lines) | Cursor Cloud | Full IDE context |
| Documentation | Jules | Full file context |
| Bug fix (complex) | Cursor Cloud | Debugging capability |
| Dependency update | Ollama | Simple changes |
| Security fix | Jules + Cursor | Needs careful review |

## Trigger Commands

| Command | Agent | Action |
|---------|-------|--------|
| `/ollama fix` | Ollama | Quick inline fix |
| `/jules refactor` | Jules | Async refactoring session |
| `/cursor background` | Cursor | Long-running agent |
| `/auto` | Router | Auto-select best agent |

## Required Secrets

| Secret | Status | Purpose |
|--------|--------|---------|
| `OLLAMA_API_KEY` | ✅ EXISTS | Ollama Cloud API |
| `GOOGLE_JULES_API_KEY` | ✅ EXISTS | Jules sessions |
| `CURSOR_API_KEY` | ⏳ NEEDED | Cursor Cloud Agents |
| `CI_GITHUB_TOKEN` | ✅ EXISTS | Cross-repo operations |

## Implementation Phases

### Phase 1: Jules Integration ✅
- [x] Add GOOGLE_JULES_API_KEY org secret
- [ ] Add delegate-to-jules job to ollama-cloud-pr-review.yml
- [ ] Create jules-issue-automation.yml workflow

### Phase 2: Cursor Cloud Integration
- [ ] Add CURSOR_API_KEY org secret
- [ ] Create cursor-agent-launcher.yml workflow
- [ ] Add long-running task delegation

### Phase 3: Unified Router
- [ ] Create task-router.yml workflow
- [ ] Implement routing logic (Ollama decides which agent)
- [ ] Add session/agent tracking

### Phase 4: Feedback Loop
- [ ] Aggregate feedback from all AI reviewers
- [ ] Cross-agent fix coordination
- [ ] Conflict resolution

### Phase 5: Monitoring & Dashboard
- [ ] Session status tracking
- [ ] PR lifecycle metrics
- [ ] Agent performance analytics

## Success Criteria

- [ ] Issues can be fully resolved without human intervention
- [ ] PRs are created, reviewed, fixed, and merged autonomously
- [ ] <5 min for simple fixes, <1 hour for complex refactors
- [ ] All AI feedback is automatically addressed
- [ ] Zero manual merge button clicks for routine changes

## Related Documents

- [AI Design Automation](./AI_DESIGN_AUTOMATION.md) - UI/UX generation
- [Game Framework Vision](./GAME_FRAMEWORK_VISION.md) - Strata 2.0 goals
- [Roadmap](./ROADMAP.md) - Implementation timeline

## Related Issues

- [control-center#420](https://github.com/jbcom/control-center/issues/420) - Jules integration
- [control-center#422](https://github.com/jbcom/control-center/issues/422) - This EPIC
- [control-center#423](https://github.com/jbcom/control-center/issues/423) - CURSOR_API_KEY
