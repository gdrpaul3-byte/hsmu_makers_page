const header = document.querySelector('[data-nav]');
const copyButton = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('[data-copy-status]');

function updateHeader() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}

async function copyJoinMessage() {
  if (!copyButton || !copyStatus) return;

  const text = copyButton.dataset.copyEmail || '';

  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = '가입 문의 문구를 복사했습니다.';
  } catch {
    copyStatus.textContent = text;
  }
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
copyButton?.addEventListener('click', copyJoinMessage);
