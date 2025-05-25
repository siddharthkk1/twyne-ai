
import { useRef, useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/chat';

export const useScrollManager = (messages: Message[]) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const lastMessageCountRef = useRef(0);

  // Check if user is near bottom
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 100;
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const nearBottom = checkIfNearBottom();
    setIsUserNearBottom(nearBottom);
  }, [checkIfNearBottom]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior
      });
    });
  }, []);

  // Handle message changes
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    
    if (currentMessageCount > previousMessageCount) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.sender === 'user') {
        // For user messages: always scroll immediately and anchor at bottom
        requestAnimationFrame(() => {
          scrollToBottom('auto');
          setIsUserNearBottom(true);
        });
      } else if (lastMessage?.sender === 'ai' && isUserNearBottom) {
        // For AI messages: only smooth scroll if user was near bottom
        requestAnimationFrame(() => {
          scrollToBottom('smooth');
        });
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
