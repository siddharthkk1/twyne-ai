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
    setIsUserNearBottom(distanceFromBottom < 100); // 100px leeway
  }, []);

  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    scrollToBottom(); // immediate scroll
  }, [scrollToBottom]);

  const handleMessagePartVisible = useCallback(() => {
  if (!scrollViewportRef.current || !messagesEndRef.current) return;

  const el = scrollViewportRef.current;
  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

  // Only scroll if we're near the bottom already (within 100px)
  if (distanceFromBottom < 100) {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }
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
