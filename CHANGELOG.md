# Changelog

## v2.0.0 - Enhanced Edition

### New Features
- **TypeScript Support**: Full TypeScript definitions with proper types
- **Query Parameters**: Built-in query parameter parsing and handling
- **Middleware System**: Add global middleware that runs before every route
- **Route Hooks**: `beforeEnter` and `afterLeave` lifecycle hooks
- **Scroll Behavior**: Configurable scroll restoration (auto, smooth, none)
- **State Management**: Built-in router state with current/previous routes and params
- **Navigation Methods**: `back()`, `forward()`, `replace()` methods
- **Link Helpers**: Utility functions for creating links and building URLs
- **Better Guards**: Support for async guards and guard composition
- **History Mode**: Better link interception for SPA behavior
- **Meta Fields**: Add custom metadata to routes

### Improvements
- Async/await throughout for better error handling
- Cleaner API with chainable methods
- Better separation of concerns
- More detailed code documentation
- Improved error handling

### Breaking Changes
- Component functions now receive both params and query objects
- Guards can now be async (return Promise<boolean>)
- Router constructor takes options object instead of positional args
