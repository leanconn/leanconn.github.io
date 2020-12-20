(async function bml() {
  let win = window.open('', 'angela he', 'width=500,height=600,' + 'left=' + (window.screenX + (window.outerWidth - 500) / 2) + ',top=' + (window.screenY + (window.outerHeight - 740) / 2));
  win.document.write('loading...');

  async function loadFyfy() {
    const response = await fetch('https://anemochore.github.io/amazon2trello_rev/app_rev2.js');
    const txt = await response.text();
    let se = document.createElement('script');
    se.type = 'text/javascript';
    se.text = txt;
    document.getElementsByTagName('head')[0].appendChild(se);
  }
  await loadFyfy();
  const [url, title, desc] = await fyfy();

  win.location.href = 'https://trello.com/add-card' +
  '?source=' + window.location.host + '&mode=popup' +
  '&url=' + encodeURIComponent(url) +
  '&name=' + encodeURIComponent(title) +
  '&desc=' + encodeURIComponent(desc);
    

})();
