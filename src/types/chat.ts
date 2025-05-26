
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

// Big Five Traits type for AI-generated profiles
export interface BigFiveTraits {
  openness: string;
  conscientiousness: string;
  extraversion: string;
  agreeableness: string;
  neuroticism: string;
}

// User profile type with enhanced properties matching AI generation format
export interface UserProfile {
  // Overview
  vibeSummary?: string;
  oneLiner?: string;
  twyneTags?: string[];

  // Key Facts / Background
  name: string;
  age?: string;
  location: string;
  job?: string;
  school?: string;
  ethnicity?: string;
  religion?: string;
  hometown?: string;

  // Interests & Lifestyle
  lifestyle?: string;
  favoriteProducts?: string;
  style?: string;
  interestsAndPassions?: string;
  favoriteMoviesAndShows?: string;
  favoriteMusic?: string;
  favoriteBooks?: string;
  favoritePodcastsOrYouTube?: string;
  talkingPoints?: string[];
  favoriteActivities?: string;
  favoriteSpots?: string;

  // Inner World
  coreValues?: string;
  lifePhilosophy?: string;
  goals?: string;
  personalitySummary?: string;
  bigFiveTraits?: BigFiveTraits;
  quirks?: string;
  communicationStyle?: string;
  politicalViews?: string;
  personalBeliefs?: string;

  // Story
  upbringing?: string;
  majorTurningPoints?: string;
  recentLifeContext?: string;

  // Connection
  socialStyle?: string;
  loveLanguageOrFriendStyle?: string;
  socialNeeds?: string;
  connectionPreferences?: string;
  dealBreakers?: string;
  boundariesAndPetPeeves?: string;
  connectionActivities?: string;

  // Legacy fields for backward compatibility - made optional
  interests?: string[] | string;
  personalInsights?: string[];
  personalityTraits?: PersonalityTraits;
  timeInCurrentCity?: string;
  friendshipPace?: string;
  socialEnergy?: string;
  weekendActivities?: string;
  mediaTastes?: string;
  lookingFor?: string;
  values?: string[] | string;
  misunderstood?: string;
  lifeStory?: string;
  background?: string;
  careerOrEducation?: string;
  creativePursuits?: string;
  meaningfulAchievements?: string;
  challengesOvercome?: string;
  growthJourney?: string;
  emotionalIntelligence?: string;
  lifeContext?: string;
  vibeWords?: string[];
  keyFacts?: string;
  philosophy?: string;
  beliefSystem?: string;
  spirituality?: string;
  aspirations?: string[];
  personalityQuirks?: string[];
  boundaries?: string;
  petPeeves?: string;
  majorEvents?: string[];
  turningPoints?: string[];
  loveLanguage?: string;
  friendsStyle?: string;
  oneLinerSummary?: string;
}
