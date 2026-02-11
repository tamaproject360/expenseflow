# Build Troubleshooting Guide

This guide helps you resolve common issues when building ExpenseFlow for Android and iOS.

## Table of Contents
- [General Issues](#general-issues)
- [Android Build Issues](#android-build-issues)
- [iOS Build Issues](#ios-build-issues)
- [EAS Build Issues](#eas-build-issues)

---

## General Issues

### Issue: Node modules not found
**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Issue: Metro bundler cache issues
**Error**: Various bundling errors

**Solution**:
```bash
# Clear Metro cache
npx expo start -c

# Or manually
rm -rf .expo
rm -rf node_modules/.cache
```

### Issue: TypeScript errors
**Error**: Type errors during build

**Solution**:
```bash
# Run type checking
npm run typecheck

# Fix errors shown in output
# Then rebuild
```

---

## Android Build Issues

### Issue: Gradle build fails
**Error**: `FAILURE: Build failed with an exception`

**Solution**:
```bash
# Clean Gradle cache
cd android
./gradlew clean

# Try build again
./gradlew assembleRelease

# If still failing, clean Gradle daemon
./gradlew --stop
```

### Issue: Java version mismatch
**Error**: `Unsupported Java version` or `Android Gradle plugin requires Java 17`

**Solution**:
```bash
# Check Java version
java -version

# Should be Java 17 or higher
# Install Java 17 if needed:
# On macOS: brew install openjdk@17
# On Windows: Download from https://adoptium.net/

# Set JAVA_HOME
export JAVA_HOME=/path/to/java17
```

### Issue: SDK not found
**Error**: `SDK location not found`

**Solution**:
1. Create `android/local.properties`:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
# Windows: C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### Issue: Out of memory during build
**Error**: `OutOfMemoryError` or `Expiring Daemon because JVM heap space is exhausted`

**Solution**:
Create/edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

### Issue: Keystore errors
**Error**: `Keystore was tampered with, or password was incorrect`

**Solution**:
```bash
# Verify keystore
keytool -list -v -keystore expenseflow.keystore

# Re-generate if needed
keytool -genkeypair -v -storetype PKCS12 -keystore expenseflow.keystore -alias expenseflow -keyalg RSA -keysize 2048 -validity 10000
```

### Issue: APK/AAB location not found
**Solution**:
After successful build, files are located at:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## iOS Build Issues

### Issue: CocoaPods installation fails
**Error**: `pod install` fails

**Solution**:
```bash
# Update CocoaPods
sudo gem install cocoapods

# Clear CocoaPods cache
cd ios
rm -rf Pods
rm Podfile.lock
pod cache clean --all

# Reinstall
pod install
```

### Issue: Xcode version too old
**Error**: Requires Xcode 14.x or higher

**Solution**:
1. Update Xcode from App Store
2. Set Xcode command line tools:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### Issue: Signing certificate issues
**Error**: `No signing certificate found` or `Provisioning profile not found`

**Solution**:
1. Open Xcode
2. Go to Preferences → Accounts
3. Add your Apple ID
4. Download certificates
5. In your project: Select target → Signing & Capabilities
6. Enable "Automatically manage signing"
7. Select your Team

### Issue: Build fails with Swift errors
**Error**: Swift compilation errors

**Solution**:
```bash
# Clean build folder
cd ios
xcodebuild clean -workspace ExpenseFlow.xcworkspace -scheme ExpenseFlow

# Or in Xcode: Product → Clean Build Folder (Shift+Cmd+K)
```

### Issue: Module not found
**Error**: `Module 'xyz' not found`

**Solution**:
```bash
cd ios
pod deintegrate
pod install
```

### Issue: DerivedData corruption
**Solution**:
```bash
# Clear DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData

# Rebuild in Xcode
```

---

## EAS Build Issues

### Issue: Build fails on EAS Cloud
**Error**: Various build errors on cloud

**Solution**:
```bash
# Check build logs
eas build:list

# Run local build first to verify
eas build --platform android --profile preview --local

# Check eas.json configuration
cat eas.json
```

### Issue: Authentication errors
**Error**: `Authentication failed` or `Not logged in`

**Solution**:
```bash
# Logout and login again
eas logout
eas login

# Verify account
eas whoami
```

### Issue: Project not configured
**Error**: `Project not configured for EAS Build`

**Solution**:
```bash
# Reconfigure EAS
eas build:configure

# Link project
eas init
```

### Issue: Build timeout
**Error**: Build times out on cloud

**Solution**:
In `eas.json`, increase resource class:
```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-large"  // or m-xlarge
      }
    }
  }
}
```

### Issue: Credentials not found
**Error**: iOS credentials missing

**Solution**:
```bash
# Configure credentials
eas credentials

# Or let EAS manage automatically
eas build --platform ios --profile production
# Follow prompts to generate credentials
```

---

## Performance Tips

### Speed up Android builds
1. Enable Gradle daemon:
   ```properties
   # android/gradle.properties
   org.gradle.daemon=true
   org.gradle.parallel=true
   org.gradle.configureondemand=true
   ```

2. Use local Maven cache:
   ```bash
   ./gradlew build --build-cache
   ```

### Speed up iOS builds
1. Use incremental builds in Xcode
2. Disable unnecessary build phases
3. Use `.xcworkspace` instead of `.xcodeproj`

### Speed up EAS builds
1. Use build cache:
   ```json
   {
     "build": {
       "production": {
         "cache": {
           "key": "expenseflow-v1"
         }
       }
     }
   }
   ```

2. Use appropriate resource class (don't over-provision)

---

## Getting Help

If you're still stuck:

1. **Check Expo Forums**: https://forums.expo.dev
2. **Expo Discord**: https://chat.expo.dev
3. **GitHub Issues**: Create an issue in this repository
4. **Stack Overflow**: Tag with `expo`, `react-native`, `eas`

### Useful Commands for Debugging

```bash
# Check Expo CLI version
npx expo --version

# Check EAS CLI version
eas --version

# Doctor command (checks environment)
npx expo-doctor

# View build logs
eas build:view

# List all builds
eas build:list
```

---

**Last Updated**: February 11, 2025
