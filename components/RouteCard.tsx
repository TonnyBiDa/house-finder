import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { type TextProps } from 'react-native';
import { Box } from './ui/box';
type routeType = 'walk' | 'drive' | string;

type Props = TextProps & {
  routeType: routeType;
  distance: string;
  addressName: string;
  color: string;
  costTime: string;
};

const iconMap: Record<routeType, any> = {
  walk: require('../assets/images/icons/walk.png'),
  drive: require('../assets/images/icons/drive.png'),
};

export function RouteCard({ routeType, distance, addressName, color, costTime }: Props) {
  return (
    <Card size='sm' variant='elevated' className='border-4 rounded-xl border-sky-500 max-w-[100vw]'>
      <Box className='flex flex-row items-center gap-2 flex-wrap'>
        <Avatar size='sm'>
          <AvatarFallbackText>{routeType}</AvatarFallbackText>
          <AvatarImage source={iconMap[routeType]} />
        </Avatar>

        <Text className='flex-shrink flex-grow break-words'>
          {addressName.charAt(0).toUpperCase() + addressName.slice(1)}
        </Text>

        <Box
          className='px-2 py-1 rounded-full items-center justify-center'
          style={{ backgroundColor: color }}
        >
          <Text className='text-xs font-bold'>
            {distance} • {costTime}
          </Text>
        </Box>
      </Box>
    </Card>
  );
}
