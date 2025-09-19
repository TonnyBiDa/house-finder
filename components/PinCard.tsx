import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { type TextProps } from 'react-native';
import { Box } from './ui/box';

type PinType = 'school' | 'hospital' | 'park' | 'restaurant' | string;

type Props = TextProps & {
  pinType: PinType;
  number: number;
  colorClass: string;
};

const iconMap: Record<PinType, any> = {
  school: require('../assets/images/icons/school.png'),
  hospital: require('../assets/images/icons/hospital.png'),
  park: require('../assets/images/icons/park.png'),
  restaurant: require('../assets/images/icons/restaurant.png'),
};

export function PinCard({ pinType, number, colorClass }: Props) {
  return (
    <Card
      size='md'
      variant='elevated'
      className='border-4 rounded-xl border-sky-500 inline-flex w-auto max-w-max'
    >
      <Box className='flex flex-row items-center gap-2'>
        <Avatar size='sm'>
          <AvatarFallbackText>{pinType}</AvatarFallbackText>
          <AvatarImage source={iconMap[pinType]} />
        </Avatar>

        <Text>{pinType.charAt(0).toUpperCase() + pinType.slice(1)}</Text>

        <Box className={`px-2 py-1 rounded-full items-center justify-center ${colorClass}`}>
          <Text className='text-xs font-bold'>{number}</Text>
        </Box>
      </Box>
    </Card>
  );
}
