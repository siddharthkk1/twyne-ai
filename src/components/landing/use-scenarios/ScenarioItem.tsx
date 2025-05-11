
import React from "react";
import { 
  IoLocationSharp, 
  IoCafe, 
  IoPeople, 
  IoBookSharp, 
  IoLaptopOutline, 
  IoChatbubbleEllipses, 
  IoBulb, // Changed from IoBrain to IoBulb which exists in the io5 package
  IoHeartSharp, 
  IoFastFoodOutline,
  IoBasketballSharp,
  IoCloudSharp,
  IoColorPaletteSharp,
  IoMusicalNotes,
  IoGlobeOutline,
  IoCameraSharp
} from "react-icons/io5";

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
    id: 12,
    title: "I'm looking for people to attend concerts and music festivals with.",
    icon: <div className="p-2 bg-accent-100 rounded-full"><IoMusicalNotes size={28} className="text-accent" /></div>
  },
  {
    id: 1,
    title: "I'm a new grad who just moved to a new city and don't know anyone.",
    icon: <div className="p-2 bg-primary-100 rounded-full"><IoLocationSharp size={28} className="text-primary" /></div>
  },
  {
    id: 2,
    title: "I work remotely and barely see people during the week.",
    icon: <div className="p-2 bg-secondary-100 rounded-full"><IoLaptopOutline size={28} className="text-secondary" /></div>
  },
  {
    id: 3,
    title: "I want friendships that aren't random roommates or coworkers.",
    icon: <div className="p-2 bg-accent-100 rounded-full"><IoPeople size={28} className="text-accent" /></div>
  },
  {
    id: 4,
    title: "I'm in college but still feel like I haven't found my people yet.",
    icon: <div className="p-2 bg-primary-100 rounded-full"><IoBookSharp size={28} className="text-primary" /></div>
  },
  {
    id: 5,
    title: "I want deep conversations about books and philosophy over coffee.",
    icon: <div className="p-2 bg-secondary-100 rounded-full"><IoCafe size={28} className="text-secondary" /></div>
  },
  {
    id: 6,
    title: "I'm looking for NBA fans to watch games at with.",
    icon: <div className="p-2 bg-accent-100 rounded-full"><IoBasketballSharp size={28} className="text-accent" /></div>
  },
  {
    id: 7,
    title: "I've outgrown my circles and want to consciously rebuild my social life.",
    icon: <div className="p-2 bg-primary-100 rounded-full"><IoGlobeOutline size={28} className="text-primary" /></div>
  },
  {
    id: 8,
    title: "I have friends but no one I feel deeply connected with.",
    icon: <div className="p-2 bg-secondary-100 rounded-full"><IoHeartSharp size={28} className="text-secondary" /></div>
  },
  {
    id: 9,
    title: "I'm a foodie looking for friends to try restaurants with.",
    icon: <div className="p-2 bg-accent-100 rounded-full"><IoFastFoodOutline size={28} className="text-accent" /></div>
  },
  {
    id: 10,
    title: "I'm looking for a group of lads to go bar hopping with regularly.",
    icon: <div className="p-2 bg-primary-100 rounded-full"><IoBulb size={28} className="text-primary" /></div>
  },
  {
    id: 11,
    title: "I'm a baby mama looking for other baby mamas to swap stories, laughs, and survival tips.",
    icon: <div className="p-2 bg-primary-100 rounded-full"><IoBulb size={28} className="text-primary" /></div>
  },
  {
    id: 12,
    title: "I'm in my healing era and looking for people who get it.",
    icon: <div className="p-2 bg-secondary-100 rounded-full"><IoColorPaletteSharp size={28} className="text-secondary" /></div>
  },
];
