
import { useRef, useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/chat';

export const useOnboardingScroll = (isComplete: boolean, messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [isUserNearBottom, setIsUserNearBottom] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    if (behavior === "auto") {
      viewport.scrollTop = viewport.scrollHeight;
    } else {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: behavior
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setIsUserNearBottom(distanceFromBottom < 100); // 100px leeway
  }, []);

  const handleMessagePartVisible = useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
  
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
  
    if (distanceFromBottom < 100) {
      scrollToBottom("smooth");
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
