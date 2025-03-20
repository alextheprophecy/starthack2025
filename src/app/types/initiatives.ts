// Initiative Types

// Base Initiative type definition
export interface Initiative {
  uid: string;
  "Virgin Company": string;
  "Initiaitive": string;
  "Challenge": string;
  "What Virgin is doing": string;
  "Call to Action": string;
  "Links": string;
  theme?: string;
  region?: string;
  phase?: ProjectPhase;
  impactScore?: number;
  lastUpdated?: string;
  collaborators?: string[];
  metrics?: InitiativeMetrics;
}

// Enhanced Initiative with additional metadata
export interface EnhancedInitiative extends Initiative {
  tags: string[];
  summary: string;
  startDate: string;
  targetCompletionDate?: string;
  teamMembers: TeamMember[];
  milestones: Milestone[];
  updates: ProjectUpdate[];
  resources: Resource[];
  status: ProjectStatus;
  statusHistory: StatusChange[];
  budgetData?: BudgetData;
  impactReports: ImpactReport[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  avatar?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  owner?: string;
}

export interface ProjectUpdate {
  id: string;
  date: string;
  author: string;
  content: string;
  attachments?: string[];
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  date: string;
  content: string;
  likes: number;
}

export interface Resource {
  id: string;
  type: 'document' | 'image' | 'video' | 'link' | 'dataset';
  title: string;
  description?: string;
  url: string;
  uploadedBy?: string;
  uploadDate: string;
  size?: string;
}

export type ProjectStatus = 'planning' | 'implementation' | 'active' | 'completed' | 'evaluation' | 'on-hold';

export type ProjectPhase = 'Planning' | 'Implementation' | 'Active' | 'Completed' | 'Evaluation';

export interface StatusChange {
  date: string;
  from: ProjectStatus;
  to: ProjectStatus;
  changedBy: string;
  reason?: string;
}

export interface BudgetData {
  totalBudget: number;
  allocated: number;
  spent: number;
  currency: string;
  lastUpdated: string;
  breakdowns: BudgetBreakdown[];
}

export interface BudgetBreakdown {
  category: string;
  allocated: number;
  spent: number;
}

export interface ImpactReport {
  id: string;
  title: string;
  date: string;
  highlights: string[];
  metrics: {
    [key: string]: number | string;
  };
  methodology?: string;
  conclusions: string;
  recommendations?: string[];
  attachments?: string[];
}

export interface InitiativeMetrics {
  [key: string]: number | string;
  carbonReduction?: string;
  peopleImpacted?: number;
  investmentAmount?: string;
}

// Dashboard Layout & Preferences
export interface DashboardLayout {
  widgets: Widget[];
  pinnedInitiatives: string[];
  visibleSections: DashboardSection[];
  sectionOrder: DashboardSection[];
}

export interface Widget {
  id: string;
  type: WidgetType;
  position: {
    column: number;
    row: number;
  };
  size: {
    width: number;
    height: number;
  };
  title: string;
  config: any;
}

export type WidgetType = 
  | 'recentUpdates' 
  | 'initiativeMetrics' 
  | 'timeline' 
  | 'impactScore' 
  | 'teamActivity'
  | 'projectProgress'
  | 'upcomingMilestones'
  | 'regionMap'
  | 'themeDistribution';

export type DashboardSection = 
  | 'projectCatalog' 
  | 'projectFeed' 
  | 'impactOverview' 
  | 'analytics' 
  | 'collaboration';

export interface UserPreferences {
  theme: string;
  region: string;
  phase: string;
  sortBy: string;
  view: string;
  filters: {
    [key: string]: any;
  };
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    digest: 'none' | 'daily' | 'weekly';
    types: {
      [key: string]: boolean;
    };
  };
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'update' | 'milestone' | 'mention' | 'system' | 'alert';
  initiativeId?: string;
  date: string;
  read: boolean;
  actionUrl?: string;
  sender?: string;
}

export interface CollaborationData {
  comments: {
    [initiativeId: string]: Comment[];
  };
  assignments: {
    [initiativeId: string]: string[];
  };
  sharedFiles: {
    [initiativeId: string]: Resource[];
  };
  activityLog: ActivityLogEntry[];
}

export interface ActivityLogEntry {
  id: string;
  date: string;
  userId: string;
  userName: string;
  action: string;
  targetType: 'initiative' | 'comment' | 'resource' | 'user';
  targetId: string;
  details?: any;
}

export interface MetricsHistory {
  [initiativeId: string]: {
    [metricName: string]: MetricDataPoint[];
  };
}

export interface MetricDataPoint {
  date: string;
  value: number;
  notes?: string;
}

// Initial Data Constants
export const PROJECT_PHASES: ProjectPhase[] = [
  'Planning',
  'Implementation',
  'Active',
  'Completed',
  'Evaluation'
];

export const THEMES = [
  "Environmental Sustainability",
  "Digital Inclusion",
  "Social Activism",
  "Community Support",
  "Climate Action",
  "Health & Wellbeing",
  "Education",
  "Economic Development",
  "Disaster Relief",
  "Space Innovation"
];

export const REGIONS = [
  "Global",
  "North America",
  "Europe",
  "Africa",
  "Asia",
  "Australia",
  "South America",
  "Middle East"
];

export const COMPANIES = [
  "Virgin Atlantic",
  "Virgin Media O2",
  "Virgin Voyages",
  "Virgin Limited Edition",
  "Virgin Unite",
  "Virgin Galactic",
  "Virgin Orbit",
  "Virgin Records",
  "Virgin Active",
  "Virgin Money"
];