import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedInitiative } from '../../types/initiatives';

// Format large numbers with commas and abbreviations
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Animated counter component
const AnimatedCounter = ({ value, formatter = (val: number) => val.toString() }) => {
  const [count, setCount] = useState(0);
  
  React.useEffect(() => {
    let start = 0;
    const increment = value / 50;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        clearInterval(timer);
        setCount(value);
      } else {
        setCount(start);
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <>{formatter(count)}</>;
};

interface AnalyticsPanelProps {
  initiatives: EnhancedInitiative[];
  impactData: {
    totalInitiatives: number;
    initiativesByTheme: { theme: string; count: number; percentage: number }[];
    averageImpactScore: number;
    totalPeopleImpacted: number;
  };
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ initiatives, impactData }) => {
  // Calculate derived statistics
  const completedInitiatives = initiatives.filter(init => init.status === 'Completed').length;
  const completionRate = initiatives.length > 0 ? (completedInitiatives / initiatives.length) * 100 : 0;
  
  const activeRegions = new Set(initiatives.map(init => init.region).filter(Boolean)).size;
  const companiesInvolved = new Set(initiatives.map(init => init["Virgin Company"]).filter(Boolean)).size;
  
  const topTheme = impactData.initiativesByTheme[0]?.theme || 'N/A';
  const topThemePercentage = impactData.initiativesByTheme[0]?.percentage || 0;
  
  // Sort initiatives by impact score
  const topInitiatives = [...initiatives]
    .sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0))
    .slice(0, 3);
    
  // Calculate regional distribution
  const regionCounts: Record<string, number> = {};
  initiatives.forEach(initiative => {
    if (initiative.region) {
      regionCounts[initiative.region] = (regionCounts[initiative.region] || 0) + 1;
    }
  });
  
  const regionData = Object.entries(regionCounts)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  // Calculate theme distribution  
  const themePercentages = impactData.initiativesByTheme.slice(0, 5).map(theme => ({
    name: theme.theme,
    percentage: theme.percentage
  }));
  
  // Calculate status distribution
  const statusCounts: Record<string, number> = {
    'Planned': 0,
    'In Progress': 0,
    'Completed': 0,
    'On Hold': 0,
  };
  
  initiatives.forEach(initiative => {
    if (initiative.status) {
      statusCounts[initiative.status] = (statusCounts[initiative.status] || 0) + 1;
    }
  });
  
  // Tabs for different views
  const [activeMetric, setActiveMetric] = useState<'regions' | 'themes' | 'status' | 'impact'>('impact');
  
  // Determine the color for a metric card
  const getMetricColor = (index: number) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-md h-[850px] overflow-hidden flex flex-col">
      {/* Header with metrics cards */}
      <div className="p-6 bg-gradient-to-r from-red-600 to-red-500 text-white">
        <h2 className="text-2xl font-bold mb-5">Analytics & Insights</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-1">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-4xl font-bold mb-1">
              <AnimatedCounter value={impactData.totalInitiatives} />
            </div>
            <div className="text-sm opacity-90">Total Initiatives</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-4xl font-bold mb-1">
              <AnimatedCounter value={impactData.averageImpactScore} formatter={(val) => val.toFixed(1)} />
            </div>
            <div className="text-sm opacity-90">Avg Impact Score</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-4xl font-bold mb-1">
              <AnimatedCounter value={impactData.totalPeopleImpacted} formatter={(val) => formatNumber(val)} />
            </div>
            <div className="text-sm opacity-90">People Impacted</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-4xl font-bold mb-1">
              <AnimatedCounter value={completionRate} formatter={(val) => val.toFixed(0) + '%'} />
            </div>
            <div className="text-sm opacity-90">Completion Rate</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-4xl font-bold mb-1">
              <AnimatedCounter value={companiesInvolved} />
            </div>
            <div className="text-sm opacity-90">Companies</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-4xl font-bold mb-1">
              <AnimatedCounter value={activeRegions} />
            </div>
            <div className="text-sm opacity-90">Active Regions</div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - content controls and details */}
        <div className="w-3/4 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="px-6 pt-4 pb-2 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveMetric('impact')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  activeMetric === 'impact' 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Impact Metrics
              </button>
              <button
                onClick={() => setActiveMetric('regions')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  activeMetric === 'regions' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Regional
              </button>
              <button
                onClick={() => setActiveMetric('themes')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  activeMetric === 'themes' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Themes
              </button>
              <button
                onClick={() => setActiveMetric('status')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  activeMetric === 'status' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Status
              </button>
            </div>
          </div>
          
          {/* Main content panel for selected metric */}
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeMetric === 'impact' && (
                <motion.div
                  key="impact"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Impact Insights</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Impact scores */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-3">Impact Score Distribution</h4>
                      <div className="space-y-4">
                        {[
                          { range: '8-10', count: initiatives.filter(i => (i.impactScore || 0) >= 8).length, color: 'bg-green-500' },
                          { range: '6-8', count: initiatives.filter(i => (i.impactScore || 0) >= 6 && (i.impactScore || 0) < 8).length, color: 'bg-blue-500' },
                          { range: '4-6', count: initiatives.filter(i => (i.impactScore || 0) >= 4 && (i.impactScore || 0) < 6).length, color: 'bg-yellow-500' },
                          { range: '1-4', count: initiatives.filter(i => (i.impactScore || 0) >= 1 && (i.impactScore || 0) < 4).length, color: 'bg-red-500' },
                        ].map((item) => (
                          <div key={item.range} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">Score {item.range}</span>
                              <span className="text-gray-600">{item.count} initiatives</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${initiatives.length > 0 ? (item.count / initiatives.length) * 100 : 0}%` }}
                                transition={{ duration: 1 }}
                                className={`h-2 rounded-full ${item.color}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Impact metrics */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-3">Target Progress</h4>
                      <div className="space-y-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Carbon Reduction</span>
                            <span className="text-sm font-semibold text-green-600">67%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '67%' }}
                              transition={{ duration: 1 }}
                              className="bg-green-500 h-2.5 rounded-full"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Target: 15% by 2025</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Community Engagement</span>
                            <span className="text-sm font-semibold text-blue-600">83%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '83%' }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="bg-blue-500 h-2.5 rounded-full"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Target: 50,000 people</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Top Performing Initiatives</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Initiative
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Company
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Impact Score
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              People Impacted
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {topInitiatives.map((initiative, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{initiative.Initiaitive || 'Unnamed Initiative'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{initiative["Virgin Company"] || '-'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  {initiative.impactScore || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {initiative.peopleImpacted ? formatNumber(initiative.peopleImpacted) : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  initiative.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  initiative.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                  initiative.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {initiative.status || 'Unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeMetric === 'regions' && (
                <motion.div
                  key="regions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Regional Distribution</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Map visualization placeholder - in a real application this would be a map */}
                    <div className="bg-gray-50 rounded-xl p-5 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl text-blue-500 mb-2">🌍</div>
                        <div className="text-gray-600 font-medium">Initiative Distribution</div>
                        <div className="text-sm text-gray-500 mt-1">{activeRegions} active regions worldwide</div>
                      </div>
                    </div>
                    
                    {/* Region breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-3">Top Regions</h4>
                      <div className="space-y-4">
                        {regionData.map((region, index) => (
                          <div key={region.region} className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">{region.region}</span>
                              <span className="text-sm font-semibold text-blue-600">{region.count} initiatives</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(region.count / initiatives.length) * 100}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className="bg-blue-500 h-2.5 rounded-full"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {((region.count / initiatives.length) * 100).toFixed(1)}% of all initiatives
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Regional Impact Metrics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {regionData.slice(0, 3).map((region, idx) => {
                        const regionInitiatives = initiatives.filter(i => i.region === region.region);
                        const avgImpact = regionInitiatives.reduce((sum, i) => sum + (i.impactScore || 0), 0) / regionInitiatives.length;
                        const totalPeople = regionInitiatives.reduce((sum, i) => sum + (i.peopleImpacted || 0), 0);
                        
                        return (
                          <div key={idx} className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-blue-500">
                            <h5 className="font-medium text-gray-800 mb-2">{region.region}</h5>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-gray-50 p-2 rounded">
                                <div className="text-xs text-gray-500">Initiatives</div>
                                <div className="text-lg font-bold text-gray-800">{region.count}</div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <div className="text-xs text-gray-500">Avg. Impact</div>
                                <div className="text-lg font-bold text-gray-800">{avgImpact.toFixed(1)}</div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded col-span-2">
                                <div className="text-xs text-gray-500">People Impacted</div>
                                <div className="text-lg font-bold text-gray-800">{formatNumber(totalPeople)}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeMetric === 'themes' && (
                <motion.div
                  key="themes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Theme Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Theme breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-3">Initiative Themes</h4>
                      <div className="space-y-4">
                        {themePercentages.map((theme, index) => (
                          <div key={theme.name} className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">{theme.name}</span>
                              <span className="text-sm font-semibold text-green-600">{theme.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${theme.percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className="bg-green-500 h-2.5 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Theme impact metrics */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-3">Impact by Theme</h4>
                      <div className="space-y-5">
                        {impactData.initiativesByTheme.slice(0, 3).map((theme, idx) => {
                          const themeInitiatives = initiatives.filter(i => i.theme === theme.theme);
                          const avgImpact = themeInitiatives.reduce((sum, i) => sum + (i.impactScore || 0), 0) / themeInitiatives.length;
                          
                          return (
                            <div key={idx} className="grid grid-cols-3 gap-3">
                              <div className="col-span-3 text-sm font-medium text-gray-700">{theme.theme}</div>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500">Initiatives</div>
                                <div className="text-xl font-bold text-gray-800">{theme.count}</div>
                              </div>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500">% of Total</div>
                                <div className="text-xl font-bold text-gray-800">{theme.percentage.toFixed(1)}%</div>
                              </div>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500">Avg Impact</div>
                                <div className="text-xl font-bold text-gray-800">{avgImpact.toFixed(1)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Top Initiatives by Theme</h4>
                    {impactData.initiativesByTheme.slice(0, 1).map((theme) => {
                      const themeInitiatives = initiatives
                        .filter(i => i.theme === theme.theme)
                        .sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0))
                        .slice(0, 3);
                      
                      return (
                        <div key={theme.theme} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                          <h5 className="font-medium text-gray-800 mb-3">{theme.theme}</h5>
                          <div className="space-y-2">
                            {themeInitiatives.map((initiative, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                                <div>
                                  <div className="font-medium text-gray-700">{initiative.Initiaitive}</div>
                                  <div className="text-sm text-gray-500">{initiative["Virgin Company"]}</div>
                                </div>
                                <div className="px-3 py-1 bg-green-100 rounded-full text-sm font-medium text-green-800">
                                  Score: {initiative.impactScore}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              {activeMetric === 'status' && (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Progress & Status</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status distribution */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-3">Status Overview</h4>
                      
                      <div className="text-center mb-4">
                        <div className="inline-flex bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex space-x-1">
                            {/* Circular progress */}
                            <div className="relative w-32 h-32">
                              <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle
                                  className="text-gray-200"
                                  strokeWidth="10"
                                  stroke="currentColor"
                                  fill="transparent"
                                  r="40"
                                  cx="50"
                                  cy="50"
                                />
                                <motion.circle
                                  className="text-purple-500"
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                  stroke="currentColor"
                                  fill="transparent"
                                  r="40"
                                  cx="50"
                                  cy="50"
                                  initial={{ strokeDasharray: "0 251.2" }}
                                  animate={{ 
                                    strokeDasharray: `${completionRate * 2.512} 251.2` 
                                  }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  style={{
                                    transformOrigin: "center",
                                    transform: "rotate(-90deg)",
                                  }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div>
                                  <div className="text-3xl font-bold text-purple-600">{Math.round(completionRate)}%</div>
                                  <div className="text-xs text-gray-500">Completed</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {Object.entries(statusCounts).map(([status, count], idx) => {
                          let color;
                          switch(status) {
                            case 'Completed': color = 'bg-green-500'; break;
                            case 'In Progress': color = 'bg-blue-500'; break;
                            case 'Planned': color = 'bg-yellow-500'; break;
                            default: color = 'bg-gray-500';
                          }
                          
                          return (
                            <div key={status} className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{status}</span>
                                <span className="text-sm text-gray-600">{count} initiatives</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${initiatives.length > 0 ? (count / initiatives.length) * 100 : 0}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 }}
                                  className={`h-2 rounded-full ${color}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Company & initiative progress */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-3">Company Progress</h4>
                      
                      <div className="space-y-4">
                        {Object.entries(initiatives.reduce((acc: Record<string, {total: number, completed: number}>, initiative) => {
                          const company = initiative["Virgin Company"] || 'Unknown';
                          if (!acc[company]) acc[company] = {total: 0, completed: 0};
                          acc[company].total++;
                          if (initiative.status === 'Completed') acc[company].completed++;
                          return acc;
                        }, {}))
                        .sort((a, b) => b[1].total - a[1].total)
                        .slice(0, 4)
                        .map(([company, data], idx) => {
                          const percentage = data.total > 0 ? (data.completed / data.total) * 100 : 0;
                          
                          return (
                            <div key={company} className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{company}</span>
                                <span className="text-sm font-medium text-purple-600">
                                  {data.completed}/{data.total} completed
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 }}
                                  className={`h-2.5 rounded-full bg-purple-500`}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {percentage.toFixed(0)}% completion rate
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">Recent Completions</h4>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <div className="space-y-3">
                        {initiatives
                          .filter(i => i.status === 'Completed')
                          .slice(0, 3)
                          .map((initiative, idx) => (
                            <div key={idx} className="flex items-center p-2 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                              <div className="flex-shrink-0 mr-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{initiative.Initiaitive}</div>
                                <div className="text-sm text-gray-600">
                                  {initiative["Virgin Company"]} • Impact Score: {initiative.impactScore}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Right side - insights sidebar */}
        <div className="w-1/4 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-700 mb-3">Key Insights</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-700 mb-1">Top Theme</div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <div className="text-sm">{topTheme}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{topThemePercentage.toFixed(1)}% of all initiatives</div>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-700 mb-1">Highest Impact</div>
              <div className="text-sm font-medium">
                {topInitiatives[0]?.impactScore || 'N/A'} impact score
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {topInitiatives[0]?.Initiaitive || 'No initiatives found'}
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-700 mb-1">Most Active Region</div>
              <div className="text-sm font-medium">
                {regionData[0]?.region || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {regionData[0]?.count || 0} initiatives ({regionData[0] ? ((regionData[0].count / initiatives.length) * 100).toFixed(1) : 0}%)
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-700 mb-1">Status Summary</div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-green-50 p-2 rounded-md text-center">
                  <div className="text-xs text-gray-600">Completed</div>
                  <div className="text-sm font-medium text-green-600">{statusCounts['Completed'] || 0}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-md text-center">
                  <div className="text-xs text-gray-600">In Progress</div>
                  <div className="text-sm font-medium text-blue-600">{statusCounts['In Progress'] || 0}</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded-md text-center">
                  <div className="text-xs text-gray-600">Planned</div>
                  <div className="text-sm font-medium text-yellow-600">{statusCounts['Planned'] || 0}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-md text-center">
                  <div className="text-xs text-gray-600">On Hold</div>
                  <div className="text-sm font-medium text-gray-600">{statusCounts['On Hold'] || 0}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-sm font-medium text-red-700 mb-1">Download Reports</div>
              <div className="space-y-2 mt-2">
                <button className="flex items-center text-xs text-red-600 hover:text-red-800">
                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Impact Report PDF
                </button>
                <button className="flex items-center text-xs text-red-600 hover:text-red-800">
                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Analytics CSV
                </button>
                <button className="flex items-center text-xs text-red-600 hover:text-red-800">
                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Quarterly Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;