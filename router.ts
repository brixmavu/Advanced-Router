interface RouteConfig {
  component: any
  guard?: (params?: Record<string, string>) => boolean | Promise<boolean>
  meta?: Record<string, any>
  beforeEnter?: (params?: Record<string, string>) => void | Promise<void>
  afterLeave?: () => void | Promise<void>
}

interface RouterOptions {
  mode?: "hash" | "history"
  root?: string
  fallback?: string
  onRouteChange?: (to: string, from: string) => void
  scrollBehavior?: "auto" | "smooth" | "none"
}

interface RouterState {
  current: string
  previous: string
  params: Record<string, string>
  query: Record<string, string>
}

export class Router {
  private routes: Record<string, RouteConfig>
  private mode: "hash" | "history"
  private root: string
  private fallback: string
  private currentRoute: RouteConfig | null = null
  private state: RouterState
  private middleware: Array<(to: string, from: string, next: () => void) => void> = []
  private onRouteChange?: (to: string, from: string) => void
  private scrollBehavior: "auto" | "smooth" | "none"

  constructor(routes: Record<string, RouteConfig>, options: RouterOptions = {}) {
    this.routes = routes
    this.mode = options.mode || "hash"
    this.root = options.root || "/"
    this.fallback = options.fallback || (this.mode === "hash" ? "#/404" : "/404")
    this.onRouteChange = options.onRouteChange
    this.scrollBehavior = options.scrollBehavior || "auto"

    this.state = {
      current: "",
      previous: "",
      params: {},
      query: {},
    }
  }

  /**
   * Add middleware that runs before every route change
   */
  use(middleware: (to: string, from: string, next: () => void) => void) {
    this.middleware.push(middleware)
    return this
  }

  /**
   * Start the router by listening to navigation events
   */
  start() {
    if (this.mode === "hash") {
      window.addEventListener("hashchange", () => this.handleRoute())
    } else {
      window.addEventListener("popstate", () => this.handleRoute())
      // Intercept link clicks for history mode
      this.interceptLinks()
    }
    this.handleRoute()
  }

  /**
   * Navigate to a specific route
   */
  async navigate(path: string, state?: any) {
    if (this.mode === "hash") {
      window.location.hash = path.startsWith("#") ? path : `#${path}`
    } else {
      window.history.pushState(state || {}, "", path)
      await this.handleRoute()
    }
  }

  /**
   * Replace current route without adding to history
   */
  async replace(path: string, state?: any) {
    if (this.mode === "hash") {
      const cleanPath = path.startsWith("#") ? path.slice(1) : path
      window.location.replace(`#${cleanPath}`)
    } else {
      window.history.replaceState(state || {}, "", path)
      await this.handleRoute()
    }
  }

  /**
   * Go back in history
   */
  back() {
    window.history.back()
  }

  /**
   * Go forward in history
   */
  forward() {
    window.history.forward()
  }

  /**
   * Get current router state
   */
  getState(): RouterState {
    return { ...this.state }
  }

  /**
   * Main route handler
   */
  private async handleRoute() {
    const path = this.getCurrentPath()
    const previousPath = this.state.current

    // Parse query parameters
    const [cleanPath, queryString] = path.split("?")
    this.state.query = this.parseQuery(queryString)

    // Store previous state
    this.state.previous = previousPath
    this.state.current = cleanPath

    // Run middleware chain
    await this.runMiddleware(cleanPath, previousPath)

    // Match route
    const { route, params } = this.matchRoute(cleanPath)
    this.state.params = params

    if (!route) {
      this.navigate(this.fallback)
      return
    }

    // Run beforeLeave hook on previous route
    if (this.currentRoute?.afterLeave) {
      await this.currentRoute.afterLeave()
    }

    // Check route guard
    if (route.guard) {
      const canAccess = await route.guard(params)
      if (!canAccess) {
        this.navigate("#/login")
        return
      }
    }

    // Run beforeEnter hook
    if (route.beforeEnter) {
      await route.beforeEnter(params)
    }

    // Render component
    this.currentRoute = route
    if (route.component) {
      route.component(params, this.state.query)
    }

    // Handle scroll behavior
    this.handleScrollBehavior()

    // Emit route change event
    if (this.onRouteChange) {
      this.onRouteChange(cleanPath, previousPath)
    }
  }

  /**
   * Run middleware chain
   */
  private async runMiddleware(to: string, from: string): Promise<void> {
    return new Promise((resolve) => {
      let index = 0
      const next = () => {
        if (index >= this.middleware.length) {
          resolve()
          return
        }
        const middleware = this.middleware[index++]
        middleware(to, from, next)
      }
      next()
    })
  }

  /**
   * Match route pattern with params
   */
  private matchRoute(path: string): { route: RouteConfig | null; params: Record<string, string> } {
    const cleanPath = this.mode === "hash" ? `#${path}` : path

    for (const [pattern, route] of Object.entries(this.routes)) {
      const params = this.extractParams(pattern, cleanPath)
      if (params !== null) {
        return { route, params }
      }
    }

    return { route: null, params: {} }
  }

  /**
   * Extract params from route pattern
   */
  private extractParams(pattern: string, path: string): Record<string, string> | null {
    const paramNames: string[] = []
    const regexPattern = pattern
      .replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1))
        return "([^/]+)"
      })
      .replace(/\*/g, "(.*)")

    const regex = new RegExp(`^${regexPattern}$`)
    const matches = path.match(regex)

    if (!matches) return null

    const params: Record<string, string> = {}
    paramNames.forEach((name, index) => {
      params[name] = matches[index + 1]
    })

    return params
  }

  /**
   * Parse query string into object
   */
  private parseQuery(queryString?: string): Record<string, string> {
    if (!queryString) return {}

    const params: Record<string, string> = {}
    queryString.split("&").forEach((param) => {
      const [key, value] = param.split("=")
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || "")
      }
    })
    return params
  }

  /**
   * Get current path based on mode
   */
  private getCurrentPath(): string {
    if (this.mode === "hash") {
      return window.location.hash.slice(1) || "/"
    } else {
      return window.location.pathname.replace(this.root, "") || "/"
    }
  }

  /**
   * Intercept link clicks for history mode
   */
  private interceptLinks() {
    document.addEventListener("click", (e) => {
      const target = (e.target as HTMLElement).closest("a")
      if (!target || target.getAttribute("target") === "_blank") return

      const href = target.getAttribute("href")
      if (href && href.startsWith("/")) {
        e.preventDefault()
        this.navigate(href)
      }
    })
  }

  /**
   * Handle scroll behavior on route change
   */
  private handleScrollBehavior() {
    if (this.scrollBehavior === "none") return

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: this.scrollBehavior === "smooth" ? "smooth" : "auto",
    })
  }
}
