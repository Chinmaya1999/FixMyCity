import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createIssue } from '../services/api';
import { FaMapMarkerAlt, FaCamera, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReportIssuePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'garbage',
    address: ''
  });

  const categories = [
    { value: 'garbage', label: 'Garbage Dump', icon: '🗑️' },
    { value: 'road', label: 'Road Damage', icon: '🛣️' },
    { value: 'streetlight', label: 'Streetlight Issue', icon: '💡' },
    { value: 'graffiti', label: 'Graffiti', icon: '🎨' },
    { value: 'water', label: 'Water Problem', icon: '💧' },
    { value: 'electricity', label: 'Electricity Issue', icon: '⚡' },
    { value: 'other', label: 'Other', icon: '🔧' }
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation([longitude, latitude]); // GeoJSON format [lng, lat]
          
          // Reverse geocoding to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocationAddress(data.display_name);
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } catch (error) {
            console.error('Error getting address:', error);
          }
          
          toast.success('Location captured successfully!');
        },
        (error) => {
          toast.error('Error getting location. Please allow location access.');
          console.error('Error getting location:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      return true;
    });

    if (validFiles.length + images.length > 5) {
      toast.error('You can upload up to 5 images');
      return;
    }

    setImages([...images, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      toast.error('Please select your location');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);

    try {
      const issueData = {
        ...formData,
        location,
        images
      };

      const response = await createIssue(issueData);
      
      toast.success('Issue reported successfully!');
      navigate(`/my-issues`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error reporting issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Report an Issue</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-red-500" />
            Step 1: Select Location
          </h2>
          
          {!location ? (
            <button
              type="button"
              onClick={getCurrentLocation}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <FaMapMarkerAlt className="mr-2" />
              Use My Current Location
            </button>
          ) : (
            <div className="space-y-2">
              <div className="bg-green-50 text-green-700 p-3 rounded-lg">
                ✓ Location captured successfully
              </div>
              <p className="text-sm text-gray-600">{locationAddress}</p>
              <button
                type="button"
                onClick={() => {
                  setLocation(null);
                  setLocationAddress('');
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Change Location
              </button>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCamera className="mr-2 text-green-500" />
            Step 2: Upload Photos
          </h2>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-block"
              >
                <div className="text-gray-600">
                  <FaCamera className="text-4xl mx-auto mb-2" />
                  <p>Click to upload images (max 5)</p>
                  <p className="text-sm">JPEG, PNG, GIF up to 5MB each</p>
                </div>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Issue Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaExclamationTriangle className="mr-2 text-yellow-500" />
            Step 3: Issue Details
          </h2>
          
          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title describing the issue"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                maxLength="100"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about the issue..."
                rows="4"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                maxLength="1000"
                required
              ></textarea>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address or landmark"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !location || images.length === 0}
          className={`w-full py-3 rounded-lg text-white font-semibold text-lg ${
            loading || !location || images.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition`}
        >
          {loading ? 'Submitting...' : 'Report Issue'}
        </button>
      </form>
    </div>
  );
};

export default ReportIssuePage;