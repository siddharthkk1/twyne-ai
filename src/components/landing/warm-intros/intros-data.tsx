
import { IoBasketballOutline, IoBookOutline, IoHeartOutline, IoHomeOutline, IoMedicalOutline, IoBusinessOutline, IoMusicalNotesOutline, IoGameControllerOutline, IoFitnessOutline, IoTvOutline } from "react-icons/io5";
import { IntroCard } from "./types";

// Define all intro cards data
export const initialIntros: IntroCard[] = [
  {
    id: 1,
    text: "You and Siddharth both love basketball, burritos, and late-night debates.",
    visible: true,
    position: 0,
    icon: <IoBasketballOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 2,
    text: "You and Priya both read too many psychology books and have 300+ tabs open.",
    visible: true,
    position: 1,
    icon: <IoBookOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 3, 
    text: "You and Bryton are both getting married in a month and feeling all the chaos and excitement.",
    visible: true,
    position: 2,
    icon: <IoHeartOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 4,
    text: "You, Lena, and Zara all just moved to the city and are figuring out how to feel at home here.",
    visible: true,
    isGroup: true,
    position: 3,
    icon: <IoHomeOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 5,
    text: "You, Lexi, and Ethan are all in healthcare and could use a break from being everyone else's support system. Walk and talk?",
    visible: true,
    isGroup: true,
    position: 4,
    icon: <IoMedicalOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 6,
    text: "You and Dake are both startup people—figuring out life, product-market fit, and how to have hobbies again. Coffee?",
    visible: true,
    position: 5,
    icon: <IoBusinessOutline className="h-5 w-5 text-primary/60" />
  }
];

export const additionalIntros: IntroCard[] = [
  {
    id: 7,
    text: "You and Tre both grew up watching LeBron chase greatness—and never back down from the GOAT debate. MJ or Bron? You've got takes.",
    visible: false,
    icon: <IoBasketballOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 8,
    text: "You and Amara both read spicy books faster than your TBR can handle. Sarah J. Maas? Colleen Hoover? You've got annotated paperbacks and a lot of opinions.",
    visible: false,
    icon: <IoBookOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 9,
    text: "You and August are Swifties fluent in Easter eggs, healing arcs, and midnight spirals. Reputation is underrated and you all know it.",
    visible: false,
    icon: <IoMusicalNotesOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 10,
    text: "You and Sage both play games to decompress—whether it's Valorant, Stardew, or something in-between. You speak in Discord emojis and side quests.",
    visible: false,
    icon: <IoGameControllerOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 11,
    text: "You and Zayn are both gym rats with a soft side. You lift heavy, journal often, and still believe in character development.",
    visible: false,
    icon: <IoFitnessOutline className="h-5 w-5 text-primary/60" />
  },
  {
    id: 12,
    text: "You and Levi both grew up on anime, still think about the Attack on Titan finale, and maybe cried during Your Name.",
    visible: false,
    icon: <IoTvOutline className="h-5 w-5 text-primary/60" />
  }
];
