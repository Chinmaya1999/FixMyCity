import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getIssue, upvoteIssue, addComment, updateIssueStatus } from '../services/api';
import { format } from 'date-fns';
import { FaMapMarkerAlt, FaUser, FaThumbsUp, FaComment, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const IssueDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOfficial, isAdmin } = useAuth();
  const { socket, joinIssue, leaveIssue, emitTyping } = useSocket();
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    fetchIssue();
    joinIssue(id);

    // Socket listeners for real-time updates
    if (socket) {
      socket.on('issue-updated', handleIssueUpdate);
      socket.on('new-comment', handleNewComment);
      socket.on('upvote-updated', handleUpvoteUpdate);
      socket.on('user-typing', handleUserTyping);
    }

    return () => {
      leaveIssue(id);
      if (socket) {
        socket.off('issue-updated', handleIssueUpdate);
        socket.off('new-comment', handleNewComment);
        socket.off('upvote-updated', handleUpvoteUpdate);
        socket.off('user-typing', handleUserTyping);
      }
    };
  }, [id, socket]);

  const fetchIssue = async () => {
    try {
      const response = await getIssue(id);
      setIssue(response.data.data);
    } catch (error) {
      toast.error('Error loading issue');
      navigate('/map');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueUpdate = (data) => {
    if (data.issueId === id) {
      setIssue(prev => ({ ...prev, ...data }));
      toast.success(`Issue status updated to ${data.status}`);
    }
  };

  const handleNewComment = (data) => {
    if (data.issueId === id) {
      setIssue(prev => ({
        ...prev,
        comments: [...prev.comments, data.comment]
      }));
    }
  };

  const handleUpvoteUpdate = (data) => {
    if (data.issueId === id) {
      setIssue(prev => ({ ...prev, upvotes: data.upvotes }));
    }
  };

  const handleUserTyping = ({ userId, isTyping }) => {
    if (userId !== user?.id) {
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
    }
  };

  const handleUpvote = async () => {
    try {
      const response = await upvoteIssue(id);
      setIssue(prev => ({
        ...prev,
        upvotes: response.data.upvotes
      }));
    } catch (error) {
      toast.error('Error upvoting issue');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addComment(id, comment);
      setComment('');
      emitTyping(id, false);
    } catch (error) {
      toast.error('Error adding comment');
    }
  };

  const updateStatus = async (status, comment) => {
    try {
      await updateIssueStatus(id, status, comment);
      toast.success(`Issue status updated to ${status}`);
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const handleTyping = (e) => {
    setComment(e.target.value);
    if (!typing && e.target.value) {
      setTyping(true);
      emitTyping(id, true);
    } else if (typing && !e.target.value) {
      setTyping(false);
      emitTyping(id, false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Issue not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Images */}
        {issue.images && issue.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-100">
            {issue.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Issue ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                onClick={() => window.open(image.url, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{issue.title}</h1>
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{categoryIcons[issue.category]}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[issue.status]}`}>
                  {issue.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            
            {/* Upvote button */}
            <button
              onClick={handleUpvote}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                issue.upvotes?.includes(user?.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <FaThumbsUp />
              <span>{issue.upvotes?.length || 0}</span>
            </button>
          </div>

          {/* Location */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-start mb-2">
              <FaMapMarkerAlt className="text-red-500 mr-2 mt-1" />
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-gray-600">{issue.location.address}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Reported by: {issue.createdBy?.name} • {format(new Date(issue.createdAt), 'PPP')}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{issue.description}</p>
          </div>

          {/* Status Updates (for officials) */}
          {(isOfficial || isAdmin) && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Update Status</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateStatus('in-progress', 'Working on this issue')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => updateStatus('resolved', 'Issue has been resolved')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => updateStatus('rejected', 'Cannot resolve this issue')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaComment className="mr-2" />
              Comments ({issue.comments?.length || 0})
            </h3>

            {/* Comment list */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {issue.comments?.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">{comment.user?.name}</span>
                      {comment.isOfficial && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Official
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(comment.createdAt), 'PPp')}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>

            {/* Typing indicator */}
            {Object.keys(typingUsers).length > 0 && (
              <div className="text-sm text-gray-500 mb-2">
                Someone is typing...
              </div>
            )}

            {/* Comment form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={comment}
                  onChange={handleTyping}
                  placeholder="Add a comment..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className={`px-6 py-2 rounded-lg ${
                    comment.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Post
                </button>
              </form>
            ) : (
              <p className="text-center text-gray-500">
                Please <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">login</button> to comment
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsPage;