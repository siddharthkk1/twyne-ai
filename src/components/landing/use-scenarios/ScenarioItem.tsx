
import React from "react";
import { MapPin, Coffee, Users, Book, Laptop, MessageCircle, Zap, Heart, Utensils } from "lucide-react";

export interface ScenarioItemProps {
  id: number;
  title: string;
  icon: React.ReactNode;
}

// Changed to a regular function that returns the data object instead of an FC
export const createScenario = ({ id, title, icon }: ScenarioItemProps): ScenarioItemProps => {
  return {
    id,
    title,
    icon,
  };
};

// Create scenarios data that will be used in the carousel
export const scenarios: ScenarioItemProps[] = [
  {
    id: 1,
    title: "I'm a new grad who just moved to a new city and don't know anyone.",
    icon: <div className="p-2 bg-primary-100 rounded-full"><MapPin size={32} className="text-primary" /></div>
  },
  {
    id: 2,
    title: "I work remotely and barely see people during the week.",
    icon: <div className="p-2 bg-secondary-100 rounded-full"><Laptop size={32} className="text-secondary" /></div>
  },
  {
    id: 3,
    title: "I want friendships that aren't random roommates or coworkers.",
    icon: <div className="p-2 bg-accent-100 rounded-full"><Users size={32} className="text-accent" /></div>
  },
  {
    id: 4,
    title: "I'm in college but still feel like I haven't found my people yet.",
    icon: <div className="p-2 bg-primary-100 rounded-full"><Book size={32} className="text-primary" /></div>
  },
  {
    id: 5,
    title: "I want deep conversations about books and philosophy over coffee.",
    icon: <div className="p-2 bg-secondary-100 rounded-full"><Coffee size={32} className="text-secondary" /></div>
  },
  {
    id: 6,
    title: "I'm looking for NBA fans to watch games with.",
    icon: <div className="p-2 bg-accent-100 rounded-full"><Users size={32} className="text-accent" /></div>
  },
  {
    id: 7,
    title: "I've outgrown my circles and want to consciously rebuild my social life.",
    icon: <div className="p-2 bg-primary-100 rounded-full"><Zap size={32} className="text-primary" /></div>
  },
  {
    id: 8,
    title: "I have friends but no one I feel deeply connected with.",
    icon: <div className="p-2 bg-secondary-100 rounded-full"><Heart size={32} className="text-secondary" /></div>
  },
  {
    id: 9,
    title: "I'm a foodie looking for friends to try restaurants with.",
    icon: <div className="p-2 bg-accent-100 rounded-full"><Utensils size={32} className="text-accent" /></div>
  },
];
