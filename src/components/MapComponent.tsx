import React from 'react';
import { MapPin, ExternalLink, Star, Clock } from 'lucide-react';

interface LocationResult {
  name: string;
  address: string;
  placeId?: string;
  rating?: number;
  types: string[];
  vicinity?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface LocationData {
  locations: LocationResult[];
  mapUrl?: string;
  searchQuery: string;
  category: string;
}

interface MapComponentProps {
  locationData: LocationData;
}

const MapComponent: React.FC<MapComponentProps> = ({ locationData }) => {
  const { locations, mapUrl, searchQuery } = locationData;

  const openInGoogleMaps = (location?: LocationResult) => {
    if (location && location.geometry) {
      const { lat, lng } = location.geometry.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    } else if (mapUrl) {
      window.open(mapUrl, '_blank');
    }
  };

  const getDirections = (location: LocationResult) => {
    if (location.geometry) {
      const { lat, lng } = location.geometry.location;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      const query = encodeURIComponent(`${location.name} ${location.address}`);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
      window.open(url, '_blank');
    }
  };

  const getCategoryIcon = (types: string[]) => {
    if (types.includes('bank') || types.includes('finance')) return '🏦';
    if (types.includes('hospital') || types.includes('health')) return '🏥';
    if (types.includes('local_government_office')) return '🏛️';
    if (types.includes('convenience_store')) return '🏪';
    if (types.includes('pharmacy')) return '💊';
    if (types.includes('restaurant')) return '🍽️';
    if (types.includes('supermarket')) return '🛒';
    if (types.includes('post_office')) return '📮';
    return '📍';
  };

  if (!locations || locations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-2xl border border-blue-200 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h4 className="font-bold text-blue-800">📍 Location Results</h4>
        {mapUrl && (
          <button
            onClick={() => openInGoogleMaps()}
            className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            View on Maps
          </button>
        )}
      </div>

      <div className="space-y-3">
        {locations.map((location, index) => (
          <div key={index} className="bg-white/80 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{getCategoryIcon(location.types)}</span>
                  <h5 className="font-bold text-gray-800">{location.name}</h5>
                  {location.rating && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{location.rating}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-2">📍 {location.address}</p>
                
                {location.vicinity && (
                  <p className="text-blue-600 text-sm mb-3">🗺️ {location.vicinity}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  {location.types.slice(0, 3).map((type, typeIndex) => (
                    <span
                      key={typeIndex}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-blue-100">
              <button
                onClick={() => openInGoogleMaps(location)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => getDirections(location)}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Directions
              </button>
            </div>
          </div>
        ))}
      </div>

      {locations.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => openInGoogleMaps()}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all results on Google Maps →
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-blue-700 text-sm">
          <Clock className="w-4 h-4" />
          <span className="font-medium">Pro Tip:</span>
        </div>
        <p className="text-blue-600 text-sm mt-1">
          Click "Directions" to get turn-by-turn navigation. Most locations are accessible by train or bus.
        </p>
      </div>
    </div>
  );
};

export default MapComponent;