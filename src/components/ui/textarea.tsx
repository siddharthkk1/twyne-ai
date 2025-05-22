
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    
    React.useEffect(() => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        
        // Function to adjust the height
        const adjustHeight = () => {
          // Reset height to auto to get the correct scrollHeight
          textarea.style.height = "auto";
          
          // Set the new height based on scrollHeight with a max height of 150px
          const newHeight = Math.min(textarea.scrollHeight, 150);
          textarea.style.height = `${newHeight}px`;
        };
        
        // Initial adjustment
        adjustHeight();
        
        // Add event listener for input events
        textarea.addEventListener("input", adjustHeight);
        
        // Clean up
        return () => {
          textarea.removeEventListener("input", adjustHeight);
        };
      }
    }, []);
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden",
          className
        )}
        ref={(element) => {
          // Handle both refs
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
          textareaRef.current = element;
        }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
