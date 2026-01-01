// src/popup/main.ts

const KEY_ENABLED = 'isEnabled';
const KEY_SETTINGS = 'gemSettings'; // データ構造を変更: [{name, imageBase64}]

interface GemSetting {
  name: string;
  image: string; // Base64 string
}

const toggleSwitch = document.getElementById('toggle-switch') as HTMLInputElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const nameInput = document.getElementById('gem-name-input') as HTMLInputElement;
const imageInput = document.getElementById('gem-image-input') as HTMLInputElement;
const addBtn = document.getElementById('add-btn') as HTMLButtonElement;
const gemList = document.getElementById('gem-list') as HTMLUListElement;

// --- UI更新 ---

const updateStatusUI = (isEnabled: boolean) => {
  toggleSwitch.checked = isEnabled;
  statusText.textContent = isEnabled ? 'ON' : 'OFF';
  statusText.style.color = isEnabled ? '#1a73e8' : '#5f6368';
};

const renderGemList = (settings: GemSetting[]) => {
  gemList.innerHTML = '';
  settings.forEach(setting => {
    const li = document.createElement('li');
    li.className = 'gem-item';
    
    // サムネイル画像表示
    const img = document.createElement('img');
    img.src = setting.image;
    
    const span = document.createElement('span');
    span.className = 'item-name';
    span.textContent = setting.name;
    
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'delete-btn';
    delBtn.onclick = () => removeGem(setting.name);

    li.appendChild(img);
    li.appendChild(span);
    li.appendChild(delBtn);
    gemList.appendChild(li);
  });
};

const checkInputState = () => {
  // 名前とファイル両方がある時だけボタンを有効化
  addBtn.disabled = !(nameInput.value.trim() && imageInput.files && imageInput.files.length > 0);
};

// --- 画像処理 ---

// 画像ファイルをBase64文字列に変換する関数
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// --- データ操作 ---

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
    // 画像を変換
    const base64Image = await convertFileToBase64(file);

    const data = await chrome.storage.local.get(KEY_SETTINGS);
    const currentSettings: GemSetting[] = data[KEY_SETTINGS] ?? [];

    // 同じ名前があれば上書き、なければ追加
    const newSettings = currentSettings.filter(s => s.name !== name);
    newSettings.push({ name: name, image: base64Image });

    await chrome.storage.local.set({ [KEY_SETTINGS]: newSettings });
    
    renderGemList(newSettings);
    reloadTabs();

    // フォームリセット
    nameInput.value = '';
    imageInput.value = '';
    checkInputState();

  } catch (e) {
    console.error("Image upload failed", e);
    alert("画像の読み込みに失敗しました。");
  }
};

const removeGem = async (nameToRemove: string) => {
  const data = await chrome.storage.local.get(KEY_SETTINGS);
  const currentSettings: GemSetting[] = data[KEY_SETTINGS] ?? [];
  
  const newSettings = currentSettings.filter(s => s.name !== nameToRemove);
  await chrome.storage.local.set({ [KEY_SETTINGS]: newSettings });
  renderGemList(newSettings);
  reloadTabs();
};

// --- 初期化 ---

const init = async () => {
  const data = await chrome.storage.local.get([KEY_ENABLED, KEY_SETTINGS]);
  updateStatusUI(data[KEY_ENABLED] ?? true);
  renderGemList(data[KEY_SETTINGS] ?? []);
};

// --- イベント ---

toggleSwitch.addEventListener('change', async (e) => {
  const isEnabled = (e.target as HTMLInputElement).checked;
  await chrome.storage.local.set({ [KEY_ENABLED]: isEnabled });
  updateStatusUI(isEnabled);
  reloadTabs();
});

addBtn.addEventListener('click', addGem);
nameInput.addEventListener('input', checkInputState);
imageInput.addEventListener('change', checkInputState);

init();