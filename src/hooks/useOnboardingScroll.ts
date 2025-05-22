
import { useRef, useState, useCallback, useEffect } from 'react';

export const useOnboardingScroll = (isComplete: boolean) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Track if user has manually scrolled up
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  
  // Store the last scroll position to determine scroll direction
  const lastScrollTopRef = useRef<number>(0);
  
  // Define a function to scroll to bottom with smooth animation
  const scrollToBottom = useCallback(() => {
    if (!scrollViewportRef.current || userHasScrolledUp) return;
    
    const scrollElement = scrollViewportRef.current;
    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior: "smooth"
    });
    
    // Also use the messagesEndRef for additional scrolling support
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesEndRef, userHasScrolledUp]);

  // Handle user scroll events to detect if they've scrolled up
  const handleScroll = useCallback(() => {
    if (!scrollViewportRef.current) return;
    
    const scrollElement = scrollViewportRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    
    // Detect scroll direction
    const isScrollingUp = scrollTop < lastScrollTopRef.current;
    lastScrollTopRef.current = scrollTop;
    
    // Calculate how close to bottom (within 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // If user is scrolling up and not near bottom, they're reading history
    if (isScrollingUp && !isNearBottom) {
      setUserHasScrolledUp(true);
    }
    
    // If user manually scrolls to bottom, reset the flag
    if (isNearBottom) {
      setUserHasScrolledUp(false);
    }
  }, []);
  
  // Scroll to top when profile is complete
  useEffect(() => {
    if (isComplete && dashboardRef.current) {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [isComplete]);
  
  // Handle message part becoming visible
  const handleMessagePartVisible = useCallback(() => {
    requestAnimationFrame(() => {
      if (!userHasScrolledUp) {
        scrollToBottom();
      }
    });
  }, [scrollToBottom, userHasScrolledUp]);
  
  // Reset user scroll state
  const resetScrollState = useCallback(() => {
    setUserHasScrolledUp(false);
    requestAnimationFrame(scrollToBottom);
  }, [scrollToBottom]);

  return {
    messagesEndRef,
    scrollViewportRef,
    dashboardRef,
    userHasScrolledUp,
    setUserHasScrolledUp,
    scrollToBottom,
    handleScroll,
    resetScrollState,
    handleMessagePartVisible
  };
};
