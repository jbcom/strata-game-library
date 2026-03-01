---
title: "AI Design Automation Research"
description: "Research and recommendations for AI-owned end-to-end UI/UX design process"
status: draft
implementation: 20
last_updated: 2026-03-01
area: architecture
---

# AI Design Automation Research

> **Goal**: Fully AI-owned end-to-end design process for UI, layout, typography, and branding.

## Research Summary

### Tier 1: Full-Stack AI App Builders (End-to-End)

These platforms generate complete applications from prompts, including design:

| Tool | Type | Best For | API/Automation |
|------|------|----------|----------------|
| **[v0 by Vercel](https://v0.dev)** | SaaS | React/Next.js UI components | ✅ **Platform API available** |
| **[Bolt.new](https://bolt.new)** | Open Source | Full-stack apps in browser | ✅ Open source, self-hostable |
| **[Lovable](https://lovable.dev)** | SaaS | Complete web apps | ❌ Chat-based only |
| **[21st.dev Magic MCP](https://21st.dev)** | MCP Server | IDE-integrated UI generation | ✅ **MCP protocol** |

#### Recommendation: v0 Platform API + 21st.dev Magic MCP

**v0 Platform API** provides:

- Text-to-app generation pipeline
- React + Tailwind + shadcn/ui output
- Programmatic access (same infrastructure as v0.dev)
- Can be called from CI/CD or agentic workflows

**21st.dev Magic MCP** provides:

- IDE integration (Cursor, Windsurf, VSCode)
- Natural language → component generation
- Works within existing development workflow
- MCP protocol = agentic-control compatible

---

### Tier 2: Screenshot/Design-to-Code

Convert existing designs or references to code:

| Tool | Type | Input | Output |
|------|------|-------|--------|
| **[screenshot-to-code](https://github.com/abi/screenshot-to-code)** | Open Source | Screenshots, Figma | HTML/Tailwind/React/Vue |
| **[Codia AI](https://codia.ai)** | SaaS | Design concepts | Production components |
| **[1UI](https://1ui.dev)** | SaaS | Designs | HTML/CSS/Figma |

#### Recommendation: screenshot-to-code (Open Source)

- **68,000+ GitHub stars**
- Uses Claude Sonnet 3.7 or GPT-4o
- Outputs: HTML+Tailwind, React+Tailwind, Vue+Tailwind, Bootstrap
- Self-hostable, fully controllable
- Can be integrated into CI/CD pipelines

---

### Tier 3: Design System Generation

AI-powered color palettes, typography, and tokens:

| Tool | Type | Capabilities |
|------|------|--------------|
| **[Chromatica](https://chromatica.pro)** | SaaS | Color palettes, typography, design tokens |
| **[Design Foundry](https://designfoundry.io)** | SaaS | Full design systems, exports to Figma/CSS/JSON |
| **[Khroma](https://khroma.co)** | SaaS | AI-learned color preferences |
| **[Coolors](https://coolors.co)** | SaaS | Fast palette generation |
| **[AI Colors](https://aicolors.im)** | SaaS | Text-to-palette |

#### Recommendation: Design Foundry + Chromatica

Both export to CSS/JSON format that can be programmatically consumed.

---

### Tier 4: MCP-Based Design Tools

For agentic integration:

| MCP Server | Purpose |
|------------|---------|
| **[Figma Context MCP](https://github.com/nicobrinkkemper/figma-mcp)** | Query Figma designs from AI |
| **[21st.dev Magic MCP](https://github.com/21st-dev/magic-mcp)** | Generate UI from natural language |
| **Browser MCP** | Screenshot comparison for design QA |

---

## Recommended Stack for Strata

### Phase 1: Immediate (Use Existing Tools)

```yaml
design_automation:
  ui_generation:
    primary: "21st.dev Magic MCP"  # Cursor-integrated
    fallback: "v0 Platform API"    # Programmatic
    
  screenshot_to_code:
    tool: "abi/screenshot-to-code"
    self_hosted: true
    models:
      - claude-sonnet-3.7
      - gpt-4o
      
  design_system:
    colors: "chromatica.pro API"
    typography: "manual + AI suggestions"
    tokens: "export to CSS variables"
```

### Phase 2: Agentic Integration

```yaml
# .agentic-control/design.yaml
flows:
  generate-ui:
    description: "Generate UI component from description"
    steps:
      - mcp: 21st-magic
        action: generate_component
        input: "{{ prompt }}"
        output: component_code
        
      - action: validate_accessibility
        input: "{{ component_code }}"
        
      - action: write_file
        path: "src/components/{{ name }}.tsx"
        content: "{{ component_code }}"

  design-system-refresh:
    description: "Regenerate design tokens from brand"
    steps:
      - api: chromatica
        action: generate_palette
        input:
          base_color: "{{ brand_primary }}"
          style: "modern dark"
        output: palette
        
      - action: write_file
        path: "src/styles/tokens.css"
        content: "{{ palette | to_css_vars }}"

  screenshot-compare:
    description: "Compare implementation to design"
    steps:
      - mcp: browser
        action: screenshot
        url: "{{ dev_url }}"
        output: screenshot
        
      - mcp: figma
        action: export_frame
        frame_id: "{{ design_frame }}"
        output: design_image
        
      - model: claude-sonnet
        prompt: "Compare these images and list differences"
        images:
          - "{{ screenshot }}"
          - "{{ design_image }}"
        output: diff_report
```

### Phase 3: Full Automation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI DESIGN PIPELINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   PROMPT    │────▶│  v0 / Magic │────▶│   CODE      │                   │
│  │  "Create    │     │    MCP      │     │  Component  │                   │
│  │   a..."     │     │             │     │  .tsx       │                   │
│  └─────────────┘     └─────────────┘     └──────┬──────┘                   │
│                                                  │                          │
│                                                  ▼                          │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │  DESIGN     │◀────│  Browser    │◀────│   DEV       │                   │
│  │  REFERENCE  │     │    MCP      │     │  SERVER     │                   │
│  │  (Figma)    │     │ Screenshot  │     │             │                   │
│  └──────┬──────┘     └─────────────┘     └─────────────┘                   │
│         │                   │                                               │
│         │                   ▼                                               │
│         │            ┌─────────────┐                                        │
│         └───────────▶│   COMPARE   │                                        │
│                      │  (Claude)   │                                        │
│                      └──────┬──────┘                                        │
│                             │                                               │
│                             ▼                                               │
│                      ┌─────────────┐                                        │
│                      │   ITERATE   │◀─────────────────────┐                │
│                      │  or APPROVE │                      │                │
│                      └──────┬──────┘                      │                │
│                             │                             │                │
│                    ┌────────┴────────┐                    │                │
│                    ▼                 ▼                    │                │
│             ┌───────────┐     ┌───────────┐               │                │
│             │  COMMIT   │     │   FIX     │───────────────┘                │
│             │           │     │  DIFFS    │                                │
│             └───────────┘     └───────────┘                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tool Configuration

### 21st.dev Magic MCP Setup

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "21st-magic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic-mcp"],
      "env": {
        "TWENTY_FIRST_API_KEY": "${TWENTY_FIRST_API_KEY}"
      }
    }
  }
}
```

### v0 Platform API

```typescript
// scripts/generate-ui.ts
import { v0 } from '@vercel/v0-sdk';

async function generateComponent(prompt: string) {
  const result = await v0.generate({
    prompt,
    framework: 'react',
    styling: 'tailwind',
    components: 'shadcn'
  });
  
  return result.code;
}
```

### screenshot-to-code Integration

```bash
# Self-hosted deployment
git clone https://github.com/abi/screenshot-to-code
cd screenshot-to-code

# Run with Claude
ANTHROPIC_API_KEY=xxx docker-compose up

# API endpoint: http://localhost:7001/api/generate
```

---

## Strata-Specific Implementation

### Design Token Generation

```typescript
// scripts/generate-design-tokens.ts
const strataTokens = await generateDesignSystem({
  brand: {
    name: 'Strata',
    primary: '#06b6d4',  // Cyan
    personality: 'modern, technical, layered'
  },
  features: [
    { name: 'terrain', color: '#78350f' },
    { name: 'water', color: '#0284c7' },
    { name: 'vegetation', color: '#15803d' },
    { name: 'sky', color: '#7c3aed' },
    { name: 'game', color: '#eab308' }
  ],
  typography: {
    headings: 'Space Grotesk',
    body: 'Inter',
    code: 'JetBrains Mono'
  }
});

// Output: CSS variables, Tailwind config, JSON tokens
```

### UI Component Generation Prompt Template

```markdown
Generate a React component for Strata documentation using:
- Tailwind CSS for styling
- shadcn/ui components
- Dark theme (bg-slate-900)
- Strata color palette:
  - Primary: cyan-500
  - Terrain: amber-800
  - Water: sky-600
  - Vegetation: green-700
  - Sky: violet-600
  - Game: yellow-500
- JetBrains Mono for code blocks
- Space Grotesk for headings

Component: {{ component_description }}
```

---

## Control Center Issue

Create issue for implementing this:

```bash
gh issue create --repo jbcom/control-center \
  --title "🎨 AI Design Automation Pipeline" \
  --body "Implement end-to-end AI-owned design process..."
```

---

## Cost Estimates

| Tool | Pricing | Usage |
|------|---------|-------|
| v0 Platform API | Pay per generation | Component generation |
| 21st.dev Magic | Free tier + paid | Cursor integration |
| Claude API | $3/MTok input, $15/MTok output | Design comparison |
| screenshot-to-code | Self-hosted (API costs only) | Design-to-code |
| Chromatica | Free tier available | Palette generation |

---

## Implementation Status

### ✅ Completed

1. **21st.dev Magic MCP** - Configured with GitHub App integration + Sandboxes
2. **MCP Configuration** - Added to `.kiro/settings/mcp.json`

### 🔲 Remaining

1. **Set up screenshot-to-code** for design reference conversion
2. **Create agentic-control flow** for design automation
3. **Document design tokens** in CSS variables format
4. **Integrate into CI** for design QA checks

---

*Last Updated: 2025-12-23*
