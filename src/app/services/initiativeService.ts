import {
  CollaborationData,
  DashboardLayout,
  EnhancedInitiative,
  Initiative,
  MetricsHistory,
  UserNotification,
  UserPreferences
} from '../types/initiatives';
import {
  COLLABORATION_DATA_KEY,
  DASHBOARD_LAYOUT_KEY,
  INITIATIVES_STORAGE_KEY,
  METRICS_HISTORY_KEY,
  USER_NOTIFICATIONS_KEY,
  USER_PREFERENCES_KEY,
  getFromLocalStorage,
  setToLocalStorage
} from '../utils/localStorage';

// Default Layout
const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  widgets: [
    {
      id: 'recent-updates',
      type: 'recentUpdates',
      position: { column: 0, row: 0 },
      size: { width: 1, height: 1 },
      title: 'Recent Updates',
      config: { limit: 5 }
    },
    {
      id: 'impact-score',
      type: 'impactScore',
      position: { column: 1, row: 0 },
      size: { width: 1, height: 1 },
      title: 'Impact Score',
      config: { showTrend: true }
    },
    {
      id: 'upcoming-milestones',
      type: 'upcomingMilestones',
      position: { column: 0, row: 1 },
      size: { width: 2, height: 1 },
      title: 'Upcoming Milestones',
      config: { days: 30 }
    }
  ],
  pinnedInitiatives: [],
  visibleSections: ['projectFeed', 'projectCatalog', 'impactOverview', 'analytics', 'collaboration'],
  sectionOrder: ['projectFeed', 'projectCatalog', 'impactOverview', 'analytics', 'collaboration']
};

// Default User Preferences
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'All',
  region: 'All',
  phase: 'All',
  sortBy: 'recent',
  view: 'ProjectFeed',
  filters: {},
  notificationSettings: {
    email: true,
    inApp: true,
    digest: 'weekly',
    types: {
      milestones: true,
      updates: true,
      mentions: true,
      system: true
    }
  }
};

// Initial empty collaboration data
const EMPTY_COLLABORATION_DATA: CollaborationData = {
  comments: {},
  assignments: {},
  sharedFiles: {},
  activityLog: []
};

/**
 * Load initiatives from local storage or fetch from sample data
 */
export async function loadInitiatives(): Promise<Initiative[]> {
  // First try to get initiatives from local storage
  const storedInitiatives = getFromLocalStorage<Initiative[]>(INITIATIVES_STORAGE_KEY, []);
  
  if (storedInitiatives.length > 0) {
    return storedInitiatives;
  }
  
  // If not in local storage, fetch from file
  try {
    const response = await fetch('/res/sample_initiatives.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch initiatives: ${response.status}`);
    }
    
    const data = await response.json();
    // Save to local storage for future use
    setToLocalStorage(INITIATIVES_STORAGE_KEY, data);
    return data;
  } catch (error) {
    console.error('Error loading initiatives:', error);
    return [];
  }
}

/**
 * Enhance basic initiatives with additional data
 */
