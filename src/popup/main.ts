// src/popup/main.ts

const KEY_ENABLED = 'isEnabled';
const KEY_SETTINGS = 'gemSettings';
const KEY_LANG = 'appLanguage';
const KEY_FONTSIZE = 'gemFontSize';
const KEY_BGMODE = 'gemBgMode';

const EXPORT_KEYS = [KEY_ENABLED, KEY_SETTINGS, KEY_LANG, KEY_FONTSIZE, KEY_BGMODE];

interface GemSetting {
  name: string;
  image: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    appName: 'GemAvatar',
    statusOn: 'Status: ON',
    statusOff: 'Status: OFF',
    labelTarget: '1. Target Gem Name:',
    placeholderTarget: 'Please enter the target Gem name here.',
    labelImage: '2. Select Icon Image:',
    btnAdd: 'Add Gem Settings',
    labelList: 'Registered Gems:',
    settingsTitle: 'Settings',
    langLabel: 'Language',
    designLabel: 'Design',
    fontSizeLabel: 'Font Size',
    bgLabel: 'Background',
    bgLight: 'Light',
    bgDark: 'Dark',
    bgBlue: 'Blue',
    bgBlack: 'Black',
    storageLabel: 'Storage',
    storageInfo: 'Export, import, or reset your settings.',
    exportBtn: 'Export',
    importBtn: 'Import',
    resetBtn: 'Reset',
    confirmReset: 'Are you sure you want to reset all settings? This cannot be undone.',
    importLabel: 'Import Settings',
    exportLabel: 'Export Settings',
    resetLabel: 'Reset Settings',
    resetDesc: 'Restore settings to defaults.',
    clearLabel: 'Clear Storage',
    clearDesc: 'Delete all data permanently.',
    clearBtn: 'Clear',
    confirmClear: 'Are you sure you want to clear all storage? All data will be deleted and this cannot be undone.',
    storageCurrent: 'Current',
    storageTotal: 'Total',
    storageSettingsSize: 'Settings',
    storageOther: 'Other',
    importSuccess: 'Settings imported successfully.',
    importFailed: 'Failed to import settings.',
    btnChooseFile: 'Choose File',
    noFileChosen: 'No file chosen',
    otherLabel: 'Others / Contact',
    linkBugTitle: 'Bug Report',
    linkBugDesc: 'Report bugs or request features',
    linkPrivacyTitle: 'Privacy Policy',
    linkPrivacyDesc: 'Handling of personal information',
    linkSourceTitle: 'Source Code',
    linkSourceDesc: 'View code on GitHub',
    linkSupportTitle: 'Support Developer',
    linkSupportDesc: 'Amazon Wishlist',
    linkOfficialTitle: 'Official Site',
    linkOfficialDesc: 'keigoly.jp',
    btnReload: 'Update',
    autoFetch: 'Auto-fetch My Gems',
    manualAdd: 'or add manually',
    fetching: 'Fetching...',
    openGemini: 'Please open Google Gemini first',
    noGems: 'No My Gems found',
    addedItems: 'Added {count} item(s)',
    skippedItems: '{count} skipped',
    allRegistered: 'All already registered',
    errorOccurred: 'Error occurred',
    setIconOption: 'Set Icon',
    deleteOption: 'Delete'
  },
  ja: {
    appName: 'GemAvatar',
    statusOn: '状態: ON',
    statusOff: '状態: OFF',
    labelTarget: '1. 対象のGem名:',
    placeholderTarget: '対象のワードを入力してください',
    labelImage: '2. アイコン画像を選択:',
    btnAdd: '設定を追加',
    labelList: '登録済み:',
    settingsTitle: '設定',
    langLabel: '言語設定',
    designLabel: 'デザイン',
    fontSizeLabel: 'フォントサイズ',
    bgLabel: '背景',
    bgLight: 'ライト',
    bgDark: 'ダーク',
    bgBlue: 'ブルー',
    bgBlack: 'ブラック',
    storageLabel: 'ストレージ',
    storageInfo: '設定のエクスポート・インポート・リセットができます。',
    exportBtn: 'エクスポート',
    importBtn: 'インポート',
    resetBtn: 'リセット',
    confirmReset: 'すべての設定をリセットしますか？この操作は元に戻せません。',
    importLabel: '設定をインポート',
    exportLabel: '設定をエクスポート',
    resetLabel: '設定をリセット',
    resetDesc: '設定を初期値に戻します。',
    clearLabel: 'ストレージを初期化',
    clearDesc: 'データを全て消去します。',
    clearBtn: '初期化',
    confirmClear: 'ストレージを初期化しますか？すべてのデータが削除され、元に戻すことはできません。',
    storageCurrent: '現在',
    storageTotal: '全体',
    storageSettingsSize: '設定',
    storageOther: 'その他',
    importSuccess: '設定をインポートしました。',
    importFailed: '設定のインポートに失敗しました。',
    btnChooseFile: 'ファイルを選択',
    noFileChosen: '選択されていません',
    otherLabel: 'その他・問い合わせ',
    linkBugTitle: '不具合の報告',
    linkBugDesc: 'バグ報告や機能要望はこちら',
    linkPrivacyTitle: 'プライバシーポリシー',
    linkPrivacyDesc: '個人情報の取り扱いについて',
    linkSourceTitle: 'ソースコード',
    linkSourceDesc: 'GitHubでコードを見る',
    linkSupportTitle: '開発者を支援する',
    linkSupportDesc: 'Amazon 欲しいものリスト',
    linkOfficialTitle: 'オフィシャルサイト',
    linkOfficialDesc: 'keigoly.jp',
    btnReload: '更新',
    autoFetch: 'マイGemを自動取得',
    manualAdd: 'または手動で追加',
    fetching: '取得中...',
    openGemini: 'Google Geminiを先に開いてください',
    noGems: 'マイGemが見つかりませんでした',
    addedItems: '{count}件追加しました',
    skippedItems: '{count}件スキップ',
    allRegistered: 'すべて登録済みです',
    errorOccurred: 'エラーが発生しました',
    setIconOption: 'アイコンを設定',
    deleteOption: '削除'
  }
};

