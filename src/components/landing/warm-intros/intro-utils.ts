
import { IntroCard } from "./types";

// Helper function to split text correctly based on the presence of "both" or "all"
export const splitIntroText = (text: string, isGroup: boolean | undefined) => {
  const separator = isGroup ? " all " : " both ";
  if (!text.includes(separator)) {
    // If the text doesn't contain the expected separator, return it as is
    return { firstPart: text, secondPart: "" };
  }
  
  const parts = text.split(separator);
  return {
    firstPart: parts[0],
    secondPart: separator + (parts[1] || "")
  };
};
