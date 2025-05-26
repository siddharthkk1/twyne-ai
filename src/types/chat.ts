
export type ChatRole = "system" | "user" | "assistant";

export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai" | "typing";
}

export interface Conversation {
  messages: { role: ChatRole; content: string }[];
  userAnswers: string[];
}

export interface UserProfile {
  // 🪞 Overview
  vibeSummary: string;
  oneLiner: string;
  twyneTags: string[];

  // 📌 Key Facts / Background
  name: string;
  age: string;
  location: string;
  job: string;
  school: string;
  ethnicity: string;
  religion: string;
  hometown: string;

  // 🌱 Interests & Lifestyle
  lifestyle: string;
  favoriteProducts: string;
  style: string;
  interestsAndPassions: string;
  favoriteMoviesAndShows: string;
  favoriteMusic: string;
  favoriteBooks: string;
  favoritePodcastsOrYouTube: string;
  talkingPoints: string[];
  favoriteActivities: string;
  favoriteSpots: string;

  // 🧘 Inner World
  coreValues: string;
  lifePhilosophy: string;
  goals: string;
  personalitySummary: string;
  bigFiveTraits: {
    openness: string;
    conscientiousness: string;
    extraversion: string;
    agreeableness: string;
    neuroticism: string;
  };
  quirks: string;
  communicationStyle: string;

  // 📖 Story
  upbringing: string;
  majorTurningPoints: string;
  recentLifeContext: string;

  // 🤝 Connection
  socialStyle: string;
  loveLanguageOrFriendStyle: string;
  socialNeeds: string;
  connectionPreferences: string;
  dealBreakers: string;
  boundariesAndPetPeeves: string;
  connectionActivities: string;
}
