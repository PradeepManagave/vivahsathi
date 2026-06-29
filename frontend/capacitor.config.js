const FLAVOR = process.env.FLAVOR || 'user';

const FLAVOR_CONFIGS = {
  user: {
    appId: 'com.mplus.matrimony.user',
    appName: 'M-Plus Matrimony',
    baseUrl: 'https://app.mplusmatrimony.com',
  },
  admin: {
    appId: 'com.mplus.matrimony.admin',
    appName: 'M-Plus Admin',
    baseUrl: 'https://admin.mplusmatrimony.com',
  },
  centre: {
    appId: 'com.mplus.matrimony.centre',
    appName: 'M-Plus Centre',
    baseUrl: 'https://centre.mplusmatrimony.com',
  },
  vendor: {
    appId: 'com.mplus.matrimony.vendor',
    appName: 'M-Plus Vendor',
    baseUrl: 'https://vendor.mplusmatrimony.com',
  },
};

const flavor = FLAVOR_CONFIGS[FLAVOR] || FLAVOR_CONFIGS.user;

const config = {
  appId: flavor.appId,
  appName: flavor.appName,
  webDir: 'out',
  server: {
    url: flavor.baseUrl,
    cleartext: false,
    hostname: new URL(flavor.baseUrl).hostname,
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystorePath: process.env.KEYSTORE_PATH || undefined,
      keystorePassword: process.env.KEYSTORE_PASSWORD || undefined,
      keystoreAlias: process.env.KEYSTORE_ALIAS || undefined,
      keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASSWORD || undefined,
      releaseType: process.env.RELEASE_TYPE || 'AAB',
    },
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
  bundledWebRuntime: false,
};

module.exports = config;
