import React from 'react';
import { Text } from 'react-native';
import { SYNTRA_THEME } from '../../constants/Theme';

interface SyntraLogoProps {
  onDark?: boolean;
}

export const SyntraLogo: React.FC<SyntraLogoProps> = ({ onDark = true }) => {
  return (
    <Text
      style={{
        fontFamily: 'DMSans_700Bold',
        fontSize: 36,
        letterSpacing: 4,
        color: onDark ? SYNTRA_THEME.colors.primary : SYNTRA_THEME.colors.white,
      }}
    >
      SYNTRA.
    </Text>
  );
};
