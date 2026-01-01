// src/content/index.ts

// ▼▼▼ ここが変わりました: 固定リストではなく空で定義 ▼▼▼
// 実際にはStorageから読み込みます
let targetGemNames: string[] = [];

// 使用する画像（現在は1種類固定）
const DEFAULT_AVATAR_PATH = "src/assets/my-avatar.png";

const PROCESSED_ATTR = 'data-gemavatar-processed';

const getImageUrl = (path: string) => {
  try {
    return chrome.runtime.getURL(path);
  } catch (e) {
    return '';
  }
};

const cleanupOldMess = (targetElement: HTMLElement) => {
  const oldImages = targetElement.querySelectorAll('img[src*="chrome-extension"]');
  oldImages.forEach(img => img.remove());
  if (targetElement.style.display === 'none') {
    targetElement.style.display = '';
  }
};

const applyAvatarStyle = (element: HTMLElement, imagePath: string) => {
  cleanupOldMess(element);
  element.style.color = 'transparent';
  element.style.backgroundColor = 'transparent';
  element.style.boxShadow = 'none';
  element.style.border = 'none';
  element.style.backgroundImage = `url("${getImageUrl(imagePath)}")`;
  element.style.backgroundSize = 'cover';
  element.style.backgroundPosition = 'center';
  element.style.backgroundRepeat = 'no-repeat';
  element.style.borderRadius = '50%';
  element.style.minWidth = '28px';
  element.style.minHeight = '28px';
  element.style.display = 'flex';
  element.setAttribute(PROCESSED_ATTR, 'true');
};

const performReplacement = () => {
  // Storageから読み込んだリスト(targetGemNames)を使ってループ
  targetGemNames.forEach(name => {
    const allRows = document.querySelectorAll('a, div[role="listitem"], .bot-list-row-container');
    allRows.forEach(row => {
      // 部分一致ではなく、誤爆防止のため名前が含まれているかチェック
      if (!row.textContent || !row.textContent.includes(name)) return;
      
      const iconElement = row.querySelector('.bot-logo-text') as HTMLElement;
      if (iconElement) {
        const isProcessed = iconElement.getAttribute(PROCESSED_ATTR) === 'true';
        const hasGarbage = iconElement.querySelector('img[src*="chrome-extension"]');
        if (!isProcessed || hasGarbage) {
           // 現状はすべて同じ画像パスを使用
           applyAvatarStyle(iconElement, DEFAULT_AVATAR_PATH);
        }
      }
    });
  });
};

const startEngine = async () => {
  // 1. ストレージから「ON/OFF」と「Gemリスト」を取得
  const data = await chrome.storage.local.get(['isEnabled', 'targetGemNames']);
  
  const isEnabled = data.isEnabled ?? true;
  // リストがない場合は初期値をセット
  targetGemNames = data.targetGemNames ?? ["新規 アプリ開発", "継続 アプリ開発"];

  if (!isEnabled) {
    console.log('[GemAvatar] Disabled by user setting.');
    return;
  }

  console.log('[GemAvatar] Engine Started with targets:', targetGemNames);
  performReplacement();

  const observer = new MutationObserver(() => {
    performReplacement();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(performReplacement, 1000);
};

startEngine();