import { useEffect } from 'react';
import { Message } from '@/types/chat';

export const useAutoScroll = (
  messagesEndRef: React.RefObject<HTMLDivElement>,
  scrollViewportRef: React.RefObject<HTMLDivElement>,
  messages: Message[],
  isUserNearBottom: boolean
) => {
  useEffect(() => {
    if (!scrollViewportRef.current || !messagesEndRef.current || !isUserNearBottom) return;

    // Wait until layout settles, then scroll
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto, block: "end" });
    });
  }, [messages.length, isUserNearBottom]);
};
