import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';

interface MaterialIconProps {
  name: string;
  color?: string;
  size?: number;
  style?: any;
}

export default function MaterialIcon({ name, color: propColor, size = 24, style }: MaterialIconProps) {
  const colors = useColors();
  const color = propColor ?? colors.onSurface;
  return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
}
