import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapLocation({ address }) {
  const [position, setPosition] = useState({ lat: 28.6139, lng: 77.209 }); // Default: New Delhi

  useEffect(() => {
    if (!address) return;

    const fetchCoordinates = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setPosition({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    };

    fetchCoordinates();
  }, [address]);

  return (
    <div style={{ width: "100%", height: "300px", marginTop: "1rem" }}>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ width: "100%", height: "100%", borderRadius: "10px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[position.lat, position.lng]} icon={defaultIcon} />
      </MapContainer>
    </div>
  );
}

export default MapLocation;
