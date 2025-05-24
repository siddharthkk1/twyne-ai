
import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';

export const useAutoScroll = (
  messagesEndRef: React.RefObject<HTMLDivElement>,
  scrollViewportRef: React.RefObject<HTMLDivElement>,
  messages: Message[],
  isUserNearBottom: boolean
) => {
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!scrollViewportRef.current || !messagesEndRef.current || !isUserNearBottom) return;

    const observer = new ResizeObserver(() => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);

      // Wait for layout to settle before scrolling
      resizeTimeout.current = setTimeout(() => {
        if (messagesEndRef.current && isUserNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Delay to ensure layout is stable
    });

    observer.observe(scrollViewportRef.current);

    return () => {
      observer.disconnect();
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    };
  }, [messages.length, isUserNearBottom]);
};
