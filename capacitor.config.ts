import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Android wrapper for «صلِّ على النبي».
 * The web bundle is fully offline; no server URL is required.
 */
const config: CapacitorConfig = {
  appId: "com.salli.alannabi",
  appName: "صلِّ على النبي",
  webDir: "dist",
  android: {
    backgroundColor: "#0e1420",
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
