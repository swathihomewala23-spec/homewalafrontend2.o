import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const MapComponent = () => {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 13.0827, lng: 80.2707 }); // Default: Chennai
  const [mapInstance, setMapInstance] = useState(null);
  
  const filter = useSelector((state) => state.basic.filter);

  useEffect(() => {
    // Initialize map
    if (!window.google || !mapRef.current) return;
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 12,
    });
    setMapInstance(map);
  }, []);

  const geocodeLocation = (location) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();

        // map center change
        setMapCenter({ lat, lng });
        
        if (mapInstance) {
          mapInstance.setCenter({ lat, lng });
          
          new window.google.maps.Marker({
            map: mapInstance,
            position: { lat, lng },
            title: location,
            icon: {
              url: "/house-marker.svg",
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32),
            },
          });
        }
      } else {
        console.error("Geocode was not successful: " + status);
      }
    });
  };

  useEffect(() => {
    if (filter.search?.length > 0) {
      geocodeLocation(filter.search[0]);
    }
  }, [filter.search, mapInstance]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: "100%", height: "400px", borderRadius: "12px", background: "#f0f0f0" }}
      className="google-map-container"
    >
      {!window.google && <p style={{ padding: "20px", textAlign: "center" }}>Map is loading or Google Maps API key is missing...</p>}
    </div>
  );
};

export default MapComponent;
