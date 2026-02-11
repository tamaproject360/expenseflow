# Panduan Build APK ExpenseFlow

## Pilihan 1: Build dengan EAS (Recommended - Paling Mudah) ✅

### Langkah 1: Login ke Expo
```bash
eas login
```
- Jika belum punya akun, daftar gratis di expo.dev
- Masukkan email dan password Anda

### Langkah 2: Build APK
```bash
eas build --platform android --profile preview
```

Proses akan:
- ✅ Upload kode ke cloud Expo
- ✅ Build APK di server mereka (gratis)
- ✅ Berikan link download APK (sekitar 10-20 menit)

### Langkah 3: Download APK
Setelah build selesai, Anda akan dapat link download APK.
Atau cek di: https://expo.dev/accounts/[your-username]/projects/expenseflow/builds

---

## Pilihan 2: Build Lokal (Perlu Android Studio)

### Prerequisites
1. Install Android Studio
2. Install Android SDK (API Level 33+)
3. Install JDK 17+

### Langkah Build

#### 1. Generate Native Project
```bash
npx expo prebuild --platform android
```

#### 2. Masuk ke folder Android
```bash
cd android
```

#### 3. Build APK
```bash
./gradlew assembleRelease
```
Atau di Windows:
```bash
gradlew.bat assembleRelease
```

#### 4. Lokasi APK
Setelah selesai, APK akan ada di:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Pilihan 3: Development Build (Paling Cepat untuk Testing)

```bash
eas build --platform android --profile development
```

Ini akan membuat development APK yang bisa connect ke Expo dev server.

---

## Troubleshooting

### Error: Android SDK not found
1. Install Android Studio
2. Set ANDROID_HOME environment variable:
   ```bash
   # Windows
   set ANDROID_HOME=C:\Users\[USERNAME]\AppData\Local\Android\Sdk
   
   # Linux/Mac
   export ANDROID_HOME=$HOME/Android/Sdk
   ```

### Error: Java version mismatch
Install Java 17:
- Windows: https://adoptium.net/
- Mac: `brew install openjdk@17`

### Error: Gradle build failed
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

---

## Instalasi APK di Smartphone

1. Transfer APK ke smartphone (USB, Google Drive, dll)
2. Di smartphone, buka file APK
3. Izinkan instalasi dari "Unknown Sources" jika diminta
4. Install dan buka ExpenseFlow!

---

## Rekomendasi: Pakai EAS Build! 🚀

Cara paling mudah dan reliable adalah **Pilihan 1 (EAS Build)**:
1. Tidak perlu install Android Studio
2. Tidak perlu setup SDK/JDK
3. Build di cloud (gratis)
4. Hasil lebih stabil dan production-ready

Cukup jalankan:
```bash
eas login
eas build --platform android --profile preview
```

Tunggu 10-20 menit, download APK, done! ✅
