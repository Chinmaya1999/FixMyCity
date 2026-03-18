import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIssues, updateIssueStatus } from '../services/api';
import { format } from 'date-fns';
import { FaCheck, FaSpinner, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchIssues();
  }, [filter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await getIssues({ status: filter !== 'all' ? filter : '' });
      setIssues(response.data.data);
      
      // Calculate stats
      const allIssues = response.data.data;
      setStats({
        total: response.data.total,
        pending: allIssues.filter(i => i.status === 'pending').length,
        inProgress: allIssues.filter(i => i.status === 'in-progress').length,
        resolved: allIssues.filter(i => i.status === 'resolved').length,
        rejected: allIssues.filter(i => i.status === 'rejected').length
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-gray-600">Resolved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b">
        {['all', 'pending', 'in-progress', 'resolved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 capitalize ${
              filter === status
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map(issue => (
            <div key={issue._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{issue.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{issue.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <FaMapMarkerAlt className="mr-1 text-red-500" />
                      {issue.location.address}
                    </span>
                    <span>Reported by: {issue.createdBy?.name}</span>
                    <span>Upvotes: {issue.upvotes?.length}</span>
                    <span>Comments: {issue.comments?.length}</span>
                    <span>{format(new Date(issue.createdAt), 'PP')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 ml-4">
                  {issue.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(issue._id, 'in-progress', 'Starting work on this issue')}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Start
                    </button>
                  )}
                  {issue.status === 'in-progress' && (
                    <button
                      onClick={() => handleStatusUpdate(issue._id, 'resolved', 'Issue has been resolved')}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <FaCheck className="inline mr-1" />
                      Resolve
                    </button>
                  )}
                  {(issue.status === 'pending' || issue.status === 'in-progress') && (
                    <button
                      onClick={() => handleStatusUpdate(issue._id, 'rejected', 'Cannot resolve this issue')}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      <FaTrash className="inline mr-1" />
                      Reject
                    </button>
                  )}
                </div>
              </div>

              {/* Images Preview */}
              {issue.images && issue.images.length > 0 && (
                <div className="mt-4 flex space-x-2">
                  {issue.images.slice(0, 3).map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`Issue ${idx}`}
                      className="w-20 h-20 object-cover rounded cursor-pointer"
                      onClick={() => window.open(img.url, '_blank')}
                    />
                  ))}
                  {issue.images.length > 3 && (
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      +{issue.images.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {issues.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No issues found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;