
import { useRef, useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/chat';

export const useScrollManager = (messages: Message[]) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const lastMessageCountRef = useRef(0);
  const isScrollingRef = useRef(false);

  // Check if user is near bottom
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 100;
  }, []);

  // Handle scroll events with debouncing
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;
    
    const nearBottom = checkIfNearBottom();
    setIsUserNearBottom(nearBottom);
  }, [checkIfNearBottom]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior
      });
      
      // Reset the scrolling flag after a brief delay
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    });
  }, []);

  // Handle message changes
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    
    if (currentMessageCount > previousMessageCount) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.sender === 'user') {
        // For user messages: always scroll immediately
        scrollToBottom('auto');
        setIsUserNearBottom(true);
      } else if (lastMessage?.sender === 'ai' && isUserNearBottom) {
        // For AI messages: only scroll if user was near bottom
        setTimeout(() => {
          scrollToBottom('smooth');
        }, 50);
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, isUserNearBottom, scrollToBottom]);

  // Reset scroll state
  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    scrollToBottom('auto');
  }, [scrollToBottom]);

  return {
    scrollContainerRef,
    messagesEndRef,
    isUserNearBottom,
    handleScroll,
    scrollToBottom,
    resetScrollState
  };
};
