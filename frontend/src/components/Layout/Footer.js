import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaFacebook, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">FixMyCity</h3>
            <p className="text-gray-400 text-sm">
              Empowering citizens to report and track local issues, making our communities better together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link to="/map" className="text-gray-400 hover:text-white transition">Map View</Link></li>
              <li><Link to="/report" className="text-gray-400 hover:text-white transition">Report Issue</Link></li>
              <li><Link to="/my-issues" className="text-gray-400 hover:text-white transition">My Issues</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Garbage & Waste</li>
              <li className="text-gray-400">Road Damage</li>
              <li className="text-gray-400">Street Lighting</li>
              <li className="text-gray-400">Water Issues</li>
              <li className="text-gray-400">Electricity</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                <FaGithub />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                <FaFacebook />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              Email: support@fixmycity.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p className="flex items-center justify-center">
            Made with <FaHeart className="text-red-500 mx-1" /> chinmaya
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} FixMyCity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;