export function enhanceInitiatives(initiatives: Initiative[]): EnhancedInitiative[] {
  return initiatives.map(initiative => {
    // Generate a unique salt for deterministic but random-seeming data
    const salt = initiative.uid.charCodeAt(initiative.uid.length - 1);
    
    // Extract base URLs from links
    const links = typeof initiative.Links === 'string' 
      ? initiative.Links.split('\n').filter(Boolean)
      : [];
      
    const baseUrls = links.map(link => {
      try {
        const url = new URL(link);
        return url.hostname;
      } catch {
        return '';
      }
    }).filter(Boolean);
    
    // Create deterministic tags based on initiative properties
    const tags = [
      ...(initiative.theme ? [initiative.theme] : []),
      ...(initiative.region ? [initiative.region] : []),
      ...baseUrls
    ];
    
    // Generate random dates based on the initiative's uid
    const today = new Date();
    const startDateOffset = (salt * 17) % 365; // Deterministic offset based on uid
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - startDateOffset);
    
    const endDateOffset = startDateOffset + ((salt * 31) % 180); // Between 0 and 180 days after start
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + endDateOffset);
    
    // Create a summary from the challenge text
    const challenge = initiative["Challenge"] || '';
    const summary = challenge.length > 120 ? `${challenge.slice(0, 117)}...` : challenge;
    
    // Generate deterministic team members
    const teamSize = (salt % 4) + 1; // 1-4 team members
    const teamMembers = Array.from({ length: teamSize }, (_, i) => ({
      id: `member-${salt + i}`,
      name: `Team Member ${i + 1}`,
      email: `member${i+1}@virgingroup.com`,
      role: i === 0 ? 'Project Lead' : ['Analyst', 'Coordinator', 'Specialist'][i % 3],
      company: initiative["Virgin Company"],
      avatar: `/images/avatar${(salt + i) % 5}.jpg`
    }));
    
    // Generate milestones
    const milestoneCount = (salt % 3) + 2; // 2-4 milestones
    const milestones = Array.from({ length: milestoneCount }, (_, i) => {
      const milestoneDate = new Date(startDate);
      milestoneDate.setDate(startDate.getDate() + ((i + 1) * 30)); // Every ~30 days
      
      const isCompleted = milestoneDate < today;
      const completedDate = isCompleted ? 
        new Date(milestoneDate.getTime() - (salt % 10) * 24 * 60 * 60 * 1000) : // Random completion before due date
        undefined;
      
      return {
        id: `milestone-${initiative.uid}-${i}`,
        title: [
          'Project Initiation', 
          'Research Phase', 
          'Implementation', 
          'Stakeholder Review', 
          'Final Deployment'
        ][i % 5],
        description: `Milestone ${i+1} for ${initiative["Initiaitive"]}`,
        dueDate: milestoneDate.toISOString(),
        completedDate: completedDate?.toISOString(),
        status: isCompleted ? 'completed' : (milestoneDate < new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) ? 'in-progress' : 'pending'),
        owner: teamMembers[i % teamMembers.length].id
      };
    });
    
    // Generate project updates
    const updateCount = (salt % 4) + 1; // 1-4 updates
    const updates = Array.from({ length: updateCount }, (_, i) => {
      const updateDate = new Date(startDate);
      updateDate.setDate(startDate.getDate() + ((i + 1) * 15)); // Every ~15 days
      
      return {
        id: `update-${initiative.uid}-${i}`,
        date: updateDate.toISOString(),
        author: teamMembers[i % teamMembers.length].name,
        content: [
          `Progress update on ${initiative["Initiaitive"]}: We've completed the initial assessment phase.`,
          `Key stakeholders have reviewed and approved the next phase of ${initiative["Initiaitive"]}.`,
          `Implementation is now underway for ${initiative["Initiaitive"]}, focusing on sustainability metrics.`,
          `The team has successfully addressed technical challenges in the ${initiative["Initiaitive"]} project.`
        ][i % 4],
        likes: (salt + i) % 15,
        comments: []
      };
    });
    
    // Generate resources
    const resourceCount = (salt % 3) + 1; // 1-3 resources
    const resources = Array.from({ length: resourceCount }, (_, i) => {
      const resourceDate = new Date(startDate);
      resourceDate.setDate(startDate.getDate() + ((i + 1) * 7)); // Every week
      
      return {
        id: `resource-${initiative.uid}-${i}`,
        type: ['document', 'image', 'link'][i % 3] as 'document' | 'image' | 'link',
        title: [
          `${initiative["Initiaitive"]} Project Plan`,
          'Sustainability Impact Report',
          'Technical Implementation Guide',
          'Stakeholder Presentation'
        ][i % 4],
        description: `Resource ${i+1} for ${initiative["Initiaitive"]}`,
        url: `https://example.com/resources/${initiative.uid}-doc${i}`,
        uploadedBy: teamMembers[i % teamMembers.length].name,
        uploadDate: resourceDate.toISOString(),
        size: `${(salt + i) % 10 + 1}MB`
      };
    });
    
    // Generate impact reports
    const reportCount = Math.max(1, salt % 3); // 0-2 reports
    const impactReports = Array.from({ length: reportCount }, (_, i) => {
      const reportDate = new Date(startDate);
      reportDate.setDate(startDate.getDate() + ((i + 1) * 60)); // Every ~60 days
      
      return {
        id: `report-${initiative.uid}-${i}`,
        title: `Impact Assessment ${i+1} for ${initiative["Initiaitive"]}`,
        date: reportDate.toISOString(),
        highlights: [
          `Reduced carbon emissions by ${(salt + i) % 50 + 10}%`,
          `Engaged with ${(salt + i) % 1000 + 500} stakeholders`,
          `Implemented ${(salt + i) % 5 + 2} new sustainability practices`
        ],
        metrics: {
          carbonReduction: `${(salt + i) % 500 + 100} tons`,
          peopleImpacted: (salt + i) % 10000 + 1000,
          investmentReturn: `${(salt + i) % 20 + 5}%`
        },
        methodology: 'Quantitative and qualitative assessment through stakeholder interviews and data analysis',
        conclusions: 'Project has shown significant positive impact across key sustainability metrics',
        recommendations: [
          'Expand program to additional regions',
          'Increase stakeholder engagement',
          'Implement additional metrics tracking'
        ]
      };
    });
    
    return {
      ...initiative,
      tags,
      summary,
      startDate: startDate.toISOString(),
      targetCompletionDate: endDate.toISOString(),
      teamMembers,
      milestones,
      updates,
      resources,
      status: ['planning', 'implementation', 'active', 'completed', 'evaluation'][salt % 5] as any,
      statusHistory: [
        {
          date: new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          from: 'planning',
          to: 'implementation',
          changedBy: teamMembers[0].name
        },
        {
          date: startDate.toISOString(),
          from: 'implementation',
          to: ['planning', 'implementation', 'active', 'completed', 'evaluation'][salt % 5] as any,
          changedBy: teamMembers[salt % teamMembers.length].name
        }
      ],
      budgetData: {
        totalBudget: (salt % 10 + 1) * 10000,
        allocated: (salt % 10 + 1) * 8000,
        spent: (salt % 10 + 1) * 5000,
        currency: 'USD',
        lastUpdated: new Date(today.getTime() - (salt % 10) * 24 * 60 * 60 * 1000).toISOString(),
        breakdowns: [
          { category: 'Research', allocated: (salt % 10 + 1) * 3000, spent: (salt % 10 + 1) * 2500 },
          { category: 'Implementation', allocated: (salt % 10 + 1) * 5000, spent: (salt % 10 + 1) * 2500 }
        ]
      },
      impactReports
    };
  });
}

