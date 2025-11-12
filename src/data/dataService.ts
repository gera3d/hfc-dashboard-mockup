import { sampleReviews } from './reviews';
import departments from './departments.json';
import agents from './agents.json';
import sources from './sources.json';
import { getCachedGoogleSheetsData, refreshGoogleSheetsData } from './googleSheetsService';

export interface Department {
  id: string;
  name: string;
}

export interface Agent {
  id: string;
  agent_key: string;
  display_name: string;
  department_id: string;
  image_url?: string;
}

export interface Review {
  id: string;
  ext_review_id: string;
  agent_id: string;
  department_id: string;
  rating: number;
  comment: string;
  review_ts: string;
  source: string;
}

export interface MetricsSummary {
  star_1: number;
  star_2: number;
  star_3: number;
  star_4: number;
  star_5: number;
  total: number;
  avg_rating: number;
  percent_5_star: number;
}

export interface AgentMetrics extends MetricsSummary {
  agent_id: string;
  agent_name: string;
  department_name: string;
  last_review_date: string | null;
  image_url?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
  label?: string;
}

// Helper to get date ranges
export const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    last7Days: {
      from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      label: 'Last 7 days'
    },
    last30Days: {
      from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      label: 'Last 30 days'
    },
    last90Days: {
      from: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
      to: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      label: 'Last 90 days'
    },
    thisMonth: {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      label: 'This month'
    },
    lastMonth: {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 1),
      label: 'Last month'
    },
    thisYear: {
      from: new Date(now.getFullYear(), 0, 1),
      to: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Up to end of today
      label: 'This year'
    }
  };
};

// Filter reviews by date range
export const filterReviewsByDate = (reviews: Review[], dateRange: DateRange): Review[] => {
  console.log('[Filter Debug] Date range:', {
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    label: dateRange.label
  });
  
  const filtered = reviews.filter(review => {
    const reviewDate = new Date(review.review_ts);
    return reviewDate >= dateRange.from && reviewDate < dateRange.to;
  });
  
  console.log('[Filter Debug] Results:', {
    totalReviews: reviews.length,
    filteredReviews: filtered.length,
    sampleDates: filtered.slice(0, 5).map(r => new Date(r.review_ts).toISOString())
  });
  
  return filtered;
};

// Filter reviews by departments
export const filterReviewsByDepartments = (reviews: Review[], departmentIds: string[]): Review[] => {
  if (departmentIds.length === 0) return reviews;
  return reviews.filter(review => departmentIds.includes(review.department_id));
};

// Filter reviews by agents
export const filterReviewsByAgents = (reviews: Review[], agentIds: string[]): Review[] => {
  if (agentIds.length === 0) return reviews;
  return reviews.filter(review => agentIds.includes(review.agent_id));
};

// Calculate metrics from reviews
export const calculateMetrics = (reviews: Review[]): MetricsSummary => {
  const validReviews = reviews.filter(r => r.rating >= 1 && r.rating <= 5);
  
  const star_1 = validReviews.filter(r => r.rating === 1).length;
  const star_2 = validReviews.filter(r => r.rating === 2).length;
  const star_3 = validReviews.filter(r => r.rating === 3).length;
  const star_4 = validReviews.filter(r => r.rating === 4).length;
  const star_5 = validReviews.filter(r => r.rating === 5).length;
  
  const total = validReviews.length;
  const avg_rating = total > 0 ? validReviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const percent_5_star = total > 0 ? (star_5 / total) * 100 : 0;
  
  return {
    star_1,
    star_2,
    star_3,
    star_4,
    star_5,
    total,
    avg_rating: Math.round(avg_rating * 100) / 100,
    percent_5_star: Math.round(percent_5_star * 100) / 100
  };
};

// Get agent metrics
export const getAgentMetrics = (reviews: Review[], agents: Agent[] = [], departments: Department[] = []): AgentMetrics[] => {
  const agentGroups = reviews.reduce((acc, review) => {
    if (!acc[review.agent_id]) {
      acc[review.agent_id] = [];
    }
    acc[review.agent_id].push(review);
    return acc;
  }, {} as Record<string, Review[]>);
  
  return Object.entries(agentGroups).map(([agentId, agentReviews]) => {
    const agent = agents.find(a => a.id === agentId);
    const department = departments.find(d => d.id === agent?.department_id);
    const metrics = calculateMetrics(agentReviews);
    
    // Find most recent review
    const sortedReviews = agentReviews.sort((a, b) => 
      new Date(b.review_ts).getTime() - new Date(a.review_ts).getTime()
    );
    
    return {
      ...metrics,
      agent_id: agentId,
      agent_name: agent?.display_name || 'Unknown',
      department_name: department?.name || 'Unknown',
      last_review_date: sortedReviews.length > 0 ? sortedReviews[0].review_ts : null,
      image_url: agent?.image_url
    };
  }).sort((a, b) => b.total - a.total); // Sort by total reviews descending
};

