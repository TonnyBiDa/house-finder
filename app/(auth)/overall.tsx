import { Box } from '@/components/ui/box';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { PinCard } from '@/components/PinCard';
import { RouteCard } from '@/components/RouteCard';
import { Button, ButtonIcon } from '@/components/ui/button';
import { ArrowLeftIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
// @ts-ignore
import polyline from '@mapbox/polyline';
import { ScrollView } from 'react-native';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Route = {
  coordinates: Coordinates[];
  color: string;
  placeName: string;
  distance: string;
  costTime: string;
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
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <Box className={`w-3 h-3 rounded-full border border-white ${colorClass}`} />
    </Marker>
  );
}

export default function Overall() {
  const mapRef = useRef<MapView>(null);
  const { address } = useLocalSearchParams<{ address: string }>();

  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [placesByType, setPlacesByType] = useState<Record<string, Place[]>>({});
  const [coordinateLoading, setCoordinateLoading] = useState(true);
  const [showDetails, setShowDetails] = useState('false');

  const [selectedPlaceType, setSelectedPlaceType] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);

  const getRandomRgba = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = 0.7; // semi-transparent
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

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
      setCoordinateLoading(false);
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
    const allRoutes: Route[] = [];

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

          const leg = json.routes[0]?.legs?.[0];
          const distance = leg?.distance?.text ?? 'N/A';
          const duration = leg?.duration?.text ?? 'N/A';

          allRoutes.push({
            coordinates: decoded,
            color: getRandomRgba(),
            placeName: place.name,
            distance,
            costTime: duration,
          });
        }
      } catch (err) {
        console.error('Directions API error:', err);
      }
    }

    setRoutes(allRoutes);
  };

  const onPinCardPress = async (type: string) => {
    setShowDetails('loading');
    setSelectedPlaceType(type);
    await fetchRoutesForType(type);
    setShowDetails('show');
  };

  const backToOverall = () => {
    setShowDetails('hide');
    setSelectedPlaceType(null);
    setRoutes([]);
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
        {coordinateLoading ? (
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
              <Polyline
                key={index}
                coordinates={route.coordinates}
                strokeWidth={3}
                strokeColor={route.color}
              />
            ))}
          </MapView>
        ) : (
          <Box className='flex-1 justify-center items-center'>
            <Text>Unable to load map</Text>
          </Box>
        )}
      </Box>

      <Box className='h-[60vh] p-4'>
        <Box className='flex flex-row items-center gap-2 mb-2'>
          {showDetails === 'show' && (
            <Button size='md' className='p-3' onPress={() => backToOverall()}>
              <ButtonIcon as={ArrowLeftIcon} />
            </Button>
          )}
          <Text className='flex-shrink flex-grow break-words'>{address}</Text>
        </Box>

        {showDetails === 'loading' ? (
          <Box className='flex-1 justify-center items-center'>
            <Spinner size='large' />
          </Box>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 45 }} // give space for last item
            showsVerticalScrollIndicator={true}
          >
            <Box className='flex flex-row flex-wrap gap-2'>
              {showDetails === 'show'
                ? routes.map((route, index) => (
                    <RouteCard
                      key={index}
                      routeType='walk'
                      distance={route.distance}
                      addressName={route.placeName}
                      color={route.color}
                      costTime={route.costTime}
                    />
                  ))
                : Object.entries(placesByType).map(([type, places]) => (
                    <Pressable key={type} onPress={() => onPinCardPress(type)}>
                      <PinCard
                        pinType={type}
                        colorClass={typeToColor[type]}
                        number={places.length}
                      />
                    </Pressable>
                  ))}
            </Box>
          </ScrollView>
        )}
      </Box>
    </Box>
  );
}
