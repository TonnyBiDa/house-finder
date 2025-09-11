import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store';

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = () => {
    dispatch(login());
    router.replace('/home');
  };

  return (
    <Box className='flex-1 justify-center items-center px-4 bg-background-0'>
      <Text className='text-xl font-bold mb-6'>Login</Text>

      <Input className='w-4/5 mb-3'>
        <InputField placeholder='Username' />
      </Input>

      <Input className='w-4/5 mb-6'>
        <InputField placeholder='Password' type='password' />
      </Input>

      <Button variant='solid' size='lg' action='primary' className='w-4/5' onPress={handleLogin}>
        <ButtonText>Login</ButtonText>
      </Button>
    </Box>
  );
}
