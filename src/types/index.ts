export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  walletBalance: number;
  library: string[];
}

export interface Game {
  _id: string;
  id?: string;
  title: string;
  description: string;
  developer?: string;
  price: number;
  genre: string;
  coverImage: string;
  screenshots?: string[];
  systemRequirements?: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
  localFilePath?: string;
  rating?: number;
  fileSize?: string;
  createdAt?: string;
  updatedAt?: string;
}

