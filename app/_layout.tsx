// app/_layout.tsx
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import useAuth from './hooks/auth';
import { deleteToken, getToken } from './lib/auth';

const API_VALIDATE_URL = 'http://192.168.1.10:5000/api/auth/validate';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const {isAuthenticated, validateToken} = useAuth();  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const splashHiddenRef = useRef(false);

  useEffect(() => {
    if (fontsError) throw fontsError;
  }, [fontsError]);

 /*  const validateTokenWithApi = async (token: string | null) => {
    if (!token) return false;
    try {
      const res = await fetch(API_VALIDATE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      return res.ok;
    } catch (e) {
      console.warn('validateTokenWithApi error', e);
      
      return false;
    }
  }; */

  useEffect(() => {
    const fetchAuthStatus = async () => {
      const token = await getToken();
      if(token){
        const valid = await validateToken(token);
        if (!valid) await deleteToken();
        
      }
      
      setCheckingAuth(false);
    };
    fetchAuthStatus();
  }, []);
  
  /* useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getToken();
        const valid = await validateTokenWithApi(token);
        if(!valid) await deleteToken();
        console.log('Token valid:', valid);
        
        if (!mounted) return;
        setIsAuthed(Boolean(valid));
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []); */

  const tryHideSplash = useCallback(async () => {
    if (fontsLoaded && !checkingAuth && !splashHiddenRef.current) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Splash hide error', e);
      } finally {
        splashHiddenRef.current = true;
      }
    }
  }, [fontsLoaded, checkingAuth]);

  useEffect(() => {
    tryHideSplash();
  }, [tryHideSplash]);

  if (!fontsLoaded || checkingAuth) return null; // mantenemos splash

  return <RootLayoutNav isAuthed={isAuthenticated} />;
}

function RootLayoutNav({ isAuthed }: { isAuthed: boolean }) {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    if (isAuthed) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthed, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          
        </Stack>
      </View>
    </ThemeProvider>
  );
}
