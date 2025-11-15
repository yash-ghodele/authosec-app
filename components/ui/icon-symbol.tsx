// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'house': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'arrow.left.arrow.right': 'swap-horiz',
  'bell.fill': 'notifications',
  'bell': 'notifications-none',
  'person.fill': 'account-circle',
  'person': 'account-circle',
  'clock.fill': 'schedule',
  'clock': 'schedule',
  'checkmark.circle.fill': 'check-circle',
  'checkmark.circle': 'check-circle-outline',
  'qrcode': 'qr-code',
  'qrcode.viewfinder': 'qr-code-scanner',
  'camera.fill': 'camera-alt',
  'camera': 'camera-alt',
  'arrow.up.circle.fill': 'arrow-circle-up',
  'arrow.down.circle.fill': 'arrow-circle-down',
  'magnifyingglass': 'search',
  'plus.circle.fill': 'add-circle',
  'xmark.circle.fill': 'cancel',
  'minus.circle.fill': 'remove-circle',
  'exclamationmark.triangle.fill': 'warning',
  'exclamationmark.triangle': 'warning-outline',
  'tray': 'inbox',
  'tray.fill': 'inbox',
  'bell.slash': 'notifications-off',
  'bell.slash.fill': 'notifications-off',
  'indianrupeesign.circle.fill': 'currency-rupee',
  'calendar': 'calendar-today',
  'lock.fill': 'lock',
  'lock': 'lock-outline',
  'shield.fill': 'security',
  'shield': 'security',
  'questionmark.circle.fill': 'help',
  'info.circle.fill': 'info',
  'gearshape.fill': 'settings',
  'moon.fill': 'dark-mode',
  'globe': 'language',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
