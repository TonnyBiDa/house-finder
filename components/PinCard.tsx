import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Grid, GridItem } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { type TextProps } from 'react-native';

type PinType = 'school' | 'hospital' | 'park';

type Props = TextProps & {
  pinType: PinType;
  number: number;
};

const iconMap: Record<PinType, any> = {
  school: require('../assets/images/icons/school.png'),
  hospital: require('../assets/images/icons/hospital.png'),
  park: require('../assets/images/icons/park.png'),
};

export function PinCard({ pinType, number }: Props) {
  return (
    <Card size='md' variant='elevated' className='m-3'>
      <Grid
        className='gap-4'
        _extra={{
          className: 'grid-cols-12',
        }}
      >
        <GridItem
          className=' p-3 rounded-md text-center'
          _extra={{
            className: 'col-span-4',
          }}
        >
          <Avatar size='md'>
            <AvatarFallbackText>{pinType}</AvatarFallbackText>
            <AvatarImage source={iconMap[pinType]} />
            <AvatarBadge />
          </Avatar>
        </GridItem>
        <GridItem
          className=' p-3 rounded-md text-center'
          _extra={{
            className: 'col-span-6',
          }}
        >
          <Text>{pinType}</Text>
        </GridItem>
        <GridItem
          className=' p-3 rounded-md text-center'
          _extra={{
            className: 'col-span-3',
          }}
        >
          <Text>{number}</Text>
        </GridItem>
      </Grid>
    </Card>
  );
}
