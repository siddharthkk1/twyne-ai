
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
    return distanceFromBottom <= 100;
  }, []);

  // Debounced scroll handler
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
    }, 50);
  }, [checkIfNearBottom]);

  // Force scroll to bottom - immediate and synchronous
  const forceScrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    container.scrollTop = container.scrollHeight;
    
    // Reset scrolling flag immediately
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, []);

  // Handle new messages (when message count increases)
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    
    if (currentMessageCount > previousMessageCount) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.sender === 'user') {
        // For user messages: Always instantly scroll to bottom
        setIsUserNearBottom(true);
        userScrolledAwayRef.current = false;
        lastUserScrollTimeRef.current = 0;
        
        // Force immediate scroll - no conditions
        forceScrollToBottom();
        
        // Double-ensure after render
        requestAnimationFrame(() => {
          forceScrollToBottom();
        });
      } else if (lastMessage?.sender === 'ai') {
        // For AI messages: Only scroll if user is near bottom and hasn't manually scrolled recently
        const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
        const shouldAutoScroll = isUserNearBottom && !userScrolledAwayRef.current && timeSinceLastUserScroll > 1000;
        
        if (shouldAutoScroll) {
          // Pre-scroll before AI message renders
          requestAnimationFrame(() => {
            forceScrollToBottom();
          });
        }
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, forceScrollToBottom, isUserNearBottom]);

  // Handle AI message content changes (for message parts)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const currentContent = lastMessage?.text || '';
      const previousContent = lastMessageContentRef.current;
      
      // Only handle if content actually changed and it's an AI message
      if (currentContent !== previousContent && lastMessage?.sender === 'ai') {
        const currentParts = currentContent.split("||").length;
        const previousParts = previousContent.split("||").length;
        
        // New message part appeared
        if (currentParts > previousParts) {
          const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
          const shouldAutoScroll = isUserNearBottom && !userScrolledAwayRef.current && timeSinceLastUserScroll > 1000;
          
          if (shouldAutoScroll) {
            // Immediately scroll for each new part
            requestAnimationFrame(() => {
              forceScrollToBottom();
            });
          }
        }
      }
      
      lastMessageContentRef.current = currentContent;
    }
  }, [messages, forceScrollToBottom, isUserNearBottom]);

  // Smooth scroll to bottom for manual calls
  const scrollToBottomSmooth = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only scroll if user hasn't manually scrolled recently
    const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
    if (timeSinceLastUserScroll < 1000) return;

    // Only scroll if user is near bottom and hasn't manually scrolled away
    if (isUserNearBottom && !userScrolledAwayRef.current) {
      isScrollingRef.current = true;
      
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      
      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  }, [isUserNearBottom]);

  // Reset scroll state
  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    userScrolledAwayRef.current = false;
    lastUserScrollTimeRef.current = 0;
    forceScrollToBottom();
  }, [forceScrollToBottom]);

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
