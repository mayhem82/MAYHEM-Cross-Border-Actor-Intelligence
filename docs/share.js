(() => {
  const button = document.querySelector('#copySite');
  const status = document.querySelector('#copyStatus');
  const siteUrl = new URL('./', document.baseURI).href;
  const copyManually = () => {
    const input = document.createElement('textarea');
    input.value = siteUrl;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    return copied;
  };
  button.addEventListener('click', async () => {
    try {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(siteUrl); }
        catch { if (!copyManually()) throw new Error('Clipboard unavailable'); }
      } else if (!copyManually()) throw new Error('Clipboard unavailable');
      status.textContent = 'Site link copied';
    } catch {
      status.textContent = 'Copy this link: ' + siteUrl;
    }
  });
})();
