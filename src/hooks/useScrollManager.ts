
import { useRef, useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/chat';

export const useScrollManager = (messages: Message[]) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const userScrolledAwayRef = useRef(false);
  const lastUserScrollTimeRef = useRef(0);
  const isAutoScrollingRef = useRef(false);
  const lastMessageCountRef = useRef(0);

  // Check if user is near bottom (within 100px)
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 100;
  }, []);

  // Scroll to bottom immediately and synchronously
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isAutoScrollingRef.current = true;
    container.scrollTop = container.scrollHeight;
    
    // Reset auto-scroll flag after DOM settles
    requestAnimationFrame(() => {
      isAutoScrollingRef.current = false;
    });
  }, []);

  // Handle manual scroll events
  const handleScroll = useCallback(() => {
    // Ignore if we're auto-scrolling
    if (isAutoScrollingRef.current) return;
    
    lastUserScrollTimeRef.current = Date.now();
    
    const nearBottom = checkIfNearBottom();
    setIsUserNearBottom(nearBottom);
    
    if (!nearBottom) {
      userScrolledAwayRef.current = true;
    } else {
      userScrolledAwayRef.current = false;
    }
  }, [checkIfNearBottom]);

  // Pre-position for new messages - this is the key to iMessage-like behavior
  const prepareForNewMessage = useCallback((isUserMessage: boolean) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (isUserMessage) {
      // For user messages: ALWAYS pre-scroll to bottom BEFORE message is added
      setIsUserNearBottom(true);
      userScrolledAwayRef.current = false;
      scrollToBottom();
    } else {
      // For AI messages: only if user is anchored and hasn't scrolled recently
      const timeSinceUserScroll = Date.now() - lastUserScrollTimeRef.current;
      const shouldAutoScroll = isUserNearBottom && !userScrolledAwayRef.current && timeSinceUserScroll > 1000;
      
      if (shouldAutoScroll) {
        scrollToBottom();
      }
    }
  }, [isUserNearBottom, scrollToBottom]);

  // Handle message parts appearing (for AI message chunks)
  const handleMessagePartVisible = useCallback(() => {
    const timeSinceUserScroll = Date.now() - lastUserScrollTimeRef.current;
    const shouldAutoScroll = isUserNearBottom && !userScrolledAwayRef.current && timeSinceUserScroll > 1000;
    
    if (shouldAutoScroll) {
      // Scroll immediately when new parts appear
      scrollToBottom();
    }
  }, [isUserNearBottom, scrollToBottom]);

  // Monitor message changes and handle scrolling
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    
    if (currentMessageCount > previousMessageCount) {
      const newMessage = messages[currentMessageCount - 1];
      
      if (newMessage?.sender === 'user') {
        // User message: pre-position immediately
        prepareForNewMessage(true);
      } else if (newMessage?.sender === 'ai') {
        // AI message: conditional scroll
        prepareForNewMessage(false);
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, prepareForNewMessage]);

  // Reset scroll state (for conversation resets)
  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    userScrolledAwayRef.current = false;
    lastUserScrollTimeRef.current = 0;
    scrollToBottom();
  }, [scrollToBottom]);

  return {
    scrollContainerRef,
    isUserNearBottom,
    handleScroll,
    scrollToBottom,
    resetScrollState,
    handleMessagePartVisible,
    prepareForNewMessage
  };
};