// DOM要素
const viewMain = document.getElementById('view-main') as HTMLElement;
const viewSettings = document.getElementById('view-settings') as HTMLElement;
const btnOpenSettings = document.getElementById('btn-open-settings') as HTMLButtonElement;
const btnBack = document.getElementById('btn-back') as HTMLButtonElement;

const toggleSwitch = document.getElementById('toggle-switch') as HTMLInputElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const nameInput = document.getElementById('gem-name-input') as HTMLInputElement;
const imageInput = document.getElementById('gem-image-input') as HTMLInputElement;
const addBtn = document.getElementById('add-btn') as HTMLButtonElement;
const gemList = document.getElementById('gem-list') as HTMLUListElement;
const fileNameDisplay = document.getElementById('file-name-display') as HTMLSpanElement;
const btnReload = document.getElementById('btn-reload') as HTMLButtonElement;
const autoFetchBtn = document.getElementById('autoFetchBtn') as HTMLButtonElement;
const fetchStatus = document.getElementById('fetchStatus') as HTMLSpanElement;
const gemIconInput = document.getElementById('gem-icon-change-input') as HTMLInputElement;

let pendingIconGemName: string | null = null;

// デザインセクション
const designSublabel = document.getElementById('design-sublabel') as HTMLSpanElement;
const fontSizeSlider = document.getElementById('font-size-slider') as HTMLElement;
const bgPicker = document.getElementById('bg-picker') as HTMLElement;

// ストレージセクション
const btnExport = document.getElementById('btn-export') as HTMLButtonElement;
const btnImport = document.getElementById('btn-import') as HTMLButtonElement;
const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
const importFileInput = document.getElementById('import-file-input') as HTMLInputElement;
const btnClear = document.getElementById('btn-clear') as HTMLButtonElement;
const storageSublabel = document.getElementById('storage-sublabel') as HTMLSpanElement;
const storageBarSettings = document.getElementById('storage-bar-settings') as HTMLElement;
const storageBarOther = document.getElementById('storage-bar-other') as HTMLElement;
const storageTotalEl = document.getElementById('storage-total') as HTMLSpanElement;
const storageSettingsSizeEl = document.getElementById('storage-settings-size') as HTMLSpanElement;
const storageOtherSizeEl = document.getElementById('storage-other-size') as HTMLSpanElement;

