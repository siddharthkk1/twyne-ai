
import { useRef, useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/chat';

export const useOnboardingScroll = (isComplete: boolean, messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    requestAnimationFrame(() => {
      if (behavior === "auto") {
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: behavior
        });
      }
    });
  }, []);

  const handleScroll = useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Consider "near bottom" if within 50px of bottom
    const nearBottom = distanceFromBottom < 50;
    setIsUserNearBottom(nearBottom);
    
    // If user manually scrolled up significantly, disable auto-scroll
    if (distanceFromBottom > 100) {
      setShouldAutoScroll(false);
    } else if (nearBottom) {
      setShouldAutoScroll(true);
    }
  }, []);

  const handleMessagePartVisible = useCallback(() => {
    // Only auto-scroll if user is near bottom and hasn't disabled auto-scroll
    if (shouldAutoScroll && isUserNearBottom) {
      const viewport = scrollViewportRef.current;
      if (!viewport) return;

      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, [shouldAutoScroll, isUserNearBottom]);

  const resetScrollState = useCallback(() => {
    setIsUserNearBottom(true);
    setShouldAutoScroll(true);
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
    shouldAutoScroll,
    setShouldAutoScroll,
    scrollToBottom,
    handleScroll,
    resetScrollState,
    handleMessagePartVisible,
  };
};
