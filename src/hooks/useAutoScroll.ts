
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
    if (!lastMessage) return;
    
    const isUserMessage = lastMessage.sender === "user";

    // Always scroll for user messages (instant)
    // Scroll for AI messages only if user is near bottom (smooth)
    if (isUserMessage || isUserNearBottom) {
      // Use requestAnimationFrame to ensure DOM is updated with new message
      requestAnimationFrame(() => {
        const viewport = scrollViewportRef.current;
        if (!viewport) return;

        if (isUserMessage) {
          // Instant scroll to bottom for user messages
          viewport.scrollTop = viewport.scrollHeight;
        } else {
          // Smooth scroll for AI responses when user is near bottom
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  }, [messages.length, isUserNearBottom, messages]);
};