const langRadios = document.querySelectorAll('input[name="lang"]');
const accordions = document.querySelectorAll('.accordion');

let currentLang = 'en';
let currentFontSize = 15;
let currentBgMode = 'light';

// --- アコーディオン制御 ---
accordions.forEach(acc => {
  const header = acc.querySelector('.accordion-header');
  header?.addEventListener('click', () => acc.classList.toggle('active'));
});

// --- デザイン適用 ---
const applyDesign = () => {
  document.body.style.fontSize = currentFontSize + 'px';

  document.body.classList.remove('dark-mode', 'blue-mode', 'black-mode');
  if (currentBgMode === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (currentBgMode === 'blue') {
    document.body.classList.add('blue-mode');
  } else if (currentBgMode === 'black') {
    document.body.classList.add('black-mode');
  }

  // サブラベル更新
  const t = translations[currentLang];
  const bgName = t[`bg${currentBgMode.charAt(0).toUpperCase() + currentBgMode.slice(1)}`] || currentBgMode;
  designSublabel.textContent = `${currentFontSize}px / ${bgName}`;

  // ドットUI更新
  fontSizeSlider.querySelectorAll('.slider-dot').forEach(dot => {
    dot.classList.toggle('selected', (dot as HTMLElement).dataset.size === String(currentFontSize));
  });

  // カードUI更新
  bgPicker.querySelectorAll('.bg-option').forEach(opt => {
    opt.classList.toggle('selected', (opt as HTMLElement).dataset.bg === currentBgMode);
  });
};

// --- 言語更新 ---
const updateTexts = () => {
  const t = translations[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.id === 'file-name-display' && !el.hasAttribute('data-i18n')) return;
    const key = el.getAttribute('data-i18n');
    if (key && t[key]) el.textContent = t[key];
  });
  if (t.placeholderTarget) nameInput.placeholder = t.placeholderTarget;
  updateStatusText(toggleSwitch.checked);
  applyDesign();
};

const updateStatusText = (isEnabled: boolean) => {
  const t = translations[currentLang];
  statusText.textContent = isEnabled ? t.statusOn : t.statusOff;
  statusText.style.color = isEnabled ? '#1a73e8' : '#5f6368';
  const isDarkTheme = currentBgMode === 'dark' || currentBgMode === 'blue' || currentBgMode === 'black';
  if (isDarkTheme && !isEnabled) {
    statusText.style.color = '#9aa0a6';
  }
};

// --- イベントリスナー ---
imageInput.addEventListener('change', () => {
  if (imageInput.files && imageInput.files.length > 0) {
    fileNameDisplay.textContent = imageInput.files[0].name;
    fileNameDisplay.removeAttribute('data-i18n');
    checkInputState();
  } else {
    resetFileInputDisplay();
    checkInputState();
  }
});

const resetFileInputDisplay = () => {
  imageInput.value = '';
  fileNameDisplay.setAttribute('data-i18n', 'noFileChosen');
  fileNameDisplay.textContent = translations[currentLang].noFileChosen;
};

btnOpenSettings.addEventListener('click', () => {
  viewMain.classList.add('hidden');
  viewSettings.classList.remove('hidden');
});
btnBack.addEventListener('click', () => {
  viewSettings.classList.add('hidden');
  viewMain.classList.remove('hidden');
});

langRadios.forEach(radio => {
  radio.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      currentLang = target.value;
      await chrome.storage.local.set({ [KEY_LANG]: currentLang });
      updateTexts();
      await updateStorageInfo();
    }
  });
});

// --- フォントサイズドット ---
fontSizeSlider.addEventListener('click', async (e) => {
  const dot = (e.target as HTMLElement).closest('.slider-dot') as HTMLElement | null;
  if (!dot) return;
  currentFontSize = Number(dot.dataset.size);
  await chrome.storage.local.set({ [KEY_FONTSIZE]: currentFontSize });
  applyDesign();
});

