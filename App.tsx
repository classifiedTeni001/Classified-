import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import TenisTool from './src/TenisTool';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Orbitron': require('./assets/fonts/Orbitron-Regular.ttf'),
    'OrbBold': require('./assets/fonts/Orbitron-Bold.ttf'),
    'Rajdhani': require('./assets/fonts/Rajdhani-Regular.ttf'),
    'RajBold': require('./assets/fonts/Rajdhani-Bold.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'web' ? (
        <TenisTool />
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <TenisTool />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a06',
  },
  scroll: {
    flex: 1,
  },
});
