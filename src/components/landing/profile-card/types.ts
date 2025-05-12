
import { LucideIcon } from "lucide-react";

export interface Interest {
  icon: LucideIcon;
  text: string;
}

export interface Hang {
  emoji: string;
  text: string;
}

export interface Mutual {
  name: string;
  avatar: string;
}

export interface ConnectionProfile {
  id: string;
  name: string;
  location: string;
  initial: string;
  avatar: string;
  avatarImage: string;
  sharedInterests: Interest[];
  idealHangs: Hang[];
  compatibilityHighlights: string[];
  mutuals: Mutual[];
  connectionDegrees: number;
}
