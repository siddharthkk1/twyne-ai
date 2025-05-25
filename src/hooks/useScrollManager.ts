
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
  const lastAIMessagePartsRef = useRef(0);

  // Check if user is near bottom
  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 100;
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
    }, 50);
  }, [checkIfNearBottom]);

  // Instant scroll to bottom - synchronous
  const scrollToBottomInstant = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    container.scrollTop = container.scrollHeight;
    
    // Reset scrolling flag immediately since this is synchronous
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 10);
  }, []);

  // Pre-scroll before AI message appears - this ensures message renders in correct position
  const preScrollBeforeAIMessage = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only pre-scroll if user is near bottom and hasn't manually scrolled recently
    const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
    if (isUserNearBottom && !userScrolledAwayRef.current && timeSinceLastUserScroll > 500) {
      isScrollingRef.current = true;
      
      // Scroll to bottom plus some extra space for the incoming message
      const extraSpace = 300; // Buffer for new message
      container.scrollTop = container.scrollHeight + extraSpace;
      
      // Use requestAnimationFrame to ensure this happens before render
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
        isScrollingRef.current = false;
      });
    }
  }, [isUserNearBottom]);

  // Handle new messages (count changes) - this fires when message count increases
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    
    if (currentMessageCount > previousMessageCount) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.sender === 'user') {
        // For user messages: instantly scroll and anchor at bottom
        setIsUserNearBottom(true);
        userScrolledAwayRef.current = false;
        lastUserScrollTimeRef.current = 0;
        
        // Immediate scroll for user messages
        scrollToBottomInstant();
        
        // Ensure we stay at bottom after message renders
        requestAnimationFrame(() => {
          scrollToBottomInstant();
        });
      } else if (lastMessage?.sender === 'ai') {
        // For AI messages: pre-scroll BEFORE the message renders
        preScrollBeforeAIMessage();
        
        // Reset AI message parts counter for new message
        lastAIMessagePartsRef.current = 0;
        const currentParts = lastMessage.text.split("||").length;
        lastAIMessagePartsRef.current = currentParts;
        
        // Ensure proper positioning after render
        requestAnimationFrame(() => {
          const container = scrollContainerRef.current;
          if (container && isUserNearBottom && !userScrolledAwayRef.current) {
            const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
            if (timeSinceLastUserScroll > 500) {
              container.scrollTop = container.scrollHeight;
            }
          }
        });
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, scrollToBottomInstant, preScrollBeforeAIMessage, isUserNearBottom]);

  // Handle AI message content changes (for message parts) - this fires when AI message content changes
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
          // Pre-scroll before new part renders
          preScrollBeforeAIMessage();
          
          // Ensure proper positioning after new part renders
          requestAnimationFrame(() => {
            const container = scrollContainerRef.current;
            if (container && isUserNearBottom && !userScrolledAwayRef.current) {
              const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
              if (timeSinceLastUserScroll > 500) {
                container.scrollTop = container.scrollHeight;
              }
            }
          });
        }
      }
      
      lastMessageContentRef.current = currentContent;
    }
  }, [messages, preScrollBeforeAIMessage, isUserNearBottom]);

  // Smooth scroll to bottom for manual calls
  const scrollToBottomSmooth = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only scroll if user hasn't manually scrolled recently
    const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current;
    if (timeSinceLastUserScroll < 500) return;

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
