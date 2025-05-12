
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Initial check based on media query
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      // Base check on screen size
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT
      
      // Additional iOS detection (iPads might have larger screens)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
                   
      // Combined check - treat as mobile if either screen is small OR it's an iOS device
      setIsMobile(isSmallScreen || isIOS)
    }
    
    mql.addEventListener("change", onChange)
    onChange() // Run the check immediately
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