// --- 背景カラーピッカー ---
bgPicker.addEventListener('click', async (e) => {
  const opt = (e.target as HTMLElement).closest('.bg-option') as HTMLElement | null;
  if (!opt) return;
  currentBgMode = opt.dataset.bg || 'light';
  await chrome.storage.local.set({ [KEY_BGMODE]: currentBgMode });
  applyDesign();
  updateStatusText(toggleSwitch.checked);
});

// --- ストレージ機能 ---
const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  const mb = kb / 1024;
  return mb.toFixed(1) + ' MB';
};

const updateStorageInfo = async () => {
  try {
    const t = translations[currentLang];
    const totalBytes = await chrome.storage.local.getBytesInUse(null);
    const settingsBytes = await chrome.storage.local.getBytesInUse(EXPORT_KEYS);
    const otherBytes = totalBytes - settingsBytes;

    storageSublabel.textContent = `${t.storageCurrent}: ${formatBytes(totalBytes)}`;

    const settingsPercent = totalBytes > 0 ? (settingsBytes / totalBytes) * 100 : 0;
    const otherPercent = totalBytes > 0 ? (otherBytes / totalBytes) * 100 : 0;
    storageBarSettings.style.width = settingsPercent + '%';
    storageBarOther.style.width = otherPercent + '%';

    storageTotalEl.textContent = `${t.storageTotal}: ${formatBytes(totalBytes)}`;
    storageSettingsSizeEl.textContent = `${t.storageSettingsSize}: ${formatBytes(settingsBytes)}`;
    storageOtherSizeEl.textContent = `${t.storageOther}: ${formatBytes(otherBytes)}`;
  } catch (e) {
    console.warn('[GemAvatar] Failed to get storage info:', e);
  }
};

const clearStorage = async () => {
  const t = translations[currentLang];
  if (!confirm(t.confirmClear)) return;
  await chrome.storage.local.clear();
  await init();
};

const exportSettings = async () => {
  const data = await chrome.storage.local.get(EXPORT_KEYS);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gemavatar_backup_${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const importSettings = async (file: File) => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const filtered: Record<string, unknown> = {};
    for (const key of EXPORT_KEYS) {
      if (key in parsed) {
        filtered[key] = parsed[key];
      }
    }
    await chrome.storage.local.set(filtered);
    await init();
    alert(translations[currentLang].importSuccess);
  } catch {
    alert(translations[currentLang].importFailed);
  }
};

const resetSettings = async () => {
  const t = translations[currentLang];
  if (!confirm(t.confirmReset)) return;
  await chrome.storage.local.remove(EXPORT_KEYS);
  await init();
};

btnExport.addEventListener('click', exportSettings);
btnImport.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', async () => {
  if (importFileInput.files && importFileInput.files.length > 0) {
    await importSettings(importFileInput.files[0]);
    importFileInput.value = '';
  }
});
btnReset.addEventListener('click', resetSettings);
btnClear.addEventListener('click', clearStorage);

// --- メニュー制御 ---
const closeAllMenus = () => {
  document.querySelectorAll('.item-menu').forEach(menu => menu.classList.add('hidden'));
};
document.addEventListener('click', closeAllMenus);

