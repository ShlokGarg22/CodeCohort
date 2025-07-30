// Mock data for CodeCohort projects
export const mockProjects = [
  {
    id: 1,
    title: "E-commerce Platform",
    description: "Build a full-stack e-commerce platform with user authentication, product management, and payment integration.",
    techStack: ["React", "Node.js", "MongoDB", "Stripe"],
    membersJoined: 3,
    difficulty: "Advanced",
    category: "Full-stack"
  },
  {
    id: 2,
    title: "Real-time Chat Application",
    description: "Create a real-time messaging app with channels, direct messages, and file sharing capabilities.",
    techStack: ["React", "Socket.io", "Express", "Redis"],
    membersJoined: 2,
    difficulty: "Intermediate",
    category: "Real-time"
  },
  {
    id: 3,
    title: "AI Content Generator",
    description: "Develop an AI-powered content generation tool for blogs, social media, and marketing copy.",
    techStack: ["Python", "OpenAI API", "Flask", "PostgreSQL"],
    membersJoined: 4,
    difficulty: "Advanced",
    category: "AI/ML"
  },
  {
    id: 4,
    title: "Task Management System",
    description: "Build a collaborative project management tool with kanban boards, time tracking, and team analytics.",
    techStack: ["Vue.js", "Django", "MySQL", "Docker"],
    membersJoined: 1,
    difficulty: "Intermediate",
    category: "Productivity"
  },
  {
    id: 5,
    title: "Weather Dashboard",
    description: "Create an interactive weather dashboard with forecasts, maps, and historical data visualization.",
    techStack: ["React", "D3.js", "Weather API", "Node.js"],
    membersJoined: 2,
    difficulty: "Beginner",
    category: "Data Visualization"
  },
  {
    id: 6,
    title: "Blockchain Voting System",
    description: "Develop a secure voting platform using blockchain technology for transparent elections.",
    techStack: ["Solidity", "Web3.js", "React", "Ethereum"],
    membersJoined: 5,
    difficulty: "Expert",
    category: "Blockchain"
  }
];

export const terminalMessages = [
  "$ welcome to codecohort",
  "$ finding coding challenges...",
  "$ loading problem sets...",
  "$ ready to collaborate!"
];

export const techStackColors = {
  "React": "#61DAFB",
  "Node.js": "#339933",
  "MongoDB": "#47A248",
  "Stripe": "#635BFF",
  "Socket.io": "#010101",
  "Express": "#000000",
  "Redis": "#DC382D",
  "Python": "#3776AB",
  "OpenAI API": "#412991",
  "Flask": "#000000",
  "PostgreSQL": "#336791",
  "Vue.js": "#4FC08D",
  "Django": "#092E20",
  "MySQL": "#4479A1",
  "Docker": "#2496ED",
  "D3.js": "#F9A03C",
  "Weather API": "#FF6B35",
  "Solidity": "#363636",
  "Web3.js": "#F16822",
  "Ethereum": "#627EEA"
};

export const difficultyColors = {
  "Beginner": "#10B981",
  "Intermediate": "#F59E0B", 
  "Advanced": "#EF4444",
  "Expert": "#8B5CF6"
};