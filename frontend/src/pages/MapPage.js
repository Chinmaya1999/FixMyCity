import React, { useState, useEffect } from 'react';
import { getIssues } from '../services/api';
import IssueMap from '../components/Issues/IssueMap';
import IssueList from '../components/Issues/IssueList';
import IssueCard from '../components/Issues/IssueCard';
import { 
  FaMapMarkedAlt, 
  FaList, 
  FaFilter, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaChartBar,
  FaSpinner,
  FaLayerGroup,
  FaCompass,
  FaStreetView,
  FaRoad,
  FaLightbulb,
  FaTrash,
  FaWater,
  FaBolt,
  FaExclamationTriangle,
  FaCheck,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaSatellite,
  FaGlobe,
  FaEye,
  FaUsers,
  FaCalendarAlt,
  FaLocationArrow,
  FaCrosshairs,
  FaMapPin
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MapPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [userArea, setUserArea] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });

  useEffect(() => {
    fetchIssues();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [filters, locationFilter]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          
          // Reverse geocoding to get area name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const areaName = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || 'Your Area';
            setUserArea(areaName);
          } catch (error) {
            console.error('Error getting area name:', error);
            setUserArea('Your Area');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserArea('Unknown Location');
        }
      );
    } else {
      setUserArea('Location Not Available');
    }
  };

  const extractAreaFromAddress = (address) => {
    // Extract area/city from address string
    const parts = address.split(',');
    return parts[parts.length - 2]?.trim() || parts[0]?.trim() || '';
  };

  const getUniqueAreas = () => {
    const areas = new Set();
    issues.forEach(issue => {
      if (issue.location?.address) {
        const area = extractAreaFromAddress(issue.location.address);
        if (area) areas.add(area);
      }
    });
    return Array.from(areas).sort();
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      
      const response = await getIssues(params);
      setIssues(response.data.data);
      
      // Calculate stats
      const allIssues = response.data.data;
      setStats({
        total: allIssues.length,
        pending: allIssues.filter(i => i.status === 'pending').length,
        inProgress: allIssues.filter(i => i.status === 'in-progress').length,
        resolved: allIssues.filter(i => i.status === 'resolved').length
      });
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'garbage': return <FaTrash className="text-green-600" />;
      case 'road': return <FaRoad className="text-gray-600" />;
      case 'streetlight': return <FaLightbulb className="text-yellow-500" />;
      case 'graffiti': return <FaExclamationTriangle className="text-orange-500" />;
      case 'water': return <FaWater className="text-blue-500" />;
      case 'electricity': return <FaBolt className="text-purple-500" />;
      default: return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'from-yellow-400 to-orange-500';
      case 'in-progress': return 'from-blue-400 to-indigo-500';
      case 'resolved': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'in-progress': return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'resolved': return <FaCheckCircle className="text-green-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchTerm === '' || 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === 'all' || locationFilter === userArea || 
      extractAreaFromAddress(issue.location?.address || '') === locationFilter;
    
    return matchesSearch && matchesLocation;
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const categories = [
    'garbage',
    'road',
    'streetlight',
    'graffiti',
    'water',
    'electricity',
    'other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-100"
      >
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <FaGlobe className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Issues Map</h1>
                <p className="text-sm text-gray-500">Explore and track city issues in real-time</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Location Indicator */}
              {userArea && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 flex items-center space-x-2"
                >
                  <FaMapPin className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{userArea}</span>
                  <span className="text-xs text-blue-600">(Your Area)</span>
                </motion.div>
              )}
              
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFilter />
                <span>Filters</span>
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Issues</div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaChartBar className="text-blue-600 text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FaClock className="text-yellow-600 text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaLayerGroup className="text-blue-600 text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaCheck className="text-green-600 text-xl" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapPin className="inline mr-1 text-blue-500" />
                      Area
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Areas</option>
                      {userArea && (
                        <option value={userArea}>
                          📍 {userArea} (Your Area)
                        </option>
                      )}
                      {getUniqueAreas().map(area => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 mb-2">Active Filters</div>
                      <div className="flex flex-wrap gap-2">
                        {filters.status && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            Status: {filters.status}
                          </span>
                        )}
                        {filters.category && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Category: {filters.category}
                          </span>
                        )}
                        {locationFilter !== 'all' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            Area: {locationFilter}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilters({ status: '', category: '' });
                        setLocationFilter('all');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('map')}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-all ${
                  view === 'map' 
                    ? 'bg-white shadow-md text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaMapMarkedAlt />
                <span className="font-medium">Map View</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('list')}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-all ${
                  view === 'list' 
                    ? 'bg-white shadow-md text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaList />
                <span className="font-medium">List View</span>
              </motion.button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {filteredIssues.length} of {issues.length} issues shown
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FaEye className="text-gray-400" />
                <span>Live Updates</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          style={{ height: 'calc(100vh - 320px)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <FaSpinner className="animate-spin text-6xl text-blue-600 mb-4 mx-auto" />
                <p className="text-gray-600 text-lg">Loading community issues...</p>
              </motion.div>
            </div>
          ) : view === 'map' ? (
            <div className="h-full relative">
              {/* Map Controls */}
              <div className="absolute top-4 left-4 z-10 space-y-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
                >
                  <FaSatellite className="text-gray-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
                >
                  <FaCompass className="text-gray-600" />
                </motion.button>
              </div>

              {/* Map Legend */}
              <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <h3 className="font-semibold text-sm text-gray-900 mb-2">Issue Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">In Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Resolved</span>
                  </div>
                </div>
              </div>

              <IssueMap issues={filteredIssues} height="100%" />
            </div>
          ) : (
            <div className="h-full overflow-auto p-6">
              <div className="grid gap-6">
                {filteredIssues.map((issue, index) => (
                  <motion.div
                    key={issue._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <IssueCard issue={issue} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default MapPage;