// --- ロジック ---
const renderGemList = (settings: GemSetting[]) => {
  const t = translations[currentLang];
  gemList.innerHTML = '';
  settings.forEach(setting => {
    const li = document.createElement('li');
    li.className = 'gem-item';

    if (setting.image) {
      const img = document.createElement('img');
      img.src = setting.image;
      li.appendChild(img);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'placeholder-icon';
      placeholder.textContent = setting.name.charAt(0);
      li.appendChild(placeholder);
    }

    const span = document.createElement('span');
    span.className = 'item-name';
    span.textContent = setting.name;
    li.appendChild(span);

    // Menu wrapper
    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'menu-wrapper';

    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.textContent = '\u22EE';
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !itemMenu.classList.contains('hidden');
      closeAllMenus();
      if (!isOpen) itemMenu.classList.remove('hidden');
    });

    const itemMenu = document.createElement('div');
    itemMenu.className = 'item-menu hidden';

    const setIconBtn = document.createElement('button');
    setIconBtn.className = 'menu-option';
    setIconBtn.textContent = t.setIconOption;
    setIconBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllMenus();
      handleSetIcon(setting.name);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'menu-option delete-option';
    deleteBtn.textContent = t.deleteOption;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllMenus();
      removeGem(setting.name);
    });

    itemMenu.appendChild(setIconBtn);
    itemMenu.appendChild(deleteBtn);
    menuWrapper.appendChild(menuBtn);
    menuWrapper.appendChild(itemMenu);
    li.appendChild(menuWrapper);

    gemList.appendChild(li);
  });
};

