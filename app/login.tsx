import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import React from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store';

export default function Login() {
  const dispatch = useDispatch();

  return (
    <Box className='flex-1 justify-center items-center px-4 bg-background'>
      <Text className='text-xl font-bold mb-6'>Login</Text>

      <Input className='w-4/5 mb-3'>
        <InputField placeholder='Username' />
      </Input>

      <Input className='w-4/5 mb-6'>
        <InputField placeholder='Password' type='password' />
      </Input>

      <Button size='lg' className='w-4/5' action='primary' onPress={() => dispatch(login())}>
        <Text className='text-white'>Login</Text>
      </Button>
    </Box>
  );
}
