export const DEFAULT_SETTINGS = {
  addPrevToDescription: true,
  framesPerSection: 6,
  textsPerSection: 8,
  notificationTimeout: 6000,
  updateUsingLocalStyles: false,
  partialMatch: false,

  // stylers
  fillerPrefix: '',
  fillerSuffix: '',
  strokeerPrefix: '',
  strokeerSuffix: '-stroke',
  effecterPrefix: '',
  effecterSuffix: '',
  griderPrefix: '',
  griderSuffix: '',
  texterPrefix: '',
  texterSuffix: '',
};

const DEFAULT_SETTINGS_KEY = 'cachedSettings';

export async function loadSettingsAsync(defaultSettings, settingsKey = DEFAULT_SETTINGS_KEY) {
  const settings = (await figma.clientStorage.getAsync(settingsKey)) || defaultSettings;

  return Object.assign(defaultSettings, settings);
}

export async function saveSettingsAsync(settings, settingsKey = DEFAULT_SETTINGS_KEY) {
  await figma.clientStorage.setAsync(settingsKey, settings);
}
