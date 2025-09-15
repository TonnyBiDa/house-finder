import { Box } from '@/components/ui/box';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native';

function useDebounce(fn: Function, delay: number) {
  const timeoutRef = React.useRef<any>(null);
  const debounced = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );
  return debounced;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fetchPlaces = async (text: string) => {
    if (!text) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&components=country:nz&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const json = await res.json();
      setResults(json.predictions ?? []);
    } catch (err) {
      console.error('Google API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchPlaces = useDebounce(fetchPlaces, 300); // 300ms debounce

  const handleSearch = (text: string) => {
    setQuery(text);
    debouncedFetchPlaces(text);
  };

  const handleSelect = (item: any) => {
    // setQuery(item.description);
    router.push({
      pathname: '/overall',
      params: { address: item.description },
    });
    setResults([]);
  };

  return (
    <Box className='flex-1 justify-start items-center bg-background-0 px-4 pt-8'>
      <Text className='text-lg mb-6 text-center'>
        🎉 Welcome! Please enter your target address:
      </Text>

      <Box className='w-full'>
        <Input variant='outline' size='md' className='mb-2'>
          <InputField
            placeholder='Search'
            value={query}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
        </Input>

        <Box
          className='w-full'
          style={{
            maxHeight: 250,
          }}
        >
          {loading ? (
            <Text className='p-2'>Loading...</Text>
          ) : (
            <FlatList
              keyboardShouldPersistTaps='handled'
              data={results}
              keyExtractor={(item: any) => item.place_id}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleSelect(item)}>
                  <Box className='p-3 border-b border-border-200 bg-background-0'>
                    <Text>{item.description}</Text>
                  </Box>
                </Pressable>
              )}
              ListEmptyComponent={
                query ? (
                  <Box className='p-3'>
                    <Text>No results</Text>
                  </Box>
                ) : null
              }
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
