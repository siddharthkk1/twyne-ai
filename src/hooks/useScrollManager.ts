
import { useRef, useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/chat';

export const useScrollManager = (messages: Message[]) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const lastMessageCountRef = useRef(0);
  const lastMessageContentRef = useRef<string>('');
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const userScrolledAwayRef = useRef(false);

  // Check if user is near bottom
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 150;
  }, []);

  // Debounced scroll handler - only updates state, doesn't force scrolling
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
      
      // Track if user manually scrolled away from bottom
      if (!nearBottom) {
        userScrolledAwayRef.current = true;
      } else {
        userScrolledAwayRef.current = false;
      }
    }, 100);
  }, [checkIfNearBottom]);

  // Smooth scroll to bottom function
  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto', force = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only scroll if forced or user is near bottom and hasn't manually scrolled away
    if (force || (isUserNearBottom && !userScrolledAwayRef.current)) {
      isScrollingRef.current = true;
      
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

  // Handle new messages (count changes)
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    
    if (currentMessageCount > previousMessageCount) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.sender === 'user') {
        // For user messages: always scroll immediately and smoothly
        setIsUserNearBottom(true);
        userScrolledAwayRef.current = false;
        // Pre-scroll to make room for the message
        scrollToBottom('smooth', true);
      } else if (lastMessage?.sender === 'ai') {
        // For AI messages: only scroll if user was near bottom
        if (isUserNearBottom && !userScrolledAwayRef.current) {
          setTimeout(() => {
            scrollToBottom('smooth', false);
          }, 100);
        }
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, scrollToBottom, isUserNearBottom]);

  // Handle message content changes (for AI message parts)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const currentContent = lastMessage?.text || '';
      const previousContent = lastMessageContentRef.current;
      
      // Only scroll if content actually changed and it's an AI message
      if (currentContent !== previousContent && lastMessage?.sender === 'ai') {
        // Only scroll if user is near bottom and hasn't manually scrolled away
        if (isUserNearBottom && !userScrolledAwayRef.current) {
          setTimeout(() => {
            scrollToBottom('smooth', false);
          }, 150);
        }
      }
      
      lastMessageContentRef.current = currentContent;
    }
  }, [messages, scrollToBottom, isUserNearBottom]);

  // Reset scroll state
  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    userScrolledAwayRef.current = false;
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
