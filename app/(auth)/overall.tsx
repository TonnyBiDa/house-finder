import { PinCard } from '@/components/PinCard';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
// @ts-ignore
import polyline from '@mapbox/polyline';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Place = {
  place_id: string;
  name: string;
  location: Coordinates;
  type?: string;
};

const typeToColor: Record<string, string> = {
  school: 'bg-success-500',
  hospital: 'bg-info-500',
  restaurant: 'bg-tertiary-500',
};

function PlaceMarker({
  place,
  colorClass = 'bg-success-500', // default pin color
}: {
  place: Place;
  colorClass?: string;
}) {
  const [tracksView, setTracksView] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracksView(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      coordinate={place.location}
      title={place.name}
      tracksViewChanges={tracksView}
      pinColor={colorClass}
    >
      {/* Optional custom marker view */}
      <Box className={`w-3 h-3 rounded-full border border-white ${colorClass}`} />
    </Marker>
  );
}

export default function Overall() {
  const mapRef = useRef<MapView>(null);
  const { address } = useLocalSearchParams<{ address: string }>();

  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [placesByType, setPlacesByType] = useState<Record<string, Place[]>>({});
  const [loading, setLoading] = useState(true);

  const [selectedPlaceType, setSelectedPlaceType] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Coordinates[][]>([]);

  // Fetch coordinates from Google Geocoding API
  const fetchCoordinates = async (addr: string) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          addr
        )}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const json = await res.json();
      const location = json.results?.[0]?.geometry?.location;
      if (location) {
        setCoords({
          latitude: location.lat,
          longitude: location.lng,
        });
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPlaces = async (location: Coordinates, type: string, radius: number) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&type=${type}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const json = await res.json();
      const results: Place[] = (json.results ?? []).map((r: any) => ({
        place_id: r.place_id,
        name: r.name,
        location: {
          latitude: r.geometry.location.lat,
          longitude: r.geometry.location.lng,
        },
        type,
      }));
      setPlacesByType((prev) => ({ ...prev, [type]: results }));
    } catch (err) {
      console.error(`Nearby ${type} error:`, err);
    }
  };

  const fetchRoutesForType = async (type: string) => {
    if (!coords) return;
    const places = placesByType[type] || [];
    const allRoutes: Coordinates[][] = [];

    for (const place of places) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${coords.latitude},${coords.longitude}&destination=${place.location.latitude},${place.location.longitude}&mode=walking&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const json = await res.json();
        const points = json.routes[0]?.overview_polyline?.points;
        if (points) {
          const decoded = polyline.decode(points).map(([lat, lng]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          }));
          allRoutes.push(decoded); // push each route separately
        }
      } catch (err) {
        console.error('Directions API error:', err);
      }
    }

    setRoutes(allRoutes);
  };

  const onPinCardPress = async (type: string) => {
    setSelectedPlaceType(type);
    await fetchRoutesForType(type);
  };

  useEffect(() => {
    if (address) fetchCoordinates(address);
  }, [address]);

  useEffect(() => {
    if (!coords) return;
    // Define types and radii dynamically
    const typesWithRadius: { type: string; radius: number }[] = [
      { type: 'school', radius: 1000 },
      { type: 'hospital', radius: 1000 },
      { type: 'restaurant', radius: 1000 },
    ];
    typesWithRadius.forEach(({ type, radius }) => fetchNearbyPlaces(coords, type, radius));
  }, [coords]);

  useEffect(() => {
    if (!coords || !mapRef.current || !selectedPlaceType) return;
    const places = placesByType[selectedPlaceType] || [];
    const coordinates = [
      { latitude: coords.latitude, longitude: coords.longitude },
      ...places.map((p) => p.location),
    ];
    if (coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }
  }, [selectedPlaceType, coords, placesByType]);

  return (
    <Box className='h-screen bg-background-0'>
      <Box className='h-[40vh]'>
        {loading ? (
          <Box className='flex-1 justify-center items-center gap-4 p-3 rounded-md bg-background-100'>
            <Box className='flex-[0.8] w-full'>
              <Skeleton variant='sharp' className='flex-1 w-full' />
            </Box>
            <SkeletonText _lines={3} className='h-2' />
          </Box>
        ) : coords ? (
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker coordinate={coords} title={address} pinColor='blue' tracksViewChanges={false} />

            {Object.entries(placesByType).map(([type, places]) => {
              if (selectedPlaceType && selectedPlaceType !== type) return null;
              const colorClass = typeToColor[type] || 'bg-gray-500';
              return places.map((p) => (
                <PlaceMarker key={p.place_id} place={p} colorClass={colorClass} />
              ));
            })}
            {routes.map((route, index) => (
              <Polyline key={index} coordinates={route} strokeWidth={3} strokeColor='blue' />
            ))}
          </MapView>
        ) : (
          <Box className='flex-1 justify-center items-center'>
            <Text>Unable to load map</Text>
          </Box>
        )}
      </Box>

      <Box className='h-[60vh] p-4'>
        <Text className='mb-2'>{address}</Text>
        <Box className='flex flex-row flex-wrap gap-2'>
          {Object.entries(placesByType).map(([type, places]) => (
            <Pressable key={type} onPress={() => onPinCardPress(type)}>
              <PinCard pinType={type} colorClass={typeToColor[type]} number={places.length} />
            </Pressable>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
