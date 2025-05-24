
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
  }, [userHasScrolledUp]);

  // Handle user scroll events to detect if they've scrolled up
  const handleScroll = useCallback(() => {
    if (!scrollViewportRef.current) return;
    
    const scrollElement = scrollViewportRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    
    // Detect scroll direction
    const isScrollingUp = scrollTop < lastScrollTopRef.current;
    lastScrollTopRef.current = scrollTop;
    
    // Calculate how close to bottom (within 50px for better UX)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // If user is scrolling up and not near bottom, they're reading history
    if (isScrollingUp && !isNearBottom) {
      setUserHasScrolledUp(true);
    }
    
    // If user manually scrolls to bottom, reset the flag
    if (isNearBottom && !isScrollingUp) {
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
  
  // Handle message part becoming visible - only scroll if user hasn't scrolled up
  const handleMessagePartVisible = useCallback(() => {
    // Don't force scroll if user has scrolled up
    if (!userHasScrolledUp) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [scrollToBottom, userHasScrolledUp]);
  
  // Reset user scroll state - only call this when sending new messages
  const resetScrollState = useCallback(() => {
    setUserHasScrolledUp(false);
    // Small delay to ensure message is added to DOM first
    setTimeout(() => {
      scrollToBottom();
    }, 100);
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
