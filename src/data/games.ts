export interface Game {
  id: string;
  title: string;
  coverImage: string;
  heroImage?: string;
  fileSize: string;
  price: number;
  genre: string;
  description: string;
  developer: string;
  releaseYear: number;
  rating: number;
  systemRequirements: {
    minimum: {
      os: string;
      processor: string;
      memory: string;
      graphics: string;
      storage: string;
    };
    recommended: {
      os: string;
      processor: string;
      memory: string;
      graphics: string;
      storage: string;
    };
  };
  downloadParts?: { name: string; size: string; downloaded: boolean }[];
}

export const games: Game[] = [
  {
    id: "692df002d827438565560b76",
    title: "Grand Theft Auto V",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&h=800&fit=crop",
    fileSize: "118 GB",
    price: 100,
    genre: "Action/Adventure",
    description: "Experience the ultimate open-world adventure in Los Santos. Rob banks, race cars, and live the criminal life in stunning detail.",
    developer: "Rockstar Games",
    releaseYear: 2013,
    rating: 4.8,
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-3470",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 660 2GB",
        storage: "118 GB available space",
      },
      recommended: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i7-8700K",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 2060",
        storage: "118 GB SSD",
      },
    },
  },
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    coverImage: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400&h=600&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1920&h=800&fit=crop",
    fileSize: "70 GB",
    price: 150,
    genre: "RPG",
    description: "Become V, a mercenary outlaw going after a one-of-a-kind implant that is the key to immortality in Night City.",
    developer: "CD Projekt Red",
    releaseYear: 2020,
    rating: 4.5,
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-3570K",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 780",
        storage: "70 GB SSD",
      },
      recommended: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i7-4790",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 3070",
        storage: "70 GB NVMe SSD",
      },
    },
  },
  {
    id: "elden-ring",
    title: "Elden Ring",
    coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=600&fit=crop",
    fileSize: "60 GB",
    price: 200,
    genre: "Action RPG",
    description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord.",
    developer: "FromSoftware",
    releaseYear: 2022,
    rating: 4.9,
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-8400",
        memory: "12 GB RAM",
        graphics: "NVIDIA GTX 1060 3GB",
        storage: "60 GB available space",
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-8700K",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 3060 Ti",
        storage: "60 GB SSD",
      },
    },
  },
  {
    id: "valorant",
    title: "Valorant",
    coverImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0b?w=400&h=600&fit=crop",
    fileSize: "28 GB",
    price: 0,
    genre: "Tactical Shooter",
    description: "A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.",
    developer: "Riot Games",
    releaseYear: 2020,
    rating: 4.6,
    systemRequirements: {
      minimum: {
        os: "Windows 7/8/10 64-bit",
        processor: "Intel Core 2 Duo E8400",
        memory: "4 GB RAM",
        graphics: "Intel HD 4000",
        storage: "28 GB available space",
      },
      recommended: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i3-4150",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 730",
        storage: "28 GB SSD",
      },
    },
  },
  {
    id: "fifa-24",
    title: "EA Sports FC 24",
    coverImage: "https://images.unsplash.com/photo-1493711662062-fa541f7f897a?w=400&h=600&fit=crop",
    fileSize: "100 GB",
    price: 250,
    genre: "Sports",
    description: "Experience the world's game with HyperMotionV technology, bringing unprecedented realism to every match.",
    developer: "EA Sports",
    releaseYear: 2023,
    rating: 4.2,
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-6600K",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 1050 Ti",
        storage: "100 GB available space",
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-6700",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 2060",
        storage: "100 GB SSD",
      },
    },
  },
  {
    id: "red-dead-2",
    title: "Red Dead Redemption 2",
    coverImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400&h=600&fit=crop",
    fileSize: "150 GB",
    price: 180,
    genre: "Action/Adventure",
    description: "America, 1899. The end of the Wild West era has begun. Experience the epic tale of outlaw Arthur Morgan.",
    developer: "Rockstar Games",
    releaseYear: 2018,
    rating: 4.9,
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i7-4770K",
        memory: "12 GB RAM",
        graphics: "NVIDIA GTX 1060 6GB",
        storage: "150 GB available space",
      },
      recommended: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i7-9700K",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 2070",
        storage: "150 GB SSD",
      },
    },
  },
];

export const userLibrary: (Game & { downloadParts: { name: string; size: string; downloaded: boolean }[] })[] = [
  {
    ...games[0],
    downloadParts: [
      { name: "Part 1 - Base Game", size: "45 GB", downloaded: true },
      { name: "Part 2 - Enhanced Content", size: "40 GB", downloaded: true },
      { name: "Part 3 - Online Assets", size: "33 GB", downloaded: false },
    ],
  },
  {
    ...games[1],
    downloadParts: [
      { name: "Part 1 - Core Files", size: "35 GB", downloaded: true },
      { name: "Part 2 - DLC Content", size: "35 GB", downloaded: false },
    ],
  },
];
