import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const IssueMap = ({ issues, height = '500px', center = [51.505, -0.09], zoom = 13 }) => {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Category colors for markers
  const categoryColors = {
    garbage: 'red',
    road: 'orange',
    streetlight: 'yellow',
    graffiti: 'purple',
    water: 'blue',
    electricity: 'green',
    other: 'gray'
  };

  useEffect(() => {
    if (!isClient) return;
    
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, center, zoom]);

  // Update markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    issues.forEach(issue => {
      if (issue.location && issue.location.coordinates) {
        const [lng, lat] = issue.location.coordinates;
        
        // Create custom marker with category color
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background-color: ${categoryColors[issue.category] || 'gray'};
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
            ">${issue.category === 'garbage' ? '🗑️' : 
                 issue.category === 'road' ? '🛣️' : 
                 issue.category === 'streetlight' ? '💡' : 
                 issue.category === 'graffiti' ? '🎨' : 
                 issue.category === 'water' ? '💧' : 
                 issue.category === 'electricity' ? '⚡' : '📍'}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
          })
        }).addTo(mapInstanceRef.current);

        // Add popup
        marker.bindPopup(`
          <div style="min-width: 200px">
            <h3 style="font-weight: bold; margin-bottom: 5px">${issue.title}</h3>
            <p style="margin: 5px 0; font-size: 12px; color: #666">${issue.location.address}</p>
            <p style="margin: 5px 0">
              <span style="
                background: ${issue.status === 'resolved' ? '#10b981' : 
                           issue.status === 'in-progress' ? '#3b82f6' : '#f59e0b'};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
              ">${issue.status.toUpperCase()}</span>
            </p>
            <button onclick="window.viewIssue('${issue._id}')" style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 5px 10px;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 5px;
              width: 100%;
            ">View Details</button>
          </div>
        `);

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [issues]);

  // Expose viewIssue function globally for popup buttons
  useEffect(() => {
    window.viewIssue = (id) => {
      navigate(`/issue/${id}`);
    };
    
    return () => {
      delete window.viewIssue;
    };
  }, [navigate]);

  if (!isClient) {
    return <div ref={mapRef} style={{ height, width: '100%', backgroundColor: '#f3f4f6' }} />;
  }

  return <div ref={mapRef} style={{ height, width: '100%' }} />;
};

export default IssueMap;