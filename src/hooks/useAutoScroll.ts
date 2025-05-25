import { useEffect } from 'react';
import { Message } from '@/types/chat';

export const useAutoScroll = (
  messagesEndRef: React.RefObject<HTMLDivElement>,
  scrollViewportRef: React.RefObject<HTMLDivElement>,
  messages: Message[]
) => {
  useEffect(() => {
  if (!messagesEndRef.current || !scrollViewportRef.current) return;

  requestAnimationFrame(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  });
}, [messages.length]);

};
