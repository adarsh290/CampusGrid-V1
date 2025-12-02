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
  price: number;
  genre: string;
  coverImage: string;
  localFilePath?: string;
  rating?: number;
  fileSize?: string;
}

