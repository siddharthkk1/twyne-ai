import { useRef, useState, useCallback, useEffect } from 'react';

export const useOnboardingScroll = (isComplete: boolean) => {
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

  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    setTimeout(() => {
      scrollToBottom("auto");
    }, 0); // or 50ms if needed
}, [scrollToBottom]);



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