const checkInputState = () => {
  addBtn.disabled = !(nameInput.value.trim() && imageInput.files && imageInput.files.length > 0);
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const reloadTabs = async () => {
  const tabs = await chrome.tabs.query({ url: '*://gemini.google.com/*' });
  tabs.forEach(tab => {
    if (tab.id) chrome.tabs.reload(tab.id);
  });
};

const addGem = async () => {
  const name = nameInput.value.trim();
  const file = imageInput.files ? imageInput.files[0] : null;
  if (!name || !file) return;
  try {
    const base64Image = await convertFileToBase64(file);
    const data = await chrome.storage.local.get(KEY_SETTINGS);
    const currentSettings: GemSetting[] = data[KEY_SETTINGS] ?? [];
    const newSettings = currentSettings.filter(s => s.name !== name);
    newSettings.push({ name: name, image: base64Image });
    await chrome.storage.local.set({ [KEY_SETTINGS]: newSettings });
    renderGemList(newSettings);
    nameInput.value = '';
    resetFileInputDisplay();
    checkInputState();
    await updateStorageInfo();
  } catch (e) {
    console.error(e);
    alert("Error loading image.");
  }
};

const removeGem = async (nameToRemove: string) => {
  const data = await chrome.storage.local.get(KEY_SETTINGS);
  const currentSettings: GemSetting[] = data[KEY_SETTINGS] ?? [];
  const newSettings = currentSettings.filter(s => s.name !== nameToRemove);
  await chrome.storage.local.set({ [KEY_SETTINGS]: newSettings });
  renderGemList(newSettings);
  await updateStorageInfo();
};

const handleSetIcon = (gemName: string) => {
  pendingIconGemName = gemName;
  gemIconInput.value = '';
  gemIconInput.click();
};

gemIconInput.addEventListener('change', async () => {
  if (!pendingIconGemName || !gemIconInput.files || gemIconInput.files.length === 0) return;
  try {
    const base64Image = await convertFileToBase64(gemIconInput.files[0]);
    const data = await chrome.storage.local.get(KEY_SETTINGS);
    const currentSettings: GemSetting[] = data[KEY_SETTINGS] ?? [];
    const target = currentSettings.find(s => s.name === pendingIconGemName);
    if (target) {
      target.image = base64Image;
      await chrome.storage.local.set({ [KEY_SETTINGS]: currentSettings });
      renderGemList(currentSettings);
      await updateStorageInfo();
    }
  } catch (e) {
    console.error(e);
  }
  pendingIconGemName = null;
});

const init = async () => {
  const data = await chrome.storage.local.get([KEY_ENABLED, KEY_SETTINGS, KEY_LANG, KEY_FONTSIZE, KEY_BGMODE]);

  // 言語
  if (data[KEY_LANG]) {
    currentLang = data[KEY_LANG];
  } else {
    const browserLang = navigator.language;
    if (browserLang.startsWith('ja')) currentLang = 'ja';
  }
  const langRadio = document.querySelector(`input[name="lang"][value="${currentLang}"]`) as HTMLInputElement;
  if (langRadio) langRadio.checked = true;

  // デザイン
  currentFontSize = data[KEY_FONTSIZE] ?? 15;
  currentBgMode = data[KEY_BGMODE] ?? 'light';
  applyDesign();

  updateTexts();
  toggleSwitch.checked = data[KEY_ENABLED] ?? true;
  updateStatusText(toggleSwitch.checked);
  renderGemList(data[KEY_SETTINGS] ?? []);
  await updateStorageInfo();
};

toggleSwitch.addEventListener('change', async (e) => {
  const isEnabled = (e.target as HTMLInputElement).checked;
  await chrome.storage.local.set({ [KEY_ENABLED]: isEnabled });
  updateStatusText(isEnabled);
  reloadTabs();
});

addBtn.addEventListener('click', addGem);
nameInput.addEventListener('input', checkInputState);
btnReload.addEventListener('click', reloadTabs);

const handleAutoFetch = async () => {
  const t = translations[currentLang];
  autoFetchBtn.disabled = true;
  fetchStatus.textContent = t.fetching;
  fetchStatus.className = 'fetch-status';

  try {
    const tabs = await chrome.tabs.query({ url: 'https://gemini.google.com/*' });
    if (tabs.length === 0) {
      fetchStatus.textContent = t.openGemini;
      fetchStatus.className = 'fetch-status error';
      autoFetchBtn.disabled = false;
      return;
    }

    const allGems: { name: string }[] = [];
    for (const tab of tabs) {
      if (!tab.id) continue;
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const gems: { name: string }[] = [];
            const seen = new Set<string>();
            const links = document.querySelectorAll('a[href*="/gem/"]');
            for (let i = 0; i < links.length; i++) {
              const link = links[i];
              const href = link.getAttribute('href') || '';
              const slugMatch = href.match(/\/gem\/([^/?#]+)/);
              if (!slugMatch) continue;
              const slug = slugMatch[1];
              if (slug.length <= 10 || slug.indexOf('-') !== -1) continue;
              let name = '';
              const iconEl = link.querySelector('.bot-logo-text');
              const fullText = (link.textContent || '').trim();
              if (iconEl) {
                const iconChar = (iconEl.textContent || '').trim();
                name = fullText.replace(iconChar, '').trim();
              } else {
                name = fullText;
              }
              name = name.replace(/\s+/g, ' ').trim();
              if (name && !seen.has(name)) {
                seen.add(name);
                gems.push({ name: name });
              }
            }
            return gems;
          }
        });
        if (results && results[0] && results[0].result) {
          allGems.push(...results[0].result);
        }
      } catch (tabError) {
        console.warn('[GemAvatar] Failed to execute script on tab:', tab.id, tabError);
      }
    }

    if (allGems.length === 0) {
      fetchStatus.textContent = t.noGems;
      fetchStatus.className = 'fetch-status error';
      autoFetchBtn.disabled = false;
      return;
    }

    const data = await chrome.storage.local.get(KEY_SETTINGS);
    const currentSettings: GemSetting[] = data[KEY_SETTINGS] ?? [];
    const existingNames = new Set(currentSettings.map(s => s.name));
    let added = 0;
    let skipped = 0;
    for (const gem of allGems) {
      if (existingNames.has(gem.name)) {
        skipped++;
      } else {
        currentSettings.push({ name: gem.name, image: '' });
        existingNames.add(gem.name);
        added++;
      }
    }

    if (added > 0) {
      await chrome.storage.local.set({ [KEY_SETTINGS]: currentSettings });
      renderGemList(currentSettings);
      let msg = t.addedItems.replace('{count}', String(added));
      if (skipped > 0) {
        msg += ` (${t.skippedItems.replace('{count}', String(skipped))})`;
      }
      fetchStatus.textContent = msg;
      fetchStatus.className = 'fetch-status success';
    } else {
      fetchStatus.textContent = t.allRegistered;
      fetchStatus.className = 'fetch-status';
    }
  } catch (e) {
    console.error(e);
    fetchStatus.textContent = translations[currentLang].errorOccurred;
    fetchStatus.className = 'fetch-status error';
  }
  autoFetchBtn.disabled = false;
};

autoFetchBtn.addEventListener('click', handleAutoFetch);

init();
