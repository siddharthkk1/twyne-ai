
// Chat message type
export interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
}

// Define a literal type for the chat roles
export type ChatRole = "system" | "user" | "assistant";

// Conversation type
export interface Conversation {
  messages: {
    role: ChatRole;
    content: string;
  }[];
  userAnswers: string[];
}

// Personality traits type
export interface PersonalityTraits {
  extroversion: number;
  openness: number;
  empathy: number;
  structure: number;
}

// User profile type with enhanced properties
export interface UserProfile {
  name: string;
  location: string;
  interests: string[] | string; // Can be string or array
  socialStyle: string;
  connectionPreferences: string;
  personalInsights: string[];
  age?: string;
  hometown?: string;
  timeInCurrentCity?: string;
  talkingPoints?: string[];
  friendshipPace?: string;
  socialEnergy?: string;
  weekendActivities?: string;
  mediaTastes?: string;
  dealBreakers?: string;
  lookingFor?: string;
  values?: string[] | string; // Can be string or array
  misunderstood?: string;
  lifeStory?: string;
  background?: string;
  careerOrEducation?: string;
  creativePursuits?: string;
  meaningfulAchievements?: string;
  lifePhilosophy?: string;
  challengesOvercome?: string;
  growthJourney?: string;
  emotionalIntelligence?: string;
  twyneTags?: string[];
  vibeSummary?: string;
  socialNeeds?: string;
  coreValues?: string;
  lifeContext?: string;
  vibeWords?: string[];
  job?: string;
  ethnicity?: string;
  religion?: string;
  personalityTraits?: PersonalityTraits;
  // New fields to store overview/vibe summary, background details, inner world, etc.
  overview?: string;
  innerWorld?: string;
  connectionDetails?: string;
  lifeStories?: string[];
  beliefs?: string[];
  goals?: string[];
}
