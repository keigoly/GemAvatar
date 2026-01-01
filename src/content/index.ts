// src/content/index.ts

// データ構造の型定義
interface GemSetting {
  name: string;
  image: string; // Base64 string
}

let gemSettings: GemSetting[] = [];
const PROCESSED_ATTR = 'data-gemavatar-processed';

const cleanupOldMess = (targetElement: HTMLElement) => {
  const oldImages = targetElement.querySelectorAll('img[src*="chrome-extension"]');
  oldImages.forEach(img => img.remove());
  if (targetElement.style.display === 'none') {
    targetElement.style.display = '';
  }
};

const applyAvatarStyle = (element: HTMLElement, base64Image: string) => {
  cleanupOldMess(element);
  element.style.color = 'transparent';
  element.style.backgroundColor = 'transparent';
  element.style.boxShadow = 'none';
  element.style.border = 'none';
  
  // Base64画像をそのままURLとして使用
  element.style.backgroundImage = `url("${base64Image}")`;
  
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
  // 設定されたGemリストをループ
  gemSettings.forEach(setting => {
    const allRows = document.querySelectorAll('a, div[role="listitem"], .bot-list-row-container');
    
    allRows.forEach(row => {
      if (!row.textContent || !row.textContent.includes(setting.name)) return;
      
      const iconElement = row.querySelector('.bot-logo-text') as HTMLElement;
      if (iconElement) {
        const isProcessed = iconElement.getAttribute(PROCESSED_ATTR) === 'true';
        const hasGarbage = iconElement.querySelector('img[src*="chrome-extension"]');
        
        // 未処理、または古いゴミがある場合、または画像が変わった場合（簡易チェック）
        if (!isProcessed || hasGarbage) {
           applyAvatarStyle(iconElement, setting.image);
        }
      }
    });
  });
};

const startEngine = async () => {
  // データ取得
  const data = await chrome.storage.local.get(['isEnabled', 'gemSettings']);
  const isEnabled = data.isEnabled ?? true;
  gemSettings = data.gemSettings ?? [];

  if (!isEnabled) {
    console.log('[GemAvatar] Disabled by user setting.');
    return;
  }

  console.log('[GemAvatar] Custom Image Engine Started.');
  performReplacement();

  const observer = new MutationObserver(() => {
    performReplacement();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(performReplacement, 1000);
};

startEngine();