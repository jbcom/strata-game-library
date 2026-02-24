---
title: "Shaders"
---

# Documentation

This directory contains documentation for this project.

## Documentation Tooling

Choose the appropriate documentation tooling based on your project’s primary language:

| Language               | Tool           | Configuration Location     |
|------------------------|----------------|----------------------------|
| **Python**             | Sphinx         | Language-specific scaffold |
| **TypeScript/Node.js** | TypeDoc        | Language-specific scaffold |
| **Go**                 | godoc          | Built into Go toolchain    |
| **Terraform**          | terraform-docs | Language-specific scaffold |

## jbcom Brand Guidelines

All jbcom repositories follow a unified design system for consistent branding.

See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for:

- **Color Palette** - Cyan primary (#06b6d4), dark backgrounds
- **Typography** - Space Grotesk (headings), Inter (body), JetBrains Mono (code)
- **Accessibility** - WCAG AA compliance required

## Directory Structure

```default
docs/
├── README.md           # This file
├── DESIGN-SYSTEM.md    # jbcom brand guidelines
├── getting-started/    # User onboarding docs
│   ├── installation.md
│   └── quickstart.md
└── development/        # Contributor docs
    └── contributing.md
```

## Quick Start

1. Choose your documentation tool based on language
2. Apply the jbcom brand colors and typography
3. Follow the structure conventions from DESIGN-SYSTEM.md
4. Ensure accessibility requirements are met

## Additional Resources

- [jbcom Design System](DESIGN-SYSTEM.md) - Brand specifications
- [GitHub Pages](https://pages.github.com/) - Hosting documentation
