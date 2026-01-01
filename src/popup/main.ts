// src/popup/main.ts

const KEY_ENABLED = 'isEnabled';
const KEY_GEMS = 'targetGemNames';

const toggleSwitch = document.getElementById('toggle-switch') as HTMLInputElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const nameInput = document.getElementById('gem-name-input') as HTMLInputElement;
const addBtn = document.getElementById('add-btn') as HTMLButtonElement;
const gemList = document.getElementById('gem-list') as HTMLUListElement;

// デフォルトのターゲット（初回インストール用）
const DEFAULT_GEMS = ["新規 アプリ開発", "継続 アプリ開発"];

// --- UI更新関数 ---

const updateStatusUI = (isEnabled: boolean) => {
  toggleSwitch.checked = isEnabled;
  statusText.textContent = isEnabled ? 'ON' : 'OFF';
  statusText.style.color = isEnabled ? '#1a73e8' : '#5f6368';
};

const renderGemList = (names: string[]) => {
  gemList.innerHTML = '';
  names.forEach(name => {
    const li = document.createElement('li');
    li.className = 'gem-item';
    
    const span = document.createElement('span');
    span.textContent = name;
    
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'delete-btn';
    delBtn.onclick = () => removeGem(name);

    li.appendChild(span);
    li.appendChild(delBtn);
    gemList.appendChild(li);
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
  if (!name) return;

  const data = await chrome.storage.local.get(KEY_GEMS);
  const currentList: string[] = data[KEY_GEMS] ?? DEFAULT_GEMS;

  // 重複チェック
  if (!currentList.includes(name)) {
    const newList = [...currentList, name];
    await chrome.storage.local.set({ [KEY_GEMS]: newList });
    renderGemList(newList);
    reloadTabs();
  }
  nameInput.value = '';
};

const removeGem = async (nameToRemove: string) => {
  const data = await chrome.storage.local.get(KEY_GEMS);
  const currentList: string[] = data[KEY_GEMS] ?? DEFAULT_GEMS;
  
  const newList = currentList.filter(name => name !== nameToRemove);
  await chrome.storage.local.set({ [KEY_GEMS]: newList });
  renderGemList(newList);
  reloadTabs();
};

// --- 初期化 ---

const init = async () => {
  const data = await chrome.storage.local.get([KEY_ENABLED, KEY_GEMS]);
  
  // ON/OFF設定
  const isEnabled = data[KEY_ENABLED] ?? true;
  updateStatusUI(isEnabled);

  // リスト設定
  const gems = data[KEY_GEMS] ?? DEFAULT_GEMS;
  renderGemList(gems);
};

// --- イベントリスナー ---

toggleSwitch.addEventListener('change', async (e) => {
  const isEnabled = (e.target as HTMLInputElement).checked;
  await chrome.storage.local.set({ [KEY_ENABLED]: isEnabled });
  updateStatusUI(isEnabled);
  reloadTabs();
});

addBtn.addEventListener('click', addGem);

// エンターキーでも追加できるようにする
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addGem();
});

init();