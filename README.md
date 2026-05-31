# ✨ TENI'S TOOL - AI Anime & Video Generator

> Convert your React code to a fully functional Android APK!

![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![Platform](https://img.shields.io/badge/platform-Android-blue)
![React Native](https://img.shields.io/badge/react--native-0.73-61dafb)
![Expo](https://img.shields.io/badge/expo-51.0-black)

## 🎬 Features

✅ **5-Minute Video Generation** - Create long-form video content  
✅ **Project Saving** - Save and manage all your creations  
✅ **HD Download** - Download in 720p, 1080p, 2K, and 4K quality  
✅ **AI-Powered** - Powered by Claude AI and Replicate APIs  
✅ **Multiple Styles** - Anime, Realistic, 2D, 3D, Motion graphics  
✅ **Mobile First** - Optimized for Android and iOS  
✅ **Offline Support** - Projects saved locally on device  

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn
- Java JDK 17+
- Android SDK (optional, for local building)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/classifiedTeni001/Classified-.git
cd Classified-

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Run on Android emulator/device
npm run android
```

## 📱 Building APK

### Option 1: EAS Build (Recommended - Easiest)

```bash
# Login to Expo
npm install -g eas-cli
eas login

# Build APK
eas build --platform android

# Download from EAS dashboard and install
```

### Option 2: Local Build (Faster)

```bash
# Build locally
eas build --platform android --local

# APK will be in: android/app/build/outputs/apk/debug/
```

### Option 3: Android Studio

1. Open `android` folder in Android Studio
2. Build → Build Bundle(s) / APK(s)
3. APK generated in `android/app/build/outputs/apk/`

**For detailed instructions, see [APK_BUILD_GUIDE.md](./APK_BUILD_GUIDE.md)**

## 📁 Project Structure

```
.
├── App.tsx                 # React Native entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── eas.json              # EAS build config
├── APK_BUILD_GUIDE.md    # Detailed build instructions
├── src/
│   └── TenisTool.tsx     # Main component
├── android/              # Android native code
├── ios/                  # iOS native code
└── assets/              # Images, fonts, etc
```

## 🎨 Configuration

### API Keys

Create `.env` file in root:

```
REPLICATE_API_KEY=sk_...
ANTHROPIC_API_KEY=sk-...
```

Get keys from:
- [Replicate](https://replicate.com/api)
- [Anthropic](https://console.anthropic.com/)

### App Settings

Edit `app.json`:

```json
{
  "expo": {
    "name": "Teni's Tool",
    "version": "1.0.0",
    "android": {
      "package": "com.classifiedteni.tenis"
    }
  }
}
```

## 🎯 Usage

### Generate Video

1. **Enter API Key** - Add your Replicate API key
2. **Choose Style** - Pick Anime, Realistic, 2D, 3D, or Motion
3. **Select Mood** - Epic, Peaceful, Dark, Romantic, Action, etc.
4. **Write Prompt** - Describe what you want to see
5. **Enhance** - Let Claude AI enhance your prompt
6. **Generate** - Click Generate and wait (2-5 min for 30s video)
7. **Download** - Save in 720p, 1080p, 2K, or 4K
8. **Save Project** - Keep it for later

### Manage Projects

- **View Projects** - All saved videos with thumbnails
- **Download Anytime** - Re-download in any quality
- **Track History** - See all generations
- **Clear All** - Delete unwanted projects

## 🔧 Available Scripts

```bash
# Development
npm start              # Start Expo dev server
npm run android        # Run on Android device/emulator
npm run ios           # Run on iOS (requires macOS)
npm run web           # Run in web browser

# Building
npm run build          # Build with EAS
npm run build:android  # Build APK specifically
npm run build:apk      # Local APK build
npm run preview        # Preview build

# Debugging
npm run logs           # View device logs
npm run clean          # Clean build files
```

## ⚙️ Customization

### Modify Styles

Edit `src/TenisTool.tsx`:

```typescript
const STYLE_CONFIG = {
  anime: { 
    label: "Anime", 
    substyles: ["Shonen", "Shojo", ...],
    // Add your custom styles
  }
}
```

### Add Background Elements

```typescript
const BG_ELEMENTS = [
  {id: "birds flying gracefully", e: "🐦", l: "Birds"},
  // Add more elements
];
```

### Change Colors

Update color values in styles:

```typescript
// Primary pink
#ff6eb4

// Secondary purple
#c084fc

// Accent blue
#38bdf8
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear everything
rm -rf node_modules .expo
npm install

# Try again
npm run build:android
```

### APK Won't Install

```bash
# Check version
# Edit app.json and increment versionCode

# Uninstall previous
adb uninstall com.classifiedteni.tenis

# Try again
adb install app-release.apk
```

### API Key Errors

- Verify keys are valid
- Check internet connection
- Ensure .env file exists in root
- Restart dev server

### Slow Build

- Use EAS with larger cache
- Close other apps
- Ensure SSD (not HDD)
- Check RAM (8GB+ recommended)

### Video Generation Times Out

- Reduce duration
- Lower quality setting
- Check Replicate API status
- Try again later

## 📊 Performance

| Setting | Time | Size |
|---------|------|------|
| 6s @ 720p | ~2 min | 50MB |
| 30s @ 1080p | ~5 min | 200MB |
| 1min @ 2K | ~10 min | 600MB |
| 5min @ 4K | ~20 min | 2GB+ |

## 🔐 Security

- ✅ API keys stored locally only
- ✅ No cloud storage of videos
- ✅ AsyncStorage encryption ready
- ✅ HTTPS for all API calls
- ✅ Permissions requested properly

## 📦 Distribution

### Google Play Store

1. Create developer account ($25)
2. Generate release APK: `eas build --platform android --profile release`
3. Upload to Play Store
4. Configure store listing
5. Submit for review (~2-24 hours)

### Direct Share

1. Upload APK to GitHub Releases
2. Share download link
3. Users: Settings → Security → Unknown Apps → Enable
4. Download and tap to install

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🙏 Credits

Built with:
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Claude AI](https://anthropic.com/)
- [Replicate](https://replicate.com/)

## 📞 Support

- 📖 [Expo Docs](https://docs.expo.dev)
- 🐛 [Report Issues](https://github.com/classifiedTeni001/Classified-/issues)
- 💬 [Discussions](https://github.com/classifiedTeni001/Classified-/discussions)
- 🎓 [APK Build Guide](./APK_BUILD_GUIDE.md)

## 🎉 What's Next?

- [ ] iOS Support
- [ ] Web Version
- [ ] Video Editing
- [ ] Real-time Preview
- [ ] Community Gallery
- [ ] Advanced Effects

---

**Made with ❤️ by TENI**

Star ⭐ if you found this helpful!

v1.0.0 - Released 2026-05-31
