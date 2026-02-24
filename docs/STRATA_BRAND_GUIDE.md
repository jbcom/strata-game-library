# Strata Brand Guide

> **Within jbcom. Beyond ordinary.**

---

## Brand Philosophy

### The Name: Strata

**Strata** (noun): Layers of rock or soil with internally consistent characteristics that distinguish it from contiguous layers.

This name perfectly embodies our framework:

- **Geological Metaphor**: Building worlds layer by layer, from terrain foundations to atmospheric effects
- **Framework Architecture**: From core algorithms → React components → Game framework
- **Technical Precision**: Deliberate, structured, scientifically grounded

### Tagline Options

| Tagline | Usage |
|---------|-------|
| "Layer by Layer, World by World" | Primary/Hero |
| "Build worlds. Ship games." | Action-oriented |
| "From terrain to triumph" | Game development focus |
| "Procedural. Declarative. Beautiful." | Technical focus |

---

## Visual Identity

### Relationship to jbcom

Strata operates **within the jbcom ecosystem** while establishing its own visual personality:

| Aspect | jbcom Standard | Strata Extension |
|--------|----------------|------------------|
| Dark theme | Required ✓ | Deeper, richer darks |
| Primary cyan | `#06b6d4` | Extended palette below |
| Space Grotesk | Headings ✓ | Layered treatment |
| Inter | Body ✓ | Same |
| JetBrains Mono | Code ✓ | Same |

### Color Palette

#### Core Colors (jbcom Inherited)

```css
:root {
  /* jbcom Foundation - DO NOT MODIFY */
  --color-background: #0a0f1a;       /* Deep space black */
  --color-surface: #111827;          /* Card/surface black */
  --color-primary: #06b6d4;          /* Cyan - primary action */
  --color-secondary: #3b82f6;        /* Blue - secondary action */
  --color-text-primary: #f1f5f9;     /* Light gray - primary text */
  --color-text-secondary: #94a3b8;   /* Medium gray - secondary text */
  --color-success: #10b981;          /* Green - success */
  --color-warning: #f59e0b;          /* Amber - warning */
  --color-error: #ef4444;            /* Red - error */
}
```

#### Strata Feature Colors

These colors represent Strata's core capabilities and may be used for:
- Feature categorization
- Documentation section headers
- Interactive demos
- Marketing materials

```css
:root {
  /* Terrain System - Earth tones */
  --strata-terrain: #78350f;         /* Rich brown */
  --strata-terrain-light: #a16207;   /* Amber brown */
  --strata-terrain-dark: #451a03;    /* Deep earth */
  
  /* Water System - Ocean depths */
  --strata-water: #0284c7;           /* Sky blue */
  --strata-water-light: #38bdf8;     /* Surface shimmer */
  --strata-water-dark: #075985;      /* Deep water */
  
  /* Vegetation System - Forest greens */
  --strata-vegetation: #15803d;      /* Forest green */
  --strata-vegetation-light: #22c55e;/* Leaf green */
  --strata-vegetation-dark: #14532d; /* Shadow green */
  
  /* Sky/Volumetrics - Atmospheric purples */
  --strata-sky: #7c3aed;             /* Violet */
  --strata-sky-light: #a78bfa;       /* Dawn purple */
  --strata-sky-dark: #4c1d95;        /* Twilight */
  
  /* Game Framework - Action gold */
  --strata-game: #eab308;            /* Gold */
  --strata-game-light: #fde047;      /* Highlight gold */
  --strata-game-dark: #b45309;       /* Deep gold - distinct from terrain */
}
```

### Feature Color Mapping

| Feature | Primary | Icon | Emoji |
|---------|---------|------|-------|
| Terrain | `--strata-terrain` | mountain | 🏔️ |
| Water | `--strata-water` | waves | 🌊 |
| Vegetation | `--strata-vegetation` | tree | 🌲 |
| Sky/Volumetrics | `--strata-sky` | cloud | ☁️ |
| Game Framework | `--strata-game` | gamepad | 🎮 |
| Core Utils | `--color-primary` | bolt | ⚡ |

