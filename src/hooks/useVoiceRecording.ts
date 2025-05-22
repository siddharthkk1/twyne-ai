
import { useState, useRef, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface UseVoiceRecordingOptions {
  onComplete?: (transcript: string) => void;
}

export const useVoiceRecording = (
  onComplete?: (transcript: string) => void,
  options?: UseVoiceRecordingOptions
) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Initialize the speech recognition
  useEffect(() => {
    // Check if speech recognition is available in the browser
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Choose the available recognition API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure the recognition settings
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Set up event handlers
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the transcript
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Provide user-friendly error messages based on error type
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access to use voice input.",
            variant: "destructive",
          });
        } else if (event.error === 'network') {
          toast({
            title: "Network Error",
            description: "There's a problem with your internet connection. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Voice Input Error",
            description: "There was a problem with voice recording. Please try again or use text input.",
            variant: "destructive",
          });
        }
        
        stopListening();
      };
      
      recognitionRef.current.onend = () => {
        // Sometimes onend fires even when we're still listening
        // Only process if we were intentionally stopping
        if (isListening && transcript) {
          setIsProcessing(true);
          
          // Small delay to make the UX smoother
          setTimeout(() => {
            if (onComplete) {
              onComplete(transcript);
            }
            setTranscript('');
            setIsProcessing(false);
          }, 500);
        }
        
        setIsListening(false);
      };
    } else {
      // Fallback for browsers that don't support speech recognition
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please use text input instead.",
        variant: "destructive",
      });
    }
    
    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors when stopping on unmount
        }
      }
    };
  }, [onComplete]);

  // Function to start listening
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Voice Input Error",
          description: "Could not start voice recording. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Voice Input Not Available",
        description: "Voice input is not available in your browser. Please use text input.",
        variant: "destructive",
      });
    }
  };

  // Function to stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        // The onend handler will take care of the rest
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  // Toggle function to start/stop listening
  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    isListening,
    isProcessing,
    transcript,
    toggleVoiceInput,
    startListening,
    stopListening
  };
};
