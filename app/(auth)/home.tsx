import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store';

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  return (
    <Box className='flex-1 justify-center items-center bg-background-0'>
      <Text className='text-lg mb-6'>🎉 Welcome! You are logged in</Text>
      <Button size='lg' action='secondary' onPress={handleLogout}>
        <ButtonText>Logout</ButtonText>
      </Button>
    </Box>
  );
}
