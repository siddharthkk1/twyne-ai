
import { useRef, useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/chat';

export const useOnboardingScroll = (isComplete: boolean, messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [isUserNearBottom, setIsUserNearBottom] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollViewportRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsUserNearBottom(distanceFromBottom < 100); // 100px leeway
  }, []);

  useEffect(() => {
    if (!scrollViewportRef.current || !messagesEndRef.current) return;

    // Only scroll if user is near the bottom
    if (isUserNearBottom) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      });
    }
  }, [isUserNearBottom, messages.length]);

  const handleMessagePartVisible = useCallback(() => {
    const el = scrollViewportRef.current;
    if (!el || !messagesEndRef.current) return;
  
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  
    if (distanceFromBottom < 100) {
      requestAnimationFrame(() => {
        scrollToBottom("smooth"); // gentle scroll
      });
    }
  }, [scrollToBottom]);

  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
  }, []);

  useEffect(() => {
    if (isComplete && dashboardRef.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isComplete]);

  return {
    messagesEndRef,
    scrollViewportRef,
    dashboardRef,
    isUserNearBottom,
    setIsUserNearBottom,
    scrollToBottom,
    handleScroll,
    resetScrollState,
    handleMessagePartVisible,
  };
};