/**
 * Get full enhanced initiative by ID
 */
export async function getInitiativeById(id: string): Promise<EnhancedInitiative | null> {
  const initiatives = await loadInitiatives();
  const initiative = initiatives.find(initiative => initiative.uid === id);
  
  if (!initiative) {
    return null;
  }
  
  const [enhancedInitiative] = enhanceInitiatives([initiative]);
  return enhancedInitiative;
}

/**
 * Save initiative to local storage
 */
export function saveInitiative(initiative: Initiative): boolean {
  const initiatives = getFromLocalStorage<Initiative[]>(INITIATIVES_STORAGE_KEY, []);
  
  // Find the index of the initiative with the same uid
  const index = initiatives.findIndex(i => i.uid === initiative.uid);
  
  if (index !== -1) {
    // Update existing initiative
    initiatives[index] = initiative;
  } else {
    // Add new initiative
    initiatives.push(initiative);
  }
  
  return setToLocalStorage(INITIATIVES_STORAGE_KEY, initiatives);
}

/**
 * Delete initiative from local storage
 */
export function deleteInitiative(id: string): boolean {
  const initiatives = getFromLocalStorage<Initiative[]>(INITIATIVES_STORAGE_KEY, []);
  const filteredInitiatives = initiatives.filter(initiative => initiative.uid !== id);
  
  if (filteredInitiatives.length === initiatives.length) {
    // No initiative was removed
    return false;
  }
  
  return setToLocalStorage(INITIATIVES_STORAGE_KEY, filteredInitiatives);
}

