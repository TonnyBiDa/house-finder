import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-worklets';
import { Provider } from 'react-redux';
import { store } from '../store/index';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <GluestackUIProvider mode={colorScheme === 'dark' ? 'dark' : 'light'}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <SafeAreaView className='h-screen bg-background-0'>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='login' />
            <Stack.Screen name='(auth)' />
            <Stack.Screen name='+not-found' />
          </Stack>
        </SafeAreaView>
      </GluestackUIProvider>
    </Provider>
  );
}
