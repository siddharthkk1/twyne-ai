
import { useRef, useState, useCallback } from 'react';

export const useChatScroll = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Check if user is near the bottom
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Consider "near bottom" if within 50px
    return distanceFromBottom < 50;
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom = checkIfNearBottom();
    setIsUserNearBottom(isNearBottom);
    
    // Mark that user has manually scrolled if they're not at bottom
    if (!isNearBottom) {
      setHasUserScrolled(true);
    } else if (isNearBottom && hasUserScrolled) {
      // User scrolled back to bottom, reset the flag
      setHasUserScrolled(false);
    }
  }, [checkIfNearBottom, hasUserScrolled]);

  // Instant scroll to bottom (for user messages)
  const scrollToBottomInstant = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsScrolling(true);
    // Force instant scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    // Hide scrollbar briefly during update
    setTimeout(() => {
      setIsScrolling(false);
    }, 100);
  }, []);

  // Smooth scroll to bottom (for AI messages when user is near bottom)
  const scrollToBottomSmooth = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsScrolling(true);
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
    
    // Hide scrollbar briefly during update
    setTimeout(() => {
      setIsScrolling(false);
    }, 300);
  }, []);

  // Handle user sending a message - immediate scroll
  const handleUserMessage = useCallback((updateMessages: () => void) => {
    // Reset scroll state
    setHasUserScrolled(false);
    setIsUserNearBottom(true);

    // Update messages first
    updateMessages();

    // Scroll immediately after state update
    requestAnimationFrame(() => {
      scrollToBottomInstant();
    });
  }, [scrollToBottomInstant]);

  // Handle AI message parts - smooth scroll if user is near bottom
  const handleAIMessagePart = useCallback((updateMessages: () => void) => {
    // Always update messages first
    updateMessages();
    
    // Only scroll if user hasn't manually scrolled up
    if (!hasUserScrolled && isUserNearBottom) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        scrollToBottomInstant(); // Use instant for seamless appearance
      });
    }
  }, [hasUserScrolled, isUserNearBottom, scrollToBottomInstant]);

  // For backward compatibility - generic new message handler
  const handleNewMessage = useCallback(() => {
    if (!hasUserScrolled && isUserNearBottom) {
      scrollToBottomSmooth();
    }
  }, [hasUserScrolled, isUserNearBottom, scrollToBottomSmooth]);

  return {
    scrollContainerRef,
    isUserNearBottom,
    hasUserScrolled,
    isScrolling,
    handleScroll,
    handleUserMessage,
    handleAIMessagePart,
    handleNewMessage,
    scrollToBottomInstant,
    scrollToBottomSmooth
  };
};
