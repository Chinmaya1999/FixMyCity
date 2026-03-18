import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FaMapMarkerAlt, FaUser, FaThumbsUp, FaComment } from 'react-icons/fa';

const IssueCard = ({ issue }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const categoryIcons = {
    garbage: '🗑️',
    road: '🛣️',
    streetlight: '💡',
    graffiti: '🎨',
    water: '💧',
    electricity: '⚡',
    other: '🔧'
  };

  return (
    <Link to={`/issue/${issue._id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
        {/* Image */}
        {issue.images && issue.images[0] && (
          <div className="h-48 overflow-hidden">
            <img
              src={issue.images[0].url}
              alt={issue.title}
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          {/* Category and Status */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl" title={issue.category}>
              {categoryIcons[issue.category] || '📌'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[issue.status]}`}>
              {issue.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{issue.title}</h3>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>

          {/* Location */}
          <div className="flex items-start text-sm text-gray-500 mb-3">
            <FaMapMarkerAlt className="mr-1 mt-1 flex-shrink-0 text-red-500" />
            <span className="line-clamp-1">{issue.location.address}</span>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t">
            <div className="flex items-center space-x-1">
              <FaUser className="mr-1" />
              <span>{issue.createdBy?.name?.split(' ')[0] || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <FaThumbsUp className="text-blue-500" />
                <span>{issue.upvotes?.length || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaComment className="text-green-500" />
                <span>{issue.comments?.length || 0}</span>
              </span>
              <span>
                {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IssueCard;