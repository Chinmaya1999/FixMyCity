import React, { useState, useEffect } from 'react';
import { getIssues } from '../services/api';
import IssueMap from '../components/Issues/IssueMap';
import IssueList from '../components/Issues/IssueList';
import { FaMapMarkedAlt, FaList } from 'react-icons/fa';

const MapPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map'); // 'map' or 'list'
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      
      const response = await getIssues(params);
      setIssues(response.data.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">Community Issues Map</h1>
        
        <div className="flex space-x-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('map')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                view === 'map' ? 'bg-white shadow' : ''
              }`}
            >
              <FaMapMarkedAlt />
              <span>Map</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                view === 'list' ? 'bg-white shadow' : ''
              }`}
            >
              <FaList />
              <span>List</span>
            </button>
          </div>

          {/* Filters */}
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : view === 'map' ? (
        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
          <IssueMap issues={issues} height="100%" />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <IssueList issues={issues} />
        </div>
      )}
    </div>
  );
};

export default MapPage;