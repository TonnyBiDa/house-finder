import { Box } from '@/components/ui/box';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type School = {
  place_id: string;
  name: string;
  location: Coordinates;
};

function SchoolMarker({ school }: { school: School }) {
  const [tracksView, setTracksView] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracksView(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker coordinate={school.location} title={school.name} tracksViewChanges={tracksView}>
      <Box className='w-3 h-3 rounded-full bg-green-500 border border-white' />
    </Marker>
  );
}

export default function Overall() {
  const { address } = useLocalSearchParams<{ address: string }>();

  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchNearbySchools = async (location: Coordinates) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=1000&type=school&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const json = await res.json();
      const results: School[] = (json.results ?? []).map((r: any) => ({
        place_id: r.place_id,
        name: r.name,
        location: {
          latitude: r.geometry.location.lat,
          longitude: r.geometry.location.lng,
        },
      }));
      console.log(results);
      setSchools(results);
    } catch (err) {
      console.error('Nearby schools error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) fetchCoordinates(address);
  }, [address]);

  useEffect(() => {
    if (coords) {
      fetchNearbySchools(coords);
    }
  }, [coords]);

  if (loading) {
    return (
      <Box className='flex-1 justify-center items-center bg-background-0'>
        <ActivityIndicator size='large' />
      </Box>
    );
  }

  return (
    <Box className='flex-1 bg-background-0'>
      <Box className='flex-1'>
        {loading ? (
          <Box className='flex-1 justify-center items-center gap-4 p-3 rounded-md bg-background-100'>
            <Box className='flex-[0.8] w-full'>
              <Skeleton variant='sharp' className='flex-1 w-full' />
            </Box>
            <SkeletonText _lines={3} className='h-2' />
          </Box>
        ) : coords ? (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker coordinate={coords} title={address} pinColor='blue' tracksViewChanges={false} />

            {schools.map((school) => (
              <SchoolMarker key={school.place_id} school={school} />
            ))}
          </MapView>
        ) : (
          <Box className='flex-1 justify-center items-center'>
            <Text>Unable to load map</Text>
          </Box>
        )}
      </Box>

      <Box className='flex-1 justify-center items-center p-4'>
        <Text className='text-lg text-center'>{address}</Text>
      </Box>
    </Box>
  );
}
