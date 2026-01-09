# Advanced Router 2.0

A powerful, modular, vanilla TypeScript/JavaScript router for single-page applications with modern features.

## Features

- **Multiple Routing Modes**: Hash-based or HTML5 History API
- **TypeScript Support**: Full type definitions included
- **Route Guards**: Protect routes with sync/async guard functions
- **Middleware System**: Global middleware for logging, analytics, etc.
- **Route Hooks**: `beforeEnter` and `afterLeave` lifecycle hooks
- **Query Parameters**: Automatic parsing and access
- **Dynamic Routes**: Support for route parameters (`:id`) and wildcards (`*`)
- **Scroll Behavior**: Configurable scroll restoration
- **Link Helpers**: Utility functions for navigation and URL building
- **Zero Dependencies**: Pure vanilla JS/TS

## Installation

```bash
# Copy the advancedrouter folder to your project
# Import the modules you need
```

## Quick Start

```typescript
import { Router } from './advancedrouter/router.ts';
import * as Guards from './advancedrouter/guards.ts';

// Define your routes
const routes = {
  '#/': { 
    component: HomePage,
    meta: { title: 'Home' }
  },
  '#/about': { 
    component: AboutPage,
    beforeEnter: () => console.log('Entering about page')
  },
  '#/profile/:id': { 
    component: ProfilePage,
    guard: Guards.isLoggedIn
  },
  '#/admin': { 
    component: AdminPage,
    guard: Guards.isAdmin
  },
  '#/404': { 
    component: NotFoundPage 
  }
};

// Create router with options
const router = new Router(routes, {
  mode: 'hash',
  fallback: '#/404',
  scrollBehavior: 'smooth',
  onRouteChange: (to, from) => {
    console.log(`Navigating from ${from} to ${to}`);
  }
});

// Add global middleware
router.use((to, from, next) => {
  console.log(`[Middleware] ${from} -> ${to}`);
  // Add analytics, logging, etc.
  next();
});

// Start the router
router.start();
```

## Component Example

```typescript
function ProfilePage(params: Record<string, string>, query: Record<string, string>) {
  const userId = params.id;
  const tab = query.tab || 'overview';
  
  console.log(`Profile for user ${userId}, tab: ${tab}`);
  
  // Render your component
  document.getElementById('app')!.innerHTML = `
    <div>
      <h1>User Profile: ${userId}</h1>
      <p>Current Tab: ${tab}</p>
    </div>
  `;
}
```

## Navigation

```typescript
import { navigateTo, buildUrl } from './advancedrouter/link.ts';

// Navigate to a route
navigateTo('#/profile/123');

// Navigate with query parameters
const url = buildUrl('#/profile/123', { tab: 'settings', view: 'edit' });
navigateTo(url);

// Use router methods
router.navigate('#/about');
router.replace('#/home'); // Replace without history entry
router.back();
router.forward();
```

## Guards

```typescript
import { Guards, combineGuards } from './advancedrouter/guards.ts';

// Simple guard
const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

// Async guard
const hasPermission = async (params) => {
  const response = await fetch(`/api/permissions/${params.id}`);
  const data = await response.json();
  return data.canAccess;
};

// Combine multiple guards
const canEditProfile = combineGuards(isLoggedIn, isOwner);

// Use in route
const routes = {
  '#/profile/:id/edit': {
    component: EditProfile,
    guard: canEditProfile
  }
};
```

## Middleware

```typescript
// Logging middleware
router.use((to, from, next) => {
  console.log(`[Navigation] ${from} -> ${to}`);
  next();
});

// Analytics middleware
router.use((to, from, next) => {
  analytics.track('pageview', { path: to });
  next();
});

// Auth check middleware
router.use((to, from, next) => {
  if (to.startsWith('/admin') && !isAdmin()) {
    router.navigate('/login');
    return;
  }
  next();
});
```

## Router State

```typescript
// Get current router state
const state = router.getState();
console.log(state.current);   // Current route
console.log(state.previous);  // Previous route
console.log(state.params);    // Route parameters
console.log(state.query);     // Query parameters
```

## Route Hooks

```typescript
const routes = {
  '#/profile/:id': {
    component: ProfilePage,
    beforeEnter: async (params) => {
      // Load data before rendering
      await loadUserData(params.id);
    },
    afterLeave: () => {
      // Cleanup
      console.log('Leaving profile page');
    }
  }
};
```

## API Reference

### Router Class

#### Constructor
```typescript
new Router(routes, options?)
```

Options:
- `mode`: `'hash' | 'history'` - Routing mode (default: 'hash')
- `root`: `string` - Root path for history mode (default: '/')
- `fallback`: `string` - Fallback route for 404 (default: '#/404')
- `onRouteChange`: `(to, from) => void` - Route change callback
- `scrollBehavior`: `'auto' | 'smooth' | 'none'` - Scroll behavior (default: 'auto')

#### Methods
- `start()` - Start listening to route changes
- `navigate(path, state?)` - Navigate to a route
- `replace(path, state?)` - Replace current route
- `back()` - Go back in history
- `forward()` - Go forward in history
- `use(middleware)` - Add global middleware
- `getState()` - Get current router state

### Guards Module

- `isLoggedIn()` - Check if user is authenticated
- `isAdmin()` - Check if user has admin role
- `isOwner(params)` - Check if user owns resource
- `hasPermission(params)` - Async permission check
- `combineGuards(...guards)` - Combine multiple guards
- `setAuth(authenticated, role?)` - Set auth state (for testing)

### Link Module

- `navigateTo(path, mode?)` - Navigate programmatically
- `getCurrentPath(mode?)` - Get current route path
- `buildUrl(path, query?)` - Build URL with query params
- `createLink(options)` - Create link element

## Browser Support

Works in all modern browsers with support for:
- ES6+ features
- History API (for history mode)
- URLSearchParams (for query parsing)

## License

MIT

## Contributing

Contributions welcome! This is a resume project but improvements are appreciated.
