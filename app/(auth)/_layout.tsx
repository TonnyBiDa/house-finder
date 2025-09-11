import { Redirect, Slot } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function AuthLayout() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href='/login' />;
  }

  return <Slot />;
}
