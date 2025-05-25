import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';

export const useAutoScroll = (
  messagesEndRef: React.RefObject<HTMLDivElement>,
  scrollViewportRef: React.RefObject<HTMLDivElement>,
  messages: Message[],
  isUserNearBottom: boolean
) => {
  const prevMessageCount = useRef<number>(0);

  useEffect(() => {
    const messageAdded = messages.length > prevMessageCount.current;

    if (
      messageAdded &&
      messagesEndRef.current &&
      scrollViewportRef.current &&
      isUserNearBottom
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    prevMessageCount.current = messages.length;
  }, [messages.length, isUserNearBottom]);
};