// Get daily metrics for charts
export const getDailyMetrics = (reviews: Review[], dateRange: DateRange) => {
  const dailyData: Record<string, MetricsSummary & { date: string }> = {};
  
  // Initialize all days in range with zero metrics
  const currentDate = new Date(dateRange.from);
  while (currentDate < dateRange.to) {
    const dateStr = currentDate.toISOString().split('T')[0];
    dailyData[dateStr] = {
      date: dateStr,
      star_1: 0,
      star_2: 0,
      star_3: 0,
      star_4: 0,
      star_5: 0,
      total: 0,
      avg_rating: 0,
      percent_5_star: 0
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Group reviews by date
  reviews.forEach(review => {
    const reviewDate = new Date(review.review_ts);
    const dateStr = reviewDate.toISOString().split('T')[0];
    
    if (dailyData[dateStr]) {
      dailyData[dateStr][`star_${review.rating}` as keyof MetricsSummary] += 1;
      dailyData[dateStr].total += 1;
    }
  });
  
  // Calculate averages for each day
  Object.values(dailyData).forEach(dayData => {
    if (dayData.total > 0) {
      const totalRating = dayData.star_1 * 1 + dayData.star_2 * 2 + dayData.star_3 * 3 + 
                         dayData.star_4 * 4 + dayData.star_5 * 5;
      dayData.avg_rating = Math.round((totalRating / dayData.total) * 100) / 100;
      dayData.percent_5_star = Math.round((dayData.star_5 / dayData.total) * 100 * 100) / 100;
    }
  });
  
  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
};

// Data loading functions with Google Sheets CSV integration
export const loadReviews = async (): Promise<Review[]> => {
  try {
    const googleData = await getCachedGoogleSheetsData();
    if (googleData?.reviews && googleData.reviews.length > 0) {
      console.log('Loaded reviews from Google Sheets CSV:', googleData.reviews.length);
      return googleData.reviews;
    }
  } catch (error) {
    console.warn('Failed to load Google Sheets CSV data, using sample data:', error);
  }

  return sampleReviews;
};

export const loadAgents = async (): Promise<Agent[]> => {
  try {
    const googleData = await getCachedGoogleSheetsData();
    if (googleData?.agents && googleData.agents.length > 0) {
      console.log('Loaded agents from Google Sheets CSV:', googleData.agents.length);
      return googleData.agents;
    }
  } catch (error) {
    console.warn('Failed to load Google Sheets CSV data, using sample data:', error);
  }

  return agents;
};

export const loadDepartments = async (): Promise<Department[]> => {
  try {
    const googleData = await getCachedGoogleSheetsData();
    if (googleData?.departments && googleData.departments.length > 0) {
      console.log('Loaded departments from Google Sheets CSV:', googleData.departments.length);
      return googleData.departments;
    }
  } catch (error) {
    console.warn('Failed to load Google Sheets CSV data, using sample data:', error);
  }

  return departments;
};

export const refreshReviews = async (): Promise<Review[]> => {
  try {
    const googleData = await refreshGoogleSheetsData();
    if (googleData?.reviews && googleData.reviews.length > 0) {
      console.log('Refreshed reviews from Google Sheets CSV:', googleData.reviews.length);
      return googleData.reviews;
    }
  } catch (error) {
    console.warn('Failed to refresh Google Sheets CSV data, using sample data:', error);
  }

  return sampleReviews;
};

export const refreshAgents = async (): Promise<Agent[]> => {
  try {
    const googleData = await refreshGoogleSheetsData();
    if (googleData?.agents && googleData.agents.length > 0) {
      console.log('Refreshed agents from Google Sheets CSV:', googleData.agents.length);
      return googleData.agents;
    }
  } catch (error) {
    console.warn('Failed to refresh Google Sheets CSV data, using sample data:', error);
  }

  return agents;
};

export const refreshDepartments = async (): Promise<Department[]> => {
  try {
    const googleData = await refreshGoogleSheetsData();
    if (googleData?.departments && googleData.departments.length > 0) {
      console.log('Refreshed departments from Google Sheets CSV:', googleData.departments.length);
      return googleData.departments;
    }
  } catch (error) {
    console.warn('Failed to refresh Google Sheets CSV data, using sample data:', error);
  }

  return departments;
};

// Update agent's department assignment
export const updateAgentDepartment = async (agentId: string, departmentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Implement Google Sheets update via API
    // For now, this would need to update the Google Sheet directly
    // You would call the Google Sheets API to update the agent's department_id
    
    console.log(`Updating agent ${agentId} to department ${departmentId}`);
    
    return {
      success: false,
      message: 'Direct Google Sheets updates not yet implemented. Please update manually in the sheet for now.'
    };
  } catch (error) {
    console.error('Error updating agent department:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Export data collections
export { sampleReviews as reviews, departments, agents, sources };