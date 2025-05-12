
import { Coffee, Book, Music, Dumbbell, Globe } from "lucide-react";
import { ConnectionProfile } from "./types";

// Sample connection data for two different profiles
export const connectionProfiles: ConnectionProfile[] = [
  {
    id: "profile1",
    name: "Alex",
    location: "San Francisco",
    initial: "AK",
    avatar: "A", // Will be used as avatar fallback
    avatarImage: "/lovable-uploads/18e2f95c-dc5b-4ce6-b7d2-d1b59a046366.png",
    sharedInterests: [
      { icon: Coffee, text: "Coffee shops" },
      { icon: Book, text: "Fiction" },
      { icon: Music, text: "Indie music" },
      { icon: Dumbbell, text: "Bouldering" },
      { icon: Globe, text: "Travel" },
    ],
    idealHangs: [
      { emoji: "🏀", text: "Watching games at a sports bar" },
      { emoji: "☕️", text: "Morning Starbucks runs" },
      { emoji: "⛳", text: "Golf range" },
      { emoji: "🍺", text: "Visiting local breweries" },
      { emoji: "🎧", text: "EDM raves" },
      { emoji: "📺", text: "Anime binge session" },
    ],
    compatibilityHighlights: [], // No compatibility highlights for Alex
    mutuals: [
      { name: "Sara", avatar: "S" },
      { name: "John", avatar: "J" },
      { name: "Mei", avatar: "M" }
    ],
    connectionDegrees: 1
  },
  {
    id: "profile2",
    name: "Jordan",
    location: "Berkeley",
    initial: "JT",
    avatar: "J",
    avatarImage: "/lovable-uploads/b37dd3c3-ff54-4199-8907-907a0fac716e.png",
    sharedInterests: [
      { icon: Music, text: "Jazz" },
      { icon: Book, text: "Non-fiction" },
      { icon: Globe, text: "Mountains" },
      { icon: Coffee, text: "Tea ceremonies" },
    ],
    idealHangs: [
      { emoji: "🎸", text: "Live music venues" },
      { emoji: "🥾", text: "Hiking trails" },
      { emoji: "🧘", text: "Yoga in the park" },
      { emoji: "📚", text: "Bookstore browsing" },
      { emoji: "🎨", text: "Museum visits" },
      { emoji: "🍵", text: "Tea tasting" },
    ],
    compatibilityHighlights: [
      "You both love finding hidden cultural spots in the city",
      "You both enjoy deep conversations about philosophy"
    ],
    mutuals: [],
    connectionDegrees: 2
  }
];
