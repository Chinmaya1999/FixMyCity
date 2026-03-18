import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  FaMapMarkerAlt, 
  FaUser, 
  FaThumbsUp, 
  FaComment, 
  FaEye,
  FaShare,
  FaBookmark,
  FaTrash,
  FaRoad,
  FaLightbulb,
  FaPaintBrush,
  FaWater,
  FaBolt,
  FaTools,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaHeart
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const IssueCard = ({ issue }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'from-yellow-400 to-orange-500';
      case 'in-progress': return 'from-blue-400 to-indigo-500';
      case 'resolved': return 'from-green-400 to-emerald-500';
      case 'rejected': return 'from-red-400 to-pink-500';
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

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'garbage': return <FaTrash className="text-green-600" />;
      case 'road': return <FaRoad className="text-gray-600" />;
      case 'streetlight': return <FaLightbulb className="text-yellow-500" />;
      case 'graffiti': return <FaPaintBrush className="text-orange-500" />;
      case 'water': return <FaWater className="text-blue-500" />;
      case 'electricity': return <FaBolt className="text-purple-500" />;
      default: return <FaTools className="text-red-500" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link to={`/issue/${issue._id}`} className="block">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
          <div className="p-6">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4">
              {/* Left side - Category and Title */}
              <div className="flex items-start space-x-3 flex-1">
                <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                  {getCategoryIcon(issue.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{issue.category}</p>
                </div>
              </div>

              {/* Right side - Status Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(issue.status)} text-white shadow-sm flex-shrink-0`}>
                <span className="flex items-center space-x-1">
                  {getStatusIcon(issue.status)}
                  <span className="capitalize">{issue.status.replace('-', ' ')}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {issue.description}
            </p>

            {/* Location */}
            <div className="flex items-center space-x-2 mb-4">
              <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 line-clamp-1">{issue.location?.address || 'Location not specified'}</span>
            </div>

            {/* Image Preview */}
            {issue.images && issue.images.length > 0 && (
              <div className="mb-4">
                <div className="flex space-x-2">
                  {issue.images.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="relative group/img">
                      <img
                        src={img.url}
                        alt={`Issue ${idx}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/img:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <FaEye className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                  {issue.images.length > 3 && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <span className="text-sm text-gray-600 font-medium">+{issue.images.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Section - User Info and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {/* Left side - User and Time */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{issue.createdBy?.name?.split(' ')[0] || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
              </div>

              {/* Right side - Engagement Stats */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <FaThumbsUp className="text-blue-500" />
                    <span>{issue.upvotes?.length || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FaComment className="text-green-500" />
                    <span>{issue.comments?.length || 0}</span>
                  </span>
                </div>

                {/* Action Button */}
                <div className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <FaArrowRight className="text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default IssueCard;