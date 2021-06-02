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

/* 
Inspired by Yuan Qing Lim
https://github.com/yuanqing/create-figma-plugin/blob/03a26abc76a2ea2fe7a3b33aa9ef53cb54bd52a7/packages/utilities/src/settings.ts#L10
 */

const DEFAULT_SETTINGS_KEY = 'cachedSettings';

export async function loadSettingsAsync(defaultSettings, settingsKey = DEFAULT_SETTINGS_KEY) {
  const settings = (await figma.clientStorage.getAsync(settingsKey)) || defaultSettings;

  return Object.assign(defaultSettings, settings);
}

export async function saveSettingsAsync(settings, settingsKey = DEFAULT_SETTINGS_KEY) {
  await figma.clientStorage.setAsync(settingsKey, settings);
}
