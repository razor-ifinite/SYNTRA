import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface SyntraLogoProps {
  onDark?: boolean;
}

export const SyntraLogo: React.FC<SyntraLogoProps> = ({ onDark = true }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/Group132_SYNTRA_Purple.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 48,
  }
});
