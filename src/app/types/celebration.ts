export interface ECardTemplate {
  id: string;
  name: string;
  category: 'anniversary' | 'birthday' | 'congratulations' | 'thank-you' | 'general';
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  imageUrl?: string;
  thumbnail?: string;
  design: 'confetti' | 'balloons' | 'stars' | 'gradient' | 'pattern' | 'minimal' | 'floral';
}

export interface CelebrationMessage {
  id: string;
  employeeId: string;
  senderName: string;
  senderEmail?: string;
  senderRole: 'peer' | 'manager' | 'external' | 'leadership';
  message: string;
  eCard: ECardTemplate;
  photoUrl?: string;
  videoUrl?: string;
  createdAt: string;
  approved: boolean;
  likes?: number;
}

export const ECARD_TEMPLATES: ECardTemplate[] = [
  {
    id: 'anniversary-confetti',
    name: 'Anniversary Confetti',
    category: 'anniversary',
    backgroundColor: '#FF6B9D',
    accentColor: '#FFD93D',
    textColor: '#FFFFFF',
    design: 'confetti',
  },
  {
    id: 'anniversary-elegant',
    name: 'Anniversary Elegant',
    category: 'anniversary',
    backgroundColor: '#6C5CE7',
    accentColor: '#A29BFE',
    textColor: '#FFFFFF',
    design: 'gradient',
  },
  {
    id: 'thank-you-stars',
    name: 'Thank You Stars',
    category: 'thank-you',
    backgroundColor: '#00B4CC',
    accentColor: '#FFD93D',
    textColor: '#FFFFFF',
    design: 'stars',
  },
  {
    id: 'congratulations-balloons',
    name: 'Congratulations Balloons',
    category: 'congratulations',
    backgroundColor: '#FD79A8',
    accentColor: '#FDCB6E',
    textColor: '#2D3436',
    design: 'balloons',
  },
  {
    id: 'celebration-gradient',
    name: 'Celebration Gradient',
    category: 'general',
    backgroundColor: '#D91C81',
    accentColor: '#1B2A5E',
    textColor: '#FFFFFF',
    design: 'gradient',
  },
  {
    id: 'appreciation-floral',
    name: 'Appreciation Floral',
    category: 'thank-you',
    backgroundColor: '#FF6B9D',
    accentColor: '#FFFFFF',
    textColor: '#FFFFFF',
    design: 'floral',
  },
  {
    id: 'milestone-pattern',
    name: 'Milestone Pattern',
    category: 'anniversary',
    backgroundColor: '#1B2A5E',
    accentColor: '#00B4CC',
    textColor: '#FFFFFF',
    design: 'pattern',
  },
  {
    id: 'simple-minimal',
    name: 'Simple & Clean',
    category: 'general',
    backgroundColor: '#FFFFFF',
    accentColor: '#D91C81',
    textColor: '#2D3436',
    design: 'minimal',
  },
];
