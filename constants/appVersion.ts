import appConfig from '../app.json';

/**
 * The user-facing application version.
 *
 * Read from `app.json` — `expo.version` is the value that ships to the stores,
 * so it is the one worth showing. Not duplicated as a literal anywhere.
 *
 * `expo-constants` would be the usual way to reach this at runtime, but it is
 * not a dependency of this project and adding one for a single string is not
 * worth it. `resolveJsonModule` is enabled by expo/tsconfig.base, and Metro
 * bundles JSON natively.
 */
export const APP_VERSION: string = appConfig.expo.version;
