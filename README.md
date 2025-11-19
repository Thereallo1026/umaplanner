# Umaplanner

Plan your carat spendings ahead of time.

## Features

- Guided planner for planning your pulls
- Banner cards that display the banners and their characters
- Summary display total pulls and carats

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
bun install
```

### Development Server

```bash
bun run dev
```

Vite starts on `http://localhost:3000` by default.

### Build for Production

```bash
bun run build
```

The output is written to the `dist` directory. You can preview the production build locally with:

```bash
bun run preview
```

## Deployment

- Drag and drop the `dist` directory to any static hosting provider (Netlify, Vercel, Cloudflare Pages, etc.)

## Project Structure

- `src/main.tsx` bootstraps React and global providers
- `src/globals.css` configures Tailwind and shared styles
- `src/components/PlannerForm.tsx` contains the primary planning workflow
- `src/components/SummaryWidget.tsx` renders shareable summaries
- `src/components/ui/` houses shadcn/ui wrappers

## Contributing

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feature/my-update`
3. Install dependencies and run `bun run dev`
4. Commit changes and open a pull request

## License

This project is distributed under the MIT License. See `LICENSE` for details.
