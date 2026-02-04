import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationTime, Category } from '../types';
import { getRandomAffirmation } from '../data/affirmations';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('starlight', {
      name: 'Daily Affirmations',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 100],
      lightColor: '#FFC850',
    });
  }

  return true;
}

export async function scheduleNotifications(
  times: NotificationTime[],
  categories: Category[]
): Promise<void> {
  // Cancel all existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const enabledTimes = times.filter((t) => t.enabled);

  for (const time of enabledTimes) {
    const affirmation = getRandomAffirmation(categories);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✨ Starlight',
        body: affirmation.text,
        data: { affirmationId: affirmation.id },
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    });
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
