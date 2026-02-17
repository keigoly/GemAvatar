// src/content/index.ts

interface GemSetting {
  name: string;
  image: string;
}

let gemSettings: GemSetting[] = [];
const PROCESSED_ATTR = 'data-gemavatar-processed';

const getImageUrl = (path: string) => {
  try {
    return chrome.runtime.getURL(path);
  } catch (e) {
    return '';
  }
};

const normalizeText = (s: string): string => s.replace(/\s+/g, ' ').trim();

const cleanupOldMess = (targetElement: HTMLElement) => {
  const oldImages = targetElement.querySelectorAll('img[src*="chrome-extension"]');
  oldImages.forEach(img => img.remove());
  if (targetElement.style.display === 'none') {
    targetElement.style.display = '';
  }
};

const applyAvatarStyle = (element: HTMLElement, imageOrPath: string) => {
  if (!imageOrPath) return;
  cleanupOldMess(element);
  const bgUrl = imageOrPath.startsWith('data:') ? imageOrPath : getImageUrl(imageOrPath);

  element.style.color = 'transparent';
  element.style.backgroundColor = 'transparent';
  element.style.boxShadow = 'none';
  element.style.border = 'none';

  element.style.backgroundImage = `url("${bgUrl}")`;
  element.style.backgroundSize = 'cover';
  element.style.backgroundPosition = 'center';
  element.style.backgroundRepeat = 'no-repeat';
  element.style.borderRadius = '50%';

  element.style.minWidth = '28px';
  element.style.minHeight = '28px';
  element.style.display = 'inline-block';

  element.setAttribute(PROCESSED_ATTR, 'true');
};

const isProcessed = (el: HTMLElement): boolean => {
  if (el.getAttribute(PROCESSED_ATTR) === 'true') {
    const hasGarbage = el.querySelector('img[src*="chrome-extension"]');
    if (!hasGarbage) return true;
  }
  return false;
};

/** 正規化済みテキストでGem名を検索 */
const findGemInText = (text: string, gems: GemSetting[]): GemSetting | undefined => {
  const normalized = normalizeText(text);
  return gems.find(s => normalized.includes(normalizeText(s.name)));
};

const performReplacement = () => {
  if (gemSettings.length === 0) return;

  const gemsWithImage = gemSettings.filter(s => s.image);
  if (gemsWithImage.length === 0) return;

  const pageTitleElement = document.querySelector('h1, .gds-headline, [role="heading"]');
  const pageTitle = pageTitleElement ? normalizeText(pageTitleElement.textContent || '') : '';

  // --- Pass 1: .bot-logo-text ベースの置換 ---
  document.querySelectorAll('.bot-logo-text').forEach(candidate => {
    const el = candidate as HTMLElement;
    if (isProcessed(el)) return;

    const iconText = el.textContent?.trim();
    if (!iconText) return;

    let targetGem: GemSetting | undefined;

    // A. Gemリンク内のテキストで特定（頭文字チェック不要・最優先）
    const gemLink = el.closest('a[href*="/gem/"]');
    if (gemLink) {
      targetGem = findGemInText(gemLink.textContent || '', gemsWithImage);
    }

    // B. 近くの親要素から名前を探す（頭文字フィルター付き）
    if (!targetGem) {
      const matchingGems = gemsWithImage.filter(s =>
        s.name.charAt(0) === iconText || s.name.startsWith(iconText)
      );
      if (matchingGems.length > 0) {
        let parent = el.parentElement;
        for (let i = 0; i < 7; i++) {
          if (!parent) break;
          if (parent.querySelectorAll('.bot-logo-text').length > 2) break;
          if (parent.textContent) {
            targetGem = findGemInText(parent.textContent, matchingGems);
            if (targetGem) break;
          }
          parent = parent.parentElement;
        }
      }
    }

    // C. ページタイトルで照合（チャット画面用フォールバック）
    if (!targetGem && pageTitle) {
      const isInSidebar = el.closest('mat-sidenav, nav, [role="navigation"], .sidenav-container');
      if (!isInSidebar) {
        targetGem = gemsWithImage.find(s =>
          pageTitle.includes(normalizeText(s.name)) &&
          (s.name.charAt(0) === iconText || s.name.startsWith(iconText))
        );
      }
    }

    if (targetGem) {
      applyAvatarStyle(el, targetGem.image);
    }
  });

  // --- Pass 2: Gemリンク起点の置換（アイコンがリンク外にある場合） ---
  document.querySelectorAll('a[href*="/gem/"]').forEach(link => {
    const matchedGem = findGemInText(link.textContent || '', gemsWithImage);
    if (!matchedGem) return;

    let iconEl = link.querySelector('.bot-logo-text') as HTMLElement | null;

    if (!iconEl) {
      const parent = link.parentElement;
      if (parent) {
        iconEl = parent.querySelector('.bot-logo-text') as HTMLElement | null;
      }
    }

    if (iconEl && !isProcessed(iconEl)) {
      applyAvatarStyle(iconEl, matchedGem.image);
    }
  });
};

const startEngine = async () => {
  const data = await chrome.storage.local.get(['isEnabled', 'gemSettings']);
  const isEnabled = data.isEnabled ?? true;
  gemSettings = data.gemSettings ?? [];

  if (!isEnabled) return;

  performReplacement();

  const observer = new MutationObserver(() => {
    performReplacement();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(performReplacement, 1000);
};

// 設定変更を即時反映
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.gemSettings) {
    gemSettings = changes.gemSettings.newValue ?? [];
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => {
      el.removeAttribute(PROCESSED_ATTR);
    });
    performReplacement();
  }
});

startEngine();
