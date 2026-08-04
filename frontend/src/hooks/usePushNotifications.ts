import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiPost, SERVICES } from '../api/client';

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (user: any, token: string | null): PushNotificationState => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: true,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification');
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
    } else {
      console.warn('Must be using a physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
      });
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      
      // If we have a logged in user and a valid push token, send it to the backend
      if (user && user.id && token) {
        apiPost(SERVICES.notification, '/api/notifications/push-token', {
          userId: user.id,
          expoPushToken: token.data
        }).catch(err => console.warn("Failed to save push token to backend:", err));
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification Response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user, token]);

  return { expoPushToken, notification };
};
