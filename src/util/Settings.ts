// Settings key for persistence
const STORAGE_KEY = "rb3_save_cache_visualizer_settings";

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(
      "Could not read settings from local storage. Using defaults!",
      e,
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const saveSettings = (settings: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Could not save settings to local storage!", e);
  }
};

const Settings = {
  loadSettings,
  saveSettings,
};

export default Settings;