/**
 * Manage dashboard layout
 */
export function getDashboardLayout(): DashboardLayout {
  return getFromLocalStorage<DashboardLayout>(DASHBOARD_LAYOUT_KEY, DEFAULT_DASHBOARD_LAYOUT);
}

export function saveDashboardLayout(layout: DashboardLayout): boolean {
  return setToLocalStorage(DASHBOARD_LAYOUT_KEY, layout);
}

/**
 * Manage user preferences
 */
export function getUserPreferences(): UserPreferences {
  return getFromLocalStorage<UserPreferences>(USER_PREFERENCES_KEY, DEFAULT_USER_PREFERENCES);
}

export function saveUserPreferences(preferences: UserPreferences): boolean {
  return setToLocalStorage(USER_PREFERENCES_KEY, preferences);
}

/**
 * Manage notifications
 */
export function getUserNotifications(): UserNotification[] {
  return getFromLocalStorage<UserNotification[]>(USER_NOTIFICATIONS_KEY, []);
}

export function saveUserNotification(notification: UserNotification): boolean {
  const notifications = getUserNotifications();
  notifications.push(notification);
  return setToLocalStorage(USER_NOTIFICATIONS_KEY, notifications);
}

export function markNotificationAsRead(id: string): boolean {
  const notifications = getUserNotifications();
  const notification = notifications.find(n => n.id === id);
  
  if (!notification) {
    return false;
  }
  
  notification.read = true;
  return setToLocalStorage(USER_NOTIFICATIONS_KEY, notifications);
}

export function markAllNotificationsAsRead(): boolean {
  const notifications = getUserNotifications();
  
  if (notifications.length === 0) {
    return true;
  }
  
  const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
  return setToLocalStorage(USER_NOTIFICATIONS_KEY, updatedNotifications);
}

/**
 * Manage collaboration data
 */
export function getCollaborationData(): CollaborationData {
  return getFromLocalStorage<CollaborationData>(COLLABORATION_DATA_KEY, EMPTY_COLLABORATION_DATA);
}

export function saveCollaborationData(data: CollaborationData): boolean {
  return setToLocalStorage(COLLABORATION_DATA_KEY, data);
}

export function addComment(initiativeId: string, comment: any): boolean {
  const collaborationData = getCollaborationData();
  
  if (!collaborationData.comments[initiativeId]) {
    collaborationData.comments[initiativeId] = [];
  }
  
  collaborationData.comments[initiativeId].push(comment);
  
  // Add to activity log
  collaborationData.activityLog.push({
    id: `activity-${Date.now()}`,
    date: new Date().toISOString(),
    userId: comment.author,
    userName: comment.author,
    action: 'commented',
    targetType: 'initiative',
    targetId: initiativeId,
    details: { commentId: comment.id }
  });
  
  return saveCollaborationData(collaborationData);
}

/**
 * Manage metrics history
 */
export function getMetricsHistory(): MetricsHistory {
  return getFromLocalStorage<MetricsHistory>(METRICS_HISTORY_KEY, {});
}

export function saveMetricsHistory(data: MetricsHistory): boolean {
  return setToLocalStorage(METRICS_HISTORY_KEY, data);
}

export function addMetricDataPoint(initiativeId: string, metricName: string, dataPoint: any): boolean {
  const metricsHistory = getMetricsHistory();
  
  if (!metricsHistory[initiativeId]) {
    metricsHistory[initiativeId] = {};
  }
  
  if (!metricsHistory[initiativeId][metricName]) {
    metricsHistory[initiativeId][metricName] = [];
  }
  
  metricsHistory[initiativeId][metricName].push(dataPoint);
  
  return saveMetricsHistory(metricsHistory);
}