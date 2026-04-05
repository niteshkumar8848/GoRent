import { useMemo } from "react";
import PropTypes from "prop-types";
import { MapContainer, Marker, Popup, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import configureLeafletDefaultIcon from "../utils/leafletIcon";

configureLeafletDefaultIcon();

function VehicleDetailsMap({ vehicle, userLocation }) {
  const pickupLocations = useMemo(() => (
    Array.isArray(vehicle?.pickup_locations)
      ? vehicle.pickup_locations
          .map((location, index) => ({
            key: `${vehicle?._id || "vehicle"}-${index}`,
            name: location?.name || `Pickup Point ${index + 1}`,
            lat: Number(location?.lat),
            lng: Number(location?.lng)
          }))
          .filter((location) => Number.isFinite(location.lat) && Number.isFinite(location.lng))
      : []
  ), [vehicle]);

  const center = useMemo(() => {
    if (pickupLocations.length > 0) {
      return [pickupLocations[0].lat, pickupLocations[0].lng];
    }

    if (userLocation?.lat && userLocation?.lng) {
      return [userLocation.lat, userLocation.lng];
    }

    return [28.6139, 77.209];
  }, [pickupLocations, userLocation]);

  return (
    <div className="vehicle-map-card vehicle-details-map-card">
      <div className="vehicle-map-header">
        <h3>Available Pickup Locations</h3>
        <p>Vehicle pickup points and your current position</p>
      </div>
      <MapContainer center={center} zoom={12} scrollWheelZoom className="vehicle-map-canvas vehicle-details-map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation?.lat && userLocation?.lng && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={10}
            pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.7 }}
          >
            <Popup>Your current location</Popup>
          </CircleMarker>
        )}

        {pickupLocations.map((location) => (
          <Marker key={location.key} position={[location.lat, location.lng]}>
            <Popup>
              <div className="vehicle-map-popup">
                <strong>{vehicle?.name || "Vehicle"}</strong>
                <p>Pickup: {location.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {pickupLocations.length === 0 && (
        <p className="pickup-helper-text">No pickup locations are configured for this vehicle yet.</p>
      )}
    </div>
  );
}

VehicleDetailsMap.propTypes = {
  vehicle: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    pickup_locations: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      })
    )
  }),
  userLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  })
};

VehicleDetailsMap.defaultProps = {
  vehicle: null,
  userLocation: null
};

export default VehicleDetailsMap;
