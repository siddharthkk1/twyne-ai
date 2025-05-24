
import { useRef, useState, useCallback, useEffect } from 'react';

export const useOnboardingScroll = (isComplete: boolean) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Track if user is near the bottom - start as true so initial messages auto-scroll
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  
  // Define a function to scroll to bottom with stable layout using requestAnimationFrame
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, []);

  // Handle user scroll events to track if they're near bottom
  const handleScroll = useCallback(() => {
    const el = scrollViewportRef.current;
    if (!el) return;
    
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    
    // User is near bottom if within 100px - you can tune this number
    setIsUserNearBottom(distanceFromBottom < 100);
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
  
  // Handle message part becoming visible - only scroll if user is near bottom
  const handleMessagePartVisible = useCallback(() => {
    if (isUserNearBottom) {
      scrollToBottom();
    }
  }, [scrollToBottom, isUserNearBottom]);
  
  // Reset user scroll state and scroll to bottom - call this when sending new messages
  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    // Use requestAnimationFrame to ensure message is added to DOM first
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [scrollToBottom]);

  return {
    messagesEndRef,
    scrollViewportRef,
    dashboardRef,
    isUserNearBottom,
    setIsUserNearBottom,
    scrollToBottom,
    handleScroll,
    resetScrollState,
    handleMessagePartVisible
  };
};
