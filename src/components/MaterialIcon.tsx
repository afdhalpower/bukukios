import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface MaterialIconProps {
  name: string;
  color?: string;
  size?: number;
  style?: any;
}

export default function MaterialIcon({ name, color = colors.onSurface, size = 24, style }: MaterialIconProps) {
  return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
}
