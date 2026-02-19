# Starlight Home Screen Widget — Setup Guide

## Overview

The Starlight widget shows the daily affirmation on the home screen without requiring the user to open the app. It is gated behind a Pro subscription (`hasAccess`). The JS→native data bridge uses `react-native-shared-group-preferences`, which writes JSON to:

- **iOS**: App Group NSUserDefaults (`group.com.starlight.app`)
- **Android**: `SharedPreferences` (key: `widget_affirmation`)

---

## iOS Setup (Xcode)

### 1. Add the App Group capability

You must add the App Group to **both** the main app target and the widget extension target.

1. Open `ios/Starlight.xcworkspace` in Xcode.
2. Select the **Starlight** project in the navigator.
3. Select the **Starlight** target → **Signing & Capabilities** tab.
4. Click **+ Capability** → choose **App Groups**.
5. Add the group ID: `group.com.starlight.app`
6. Repeat steps 3–5 for the **StarlightWidget** extension target (created below).

### 2. Create the WidgetKit Extension target

1. In Xcode, choose **File → New → Target**.
2. Select **Widget Extension** under the iOS section.
3. Set the **Product Name** to `StarlightWidget`.
4. Uncheck "Include Configuration Intent" (we use a static widget).
5. Click **Finish**.
6. When prompted to activate the scheme, click **Activate**.

### 3. Add the Swift source files

The three files in `ios/StarlightWidget/` are:
- `StarlightWidgetBundle.swift` — `@main` entry point
- `StarlightWidget.swift` — timeline provider, entry view, widget struct

Either:
- Drag them from Finder into the `StarlightWidget` group in Xcode, ensuring the **StarlightWidget** target membership is checked, **or**
- Delete the auto-generated placeholder files Xcode created and copy these in.

### 4. Configure the App Group for the extension

1. Select the **StarlightWidget** target.
2. **Signing & Capabilities → App Groups** → add `group.com.starlight.app`.

### 5. Pod install

```bash
npx pod-install
# or
cd ios && pod install
```

`react-native-shared-group-preferences` auto-links via CocoaPods.

### 6. Test on simulator / device

- Build and run the main app target first (`expo run:ios`).
- In the widget customization screen, tap **Save** to push the affirmation to the App Group.
- Long-press the home screen → tap **+** → search "Starlight" → **Add Widget**.
- The widget should display the affirmation. If it shows the fallback text, the App Group ID may not match — double-check both targets have the same group ID.

---

## Android Setup

No extra Xcode-style steps are required. The widget is registered via:
- `AndroidManifest.xml` — `<receiver>` block for `StarlightWidgetProvider`
- `res/xml/starlight_widget_info.xml` — widget metadata
- `res/layout/starlight_widget.xml` — widget layout
- `res/drawable/widget_background.xml` — dark rounded background

### Build and test

```bash
expo run:android
```

To add the widget:
1. Long-press the home screen.
2. Tap **Widgets**.
3. Find **Starlight** and drag it to the home screen.

The widget text refreshes at most every 24 hours (Android OS restriction for `updatePeriodMillis`). Tapping **Save** in the app pushes the new affirmation to SharedPreferences; the next scheduled update will pick it up.

---

## Data Flow

```
JS: syncAffirmationToWidget(text)
  → react-native-shared-group-preferences
    → iOS: NSUserDefaults(suiteName: "group.com.starlight.app")["widget_affirmation"] = { text, updatedAt }
           + WidgetKit reload signal
    → Android: SharedPreferences("widget_affirmation")["widget_affirmation"] = { text, updatedAt }

Native widget reads from same storage on next refresh
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| iOS widget shows fallback text | Verify App Group ID matches in both targets and in `widgetBridge.ts` |
| iOS widget never updates | Confirm the widget extension has the App Group capability |
| Android widget shows fallback | Check `StarlightWidgetProvider` reads the correct SharedPreferences file name |
| `setItem` throws at runtime | Run `pod install` after installing `react-native-shared-group-preferences` |
