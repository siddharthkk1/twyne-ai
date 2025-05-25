import { useEffect } from 'react';
import { Message } from '@/types/chat';

export const useAutoScroll = (
  messagesEndRef: React.RefObject<HTMLDivElement>,
  scrollViewportRef: React.RefObject<HTMLDivElement>,
  messages: Message[],
  isUserNearBottom: boolean
) => {
  useEffect(() => {
    // Only scroll if user is near the bottom when new messages come in
    if (!scrollViewportRef.current || !messagesEndRef.current || !isUserNearBottom) return;

    // Use requestAnimationFrame to wait for layout to finish before scrolling
    const frame = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages.length, isUserNearBottom, messagesEndRef, scrollViewportRef]);
};
