
import { useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useVoiceRecording = (handleSend: (text: string) => void) => {
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const toggleVoiceInput = async () => {
    // Prevent rapid clicking
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      if (isListening) {
        // Stop recording
        if (audioRecorder) {
          audioRecorder.stop();
          setIsListening(false);
        }
      } else {
        try {
          // Request microphone access
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              sampleRate: 24000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          
          const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          setAudioRecorder(recorder);
          
          // Clear previous audio chunks
          setAudioChunks([]);
          
          // Handle data available event
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              setAudioChunks(chunks => [...chunks, e.data]);
            }
          };
          
          // Handle recording stop event
          recorder.onstop = async () => {
            try {
              if (audioChunks.length === 0) {
                toast({
                  title: "No audio recorded",
                  description: "Please try again and speak clearly.",
                  variant: "destructive",
                });
                setIsProcessing(false);
                return;
              }
              
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
              
              // Check if the blob is valid
              if (audioBlob.size === 0) {
                toast({
                  title: "No audio data captured",
                  description: "Please try again and check your microphone.",
                  variant: "destructive",
                });
                setIsProcessing(false);
                return;
              }
              
              // Convert to base64 for easy transmission
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async () => {
                try {
                  const base64data = reader.result;
                  
                  console.log("Sending audio data to edge function...");
                  console.log("Audio data size:", audioBlob.size, "bytes");
                  
                  // Call the Supabase edge function with improved error handling
                  const { data, error } = await supabase.functions.invoke('ai-chat', {
                    body: {
                      endpoint: 'transcribe',
                      data: {
                        audioBlob: base64data,
                        language: "en" // Specify English language for transcription
                      }
                    }
                  });
                  
                  if (error) {
                    console.error("Edge function error:", error);
                    throw new Error(`API error: ${error.message}`);
                  }
                  
                  console.log("Transcription response:", data);
                  const transcribedText = data?.text;
                  
                  if (transcribedText && transcribedText.trim()) {
                    handleSend(transcribedText);
                  } else {
                    console.error("No speech detected");
                    toast({
                      title: "No speech detected",
                      description: "Please try speaking more clearly or check your microphone.",
                      variant: "destructive",
                    });
                  }
                } catch (error: any) {
                  console.error("Error processing speech:", error);
                  toast({
                    title: "Speech Processing Error",
                    description: error.message || "Failed to process your speech. Please try again.",
                    variant: "destructive",
                  });
                }
              };
            } catch (error: any) {
              console.error("Error processing audio:", error);
              toast({
                title: "Audio Processing Error",
                description: error.message || "Failed to process audio. Please try again.",
                variant: "destructive",
              });
            }
            
            // Clean up
            stream.getTracks().forEach(track => track.stop());
            setIsProcessing(false);
          };
          
          // Start recording
          recorder.start();
          setIsListening(true);
          toast({
            title: "Listening",
            description: "Speak now. Click the microphone again when finished.",
          });
        } catch (error: any) {
          console.error("Error accessing microphone:", error);
          toast({
            title: "Microphone Access Error",
            description: "Please check your microphone permissions in your browser settings and try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      }
    } finally {
      // Set a safeguard to prevent rapid clicking
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  return {
    isListening,
    isProcessing,
    toggleVoiceInput
  };
};
