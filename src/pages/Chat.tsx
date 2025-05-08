
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user" | "connection";
  timestamp: Date;
}

interface Connection {
  id: string;
  name: string;
  imageUrl: string;
}

// Mock data
const connections: Record<string, Connection> = {
  "1": {
    id: "1",
    name: "Nina",
    imageUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=200&h=200",
  },
  "2": {
    id: "2",
    name: "Jordan",
    imageUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=200&h=200",
  },
  "twyne": {
    id: "twyne",
    name: "Twyne",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=200&h=200",
  },
};

const initialMessages: Record<string, Message[]> = {
  "1": [
    {
      id: 1,
      text: "Hi there! I saw that we both recently moved to the city. How are you finding it so far?",
      sender: "connection",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ],
  "2": [
    {
      id: 1,
      text: "Hey! Twyne mentioned you're into indie music too. What bands have you been listening to lately?",
      sender: "connection",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ],
  "twyne": [
    {
      id: 1,
      text: "Hi there! How's your experience with Twyne been so far? Any questions I can help with?",
      sender: "ai",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  ],
};

const Chat = () => {
  const { id = "twyne" } = useParams<{ id: string }>();
  const connection = connections[id];
  const [messages, setMessages] = useState<Message[]>(initialMessages[id] || []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update messages when chat ID changes
    setMessages(initialMessages[id] || []);
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate response after a delay (only for Twyne AI)
    if (id === "twyne") {
      setTimeout(() => {
        const responses = [
          "I'm glad you're enjoying Twyne! Let me know if you have any questions about how it works.",
          "That's interesting! I'll keep that in mind when looking for matches for you.",
          "Thanks for sharing. The more we chat, the better I can understand your vibe.",
          "I'll be sending more connections your way next week. Looking forward to finding great matches for you!",
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const newAiMessage: Message = {
          id: messages.length + 2,
          text: randomResponse,
          sender: "ai",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, newAiMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!connection) {
    return <div className="p-4">Chat not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm flex items-center">
        <Link to="/connections" className="mr-3">
          <ArrowLeft size={20} />
        </Link>
        
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
            <img
              src={connection.imageUrl}
              alt={connection.name}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="text-lg font-medium">{connection.name}</h1>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div
                className={`animate-fade-in ${
                  message.sender === "user" 
                    ? "chat-bubble-user" 
                    : message.sender === "ai" 
                      ? "chat-bubble-ai"
                      : "chat-bubble-ai"
                }`}
              >
                {message.text}
              </div>
              <span className="text-xs text-muted-foreground mt-1 px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble-ai animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            className="rounded-full"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="rounded-full"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
