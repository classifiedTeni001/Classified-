# 🚀 TENI'S TOOL - APK BUILD GUIDE

Convert your React Native app to a working APK for Android devices!

## Prerequisites

### 1. Install Required Tools
```bash
# Node.js & npm (v16+)
node --version

# Expo CLI
npm install -g eas-cli expo-cli

# Java JDK 17+
java -version

# Android SDK (from Android Studio or SDK Manager)
```

### 2. Setup Android Environment
```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/Sdk  # macOS/Linux
# On Windows: set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\sdk

# Add to PATH
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
```

## Method 1: Build with Expo Application Services (EAS) - Recommended

### Step 1: Login to Expo
```bash
eas login
# Enter your Expo credentials
```

### Step 2: Initialize EAS
```bash
eas build:configure
```

### Step 3: Build APK
```bash
# Build for Android (creates .apk file)
eas build --platform android

# For preview APK (faster, for testing):
eas build --platform android --profile preview
```

### Step 4: Download & Install
- Wait for build to complete (~15-30 minutes)
- Download APK from EAS dashboard
- Transfer to Android device or emulator
- Tap to install

## Method 2: Local Build (Faster)

### Step 1: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 2: Build APK Locally
```bash
# Development APK
eas build --platform android --local

# Or using Gradle directly:
cd android
./gradlew assembleDebug
cd ..
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 3: Install on Device
```bash
# Using adb
adb install -r app-debug.apk

# Or via USB:
# 1. Enable Developer Mode on Android device
# 2. Connect via USB
# 3. adb install app-release.apk
```

## Method 3: Using Android Studio

1. Open project in Android Studio
2. File → Open → Select `android` folder
3. Build → Build Bundle(s) / APK(s) → Build APK(s)
4. APK generated in `android/app/build/outputs/apk/`

## Setup & Configuration

### Update App Details

**app.json** - Configure app metadata:
```json
{
  "expo": {
    "name": "Teni's Tool",
    "slug": "tenis-tool",
    "version": "1.0.0",
    "android": {
      "package": "com.classifiedteni.tenis",
      "versionCode": 1
    }
  }
}
```

### Environment Variables

Create `.env` file:
```
REPLICATE_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Testing on Emulator

### Android Emulator
```bash
# List available emulators
emulator -list-avds

# Launch emulator
emulator -avd PixelXL_API_34

# Build and run
npm run android
```

### Physical Device
1. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
2. Connect via USB
3. Run: `npm run android`

## Troubleshooting

### Build Fails
```bash
# Clean build
rm -rf node_modules
npm install

# Clear cache
eas build --platform android --local --clear-cache
```

### APK Won't Install
- Check device storage space
- Uninstall previous version: `adb uninstall com.classifiedteni.tenis`
- Ensure app version > installed version in app.json

### API Key Issues
- Add keys to `.env` file
- Ensure Replicate & Anthropic API keys are valid
- Check network permissions in AndroidManifest.xml

### Gradle Build Error
```bash
# Update Gradle
cd android
./gradlew wrapper --gradle-version 8.0
cd ..
```

## Signing for Release

### Generate Signing Key
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

### Build Release APK
```bash
# Using EAS
eas build --platform android --profile release

# Or locally
cd android
./gradlew assembleRelease
cd ..
```

## Distribution

### Google Play Store
1. Create Google Play Developer account ($25)
2. Create app listing
3. Upload signed APK:
   ```bash
   eas build --platform android --profile release
   ```
4. Configure store listing, screenshots, description
5. Submit for review

### Direct Distribution
1. Upload APK to GitHub Releases
2. Share download link
3. Users install via: `adb install app.apk`

## File Structure

```
.
├── app.json                 # Expo configuration
├── App.tsx                  # Entry point
├── package.json             # Dependencies
├── src/
│   └── TenisTool.tsx       # Main component
├── android/                # Android-specific files
│   ├── app/
│   │   └── build/
│   │       └── outputs/apk/  # Generated APKs
│   └── build.gradle
└── .env                    # Environment variables
```

## Key Files

| File | Purpose |
|------|---------|
| `app.json` | App metadata & Expo config |
| `package.json` | Dependencies & scripts |
| `App.tsx` | React Native entry point |
| `src/TenisTool.tsx` | Main UI component |
| `android/` | Android-specific code |

## Performance Tips

- Keep videos under 5 minutes
- Use 1080p for faster processing
- Enable HW acceleration in emulator settings
- Close other apps when building

## Support & Resources

- 📖 [Expo Documentation](https://docs.expo.dev)
- 🤖 [React Native Docs](https://reactnative.dev)
- 🐛 [EAS Troubleshooting](https://docs.expo.dev/build/troubleshooting/)
- 🎓 [Android Development Guide](https://developer.android.com/)

---

**Built with ❤️ by TENI**
Version: 1.0.0
Last Updated: 2026-05-31
