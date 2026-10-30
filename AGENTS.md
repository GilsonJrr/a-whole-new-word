# Project Development Guide

## Architecture

- Use React with TypeScript.
- Keep the project structure established in this repository.
- Separate components, pages, services, hooks, and utilities.
- Keep business rules out of visual components.
- Do not create unnecessary files.

## Components

- Build small, reusable components with a clearly defined responsibility.
- Avoid duplicated code.
- Use descriptive English names and PascalCase for React components.

## Pages

- Give each page its own directory.
- Keep page-specific logic within that page's structure.
- Reuse shared components whenever practical.

## Styling

- Use Tailwind CSS.
- Follow the navy-blue and white visual identity.
- Avoid inline styles.
- Keep spacing, colors, and typography consistent.
- Build responsive interfaces with a mobile-first approach.

## Code

- Use modern TypeScript, functional components, and React hooks.
- Use English for variable and function names.
- Keep imports organized and avoid unnecessary or overly complex code.
- Give values and public component props explicit, meaningful types.

## Navigation

- Use React Router DOM.
- Centralize route configuration in `src/routes/AppRoutes.tsx`.

## Maintenance

- Check for a suitable existing structure before creating files.
- Do not duplicate existing components.
- Respect established project patterns and maintain the architecture when adding features.
- Update this file only when project standards actually change.

## Future feature work

For every new feature request, first review the existing architecture and identify the files involved. Implement the change according to these documented standards, and do not modify unrelated parts of the project.
