import { type TextProps } from 'react-native';

type routeType = 'walk' | 'drive' | string;

type Props = TextProps & {
  routeType: routeType;
  distance: number;
  addressName: string;
  colorClass: string;
};

const iconMap: Record<routeType, any> = {
  walk: require('../assets/images/icons/walk.png'),
  drive: require('../assets/images/icons/drive.png'),
};

export function RouteCard({ routeType, distance, addressName, colorClass }: Props) {}
