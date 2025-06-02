
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from '@/types/chat';

export const generateConcludingMessage = async (conversation: Conversation): Promise<string> => {
  try {
    console.log('🔄 Generating concluding message for conversation:', conversation);
    
    const { data, error } = await supabase.functions.invoke('generate-conclusion', {
      body: { conversation }
    });

    if (error) {
      console.error('Error from generate-conclusion function:', error);
      throw new Error(`API error: ${error.message}`);
    }

    if (data.error) {
      console.error('Error in conclusion response:', data.error);
      throw new Error(`Conclusion error: ${data.error}`);
    }

    return data.content || "thanks for sharing all of that with me.";
  } catch (err) {
    console.error('Error generating concluding message:', err);
    // Return a fallback message if the API call fails
    return "thanks for sharing all of that with me.";
  }
};
