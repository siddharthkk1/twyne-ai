
import { useState, useRef } from 'react';
import { Message, Conversation } from '@/types/chat';
import { getAIResponse } from '@/utils/aiUtils';

export const useOnboardingMessages = (
  onNameChange: (name: string) => void,
  messageCap: number
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Function to handle AI response
  const handleAIResponse = async (
    userText: string, 
    draftConversation: Conversation,
    currentConversation: Conversation,
    setIsTyping: (value: boolean) => void,
    setConversation: (conversation: Conversation) => void
  ) => {
    try {
      // Add a 800ms delay before showing the typing indicator
      setTimeout(() => {
        setIsTyping(true);
      }, 800);
      
      // Get AI response from the API
      const aiResponse = await getAIResponse(draftConversation);
      
      // Add AI message to the UI while keeping typing indicator visible briefly
      const newAiMessage: Message = {
        id: messages.length + 2, // +2 because user message was +1
        text: aiResponse,
        sender: "ai"
      };
      
      // Add the message first, then remove typing indicator to prevent scroll jump
      setMessages(prev => [...prev, newAiMessage]);
      
      // Small delay to ensure message is rendered before removing typing indicator
      setTimeout(() => {
        setIsTyping(false);
      }, 50);
      
      // Update conversation state with AI response
      setConversation({
        messages: [
          ...draftConversation.messages,
          { role: "assistant", content: aiResponse }
        ],
        userAnswers: draftConversation.userAnswers
      });
      
      // Enhanced name extraction from user's first message
      if (currentQuestionIndex === 0 && !userName) {
        extractUserName(userText);
      }
      
      // Enhanced AI response name recognition
      if (!userName) {
        checkAIResponseForName(aiResponse);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: messages.length + 2, // +2 because user message was +1
        text: "Sorry, I had trouble responding. Could you try again?",
        sender: "ai"
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Update conversation with error message
      setConversation({
        messages: [
          ...draftConversation.messages,
          { role: "assistant", content: errorMessage.text }
        ],
        userAnswers: draftConversation.userAnswers
      });
      
      setIsTyping(false);
    }
  };
  
  // Enhanced name extraction with multiple strategies and better filtering
  const extractUserName = (text: string) => {
    console.log('🔍 useOnboardingMessages: Attempting to extract name from user text:', text.substring(0, 100));
    
    // Strategy 1: Direct name patterns with enhanced regex
    const namePatterns = [
      /(?:my name is|i'm called|call me|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /(?:i'm|i am)\s+([A-Z][a-z]+)(?:\s|[,.]|$)/i,
      /(?:name.*?is|named)\s+([A-Z][a-z]+)/i,
      /(?:hi|hello|hey),?\s*(?:i'm|i am)\s+([A-Z][a-z]+)/i,
      /^([A-Z][a-z]+)\s+(?:here|speaking|from)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        
        // Enhanced filtering of false positives
        const commonWords = [
          "the", "and", "but", "for", "are", "with", "his", "her", "this", "that", "from", 
          "they", "been", "have", "your", "what", "were", "said", "each", "which", "their", 
          "time", "will", "about", "would", "there", "could", "other", "more", "very", "know", 
          "just", "first", "get", "has", "him", "had", "let", "put", "too", "old", "any", 
          "may", "say", "she", "use", "now", "find", "only", "come", "made", "over", "think", 
          "also", "back", "after", "two", "how", "our", "work", "life", "way", "even", "new", 
          "want", "because", "good", "water", "need", "should", "home", "oil", "sit", "word", 
          "far", "tree", "port", "self", "town", "right", "study", "book", "eye", "job", 
          "business", "issue", "side", "kind", "head", "house", "service", "friend", "father", 
          "power", "hour", "game", "line", "end", "member", "law", "car", "city", "community", 
          "name", "president", "team", "minute", "idea", "kid", "body", "information", "parent", 
          "face", "others", "level", "office", "door", "health", "person", "art", "war", 
          "history", "party", "within", "result", "open", "change", "morning", "reason", 
          "research", "girl", "guy", "moment", "air", "teacher", "force", "education", "living", 
          "based", "looking", "working", "trying", "feeling", "going", "coming", "doing", 
          "making", "getting", "taking", "giving", "seeing", "being", "having", "loving", 
          "here", "there", "where", "when", "why", "how", "what", "who", "which", "that"
        ];
        
        const lowerName = extractedName.toLowerCase();
        if (!commonWords.includes(lowerName) && 
            extractedName.length > 1 && 
            extractedName.length < 25 &&
            /^[A-Za-z]+$/.test(extractedName)) {
          
          console.log('✅ useOnboardingMessages: Name extracted from pattern:', extractedName);
          
          // Format the name properly
          const formattedName = extractedName.charAt(0).toUpperCase() + 
                               extractedName.slice(1).toLowerCase();
          
          setUserName(formattedName);
          onNameChange(formattedName);
          return;
        }
      }
    }
    
    // Strategy 2: Look for standalone capitalized words that could be names
    const words = text.split(/\s+/);
    const potentialNames = words.filter(word => {
      // Must start with capital letter and be reasonable length
      if (!/^[A-Z][a-z]+$/.test(word) || word.length < 2 || word.length > 20) {
        return false;
      }
      
      // Filter out sentence starters and common words
      const commonStarters = [
        "The", "And", "But", "For", "Are", "With", "His", "Her", "This", "That", "From", 
        "They", "Been", "Have", "Your", "What", "Were", "Said", "Each", "Which", "Their", 
        "Time", "Will", "About", "Would", "There", "Could", "Other", "More", "Very", "Know", 
        "Just", "First", "Only", "Come", "Made", "Over", "Think", "Also", "Back", "After", 
        "Work", "Life", "Even", "Want", "Because", "Good", "Water", "Need", "Should", "Home", 
        "Study", "Book", "Business", "Issue", "Side", "Kind", "Head", "House", "Service", 
        "Friend", "Father", "Power", "Game", "Line", "Member", "City", "Community", "Name", 
        "President", "Team", "Minute", "Idea", "Body", "Information", "Parent", "Face", 
        "Others", "Level", "Office", "Door", "Health", "Person", "History", "Party", "Within", 
        "Result", "Open", "Change", "Morning", "Reason", "Research", "Girl", "Moment", "Teacher", 
        "Force", "Education", "Living", "Based", "Looking", "Working", "Trying", "Feeling", 
        "Going", "Coming", "Doing", "Making", "Getting", "Taking", "Giving", "Seeing", "Being", 
        "Having", "Loving", "Here", "There", "Where", "When", "Why", "How", "Who", "Which"
      ];
      
      return !commonStarters.includes(word);
    });
    
    if (potentialNames.length > 0) {
      const extractedName = potentialNames[0];
      console.log('✅ useOnboardingMessages: Potential name found from capitalized words:', extractedName);
      setUserName(extractedName);
      onNameChange(extractedName);
      return;
    }
    
    console.log('⚠️ useOnboardingMessages: No name could be extracted from user text');
  };
  
  // Enhanced AI response name recognition with better pattern matching
  const checkAIResponseForName = (aiResponse: string) => {
    console.log('🔍 useOnboardingMessages: Checking AI response for name recognition');
    
    // Look for patterns like "Nice to meet you, [Name]" or "Hi, [Name]!" with enhanced regex
    const namePatterns = [
      /nice to meet you,?\s+([A-Z][a-z]+)[!.,]/i,
      /(?:hi|hello|hey),?\s+([A-Z][a-z]+)[!.,]/i,
      /pleasure to meet you,?\s+([A-Z][a-z]+)[!.,]/i,
      /good to meet you,?\s+([A-Z][a-z]+)[!.,]/i,
      /thanks,?\s+([A-Z][a-z]+)[!.,]/i,
      /great,?\s+([A-Z][a-z]+)[!.,]/i,
      /wonderful,?\s+([A-Z][a-z]+)[!.,]/i,
      /(?:appreciate|love) that,?\s+([A-Z][a-z]+)[!.,]/i
    ];
    
    for (const pattern of namePatterns) {
      const match = aiResponse.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1];
        
        // Enhanced filter for false positives
        const commonWords = [
          "there", "friend", "buddy", "pal", "folks", "everyone", "guys", "that", "this", 
          "then", "when", "where", "what", "which", "thank", "thanks", "great", "good", 
          "nice", "cool", "awesome", "wonderful", "amazing", "perfect", "exactly", "right", 
          "sure", "okay", "alright", "fine", "well", "now", "here", "today", "tomorrow", 
          "yesterday", "always", "never", "sometimes", "often", "usually", "maybe", "perhaps", 
          "probably", "definitely", "certainly", "absolutely", "really", "truly", "quite", 
          "very", "pretty", "rather", "fairly", "somewhat", "little", "much", "many", "more", 
          "most", "some", "any", "all", "every", "each", "both", "either", "neither"
        ];
        
        if (!commonWords.includes(extractedName.toLowerCase()) && 
            extractedName.length > 1 && 
            extractedName.length < 25) {
          
          console.log('✅ useOnboardingMessages: Name extracted from AI response:', extractedName);
          
          // Format the name properly
          const formattedName = extractedName.charAt(0).toUpperCase() + 
                               extractedName.slice(1).toLowerCase();
          
          setUserName(formattedName);
          onNameChange(formattedName);
          break;
        }
      }
    }
  };
  
  return {
    messages,
    setMessages,
    input,
    setInput,
    handleAIResponse,
    userName,
    setUserName,
    currentQuestionIndex,
    setCurrentQuestionIndex
  };
};