---

## Logo

### Primary Logo

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ███████╗████████╗██████╗  █████╗ ████████╗ █████╗       ║
║   ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗      ║
║   ███████╗   ██║   ██████╔╝███████║   ██║   ███████║      ║
║   ╚════██║   ██║   ██╔══██╗██╔══██║   ██║   ██╔══██║      ║
║   ███████║   ██║   ██║  ██║██║  ██║   ██║   ██║  ██║      ║
║   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝      ║
║   ══════════════════════════════════════════════════      ║
║   ════════════════════════════════════════════════════    ║
║   ══════════════════════════════════════════════════════  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

**Design Principles**:
1. **Layered underlines**: Three horizontal lines beneath the wordmark, representing strata/layers
2. **Gradient effect**: Lines can fade from terrain brown → water blue → sky purple
3. **Clean letterforms**: Using Space Grotesk Bold

### Logo Variants

| Variant | Usage |
|---------|-------|
| Full wordmark + lines | Hero sections, marketing |
| Wordmark only | Navigation, headers |
| Monogram "S" + lines | Favicon, app icon |
| Lines only | Decorative element |

### Minimum Sizes

| Variant | Minimum Width |
|---------|---------------|
| Full | 200px |
| Wordmark | 120px |
| Monogram | 32px |

### Clear Space

Maintain clear space equal to the height of the letter "S" on all sides of the logo.

---

## Typography

### Heading Hierarchy

```css
/* Hero/H1 - Make a statement */
.hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 4rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* H2 - Section headers */
.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
  line-height: 1.2;
}

/* H3 - Feature headers */
.feature-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  line-height: 1.3;
}

/* Body - Readable content */
.body-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.6;
}

/* Code - Technical content */
.code-text {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 400;
  font-size: 0.9rem;
  line-height: 1.5;
}
```

### Special Treatment: "Layer" Text

When describing Strata's layered architecture, use stacked/layered text treatment:

```html
<div class="layer-stack">
  <span class="layer layer-4">Layer 4: Declarative Games</span>
  <span class="layer layer-3">Layer 3: Compositional Objects</span>
  <span class="layer layer-2">Layer 2: World Topology</span>
  <span class="layer layer-1">Layer 1: Game Orchestration</span>
  <span class="layer layer-0">Layer 0: Core Primitives</span>
</div>
```

---

## Photography & Imagery

### Style Guidelines

| Aspect | Guideline |
|--------|-----------|
| **Environment** | Natural landscapes, geological formations |
| **Color grading** | Cool tones, slight cyan/purple tint |
| **Mood** | Epic, expansive, aspirational |
| **Focus** | Layered compositions (foreground, midground, background) |

### Recommended Imagery

- Aerial views of terrain
- Water flowing over rocks (layers)
- Forest scenes with depth
- Dramatic skies with clouds
- Geological cross-sections
- Procedural/abstract 3D renders

### Do Not Use

- Cartoon/clipart style
- Warm/orange color grading
- Flat compositions without depth
- Stock photos of people at computers
- Generic game screenshots

---

## Voice & Tone

### Brand Voice

| Characteristic | Expression |
|----------------|------------|
| **Technical** | We speak with precision; we know our craft |
| **Confident** | We've built something powerful and we know it |
| **Approachable** | Complex ideas, simple explanations |
| **Inspiring** | We help you build worlds |

### Writing Examples

**DO:**
> "Strata transforms game development. Define your world in layers—terrain, water, vegetation, sky—and let the framework handle the complexity."

**DON'T:**
> "Our awesome framework makes building games super easy and fun!!"

**DO:**
> "10x code reduction. Rivermarsh in under 1,000 lines. That's the Strata difference."

**DON'T:**
> "Strata might help you write less code if you use it correctly..."

---

