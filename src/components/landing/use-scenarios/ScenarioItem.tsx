
import React from "react";

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
    icon: <img src="/scenario-images/new-grad.png" alt="New graduate" className="w-16 h-16 object-cover rounded-full" />
  },
  {
    id: 2,
    title: "I work remotely and barely see people during the week.",
    icon: <img src="/scenario-images/remote-work.png" alt="Remote worker" className="w-16 h-16 object-cover rounded-full" />
  },
  {
    id: 3,
    title: "I want friendships that aren't random roommates or coworkers.",
    icon: <img src="/scenario-images/friendship.png" alt="Friendship" className="w-16 h-16 object-cover rounded-full" />
  },
  {
    id: 4,
    title: "I'm in college but still feel like I haven't found my people yet.",
    icon: <img src="/scenario-images/college.png" alt="College student" className="w-16 h-16 object-cover rounded-full" />
  },
  {
    id: 5,
    title: "I want deep conversations about books and philosophy over coffee.",
    icon: <img src="/scenario-images/coffee-chat.png" alt="Coffee conversation" className="w-16 h-16 object-cover rounded-full" />
  },
  {
    id: 6,
    title: "I'm looking for NBA fans to watch games with.",
    icon: <img src="/scenario-images/nba-fan.png" alt="NBA fan" className="w-16 h-16 object-cover rounded-full" />
  },
  {
    id: 7,
    title: "I've outgrown my circles and want to consciously rebuild my social life.",
    icon: <img src="/scenario-images/new-circles.png" alt="Social circles" className="w-16 h-16 object-cover rounded-full" />
  },
  {
    id: 8,
    title: "I have friends but no one I feel deeply connected with.",
    icon: <img src="/scenario-images/deep-connection.png" alt="Deep connection" className="w-16 h-16 object-cover rounded-full" />
  },
  {
    id: 9,
    title: "I'm a foodie looking for friends to try restaurants with.",
    icon: <img src="/scenario-images/foodie.png" alt="Food enthusiast" className="w-16 h-16 object-cover rounded-full" />
  },
];
