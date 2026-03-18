import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createIssue } from '../services/api';
import { 
  FaMapMarkerAlt, 
  FaCamera, 
  FaExclamationTriangle,
  FaLocationArrow,
  FaUpload,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaArrowLeft,
  FaCompass,
  FaCity,
  FaRoad,
  FaLightbulb,
  FaPaintBrush,
  FaWater,
  FaBolt,
  FaTools,
  FaStar,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaHeart,
  FaRocket,
  FaSparkles,
  FaFlag,
  FaMapPin,
  FaSpinner,
  FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ReportIssuePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'garbage',
    address: '',
    priority: 'medium',
    urgency: 'normal'
  });
  const [isDragging, setIsDragging] = useState(false);

  const categories = [
    { value: 'garbage', label: 'Garbage & Waste', icon: FaTrash, color: 'green' },
    { value: 'road', label: 'Road & Infrastructure', icon: FaRoad, color: 'gray' },
    { value: 'streetlight', label: 'Street Lighting', icon: FaLightbulb, color: 'yellow' },
    { value: 'graffiti', label: 'Graffiti & Vandalism', icon: FaPaintBrush, color: 'orange' },
    { value: 'water', label: 'Water & Drainage', icon: FaWater, color: 'blue' },
    { value: 'electricity', label: 'Electricity & Power', icon: FaBolt, color: 'purple' },
    { value: 'other', label: 'Other Issues', icon: FaTools, color: 'red' }
  ];

  const steps = [
    { id: 1, title: 'Location', icon: FaMapMarkerAlt, description: 'Pin the issue location' },
    { id: 2, title: 'Photos', icon: FaCamera, description: 'Upload evidence photos' },
    { id: 3, title: 'Details', icon: FaExclamationTriangle, description: 'Describe the issue' },
    { id: 4, title: 'Review', icon: FaCheckCircle, description: 'Review & submit' }
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  const handleImageFiles = (files) => {
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

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return location !== null;
      case 2:
        return images.length > 0;
      case 3:
        return formData.title && formData.description && formData.category;
      case 4:
        return true; // Review step is always valid
      default:
        return false;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-100"
      >
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <FaFlag className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
                <p className="text-sm text-gray-500">Help improve your community by reporting issues</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FaHeart className="text-red-500" />
              <span className="text-sm text-gray-600">Making our city better, one issue at a time</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        currentStep >= step.id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <step.icon className="text-xl" />
                    </motion.div>
                    <div className="ml-3 hidden md:block">
                      <h3 className={`font-semibold ${
                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Step Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <div className="text-center mb-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        <FaCompass className="text-6xl text-blue-600 mb-4" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pin the Issue Location</h2>
                      <p className="text-gray-600">Help us find exactly where the issue is located</p>
                    </div>

                    {!location ? (
                      <div className="text-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={getCurrentLocation}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all mx-auto"
                        >
                          <FaLocationArrow className="text-xl" />
                          <span className="font-semibold text-lg">Use My Current Location</span>
                        </motion.button>
                        
                        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                          <FaShieldAlt className="text-green-500" />
                          <span>Your location is secure and only used for this report</span>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 border border-green-200 rounded-xl p-6"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <FaCheckCircle className="text-green-600 text-2xl" />
                          <div>
                            <h3 className="font-semibold text-green-800">Location Captured!</h3>
                            <p className="text-green-600 text-sm">{locationAddress}</p>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setLocation(null);
                            setLocationAddress('');
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Change Location
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <div className="text-center mb-8">
                      <FaCamera className="text-6xl text-green-600 mb-4 mx-auto" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Evidence Photos</h2>
                      <p className="text-gray-600">Add clear photos to help us understand the issue better</p>
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageFiles(Array.from(e.target.files))}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer"
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="inline-block"
                        >
                          <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">Click to upload or drag & drop</p>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG, GIF up to 5MB each (max 5 photos)
                          </p>
                        </motion.div>
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Uploaded Photos ({imagePreviews.length}/5)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative group"
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <FaTimes />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <div className="text-center mb-8">
                      <FaExclamationTriangle className="text-6xl text-yellow-600 mb-4 mx-auto" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Details</h2>
                      <p className="text-gray-600">Tell us more about the issue you're reporting</p>
                    </div>

                    <div className="space-y-6">
                      {/* Category Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          What type of issue is this?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {categories.map(cat => (
                            <motion.button
                              key={cat.value}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => setFormData({ ...formData, category: cat.value })}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.category === cat.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <cat.icon className={`text-2xl mb-2 ${
                                cat.color === 'green' ? 'text-green-600' :
                                cat.color === 'gray' ? 'text-gray-600' :
                                cat.color === 'yellow' ? 'text-yellow-600' :
                                cat.color === 'orange' ? 'text-orange-600' :
                                cat.color === 'blue' ? 'text-blue-600' :
                                cat.color === 'purple' ? 'text-purple-600' :
                                'text-red-600'
                              }`} />
                              <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issue Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Brief title describing the issue"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength="100"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Detailed Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Provide detailed information about the issue..."
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength="1000"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address or Landmark
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Street address or nearby landmark"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <div className="text-center mb-8">
                      <FaCheckCircle className="text-6xl text-green-600 mb-4 mx-auto" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                      <p className="text-gray-600">Please review your issue report before submitting</p>
                    </div>

                    <div className="space-y-6">
                      {/* Location Summary */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FaMapPin className="mr-2 text-red-500" />
                          Location
                        </h3>
                        <p className="text-gray-700">{locationAddress}</p>
                      </div>

                      {/* Photos Summary */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FaCamera className="mr-2 text-green-500" />
                          Photos ({images.length})
                        </h3>
                        <div className="flex space-x-2">
                          {imagePreviews.slice(0, 3).map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ))}
                          {imagePreviews.length > 3 && (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600">
                              +{imagePreviews.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Issue Details Summary */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FaExclamationTriangle className="mr-2 text-yellow-500" />
                          Issue Details
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-500">Category:</span>
                            <span className="ml-2 font-medium">
                              {categories.find(c => c.value === formData.category)?.label}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Title:</span>
                            <span className="ml-2 font-medium">{formData.title}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Description:</span>
                            <p className="mt-1 text-gray-700">{formData.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Submit Confirmation */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center space-x-3">
                          <FaRocket className="text-blue-600 text-2xl" />
                          <div>
                            <h3 className="font-semibold text-blue-900">Ready to submit?</h3>
                            <p className="text-blue-700 text-sm">
                              Your report will be reviewed and processed quickly. Thank you for helping improve our community!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FaArrowLeft className="mr-2" />
                  Previous
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      isStepValid()
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <FaArrowRight className="ml-2" />
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all ${
                      loading
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" />
                        Submit Issue Report
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ReportIssuePage;