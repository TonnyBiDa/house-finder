import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store';

export default function Home() {
  const dispatch = useDispatch();

  return (
    <Box className='flex-1 justify-center items-center px-4 bg-background'>
      <Text className='text-lg mb-6'>🎉 Welcome! You are logged in</Text>
      <Button size='lg' action='secondary' onPress={() => dispatch(logout())}>
        <Text>Logout</Text>
      </Button>
    </Box>
  );
}
