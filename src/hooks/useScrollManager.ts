
import { useRef, useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/chat';

export const useScrollManager = (messages: Message[]) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const lastMessageCountRef = useRef(0);
  const userScrolledAwayRef = useRef(false);
  const lastUserScrollTimeRef = useRef(0);
  const isAutoScrollingRef = useRef(false);

  // Check if user is near bottom (within 100px)
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 100;
  }, []);

  // Force scroll to bottom immediately and synchronously
  const forceScrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isAutoScrollingRef.current = true;
    container.scrollTop = container.scrollHeight;
    
    // Reset flag after a brief moment
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 100);
  }, []);

  // Handle manual scroll events
  const handleScroll = useCallback(() => {
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

  // Pre-scroll before new messages appear
  const prepareForNewMessage = useCallback((isUserMessage: boolean) => {
    if (isUserMessage) {
      // For user messages: ALWAYS scroll to bottom immediately
      setIsUserNearBottom(true);
      userScrolledAwayRef.current = false;
      
      // Scroll BEFORE the message is added to DOM
      requestAnimationFrame(() => {
        forceScrollToBottom();
      });
    } else {
      // For AI messages: only if user is anchored and hasn't scrolled recently
      const timeSinceUserScroll = Date.now() - lastUserScrollTimeRef.current;
      const shouldAutoScroll = isUserNearBottom && !userScrolledAwayRef.current && timeSinceUserScroll > 1000;
      
      if (shouldAutoScroll) {
        requestAnimationFrame(() => {
          forceScrollToBottom();
        });
      }
    }
  }, [forceScrollToBottom, isUserNearBottom]);

  // Handle new messages being added
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    
    if (currentMessageCount > previousMessageCount) {
      const newMessage = messages[messages.length - 1];
      
      if (newMessage?.sender === 'user') {
        // User message: immediate scroll
        prepareForNewMessage(true);
        
        // Double-ensure after DOM update
        setTimeout(() => {
          forceScrollToBottom();
        }, 50);
      } else if (newMessage?.sender === 'ai') {
        // AI message: conditional scroll
        prepareForNewMessage(false);
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, prepareForNewMessage, forceScrollToBottom]);

  // Handle AI message parts appearing (for MessageBubble animation)
  const handleMessagePartVisible = useCallback(() => {
    const timeSinceUserScroll = Date.now() - lastUserScrollTimeRef.current;
    const shouldAutoScroll = isUserNearBottom && !userScrolledAwayRef.current && timeSinceUserScroll > 1000;
    
    if (shouldAutoScroll) {
      // Use layout effect timing for message parts
      requestAnimationFrame(() => {
        forceScrollToBottom();
      });
    }
  }, [forceScrollToBottom, isUserNearBottom]);

  // Reset scroll state
  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    userScrolledAwayRef.current = false;
    lastUserScrollTimeRef.current = 0;
    forceScrollToBottom();
  }, [forceScrollToBottom]);

  return {
    scrollContainerRef,
    messagesEndRef,
    isUserNearBottom,
    handleScroll,
    scrollToBottom: forceScrollToBottom,
    resetScrollState,
    handleMessagePartVisible,
    prepareForNewMessage
  };
};
