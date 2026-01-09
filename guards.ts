/**
 * Example guard functions for route protection
 */

// Simple auth state (in real app, use proper auth service)
let isAuthenticated = false
let userRole: string | null = null

export function setAuth(authenticated: boolean, role?: string) {
  isAuthenticated = authenticated
  userRole = role || null
}

export function getAuth() {
  return { isAuthenticated, userRole }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(params?: Record<string, string>): boolean {
  console.log("[Router Guard] Checking if user is logged in")
  return isAuthenticated
}

/**
 * Check if user is admin
 */
export function isAdmin(params?: Record<string, string>): boolean {
  console.log("[Router Guard] Checking if user is admin")
  return isAuthenticated && userRole === "admin"
}

/**
 * Check if user owns the resource (e.g., profile)
 */
export function isOwner(params?: Record<string, string>): boolean {
  console.log("[Router Guard] Checking if user owns resource")
  if (!params?.id) return false

  // In real app, compare with current user ID
  const currentUserId = "user123" // Mock
  return isAuthenticated && params.id === currentUserId
}

/**
 * Async guard example - check permissions from API
 */
export async function hasPermission(params?: Record<string, string>): Promise<boolean> {
  console.log("[Router Guard] Checking permissions from API")

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(isAuthenticated && userRole === "admin")
    }, 100)
  })
}

/**
 * Combine multiple guards (AND logic)
 */
export function combineGuards(...guards: Array<(params?: Record<string, string>) => boolean | Promise<boolean>>) {
  return async (params?: Record<string, string>) => {
    for (const guard of guards) {
      const result = await guard(params)
      if (!result) return false
    }
    return true
  }
}
