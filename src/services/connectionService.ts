
// Mock data for connections - will be populated from backend in production
export interface Connection {
  id: string;
  name: string;
  description: string;
  matchReason: string;
  imageUrl: string;
  isNew: boolean;
}

export const getMockConnections = (): Connection[] => {
  return [
    {
      id: "1",
      name: "Nina",
      description: "New to the city, loves hiking, photography, and quiet cafés",
      matchReason: "You both just moved to the city and like keeping things chill",
      imageUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=200&h=200",
      isNew: true,
    },
    {
      id: "2",
      name: "Jordan",
      description: "Musician, plant enthusiast, and weekend explorer",
      matchReason: "You share an interest in indie music and exploring hidden spots in the city",
      imageUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=200&h=200",
      isNew: true,
    },
  ];
};
