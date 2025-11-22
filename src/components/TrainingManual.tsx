'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  Users,
  Star,
  BarChart3,
  RefreshCw,
  Settings,
  Eye,
  Filter,
  Calendar,
  Building2
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function TrainingManual() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Dashboard Overview',
      icon: <BarChart3 className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The HFC Reviews Dashboard provides comprehensive analytics for customer service performance tracking. 
            This tool helps you monitor agent performance, department metrics, and customer satisfaction in real-time.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Key Features:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Real-time performance metrics and trends</li>
              <li>• Agent and department rankings</li>
              <li>• Customer satisfaction tracking</li>
              <li>• Problem feedback identification</li>
              <li>• Customizable date range filtering</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Navigating the Dashboard',
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Main Sections:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Key Metrics Header</h5>
                  <p className="text-sm text-gray-600">Displays overall customer satisfaction, total reviews, average rating, and problem reviews at a glance.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Agent Performance Rankings</h5>
                  <p className="text-sm text-gray-600">View top-performing agents ranked by review volume and quality. Click on any agent to see detailed performance data.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Department Performance</h5>
                  <p className="text-sm text-gray-600">Compare performance across departments and view all agents within each department.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">4</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Problem Feedback</h5>
                  <p className="text-sm text-gray-600">Identify and review low-rated customer feedback requiring attention.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">5</div>
                <div>
                  <h5 className="font-semibold text-gray-900">Detailed Analytics</h5>
                  <p className="text-sm text-gray-600">Explore trends, charts, and comprehensive data tables at the bottom of the dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'time-filters',
      title: 'Using Time Period Filters',
      icon: <Calendar className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Time period filters allow you to analyze performance across different timeframes. All metrics and charts update automatically when you change the time period.
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Available Time Periods:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded p-2">
                <span className="font-semibold">📅 7 Days</span> - Last week's activity
              </div>
              <div className="bg-white rounded p-2">
                <span className="font-semibold">📆 30 Days</span> - Last month's trends
              </div>
              <div className="bg-white rounded p-2">
                <span className="font-semibold">🗓️ 90 Days</span> - Quarterly performance
              </div>
              <div className="bg-white rounded p-2">
                <span className="font-semibold">📊 This Month</span> - Current month-to-date
              </div>
              <div className="bg-white rounded p-2">
                <span className="font-semibold">📋 Last Month</span> - Previous full month
              </div>
              <div className="bg-white rounded p-2">
                <span className="font-semibold">📈 This Year</span> - Year-to-date analysis
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">💡 Pro Tip:</h4>
            <p className="text-sm text-amber-800">
              Use the <strong>Compare</strong> toggle to see period-over-period changes. This helps identify trends and improvements over time.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'agent-details',
      title: 'Viewing Agent Details',
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Click on any agent card to view their detailed performance page with comprehensive metrics, trends, and individual reviews.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Agent Detail Page Includes:</h4>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Performance Metrics:</span> Total reviews, average rating, 5-star percentage, and satisfaction rate
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Trend Analysis:</span> Performance over time with comparison to previous periods
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Rating Distribution:</span> Breakdown of 1-5 star ratings with visual charts
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Individual Reviews:</span> Complete list of customer feedback with ratings and comments
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Navigation Tip:</h4>
            <p className="text-sm text-blue-800">
              Click the <strong>"Back to Dashboard"</strong> button at the top of the agent detail page to return to the main dashboard. Your filters and section states will be preserved.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'departments',
      title: 'Managing Departments',
      icon: <Building2 className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Organize agents into departments for better team management and performance comparison.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Department Management:</h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Viewing Department Performance</h5>
                <p className="text-sm text-gray-600">
                  The Department Performance Rankings section shows key metrics for each department including agent count, total reviews, 5-star percentage, and satisfaction rate.
                </p>
              </div>
              
              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Expanding/Collapsing Departments</h5>
                <p className="text-sm text-gray-600">
                  Click the collapse button on each department to show or hide all agents within that department.
                </p>
              </div>
              
              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Reassigning Agents</h5>
                <p className="text-sm text-gray-600">
                  Go to Settings → Agent Management to reassign agents to different departments or create custom departments.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'problem-reviews',
      title: 'Handling Problem Feedback',
      icon: <Star className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The Problem Feedback section highlights low-rated reviews (1-3 stars) that need attention. These represent customer concerns that should be addressed.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-red-900">What Counts as Problem Feedback:</h4>
            <ul className="space-y-1 text-sm text-red-800">
              <li>• ⭐ 1-star reviews - Critical issues</li>
              <li>• ⭐⭐ 2-star reviews - Significant problems</li>
              <li>• ⭐⭐⭐ 3-star reviews - Moderate concerns</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Best Practices:</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p>1. <strong>Review regularly:</strong> Check the Problem Feedback section daily to stay on top of customer concerns</p>
              <p>2. <strong>Identify patterns:</strong> Look for common themes in negative feedback across agents or departments</p>
              <p>3. <strong>Take action:</strong> Use this data to provide targeted coaching and training</p>
              <p>4. <strong>Track improvements:</strong> Monitor how problem review counts change over time</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> You can dismiss individual problem reviews to keep the list focused on items requiring immediate attention.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'syncing',
      title: 'Data Synchronization',
      icon: <RefreshCw className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The dashboard automatically syncs with your Google Sheets data source. You can also manually refresh data at any time.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">How Data Syncing Works:</h4>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div>
                <h5 className="font-semibold text-blue-900 mb-1">🔄 Automatic Sync</h5>
                <p className="text-sm text-blue-800">
                  The dashboard checks for new data periodically. New reviews are downloaded and processed automatically in the background.
                </p>
              </div>
              
              <div>
                <h5 className="font-semibold text-blue-900 mb-1">⚡ Quick Refresh</h5>
                <p className="text-sm text-blue-800">
                  Click "Refresh Data" in Settings to reload from your browser's cache (instant, no download required).
                </p>
              </div>
              
              <div>
                <h5 className="font-semibold text-blue-900 mb-1">📥 Full Sync</h5>
                <p className="text-sm text-blue-800">
                  Click "Sync from Google Sheets" in Settings to download the latest data from your spreadsheet (takes 2-5 minutes).
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">✅ Sync Status Indicator</h4>
            <p className="text-sm text-green-800">
              Watch the sync progress indicator in Settings to see the current status: Downloading → Processing → Saving → Complete
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">⏱️ When to Sync:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Before important presentations or meetings</li>
              <li>• When you know new reviews have been added</li>
              <li>• If data seems outdated (check "Last Updated" time)</li>
              <li>• At the start of each day for the latest metrics</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'hiding-agents',
      title: 'Hiding Agents',
      icon: <Eye className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            You can hide inactive or former agents from the dashboard to keep your view focused on current team members.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">How to Hide an Agent:</h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <p className="text-sm text-gray-700">Click on an agent card to open their detail page</p>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <p className="text-sm text-gray-700">Click the "Hide Agent" button in the header (eye icon)</p>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                <p className="text-sm text-gray-700">The agent will be removed from all dashboard views</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Unhiding Agents:</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                To restore a hidden agent:
              </p>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Go to Settings page</li>
                <li>Scroll to the "Hidden Agents" section</li>
                <li>Click "Unhide" next to the agent's name</li>
                <li>The agent will immediately reappear in the dashboard</li>
              </ol>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📊 Important Note:</h4>
            <p className="text-sm text-blue-800">
              Hidden agents' data is still included in department totals and overall metrics. Hiding only affects their visibility in agent rankings and lists.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Settings & Customization',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The Settings page provides tools for customizing your dashboard experience and managing your data.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Available Settings:</h4>
            
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 mb-1">🔄 Data Synchronization</h5>
                <p className="text-sm text-gray-600">Refresh data from cache or sync with Google Sheets</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 mb-1">👁️ Display Preferences</h5>
                <p className="text-sm text-gray-600">Toggle visibility of rating distribution charts and other visual elements</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 mb-1">👤 Hidden Agents</h5>
                <p className="text-sm text-gray-600">View and manage agents that are hidden from the dashboard</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 mb-1">🏢 Agent Management</h5>
                <p className="text-sm text-gray-600">Reassign agents to different departments and create custom departments</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 mb-1">📊 Performance Tier Guide</h5>
                <p className="text-sm text-gray-600">Reference chart explaining performance tier calculations and badges</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">💾 Local Changes:</h4>
            <p className="text-sm text-green-800">
              Agent department assignments and custom departments are saved locally in your browser. These changes won't affect other users until pushed to Google Sheets.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">📈 Maximize Your Dashboard Usage:</h4>
            
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-semibold text-blue-900 mb-1">Daily Monitoring</h5>
                <p className="text-sm text-blue-800">
                  Start each day by checking the Problem Feedback section. Address critical 1-star reviews first, then work through 2-3 star reviews.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-semibold text-green-900 mb-1">Weekly Reviews</h5>
                <p className="text-sm text-green-800">
                  Use the 7-day filter to conduct weekly team reviews. Compare agent performance and identify who needs support or recognition.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                <h5 className="font-semibold text-purple-900 mb-1">Monthly Analysis</h5>
                <p className="text-sm text-purple-800">
                  At month-end, use the "This Month" and "Last Month" filters to track trends. Look for improvements and areas needing attention.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
                <h5 className="font-semibold text-amber-900 mb-1">Coaching Opportunities</h5>
                <p className="text-sm text-amber-800">
                  Click into low-performing agents' detail pages to read their specific feedback. Use this for targeted coaching sessions.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-3">
                <h5 className="font-semibold text-cyan-900 mb-1">Department Comparisons</h5>
                <p className="text-sm text-cyan-800">
                  Use the Department Performance section to identify which teams are excelling and which need support. Share best practices across departments.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚡ Quick Actions:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Press <kbd className="px-2 py-0.5 bg-white border border-yellow-300 rounded text-xs">ESC</kbd> on agent detail pages to return to dashboard</li>
              <li>• Collapse sections you don't use frequently to reduce scrolling</li>
              <li>• Use the Compare toggle to quickly see if metrics are improving</li>
              <li>• Filter by specific time periods during team meetings for focused discussions</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const expandAll = () => {
    setExpandedSections(new Set(sections.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Training Manual</h2>
              <p className="text-sm text-gray-500">Learn how to use the HFC Reviews Dashboard</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-3">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          
          return (
            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                    {section.icon}
                  </div>
                  <span className="font-semibold text-gray-900">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50">
                  <div className="pt-4">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Need Help?</h3>
            <p className="text-sm text-blue-800">
              For questions or support, contact your system administrator or refer to the Google Sheets source data for additional context.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
