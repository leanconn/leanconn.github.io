async function fyfy() {
  const response = await fetch('https://unpkg.com/turndown/lib/turndown.browser.umd.js');
  const txt = await response.text();
  let se = document.createElement('script');
  se.type = 'text/javascript';
  se.text = txt;
  document.getElementsByTagName('head')[0].appendChild(se);
  let turndownService = new TurndownService();

  let url = document.URL;
  let title, desc = '';
  let author, date, infos, coverUrl;

  if(url.indexOf('oreilly.com/library/view/') > -1) {
    title  = document.querySelector('h1').innerText;
    const authorEl = document.querySelector('div.author') || document.querySelector('div.t-authors');
    const dateEl = document.querySelector('div.issued') || document.querySelector('div.t-release-date');
    const isbnEl = document.querySelector('div.isbn') || document.querySelector('div.t-isbn');
    const descEl = document.querySelector('div.description>span') || document.querySelector('div.title-description>div.content>span');

    let isbn = url.replace(/\/$/, '').split('/').pop();
    coverUrl = 'https://learning.oreilly.com/library/cover/'+isbn+'/250w.jpg';
    desc = '[오라일리 사파리](' + url + ')\n[cover link](' + coverUrl + ')\n'
    + authorEl.innerText + '\n\n' + dateEl.innerText + '\n' + isbnEl.innerText + '\n\n'
    + turndownService.turndown(descEl.innerHTML);
  }
  else if(url.indexOf('pragprog.com/titles/') > -1) {
    title = document.getElementsByTagName('h1')[0].innerText;
    author = document.querySelector('h2.author').innerText;
    desc = document.querySelectorAll('section.book-main')

    infos = [...document.querySelector('section.book-main').children];
    let i = 0, started = null;
    for(; i < infos.length; i++) {
      if(infos[i].tagName == 'P')
        if(!started) started = i;
        else continue;
      else if(started) break;
    }
    if(started)
      desc = infos.slice(started, i).map(el => el.innerHTML).join('\n\n').trim();

    coverUrl = document.querySelector('div.book-about-cover>a');
    if(coverUrl) coverUrl = coverUrl.href;
    
    desc = '[프래그매틱 링크](' + url + ')\n[cover link](' + coverUrl + ')\n' + author + '\n\n' + turndownService.turndown(desc);

    infos = [...document.querySelectorAll('section.book-main>ul')].slice(-1)[0];
    if(infos) {
      infos = [...infos.querySelectorAll('li')].filter(el => el.parentNode == infos).map(el => '- '+(el.firstChild.textContent || el.innerText).trim()).join('\n');
    }

    if(infos.length > 0)
      desc += '\n\n###목차\n' + infos;
  }
  else if(url.indexOf('.packtpub.') > -1) {
    title = document.getElementsByTagName('h1')[0].innerText;
    author = document.querySelector('span.product-info__author').innerText;

    coverUrl = document.querySelector('div.image>div>img.product-image');
    if(coverUrl) coverUrl = coverUrl.src;

    desc = '[팩트 링크](' + url + ') \n[cover link](' + coverUrl + ')\n' + author + '\n\n';
    desc += document.querySelector('dl.overview__datalist').textContent.trim().replace(':\n', '\n').split('\n\n\n').map(t => '- '+t.replace('\n', ': ')).join('\n') + '\n\n';;
    desc += document.querySelector('div.overview__body').innerText;
  }
  else if(url.indexOf('.manning.') > -1) {
    title = document.head.querySelector("[name=application-name]").content;
    author = document.getElementsByClassName('product-authorship')[0].innerText.trim().split('\n')[0];

    coverUrl = document.querySelector('div#coverColumn>a>div');
    if(coverUrl && coverUrl.style)
      coverUrl = coverUrl.style.backgroundImage.replace(/^url\("/, '').replace(/"\)$/, '');
    desc = '[매닝 링크](' + url + ') \n[cover link](' + coverUrl + ')\nby ' + author + '\n\n';
    desc += [...document.getElementsByClassName('product-info')[0].querySelectorAll('li')].map(el => '- ' + el.innerText.trim()).join('\n') + '\n\n'
    desc += turndownService.turndown(document.querySelector('div.description-body').innerHTML.trim());

    desc += '\n\n###' + document.querySelector('div.header').childNodes[0].textContent.trim();
    desc += '\n\n' + [...document.querySelector('div.toc').children].map(el => (el.querySelector('h2') || el).textContent).join('\n');
  }
  else if(url.indexOf('.amazon.') > -1) {
    // prettify URL
    const pathArray = document.URL.split( '/' );
    const protocol = pathArray[0];
    const host = pathArray[2];

    let index;
    if(pathArray.indexOf('product') > -1) index = pathArray.indexOf('product') + 1;
    else if(pathArray.indexOf('dp') > -1) index = pathArray.indexOf('dp') + 1;
    else if(pathArray.indexOf('d') > -1) index = pathArray.indexOf('d') + 1;
    else if(pathArray.indexOf('ASIN') > -1) index = pathArray.indexOf('ASIN') + 1;
    if(index === undefined) alert('URL을 정규화할 수 없습니다. 만든 이에게 제보해주세요.' );

    let asin = pathArray[index];
    if(asin.indexOf('?') > -1) asin = asin.slice(0, asin.indexOf('?'));
    url = protocol + '//' + host + '/dp/' + asin;

    title = document.getElementById('productTitle').innerText.trim() + ' / ' + document.getElementById('productSubtitle').innerText.trim();
    author = document.getElementById('bylineInfo');
    if(author === null) author = '';
    else author = author.innerText.replace(/^기준/, 'by');  //한글(아마존 UI);

    //table of contents (packt only)
    let descBody = document.getElementById('bookDescription_feature_div');
    if(descBody && descBody.querySelector('script:not([id])')) {
      descBody = descBody.querySelector('script:not([id])').text
      .split('bookDescEncodedData = "')[1].split('",\n')[0]
      .split('Table%20of%20Contents%3C%2Fh4%3E')[1];
    }
    else
      descBody = null;

    desc = document.querySelector('div#detailBullets_feature_div').innerText
    .replace(/\n\#/g, "\n\n- \\#")   //영문
    .replace(/\n\에서 #/g, "\n\n- \\#");  //한글(아마존 UI)
    let subIdx = desc.lastIndexOf('- \\#');
    let sub = desc.slice(subIdx).replace("\n", "\n\n");
    desc = desc.slice(0, subIdx) + sub;

    coverUrl = document.querySelector('div#booksImageBlock_feature_div img#imgBlkFront, div#imageBlockNew_feature_div img#ebooksImgBlkFront');
    if(coverUrl) coverUrl = coverUrl.src;

    desc = '[아마존 링크](' + url + ')\n[cover link](' + coverUrl + ')\n' + author + '\n\n' + desc;
    if(descBody)
      desc += '\n\n----\n###목차\n' + turndownService.turndown(decodeURIComponent(descBody));

    desc = desc
    .replace('Would you like to tell us about a lower price?', '')
    .replace('If you are a seller for this product, would you like to suggest updates through seller support?', '')
    .replace('이 상품을 출품하는 경우 출품자 지원을 통해 업데이트를 제안 하고 싶습니까?', '')
    .replace('저렴한 가격에 대해 말씀해 주시겠습니까 ?', '')
    .replace('이 제품의 판매자 인 경우 판매자 지원을 통해 업데이트 를 제안 하시겠습니까?', '');

    if(desc.indexOf('언어 : 일본어') > -1) {
      let toc = document.querySelectorAll('td.bucket>div.content li');
      if(toc.length > 0 && toc[toc.length-1].innerText == '목차보기')
        desc = desc.replace('목차보기', turndownService.turndown(toc[toc.length-1].innerHTML));

      let matches = desc.match(/^\d+ 위 ─.+$/gm);
      if(matches) matches.forEach(li => {
        desc = desc.replace(li, '\n- ' + li);
      });

      desc += '\n\n원제 : ' + document.head.querySelector('meta[name="title"]').content.split(' | ')[0];
    }
    else if(desc.indexOf('언어 : 영어') > -1) {
      let metaDesc = document.head.querySelector('meta[name="description"]').content;
      if(metaDesc.indexOf(' [') > -1) metaDesc = metaDesc.split(' [')[0];
      else metaDesc = metaDesc.split(' on Amazon')[0];

      desc += '\n\n원제 : ' + metaDesc;
    }
  }
  else {
    title = document.title;
    if(title === '') title = url;
    desc = '';
  }

  return [url, title, desc];
}
