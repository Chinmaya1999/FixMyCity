import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaMapMarkedAlt, FaPlusCircle, FaList, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { to: '/map', icon: <FaMapMarkedAlt />, text: 'Map View' },
    ...(isAuthenticated ? [
      { to: '/report', icon: <FaPlusCircle />, text: 'Report Issue' },
      { to: '/my-issues', icon: <FaList />, text: 'My Issues' }
    ] : []),
    ...(isAdmin ? [
      { to: '/admin', icon: <FaUser />, text: 'Admin' }
    ] : [])
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">FixMyCity</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="flex items-center space-x-1 hover:text-blue-200 transition"
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Hi, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-green-500 rounded hover:bg-green-400 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-2xl focus:outline-none"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="flex items-center space-x-2 py-2 hover:bg-blue-500 px-2 rounded"
                onClick={toggleMenu}
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}
            
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="flex items-center space-x-2 py-2 hover:bg-red-500 px-2 rounded w-full"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex flex-col space-y-2 mt-2">
                <Link
                  to="/login"
                  className="bg-blue-500 text-center py-2 rounded hover:bg-blue-400"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-center py-2 rounded hover:bg-green-400"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;