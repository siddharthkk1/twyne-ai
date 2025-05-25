
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
  const lastUserScrollTimeRef = useRef(0);

  // Check if user is near bottom
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 100; // Changed to 100px as per requirements
  }, []);

  // Debounced scroll handler - only updates state, doesn't force scrolling
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;
    
    // Track when user manually scrolled
    lastUserScrollTimeRef.current = Date.now();
    
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
    }, 50); // Reduced debounce time for better responsiveness
  }, [checkIfNearBottom]);

  // Instant scroll to bottom for user messages
  const scrollToBottomInstant = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    
    // Pre-scroll to make room before message appears
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      
      // Double-check after a brief moment to ensure it worked
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        isScrollingRef.current = false;
      }, 10);
    });
  }, []);

  // Smooth scroll to bottom for AI messages
  const scrollToBottomSmooth = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only scroll if user hasn't manually scrolled recently (within 500ms)
    const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
    if (timeSinceLastUserScroll < 500) return;

    // Only scroll if user is near bottom and hasn't manually scrolled away
    if (isUserNearBottom && !userScrolledAwayRef.current) {
      isScrollingRef.current = true;
      
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
        
        // Reset scrolling flag after animation
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 300);
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
        // For user messages: instantly scroll and anchor at bottom
        setIsUserNearBottom(true);
        userScrolledAwayRef.current = false;
        lastUserScrollTimeRef.current = 0; // Reset user scroll time
        
        // Pre-scroll before message renders
        scrollToBottomInstant();
        
        // Ensure we stay at bottom after message renders
        setTimeout(() => {
          scrollToBottomInstant();
        }, 50);
      } else if (lastMessage?.sender === 'ai') {
        // For AI messages: only scroll if user was near bottom
        setTimeout(() => {
          scrollToBottomSmooth();
        }, 100);
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, scrollToBottomInstant, scrollToBottomSmooth]);

  // Handle AI message content changes (for message parts)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const currentContent = lastMessage?.text || '';
      const previousContent = lastMessageContentRef.current;
      
      // Only scroll if content actually changed and it's an AI message
      if (currentContent !== previousContent && lastMessage?.sender === 'ai') {
        // Only scroll if user is near bottom and hasn't manually scrolled away recently
        const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
        if (isUserNearBottom && !userScrolledAwayRef.current && timeSinceLastUserScroll > 500) {
          setTimeout(() => {
            scrollToBottomSmooth();
          }, 100);
        }
      }
      
      lastMessageContentRef.current = currentContent;
    }
  }, [messages, scrollToBottomSmooth, isUserNearBottom]);

  // Reset scroll state
  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    userScrolledAwayRef.current = false;
    lastUserScrollTimeRef.current = 0;
    scrollToBottomInstant();
  }, [scrollToBottomInstant]);

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
    scrollToBottom: scrollToBottomSmooth,
    resetScrollState
  };
};
