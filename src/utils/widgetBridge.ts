import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

const APP_GROUP_ID = 'group.com.starlight.app';
const WIDGET_KEY = 'widget_affirmation';

interface WidgetData {
  text: string;
  updatedAt: string;
}

export async function syncAffirmationToWidget(text: string): Promise<void> {
  try {
    const data: WidgetData = {
      text,
      updatedAt: new Date().toISOString(),
    };

    if (Platform.OS === 'ios') {
      await SharedGroupPreferences.setItem(WIDGET_KEY, data, APP_GROUP_ID);
      try {
        await (SharedGroupPreferences as any).reloadWidget();
      } catch {
        // reloadWidget may not be available in all versions; safe to ignore
      }
    } else if (Platform.OS === 'android') {
      await SharedGroupPreferences.setItem(WIDGET_KEY, data, APP_GROUP_ID);
    }
  } catch {
    // Widget sync is non-critical; swallow errors silently
  }
}
