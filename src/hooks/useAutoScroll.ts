
import { useEffect } from 'react';
import { Message } from '@/types/chat';

export const useAutoScroll = (
  messagesEndRef: React.RefObject<HTMLDivElement>,
  scrollViewportRef: React.RefObject<HTMLDivElement>,
  messages: Message[],
  shouldAutoScroll: boolean
) => {
  useEffect(() => {
    if (!scrollViewportRef.current || !messagesEndRef.current || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    
    const isUserMessage = lastMessage.sender === "user";

    // For user messages: always scroll instantly to maintain bottom anchor
    // For AI messages: only scroll if user hasn't scrolled up
    if (isUserMessage || shouldAutoScroll) {
      requestAnimationFrame(() => {
        const viewport = scrollViewportRef.current;
        if (!viewport) return;

        if (isUserMessage) {
          // Instant scroll for user messages to maintain bottom anchor
          viewport.scrollTop = viewport.scrollHeight;
        } else if (shouldAutoScroll) {
          // Smooth scroll for AI messages when auto-scroll is enabled
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  }, [messages.length, shouldAutoScroll, messages]);
};
