import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIssues, updateIssueStatus } from '../services/api';
import { format } from 'date-fns';
import { 
  FaCheck, 
  FaSpinner, 
  FaTrash, 
  FaMapMarkerAlt, 
  FaChartLine, 
  FaUsers, 
  FaTasks,
  FaArrowUp,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaEye,
  FaEdit,
  FaDownload,
  FaUpload,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaComment,
  FaTimes,
  FaThumbsUp,
  FaReply,
  FaMapPin,
  FaEnvelope
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    todayIssues: 0,
    weeklyIssues: 0,
    monthlyIssues: 0
  });

  useEffect(() => {
    fetchIssues();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [filter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await getIssues({ status: filter !== 'all' ? filter : '' });
      setIssues(response.data.data);
      
      // Calculate stats
      const allIssues = response.data.data;
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Start of today (midnight)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      setStats({
        total: response.data.total,
        pending: allIssues.filter(i => i.status === 'pending').length,
        inProgress: allIssues.filter(i => i.status === 'in-progress').length,
        resolved: allIssues.filter(i => i.status === 'resolved').length,
        rejected: allIssues.filter(i => i.status === 'rejected').length,
        todayIssues: allIssues.filter(i => new Date(i.createdAt) >= startOfToday).length,
        weeklyIssues: allIssues.filter(i => new Date(i.createdAt) >= weekAgo).length,
        monthlyIssues: allIssues.filter(i => new Date(i.createdAt) >= monthAgo).length
      });
    } catch (error) {
      toast.error('Error fetching issues');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId, newStatus, comment = '') => {
    try {
      await updateIssueStatus(issueId, newStatus, comment);
      toast.success(`Issue marked as ${newStatus}`);
      fetchIssues();
    } catch (error) {
      toast.error('Error updating issue status');
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'in-progress': return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'resolved': return <FaCheckCircle className="text-green-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'from-yellow-400 to-orange-500';
      case 'in-progress': return 'from-blue-400 to-indigo-500';
      case 'resolved': return 'from-green-400 to-emerald-500';
      case 'rejected': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-100"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage city issues efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaBell className="text-xl" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="p-4">
                        <div className="text-center text-gray-500 py-8">
                          <FaBell className="mx-auto text-3xl text-gray-300 mb-2" />
                          <p className="text-sm">No new notifications</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaUserCircle className="text-2xl text-gray-600" />
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
                </button>
                
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                    >
                      <div className="py-2">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                          <FaCog className="text-gray-400" />
                          <span>Settings</span>
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                          <FaSignOutAlt className="text-gray-400" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
                <p className="text-blue-100 mb-4">Here's what's happening with your city issues today.</p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-blue-200" />
                    <span className="text-sm">{format(currentTime, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-blue-200" />
                    <span className="text-sm">{format(currentTime, 'h:mm a')}</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">{stats.todayIssues}</div>
                    <div className="text-blue-100 text-sm">New Issues Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaTasks className="text-blue-600 text-xl" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">All Issues</div>
            <div className="mt-4 flex items-center text-sm">
              <FaArrowUp className="text-green-500 mr-1" />
              <span className="text-green-500">12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pending}</div>
            <div className="text-sm text-gray-600">Awaiting Action</div>
            <div className="mt-4 flex items-center text-sm">
              <FaArrowUp className="text-red-500 mr-1" />
              <span className="text-red-500">8%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaSpinner className="text-blue-600 text-xl" />
              </div>
              <span className="text-sm text-gray-500">In Progress</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">Being Addressed</div>
            <div className="mt-4 flex items-center text-sm">
              <FaArrowUp className="text-green-500 mr-1" />
              <span className="text-green-500">15%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <span className="text-sm text-gray-500">Resolved</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Completed</div>
            <div className="mt-4 flex items-center text-sm">
              <FaArrowUp className="text-green-500 mr-1" />
              <span className="text-green-500">23%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Issues Management</h3>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <FaDownload />
                <span>Export</span>
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <FaUpload />
                <span>Import</span>
              </button>
            </div>
          </div>
          
          <div className="flex space-x-1 p-4 overflow-x-auto">
            {['all', 'pending', 'in-progress', 'resolved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === status
                    ? 'bg-gradient-to-r ' + getStatusColor(status) + ' text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="capitalize">{status.replace('-', ' ')}</span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Issues List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          style={{ height: 'calc(100vh - 420px)' }}
        >
          <div className="h-full overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <FaSpinner className="animate-spin text-4xl text-blue-600" />
                  <p className="text-gray-500">Loading issues...</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <AnimatePresence>
                  {filteredIssues.length > 0 ? (
                    filteredIssues.map((issue, index) => (
                      <motion.div
                        key={issue._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        className="bg-gray-50 rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900">{issue.title}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(issue.status)} text-white`}>
                              {issue.status}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <FaMapMarkerAlt className="text-red-500" />
                              <span>{issue.location?.address}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaUserCircle className="text-gray-400" />
                              <span>{issue.createdBy?.name}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaChartLine className="text-green-500" />
                              <span>{issue.upvotes?.length} upvotes</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaComment className="text-blue-500" />
                              <span>{issue.comments?.length} comments</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>{format(new Date(issue.createdAt), 'MMM d, yyyy')}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-6">
                          <button
                            onClick={() => setSelectedIssue(issue)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                          >
                            <FaEye className="text-sm" />
                            <span className="text-sm">View</span>
                          </button>
                          
                          {issue.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(issue._id, 'in-progress', 'Starting work on this issue')}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            >
                              <FaSpinner className="text-sm" />
                              <span className="text-sm">Start</span>
                            </button>
                          )}
                          
                          {issue.status === 'in-progress' && (
                            <button
                              onClick={() => handleStatusUpdate(issue._id, 'resolved', 'Issue has been resolved')}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                            >
                              <FaCheck className="text-sm" />
                              <span className="text-sm">Resolve</span>
                            </button>
                          )}
                          
                          {(issue.status === 'pending' || issue.status === 'in-progress') && (
                            <button
                              onClick={() => handleStatusUpdate(issue._id, 'rejected', 'Cannot resolve this issue')}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                            >
                              <FaTrash className="text-sm" />
                              <span className="text-sm">Reject</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Images Preview */}
                      {issue.images && issue.images.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            {issue.images.slice(0, 4).map((img, idx) => (
                              <div
                                key={idx}
                                className="relative group cursor-pointer"
                                onClick={() => window.open(img.url, '_blank')}
                              >
                                <img
                                  src={img.url}
                                  alt={`Issue ${idx}`}
                                  className="w-20 h-20 object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                                  <FaEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                            {issue.images.length > 4 && (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300">
                                <span className="text-sm font-medium">+{issue.images.length - 4}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center"
                >
                  <FaExclamationTriangle className="mx-auto text-4xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No issues found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms' : `No ${filter} issues at the moment`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Issue Detail Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedIssue(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                      {getStatusIcon(selectedIssue.status)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedIssue.title}</h2>
                      <p className="text-blue-100 text-sm">Issue ID: #{selectedIssue._id.slice(-8)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedIssue.description}</p>
                    </div>

                    {/* Images */}
                    {selectedIssue.images && selectedIssue.images.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Evidence Images</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedIssue.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative group cursor-pointer"
                              onClick={() => window.open(img.url, '_blank')}
                            >
                              <img
                                src={img.url}
                                alt={`Issue ${idx}`}
                                className="w-full h-32 object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                                <FaEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Comments</h3>
                      {selectedIssue.comments && selectedIssue.comments.length > 0 ? (
                        <div className="space-y-4">
                          {selectedIssue.comments.map((comment, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <FaUserCircle className="text-gray-400" />
                                  <span className="font-medium text-gray-900">{comment.user?.name}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FaComment className="mx-auto text-3xl text-gray-300 mb-2" />
                          <p>No comments yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Current Status</span>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(selectedIssue.status)} text-white`}>
                            {selectedIssue.status}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Priority</span>
                          <span className="font-medium text-gray-900">Medium</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Category</span>
                          <span className="font-medium text-gray-900">Infrastructure</span>
                        </div>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <FaMapPin className="text-red-500 mt-1" />
                          <div>
                            <p className="text-gray-700">{selectedIssue.location?.address}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Lat: {selectedIssue.location?.coordinates?.[1]}, 
                              Lng: {selectedIssue.location?.coordinates?.[0]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reporter Card */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reported By</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <FaUserCircle className="text-gray-400 text-2xl" />
                          <div>
                            <p className="font-medium text-gray-900">{selectedIssue.createdBy?.name}</p>
                            <p className="text-sm text-gray-500">{selectedIssue.createdBy?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FaEnvelope className="text-gray-400" />
                          <span>{selectedIssue.createdBy?.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaThumbsUp className="text-green-500" />
                            <span className="text-gray-600">Upvotes</span>
                          </div>
                          <span className="font-medium text-gray-900">{selectedIssue.upvotes?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaComment className="text-blue-500" />
                            <span className="text-gray-600">Comments</span>
                          </div>
                          <span className="font-medium text-gray-900">{selectedIssue.comments?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <span className="text-gray-600">Created</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {format(new Date(selectedIssue.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {selectedIssue.status === 'pending' && (
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedIssue._id, 'in-progress', 'Starting work on this issue');
                            setSelectedIssue(null);
                          }}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <FaSpinner />
                          <span>Start Working</span>
                        </button>
                      )}
                      
                      {selectedIssue.status === 'in-progress' && (
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedIssue._id, 'resolved', 'Issue has been resolved');
                            setSelectedIssue(null);
                          }}
                          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <FaCheck />
                          <span>Mark as Resolved</span>
                        </button>
                      )}
                      
                      {(selectedIssue.status === 'pending' || selectedIssue.status === 'in-progress') && (
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedIssue._id, 'rejected', 'Cannot resolve this issue');
                            setSelectedIssue(null);
                          }}
                          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <FaTrash />
                          <span>Reject Issue</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;