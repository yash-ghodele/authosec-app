export default {
  expo: {
    name: "AuthoSec",
    slug: "authosec-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/ChatGPT Image Nov 14, 2025, 01_39_54 PM.png",
    scheme: "authosec",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/ChatGPT Image Nov 14, 2025, 01_39_54 PM.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
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
        "expo-camera",
        {
          "cameraPermission": "Allow AuthoSec to access your camera to scan QR codes for secure transactions."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "4c762ba2-af57-4319-ad4c-2da80dedbac6"
      }
    }
  }
};
