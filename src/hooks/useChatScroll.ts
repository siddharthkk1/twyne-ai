
import { useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';

export const useChatScroll = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

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

    // Instant scroll to bottom
    container.scrollTop = container.scrollHeight;
  }, []);

  // Smooth scroll to bottom (for AI messages when user is near bottom)
  const scrollToBottomSmooth = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }, []);

  // Handle user sending a message - scroll BEFORE DOM update
  const handleUserMessage = useCallback((updateMessages: () => void) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Reset scroll state since user is actively participating
    setHasUserScrolled(false);
    setIsUserNearBottom(true);
    
    // Scroll to bottom BEFORE adding the message
    container.scrollTop = container.scrollHeight;
    
    // Use flushSync to immediately update DOM and scroll again
    flushSync(() => {
      updateMessages();
    });
    
    // Ensure we're at the bottom after the message is added
    container.scrollTop = container.scrollHeight;
  }, []);

  // Handle AI message parts - smooth scroll if user is near bottom
  const handleAIMessagePart = useCallback((updateMessages: () => void) => {
    if (!hasUserScrolled && isUserNearBottom) {
      // Use flushSync to immediately update DOM
      flushSync(() => {
        updateMessages();
      });
      
      // Smooth scroll to show the new content
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    } else {
      // User has scrolled up, just update without scrolling
      updateMessages();
    }
  }, [hasUserScrolled, isUserNearBottom]);

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
    handleScroll,
    handleUserMessage,
    handleAIMessagePart,
    handleNewMessage,
    scrollToBottomInstant,
    scrollToBottomSmooth
  };
};
