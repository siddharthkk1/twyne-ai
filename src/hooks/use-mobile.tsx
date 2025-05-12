
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
  
  // Improved iOS detection checking both user agent and touch capabilities
  const isIOS = (/iphone|ipad|ipod|mac/.test(userAgent) && 'ontouchend' in document) ||
                // Additional check for newer iOS devices that might use different user agents
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                // iPadOS might report as Mac + touch
                (/iphone|ipad|ipod|ios/.test(userAgent))
  
  console.log("iOS detection:", { userAgent, platform: navigator.platform, maxTouchPoints: navigator.maxTouchPoints, isIOS })
  return isIOS
}

// Debug helper to access device information
export function useDeviceDebugInfo() {
  const isMobile = useIsMobile()
  const [isIOS, setIsIOS] = React.useState(false)
  
  React.useEffect(() => {
    // Check only once on mount
    setIsIOS(isIOSDevice())
  }, [])
  
  return { 
    isMobile, 
    isIOS, 
    userAgent: window.navigator.userAgent,
    platform: navigator.platform,
    touchPoints: navigator.maxTouchPoints
  }
}
