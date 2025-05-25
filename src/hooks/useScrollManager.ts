import { useRef, useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/chat';

export const useScrollManager = (messages: Message[]) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const lastMessageCountRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Check if user is near bottom
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 150; // Increased threshold
  }, []);

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Debounce the scroll check
    scrollTimeoutRef.current = setTimeout(() => {
      const nearBottom = checkIfNearBottom();
      setIsUserNearBottom(nearBottom);
    }, 100);
  }, [checkIfNearBottom]);

  // Force scroll to bottom function
  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto', force = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // If force is true or user was near bottom, scroll
    if (force || isUserNearBottom) {
      isScrollingRef.current = true;
      
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior
        });
        
        // Reset scrolling flag after animation
        setTimeout(() => {
          isScrollingRef.current = false;
        }, behavior === 'smooth' ? 300 : 100);
      });
    }
  }, [isUserNearBottom]);

  // Enhanced message change handler
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    
    if (currentMessageCount > previousMessageCount) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.sender === 'user') {
        // For user messages: always scroll immediately and force
        setIsUserNearBottom(true);
        setTimeout(() => {
          scrollToBottom('auto', true);
        }, 50); // Small delay to ensure DOM is updated
      } else if (lastMessage?.sender === 'ai') {
        // For AI messages: always keep scrolling for continuous flow
        setTimeout(() => {
          scrollToBottom('smooth', true);
        }, 100); // Slight delay for better UX
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, scrollToBottom]);

  // Also scroll when message content changes (for message parts)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.sender === 'ai') {
        // Scroll for AI message updates (new parts appearing)
        setTimeout(() => {
          scrollToBottom('smooth', true);
        }, 150);
      }
    }
  }, [messages, scrollToBottom]);

  // Reset scroll state
  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    scrollToBottom('auto', true);
  }, [scrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollContainerRef,
    messagesEndRef,
    isUserNearBottom,
    handleScroll,
    scrollToBottom,
    resetScrollState
  };
};
