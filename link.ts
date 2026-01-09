/**
 * Create a router link element programmatically
 */
export function createLink(options: {
  to: string
  text: string
  className?: string
  activeClassName?: string
  mode?: "hash" | "history"
}): HTMLAnchorElement {
  const link = document.createElement("a")
  const href = options.mode === "hash" && !options.to.startsWith("#") ? `#${options.to}` : options.to

  link.href = href
  link.textContent = options.text

  if (options.className) {
    link.className = options.className
  }

  // Add active class if current route matches
  const currentPath = options.mode === "hash" ? window.location.hash.slice(1) : window.location.pathname

  if (currentPath === options.to && options.activeClassName) {
    link.classList.add(options.activeClassName)
  }

  return link
}

/**
 * Navigate to route programmatically
 */
export function navigateTo(path: string, mode: "hash" | "history" = "hash") {
  if (mode === "hash") {
    window.location.hash = path.startsWith("#") ? path : `#${path}`
  } else {
    window.history.pushState({}, "", path)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }
}

/**
 * Get current route path
 */
export function getCurrentPath(mode: "hash" | "history" = "hash"): string {
  if (mode === "hash") {
    return window.location.hash.slice(1) || "/"
  } else {
    return window.location.pathname || "/"
  }
}

/**
 * Build URL with query parameters
 */
export function buildUrl(path: string, query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) return path

  const queryString = Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&")

  return `${path}?${queryString}`
}
