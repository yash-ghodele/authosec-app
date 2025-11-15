import 'dotenv/config';

export default {
  expo: {
    name: "authosec-app",
    slug: "authosec-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/ChatGPT Image Nov 14, 2025, 01_39_54 PM.png",
    scheme: "authosec",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.authosec.app",
      infoPlist: {
        NSCameraUsageDescription: "AuthoSec needs access to your camera to scan QR codes for secure transactions."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/ChatGPT Image Nov 14, 2025, 01_39_54 PM.png",
        backgroundColor: "#ffffff"
      },
      package: "com.authosec.app",
      permissions: ["CAMERA"]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/ChatGPT Image Nov 14, 2025, 01_39_54 PM.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow AuthoSec to access your camera to scan QR codes."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
      eas: {
        projectId: "4c762ba2-af57-4319-ad4c-2da80dedbac6"
      }
    }
  }
};
