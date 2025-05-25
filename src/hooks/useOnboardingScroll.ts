import { useRef, useState, useCallback, useEffect } from 'react';

export const useOnboardingScroll = (isComplete: boolean) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
  const el = scrollViewportRef.current;
  if (!el) return;

  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  setIsUserNearBottom(distanceFromBottom < 100); // ✅ threshold is good
}, []);

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsUserNearBottom(distanceFromBottom < 100); // 100px leeway
  }, []);

  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    scrollToBottom(); // immediate scroll
  }, [scrollToBottom]);

  const handleMessagePartVisible = useCallback(() => {
    if (isUserNearBottom) {
      scrollToBottom();
    }
  }, [scrollToBottom, isUserNearBottom]);

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
    handleMessagePartVisible
  };
};
