
import { ReactNode } from "react";

export interface IntroCard {
  id: number;
  text: string;
  visible: boolean;
  isGroup?: boolean;
  position?: number;
  icon: ReactNode;
}
