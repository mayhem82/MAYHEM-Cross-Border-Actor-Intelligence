(() => {
  const button = document.querySelector('#installApp');
  const guide = document.querySelector('#installGuide');
  const displayMode = matchMedia('(display-mode: standalone)');
  let installPrompt;
  let installedHere = false;
  const updateButton = () => {
    button.hidden = location.protocol === 'file:' || installedHere || displayMode.matches || navigator.standalone === true;
  };
  function instructions() {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return 'In Safari, open Share, choose Add to Home Screen, then tap Add. If offered, enable Open as Web App.';
    }
    if (/Android/i.test(navigator.userAgent)) return 'Open the browser menu and choose Install app or Add to Home screen. Follow the prompt to add Protest Networks.';
    return 'In Chrome or Edge, use the install icon in the address bar or the browser’s app menu. In Safari on Mac, choose File, then Add to Dock.';
  }
  function showGuide() {
    document.querySelector('#installSteps').textContent = instructions();
    guide.showModal();
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    updateButton();
  });
  window.addEventListener('appinstalled', () => {
    installedHere = true;
    installPrompt = null;
    if (guide.open) guide.close();
    updateButton();
  });
  button.addEventListener('click', async () => {
    if (!installPrompt) { showGuide(); return; }
    const prompt = installPrompt;
    installPrompt = null;
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch { showGuide(); }
  });
  guide.querySelector('[data-dismiss-install]').onclick = () => guide.close();
  displayMode.addEventListener('change', updateButton);
  updateButton();
})();
