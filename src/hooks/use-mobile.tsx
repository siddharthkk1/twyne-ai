
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Initial check based on media query
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      // Base check on screen size only, not attempting iOS detection here
      // This will be used just for layout/responsive purposes
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(isSmallScreen)
    }
    
    mql.addEventListener("change", onChange)
    onChange() // Run the check immediately
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Helper function to detect iOS devices more reliably
export function isIOSDevice() {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod|macintosh/.test(userAgent) && 'ontouchend' in document
}
