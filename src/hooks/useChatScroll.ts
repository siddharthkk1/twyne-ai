
import { useRef, useState, useCallback, useEffect } from 'react';

export const useChatScroll = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  // Check if user is near the bottom
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Consider "near bottom" if within 100px
    return distanceFromBottom < 100;
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
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

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Use smooth scrolling to bottom
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }, []);

  // Instant scroll to bottom (for when user sends message)
  const scrollToBottomInstant = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Instant scroll to bottom
    container.scrollTop = container.scrollHeight;
  }, []);

  // Auto-scroll when new content appears (only if user is near bottom)
  const handleNewMessage = useCallback(() => {
    if (!hasUserScrolled && isUserNearBottom) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [hasUserScrolled, isUserNearBottom, scrollToBottom]);

  // Handle user sending a message (always scroll to bottom)
  const handleUserMessage = useCallback(() => {
    // Reset scroll state since user is actively participating
    setHasUserScrolled(false);
    setIsUserNearBottom(true);
    
    // Use requestAnimationFrame to scroll after DOM update
    requestAnimationFrame(() => {
      scrollToBottomInstant();
    });
  }, [scrollToBottomInstant]);

  return {
    scrollContainerRef,
    messagesEndRef,
    isUserNearBottom,
    hasUserScrolled,
    handleScroll,
    handleNewMessage,
    handleUserMessage,
    scrollToBottom
  };
};
