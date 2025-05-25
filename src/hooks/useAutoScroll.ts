
import { useEffect } from 'react';
import { Message } from '@/types/chat';

export const useAutoScroll = (
  messagesEndRef: React.RefObject<HTMLDivElement>,
  scrollViewportRef: React.RefObject<HTMLDivElement>,
  messages: Message[],
  isUserNearBottom: boolean
) => {
  useEffect(() => {
    if (!scrollViewportRef.current || !messagesEndRef.current) return;

    const lastMessage = messages[messages.length - 1];
    const isUserMessage = lastMessage?.sender === "user";

    // Always anchor user at bottom when they send a message (instant scroll)
    // OR when user is near bottom and AI responds (smooth scroll)
    if (isUserMessage) {
      // Instant scroll to bottom for user messages
      const viewport = scrollViewportRef.current;
      viewport.scrollTop = viewport.scrollHeight;
    } else if (isUserNearBottom) {
      // Smooth scroll for AI responses when user is near bottom
      const viewport = scrollViewportRef.current;
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages.length, isUserNearBottom]);
};
