
import { useState } from 'react';

export const useVoiceRecording = (handleSend: (text: string) => void) => {
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [isListening, setIsListening] = useState(false);

  // OpenAI API key - in a real app, this would be stored securely in environment variables or backend
  const OPENAI_API_KEY = "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";

  const toggleVoiceInput = async () => {
    if (isListening) {
      // Stop recording
      if (audioRecorder) {
        audioRecorder.stop();
        setIsListening(false);
      }
    } else {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setAudioRecorder(recorder);
        
        // Clear previous audio chunks
        setAudioChunks([]);
        
        // Handle data available event
        recorder.ondataavailable = (e) => {
          setAudioChunks(chunks => [...chunks, e.data]);
        };
        
        // Handle recording stop event
        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          try {
            // Convert speech to text using OpenAI Whisper API
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-1');
            
            // Call OpenAI's Whisper API
            const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`
              },
              body: formData
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`API error: ${errorData.error?.message || response.status}`);
            }
            
            const data = await response.json();
            const transcribedText = data.text;
            
            if (transcribedText && transcribedText.trim()) {
              handleSend(transcribedText);
            } else {
              console.error("No speech detected");
            }
          } catch (error) {
            console.error("Error processing speech:", error);
          }
          
          // Clean up
          stream.getTracks().forEach(track => track.stop());
        };
        
        // Start recording
        recorder.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  return {
    isListening,
    toggleVoiceInput
  };
};
