import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { Redirect, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from '../store/index';

const AuthGate = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href='/login' />;
  }

  return <Slot />;
};

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
        <AuthGate />
      </GluestackUIProvider>
    </Provider>
  );
}
