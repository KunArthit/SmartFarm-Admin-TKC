# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based admin dashboard for a Smart Farm system built with the Fuse React template and ViteJS. It's a comprehensive TypeScript application with Material-UI components, Redux state management, and JWT authentication.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## Tech Stack

- **Frontend**: React 19.0.0 + TypeScript 5.4.5
- **Build Tool**: Vite 6.0.3
- **UI Framework**: Material-UI 6.1.10 + TailwindCSS 3.4.16
- **State Management**: Redux Toolkit 2.4.0 with RTK Query
- **Authentication**: JWT-based with automatic token refresh
- **Node Requirements**: >=22.12.0, npm >=10.9.0

## Architecture

### Core Directory Structure

```
src/
├── @auth/                 # Authentication system (JWT provider)
├── @fuse/                 # Fuse React core components and utilities
├── app/
│   ├── (control-panel)/   # Protected admin routes
│   │   ├── apps/          # Feature modules (e-commerce, blog, user-management, etc.)
│   │   └── dashboards/    # Analytics dashboards
│   └── (public)/          # Public routes (login, register)
├── components/            # Reusable UI components
├── store/                 # Redux store configuration
└── configs/               # App configuration
```

### Feature Module Pattern

Each app module follows this structure:
- `components/` - Feature-specific UI components
- `api/` - RTK Query endpoints and TypeScript types
- `routes/` - Route configuration
- `i18n/` - Translation files
- `models/` - Data models and interfaces

### Authentication Flow

JWT authentication with automatic token refresh:
- Tokens stored in localStorage with validation
- Fetch interceptor handles token renewal
- Role-based access control (admin/user)
- Auth guard protects routes

### State Management

- **Server State**: RTK Query for API calls and caching
- **Client State**: Redux slices for UI state
- **Local State**: React hooks for component-specific state

## Key Features

1. **E-Commerce Management** - Product catalog, orders, inventory
2. **Content Management** - Blog posts, media files, categories
3. **User Management** - User directory, roles, permissions
4. **Analytics Dashboards** - Charts, reports, metrics
5. **Communication** - Messaging, file sharing

## API Integration

Base API URL: `https://myfarmsuk.com/api`

Authentication endpoints:
- `POST /login` - User login
- `POST /refresh` - Token refresh
- `GET /me` - Current user info

## Environment Variables

```
VITE_API_BASE_URL=https://myfarmsuk.com/api
VITE_IMAGE_URL=https://myfarmsuk.com/api
VITE_MAP_KEY=<Google Maps API Key>
```

## Development Notes

- Use Material-UI components and theme system
- Follow existing TypeScript patterns and interfaces
- Utilize RTK Query for API integration
- Implement proper error boundaries
- Use React.lazy for code splitting
- Follow the established routing patterns with Next.js App Router structure

## Code Quality

- ESLint configured for TypeScript + React
- Prettier for code formatting
- Strict TypeScript configuration
- Import organization and unused import removal