## Documentation Design

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]                    [Docs] [API] [Examples]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │             │  │                                 │  │
│  │  Sidebar    │  │  Content Area                   │  │
│  │             │  │                                 │  │
│  │  - Terrain  │  │  # Page Title                   │  │
│  │  - Water    │  │                                 │  │
│  │  - Veg      │  │  Content with proper spacing    │  │
│  │  - Sky      │  │  and code blocks styled with    │  │
│  │             │  │  feature colors.                │  │
│  │             │  │                                 │  │
│  └─────────────┘  └─────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Footer: jbcom | License | GitHub]                     │
└─────────────────────────────────────────────────────────┘
```

### Code Block Styling

```css
/* Feature-specific code blocks */
.code-block[data-feature="terrain"] {
  border-left: 4px solid var(--strata-terrain);
}

.code-block[data-feature="water"] {
  border-left: 4px solid var(--strata-water);
}

.code-block[data-feature="vegetation"] {
  border-left: 4px solid var(--strata-vegetation);
}

.code-block[data-feature="sky"] {
  border-left: 4px solid var(--strata-sky);
}

.code-block[data-feature="game"] {
  border-left: 4px solid var(--strata-game);
}
```

### Interactive Elements

| Element | Style |
|---------|-------|
| Buttons | Rounded corners (8px), slight gradient |
| Cards | Subtle border, hover lift effect |
| Links | Cyan underline, purple on hover |
| Tabs | Bottom border indicates active |

---

## Domain Identity

### strata.game

The apex domain `strata.game` should convey:
- **Authority**: This is THE source for Strata
- **Modernity**: Cutting-edge game development
- **Professionalism**: Enterprise-ready framework

### Subdomain Styling

Each subdomain maintains the Strata brand but with feature-specific accents:

| Subdomain | Accent Color | Header Treatment |
|-----------|--------------|------------------|
| strata.game | `--color-primary` | Gradient of all features |
| shaders.strata.game | `--strata-sky` | Purple accent |
| presets.strata.game | `--strata-game` | Gold accent |
| examples.strata.game | `--strata-vegetation` | Green accent |
| tutor.strata.game | Special | Professor Pixel brand |

---

## Social Media

### Profile Elements

| Platform | Avatar | Banner |
|----------|--------|--------|
| GitHub | Monogram "S" + lines | Layered landscape |
| npm | Monogram "S" | Package description |
| Twitter/X | Monogram "S" | Hero image with tagline |
| Discord | Monogram "S" | Community server banner |

### Hashtags

- `#StrataJS`
- `#StrataGame`
- `#ReactThreeFiber`
- `#WebGL`
- `#GameDev`
- `#ProceduralGeneration`

---

## Application Examples

### README Header

```markdown
<div align="center">
  <img src="logo.svg" alt="Strata" width="400">
  <p><strong>Layer by Layer, World by World</strong></p>
  <p>The game framework for React Three Fiber</p>
  
  [![npm](https://img.shields.io/npm/v/@jbcom/strata)](https://www.npmjs.com/package/@jbcom/strata)
  [![license](https://img.shields.io/github/license/jbcom/strata-game-library)](LICENSE)
</div>
```

### Documentation Hero

```html
<section class="hero">
  <div class="hero-content">
    <h1>Build worlds. Ship games.</h1>
    <p>Strata is the game framework for React Three Fiber. 
       Define your game declaratively and let the framework 
       handle the complexity.</p>
    <div class="hero-cta">
      <a href="/docs" class="btn-primary">Get Started</a>
      <a href="/examples" class="btn-secondary">See Examples</a>
    </div>
  </div>
  <div class="hero-visual">
    <!-- Interactive 3D demo -->
  </div>
</section>
```

---

## Brand Assets Checklist

### Required Assets

- [ ] Logo SVG (all variants)
- [ ] Favicon ICO/PNG
- [ ] Open Graph image (1200x630)
- [ ] Twitter card image (1200x600)
- [ ] GitHub social preview (1280x640)
- [ ] README banner
- [ ] Documentation header
- [ ] npm badge

### Color Files

- [ ] CSS custom properties file
- [ ] Tailwind config extension
- [ ] Figma/Sketch color styles
- [ ] PNG swatches for quick reference

---

*Brand Guide Version: 1.0.0*
*Last Updated: December 23, 2025*
*Maintained by: jbcom/strata-game-library*
