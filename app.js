/* 教師操作網站：不使用框架、網路API或伺服器。
   修改課文請到 content.js；修改固定音檔路徑請修改 BUILTIN_AUDIO。
*/
(() => {
  'use strict';
  const DATA = window.LESSON_DATA;
  if (!DATA) { document.getElementById('stageBody').textContent='找不到content.js，請確認檔案放在同一資料夾。'; return; }
  const STAGES = [
    {name:'認識印尼',sub:'人口、語言與移民路線',time:'0～5分鐘',heading:'千島之國，客家在哪裡？',lead:'認識臺灣與印尼的位置，追尋客家人從廣東、福建遷往不同地區的故事。'},
    {name:'課文閱讀',sub:'雙腔課文、8個詞彙',time:'5～14分鐘',heading:'行讀客家世界：印尼客家之旅',lead:'看課本、朗讀重點句，點擊詞彙可開啟註解。'},
    {name:'語言傳承',sub:'政策與生活經驗',time:'14～20分鐘',heading:'客家人不少，為什麼客語仍面臨傳承挑戰？',lead:'從課文中的印尼語言政策，連結臺灣的歷史與學生生活。'},
    {name:'海外客語',sub:'聽見山口洋',time:'20～24分鐘',heading:'隔著海洋，還聽得見熟悉的客話嗎？',lead:'透過短音檔認識海外客語；本課不進行次方言語音比較訓練。'},
    {name:'蘭芳公司',sub:'羅芳伯與海外移民',time:'24～32分鐘',heading:'蘭芳公司，真的只是一間公司嗎？',lead:'從採金移民到地方組織，認識18世紀海外客家人的歷史。'},
    {name:'尋找客家味',sub:'臺灣菜包與印尼菜粄',time:'32～39分鐘',heading:'看起來相似的粄，吃起來也一樣嗎？',lead:'從米食的名稱、食材與內餡，觀察文化在不同地方的延續與變化。'},
    {name:'元宵文化',sub:'花燈、𪹚龍與油笐火',time:'39～42分鐘',heading:'元宵節，原來可以這樣過！',lead:'從臺灣客庄到印尼山口洋，看看節慶如何展現地方特色。'},
    {name:'文化統整',sub:'保留、改變、融合',time:'42～45分鐘',heading:'飄洋過海之後，客家文化變了嗎？',lead:'回顧今天的探索，從一個具體案例說明你的觀察。'}
  ];
  /* 加入正式、已取得使用權的音檔後可把這裡改為相對路徑，例如 'assets/audio/taiwan-hailu.mp3'。*/
  const BUILTIN_AUDIO = {tw:'', id:''};
  const state = {migrationRoute:'',mapView:'overview',stage:0,dialect:'hailu',pinyin:true,toneMode:'value',fontUp:1,chunk:0,reveal:false,place:'intro',poll:[],lanfang:0,food:0,reflection:'保留',audio:{tw:BUILTIN_AUDIO.tw,id:BUILTIN_AUDIO.id},audioTemporary:{tw:false,id:false}};
  const root=document.getElementById('siteShell');
  const body=document.getElementById('stageBody');
  const nav=document.getElementById('lessonNav');
  const main=document.getElementById('main');
  const overlay=document.getElementById('dialogOverlay');
  const labels={'hailu':'海陸腔','sixian':'四縣腔'};
  const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const h = (tag,cls,inside) => `<${tag} class="${cls}">${inside}</${tag}>`;
  // 一律保存原始調值；僅在呈現時轉為上標數字或課本調型符號。
  // 對應表依授課教師校訂版本；海陸與四縣各自獨立，不做調值的跨腔推算。
  const SUPERSCRIPT_DIGIT = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
  const TONE_MARKS = {
    hailu: {'53':'ˋ','55':'','24':'ˊ','11':'ˇ','33':'+','5':'','2':'ˋ'},
    sixian:{'24':'ˊ','11':'ˇ','31':'ˋ','55':'','2':'ˋ','5':''}
  };
  function formatPinyin(source, dialect){
    const tones=TONE_MARKS[dialect];
    if(!tones)return String(source??'');
    return String(source??'').replace(/([a-z]+)(53|55|24|11|33|31|5|2)(?=[^a-z0-9]|$)/gi,(raw,syllable,tone)=>{
      // 未定義的調值保留原文以便發現資料問題，避免悄悄錯誤轉換。
      if(!Object.prototype.hasOwnProperty.call(tones,tone))return raw.toLowerCase();
      const ending=state.toneMode==='value'
        ? [...tone].map(digit=>SUPERSCRIPT_DIGIT[digit]).join('')
        : tones[tone];
      return syllable.toLowerCase()+ending;
    });
  }

  const PHOTO_SOURCES = {
    twfood: { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/%E5%AE%A2%E5%AE%B6%E8%8F%9C%E5%8C%85.jpg/960px-%E5%AE%A2%E5%AE%B6%E8%8F%9C%E5%8C%85.jpg', page:'https://commons.wikimedia.org/wiki/File:%E5%AE%A2%E5%AE%B6%E8%8F%9C%E5%8C%85.jpg', credit:'客家委員會', alt:'臺灣客家菜包' },
    idfood: { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Choipan.jpg/960px-Choipan.jpg', page:'https://commons.wikimedia.org/wiki/File:Choipan.jpg', credit:'Cun Cun', alt:'印尼邦加客家菜粄' },
    lantern: { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Taiwan_Lantern_Festival_in_Taipei_2023.jpg/960px-Taiwan_Lantern_Festival_in_Taipei_2023.jpg', page:'https://commons.wikimedia.org/wiki/File:Taiwan_Lantern_Festival_in_Taipei_2023.jpg', credit:'HC Lin', alt:'臺灣元宵花燈' },
    dragon: { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Taiwan_Bombing_Dragon-3.jpg/960px-Taiwan_Bombing_Dragon-3.jpg', page:'https://commons.wikimedia.org/wiki/File:Taiwan_Bombing_Dragon-3.jpg', credit:'Wikimedia Commons', alt:'苗栗𪹚龍' },
    tatung: { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Tatung.jpg/960px-Tatung.jpg', page:'https://commons.wikimedia.org/wiki/File:Tatung.jpg', credit:'Rudi Sugianto', alt:'山口洋元宵Tatung' },
    singkawang: { url:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Singkawang_temple_101221-10576.jpg/960px-Singkawang_temple_101221-10576.jpg', page:'https://commons.wikimedia.org/wiki/File:Singkawang_temple_101221-10576.jpg', credit:'Wibowo Djatmiko', alt:'山口洋廟宇' },
  };
  function photo(key, cls=''){ const x=PHOTO_SOURCES[key];return `<figure class="real-photo ${cls}"><img src="${x.url}" alt="${x.alt}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.parentElement.classList.add('photo-failed')"><figcaption><a href="${x.page}" target="_blank" rel="noopener noreferrer">圖片來源：${x.credit} ↗</a></figcaption></figure>`; }
  function navRender(){
    nav.innerHTML = STAGES.map((s,i)=>`<button type="button" class="nav-step ${i===state.stage?'active':''}" data-action="jump" data-index="${i}" ${i===state.stage?'aria-current="step"':''}><span class="n">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.sub)}</small></span></button>`).join('');
  }
  function render(){
    const item=STAGES[state.stage];
    document.getElementById('stepLabel').textContent=item.name;
    document.getElementById('stageEyebrow').textContent=`第${'一二三四五六七八'[state.stage]}站`;
    document.getElementById('stageTitle').textContent=item.heading;
    document.getElementById('stageIntro').textContent=item.lead;
    document.getElementById('progressText').textContent=`${String(state.stage+1).padStart(2,'0')} / 08`;
    document.getElementById('progressFill').style.width=`${(state.stage+1)/8*100}%`;
    document.getElementById('prevBtn').disabled=state.stage===0;
    document.getElementById('nextBtn').textContent=state.stage===7?'返回第一站 ↺':'下一步 →';
    document.getElementById('pinyinToggle').textContent=`拼音：${state.pinyin?'開':'關'}`;
    document.getElementById('pinyinToggle').setAttribute('aria-pressed',String(state.pinyin));
    const toneButton=document.getElementById('toneModeToggle');
    const toneLabel=state.toneMode==='value'?'調值':'調型';
    toneButton.textContent=`標音：${toneLabel}`;
    toneButton.title=`目前為${toneLabel}表記，點擊切換${state.toneMode==='value'?'調型':'調值'}`;
    toneButton.setAttribute('aria-label',toneButton.title);
    toneButton.classList.toggle('tone-shape-mode',state.toneMode==='shape');
    document.getElementById('fontToggle').textContent=state.fontUp>1?'字級－':'字級＋';
    root.style.setProperty('--fontup',state.fontUp);
    document.querySelectorAll('[data-dialect]').forEach(el=>{const on=el.dataset.dialect===state.dialect;el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on));});
    navRender();
    const fn=[introStage,readingStage,policyStage,audioStage,historyStage,foodStage,festivalStage,endingStage][state.stage];
    body.innerHTML=fn();
    body.querySelectorAll(".teacher-note,.read-tip,.map-note").forEach(el=>el.remove());
    if(state.stage===0) updateMapInfo();
    if(state.stage===3) updateAudioPlayers();
    document.getElementById('sidebar').classList.remove('open');
  }
  function goto(i){state.stage=Math.max(0,Math.min(7,i)); render();window.scrollTo({top:0,behavior:'instant'}); main.scrollTop=0;}
  function introStage(){
    return `<section class="intro-layout">${mapComponent()}${mapSidePanel()}</section>`;
  }
  // 110年客委會全國客家人口調查；人口數採圖3-6所公布之「千人」數值。
  // 腔調欄依教師指定的地方使用概況，並參照教育部、各地官方語言資料。
  const TW_COUNTIES = [
    {id:'hsinchu',name:'新竹縣',count:387,ratio:67.8,primary:'海陸腔',other:'北四縣腔、饒平腔',x:350,y:191,lx:221,ly:202},
    {id:'hsinchucity',name:'新竹市',count:137,ratio:30.3,primary:'海陸腔',other:'四縣腔',x:338,y:166,lx:208,ly:149},
    {id:'taoyuan',name:'桃園市',count:905,ratio:39.9,primary:'四縣腔',other:'海陸腔、饒平腔',x:394,y:139,lx:433,ly:124},
    {id:'miaoli',name:'苗栗縣',count:339,ratio:62.5,primary:'四縣腔',other:'海陸腔、饒平腔',x:318,y:226,lx:190,ly:239},
    {id:'taichung',name:'臺中市',count:493,ratio:17.5,primary:'大埔腔',other:'四縣腔',x:300,y:285,lx:190,ly:296},
    {id:'yunlin',name:'雲林縣',count:58,ratio:8.5,primary:'詔安腔',other:'四縣腔',x:266,y:359,lx:155,ly:371},
    {id:'kaohsiung',name:'高雄市',count:407,ratio:14.7,primary:'南四縣腔',other:'四縣腔',x:274,y:467,lx:146,ly:464},
    {id:'pintung',name:'屏東縣',count:188,ratio:23.1,primary:'南四縣腔',other:'四縣腔',x:294,y:535,lx:171,ly:558},
    {id:'hualien',name:'花蓮縣',count:111,ratio:34.2,primary:'海陸腔、四縣腔',other:'',x:432,y:341,lx:464,ly:342},
    {id:'taitung',name:'臺東縣',count:44,ratio:20.6,primary:'海陸腔、四縣腔',other:'',x:355,y:480,lx:398,ly:503}
  ];
  function makePin(x,y,name,id,labelX,labelY,cls=''){
    return `<g class="pin ${cls}" role="button" tabindex="0" data-action="map-point" data-place="${id}" aria-label="查看${name}"><circle class="halo" cx="${x}" cy="${y}" r="29"/><circle class="core" cx="${x}" cy="${y}" r="8"/><text x="${labelX}" y="${labelY}">${name}</text></g>`;
  }
  function countyPin(c){
    const higher=c.ratio>=50?'high':c.ratio>=30?'medium':'normal';
    const selected=state.place===c.id?'selected':'';
    const labelX=c.lx,labelY=c.ly;
    const startX=c.x, startY=c.y;
    return `<g class="pin county-pin ${higher} ${selected}" role="button" tabindex="0" data-action="map-point" data-place="${c.id}" aria-label="查看${c.name}客家人口資料">
      <circle class="pulse-ring" cx="${c.x}" cy="${c.y}" r="18"/>
      <circle class="pulse-ring delay" cx="${c.x}" cy="${c.y}" r="18"/>
      <circle class="halo" cx="${c.x}" cy="${c.y}" r="24"/>
      <path class="pin-leader" d="M${startX} ${startY} L${labelX<c.x?labelX+82:labelX-7} ${labelY-5}"/>
      <circle class="core" cx="${c.x}" cy="${c.y}" r="7"/>
      <text x="${labelX}" y="${labelY}">${c.name}</text>
    </g>`;
  }
  function mapComponent(){
    const tabs=[['overview','東亞與東南亞'],['taiwan','臺灣客家人口'],['indonesia','印尼客家聚居地']]
      .map(([id,label])=>`<button type="button" class="map-tab ${state.mapView===id?'active':''}" data-action="map-view" data-view="${id}" aria-pressed="${state.mapView===id}">${label}</button>`).join('');
    let title='',map='';
    if(state.mapView==='overview'){
      title='從廣東、福建出發，客家人走向哪裡？';
      const route=state.migrationRoute==='taiwan'
        ? `<path class="migration-path" pathLength="100" d="M471 139 Q520 103 545 126" marker-end="url(#migrationArrow)"/><circle class="route-destination" cx="545" cy="126" r="24"/>`
        : state.migrationRoute==='nanyang'
          ? `<path class="migration-path" pathLength="100" d="M471 139 C433 257 412 378 378 459" marker-end="url(#migrationArrow)"/><circle class="route-destination" cx="378" cy="459" r="24"/>`
          : '';
      map=`<svg class="map-svg map-geo" viewBox="0 0 1020 680" role="img" aria-label="東亞與東南亞地圖。點選廣東、福建客家原鄉選擇遷移方向。">
        <image href="assets/images/asia-coast-accurate.svg" width="1020" height="680"/>
        <defs><marker id="migrationArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#ffc874"/></marker></defs>
        ${route}
        ${makePin(471,139,'廣東、福建原鄉','origin',290,113,'origin-pin')}
        ${makePin(545,126,'臺灣','taiwan',572,102)}
        ${makePin(378,459,'山口洋','singkawang',403,453)}
        ${makePin(338,501,'邦加島','bangka',243,525)}
        ${makePin(398,569,'爪哇島','java',432,592)}
        <text class="geo-label" x="475" y="376">南海</text><text class="geo-label" x="619" y="492">印尼群島</text><text class="geo-label" x="575" y="255">菲律賓</text>
      </svg>`;
    }else if(state.mapView==='taiwan'){
      title='臺灣的客家人，分布在哪些縣市？';
      map=`<svg class="map-svg map-taiwan" viewBox="0 0 680 710" role="img" aria-label="臺灣客家人口熱區地圖，點選十個縣市的光暈標記查看客家人口及客語腔調。">
        <image href="assets/images/taiwan-hakka-heatmap-v6.svg" width="680" height="710"/>
        <image class="county-boundaries" href="assets/images/taiwan-county-lines.png" x="74" y="57" width="486.2" height="629.7" preserveAspectRatio="none" opacity=".65" style="pointer-events:none"/>
        ${TW_COUNTIES.map(countyPin).join('')}
      </svg>`;
    } else {
      title='印尼的客家人，聚居在哪些地方？';
      map=`<svg class="map-svg map-indonesia" viewBox="0 0 1020 500" role="img" aria-label="印尼海岸線與客家社群位置，點選圖釘認識地點。">
        <image href="assets/images/indonesia-coast-accurate.svg" width="1020" height="500"/>
        ${makePin(329,192,'山口洋','singkawang',355,174)}
        ${makePin(337,211,'坤甸','pontianak',366,253)}
        ${makePin(273,252,'邦加島','bangka',174,233)}
        ${makePin(287,334,'雅加達','jakarta',198,361)}
        ${makePin(405,355,'泗水','surabaya',429,352)}
        <text class="geo-label" x="458" y="113">加里曼丹</text><text class="geo-label" x="147" y="180">蘇門答臘</text><text class="geo-label" x="348" y="400">爪哇島</text>
      </svg>`;
    }
    return `<section class="map-panel" id="mapPanel"><div class="map-header"><div><span class="micro-label">地理探索</span><h2>${title}</h2></div></div>
       <div class="map-tabs" role="group" aria-label="切換地圖主題">${tabs}</div>
       <div class="map-viewport">${map}</div>
       <div class="map-info" id="mapInfo" aria-live="polite"></div>
    </section>`;
  }
  function mapSidePanel(){
    if(state.mapView==='taiwan'){
      const top=[...TW_COUNTIES].sort((a,b)=>b.ratio-a.ratio).slice(0,5);
      return `<aside class="panel intro-side distribution-panel"><span class="micro-label">客委會｜2021年調查</span><h2>客家人口比例</h2>
        <div class="county-ratios">${top.map(c=>`<button type="button" class="ratio-row ratio-button" data-action="map-point" data-place="${c.id}"><span>${c.name}</span><span class="ratio-track"><span style="width:${c.ratio}%"></span></span><strong>${c.ratio}%</strong></button>`).join('')}</div>
        <h3 class="location-list-title">選擇縣市</h3>
        <div class="location-chips county-chips">${TW_COUNTIES.map(c=>`<button type="button" class="${state.place===c.id?'active':''}" data-action="map-point" data-place="${c.id}">${c.name}</button>`).join('')}</div>
        <p class="prompt-side">為什麼客家人口較多的地區，仍然需要客語課？</p>
      </aside>`;
    }
    if(state.mapView==='indonesia'){
      return `<aside class="panel intro-side distribution-panel"><span class="micro-label">印尼客家聚落</span><h2>跨島嶼的客家生活</h2>
      <p>從西加里曼丹的山口洋、坤甸，到邦加和爪哇島的城市，探索不同地方的客家社群。</p>
      <div class="location-chips"><button data-action="map-point" data-place="singkawang">山口洋</button><button data-action="map-point" data-place="pontianak">坤甸</button><button data-action="map-point" data-place="bangka">邦加</button><button data-action="map-point" data-place="jakarta">雅加達</button><button data-action="map-point" data-place="surabaya">泗水</button></div>
      <p class="prompt-side">這些客家社群都在同一座島上嗎？</p></aside>`;
    }
    return `<aside class="panel intro-side"><div class="micro-label">探索印尼</div><h2 class="question">印尼有多少人口？<br>有多少種地方語言？</h2>
        <p class="muted">先猜一猜，再揭曉。</p>
        <div class="stat"><div class="micro-label">印尼人口</div><div class="number">${state.reveal?'2.87億':'？'}</div><small>${state.reveal?'2026年年中估計':'猜猜看'}</small></div>
        <div class="stat"><div class="micro-label">地方語言</div><div class="number">${state.reveal?'718種':'？'}</div><small>${state.reveal?'印尼教育部資料庫':'猜猜看'}</small></div>
        <button class="action" data-action="reveal">${state.reveal?'收起數據':'揭曉答案'}</button>
        <div class="choice-hint">點選地圖上的「廣東、福建原鄉」，展開遷移故事。</div>
      </aside>`;
  }
  function updateMapInfo(){
    const e=document.getElementById('mapInfo');if(!e)return;
    if(state.mapView==='taiwan'){
      const c=TW_COUNTIES.find(x=>x.id===state.place)||TW_COUNTIES[0];
      e.innerHTML=`<div class="county-info"><div><strong class="county-info-name">${c.name}</strong><span class="county-info-year">2021年客家人口推估</span></div>
        <div class="county-info-number"><span><small>客家人口</small><b>約${(c.count/10).toFixed(1)}萬人</b></span><span><small>占縣市人口</small><b>${c.ratio}%</b></span></div>
        <div class="county-info-dialects"><span><small>主要客語腔調</small><b>${esc(c.primary)}</b></span>${c.other?`<span><small>其他腔調</small><b>${esc(c.other)}</b></span>`:''}</div></div>`;
      return;
    }
    const places={
      intro:['點選地圖，開始探索','請點廣東、福建客家原鄉，選擇往臺灣或往南洋的遷移方向。'],
      origin:['廣東、福建客家原鄉','選擇「往臺灣移民」或「往南洋移民」，探索歷史遷移路線。'],
      taiwan:['臺灣客庄','客家人移居臺灣後，形成桃竹苗、六堆、花東等不同地方的客家生活。'],
      singkawang:['山口洋｜Singkawang','位於西加里曼丹，保有客語生活、廟宇與元宵慶典。'],
      pontianak:['坤甸｜Pontianak','西加里曼丹主要城市，有客家及其他華人移民社群。'],
      java:['爪哇島｜Java','雅加達、泗水等城市有客家社團與華人移民社群。'],
      bangka:['邦加島｜Bangka','當地錫礦產業與歷史上的客家移民發展有密切關係。'],
      jakarta:['雅加達｜Jakarta','印尼首都與都會區，歷來有客家會館及社團。'],
      surabaya:['泗水｜Surabaya','位於東爪哇，有客家社團與會館活動。']
    };
    const s=places[state.place]||places.intro;
    e.innerHTML=`<strong>${s[0]}</strong><div>${s[1]}</div>`;
  }
  function showMigrationChoice(){
    openDialog('客家人離開原鄉，往哪裡遷移？','選擇遷移方向',`<div class="migration-choices">
      <button type="button" data-action="migration-select" data-destination="taiwan"><span class="choice-symbol">↗</span><strong>往臺灣移民</strong><small>從原鄉到臺灣客庄</small></button>
      <button type="button" data-action="migration-select" data-destination="nanyang"><span class="choice-symbol">↘</span><strong>往南洋移民</strong><small>從原鄉到婆羅洲等地</small></button>
    </div>`);
  }
  function groupFor(i){return i<=4?0:i<=8?1:i<=11?2:3;}
  function highlightWords(text,dialect){
    const keys=DATA.vocab.map(v=>({id:v.id,t:v[dialect]})).sort((a,b)=>b.t.length-a.t.length);
    let out='',cur=0;
    while(cur<text.length){let hit=null;for(const v of keys){if(text.startsWith(v.t,cur)){hit=v;break;}}
      if(hit){out+=`<button type="button" class="vocab-btn" data-action="vocab" data-vocab="${hit.id}" title="查看${esc(hit.t)}詞義">${esc(hit.t)}</button>`;cur+=hit.t.length;}
      else{out+=esc(text[cur]);cur++;}}
    return out;
  }
  function readingUnit(row){
    const d=state.dialect;
    const content=(which)=>{const v=row[which];return `<div class="dialect-col"><span class="dialect-name">${labels[which]}</span><div class="han-text">${highlightWords(v.text,which)}</div>${state.pinyin?`<div class="pinyin-text">${esc(formatPinyin(v.pinyin,which))}</div>`:''}</div>`;};
    return `<div class="reading-unit ${d==='both'?'both':''}"><div class="unit-n">課文第${row.id}段</div>${d==='both'?content('hailu')+content('sixian'):content(d)}</div>`;
  }
  function readingStage(){
    const sets=[{name:'旅程與祖籍',ids:[1,2,3,4,5]},{name:'世代與政策',ids:[6,7,8,9]},{name:'工作與產業',ids:[10,11,12]},{name:'羅芳伯與蘭芳',ids:[13,14]}];
    const group=sets[state.chunk];
    const title=(which)=>DATA.title[which];
    return `<section class="panel"><div class="row spacebetween"><div><div class="micro-label">配合課本閱讀 · 標音可隱藏</div><h2 style="margin-top:5px">${esc(title('hailu').text)}</h2>${state.pinyin?`<div class="reading-title-pinyin">${state.dialect==='both'?`<span>海陸：${esc(formatPinyin(title('hailu').pinyin,'hailu'))}</span><span>四縣：${esc(formatPinyin(title('sixian').pinyin,'sixian'))}</span>`:esc(formatPinyin(title(state.dialect).pinyin,state.dialect))}</div>`:''}</div><span class="tag amber">點擊底線詞語查看註解</span></div>
      <div class="reading-controls">${sets.map((s,i)=>`<button class="chunk ${i===state.chunk?'active':''}" data-action="chunk" data-index="${i}">${i+1}. ${s.name}</button>`).join('')}</div>
      <div class="reading-panel">${DATA.rows.filter(r=>group.ids.includes(r.id)).map(readingUnit).join('')}</div>
      <div class="vocab-strip">${DATA.vocab.map(v=>`<button data-action="vocab" data-vocab="${v.id}">${esc(state.dialect==='sixian'?v.sixian:v.hailu)}</button>`).join('')}</div>
    </section>`;
  }
  function policyStage(){
    const poll=['家裡或親戚聚會','學校客語課','市場、商店或街上','社區活動與廟會','平常很少聽到'];
    return `<section class="panel"><span class="micro-label">從課文回到生活</span><h2 class="question">住在客家人口集中的地方，<br>就一定會說客語嗎？</h2><div class="grid2">
       <div class="policy-col"><span class="tag amber">印尼的歷史背景</span><h3>華文教育與出版曾受限制</h3><p>課文描述1960年代中後期開始的限制；華文學校、出版等政策影響了部分族群語言的學習與使用環境。</p></div>
       <div class="policy-col"><span class="tag">臺灣的歷史背景</span><h3>過去推行國語政策</h3><p>學校與公共場合的語言環境曾以國語為主，本土語言的使用機會與世代傳承受到影響。</p></div>
     </div></section>
     <section class="panel soft"><div class="micro-label">課堂提問 · 學習單任務一</div><h2>你平常在哪裡比較容易聽到客語？</h2><div class="poll">${poll.map((p,i)=>`<button class="${state.poll.includes(i)?'active':''}" data-action="poll" data-index="${i}">${p}</button>`).join('')}</div><div class="selection-output">${state.poll.length?`目前選擇：${state.poll.map(i=>poll[i]).join('、')}`:'可以複選，分享你生活中的客語經驗。'}</div><p class="question" style="font-size:19px;margin-top:15px">如果希望客語繼續有人使用，生活中還可以增加哪些使用機會？</p></section>`;
  }
  function audioCard(id,title,subtitle){
    const file=state.audio[id];
    return `<div class="audio-chooser"><span class="micro-label">${id==='tw'?'音檔 A':'音檔 B'}</span><h3>${title}</h3><p class="audio-note">${subtitle}</p>
      <input type="file" accept="audio/*" data-audio="${id}" aria-label="載入${title}音檔">
      ${file?`<audio id="audio-${id}" controls preload="metadata" src="${esc(file)}">此瀏覽器無法播放音檔。</audio><div class="audio-status">${state.audioTemporary[id]?'本次臨時選取的本機檔案':'已配置固定音檔'}</div>`:`<div class="audio-status">尚未載入音檔，請選取音訊檔案。</div>`}
    </div>`;
  }
  function audioStage(){
    return `<section class="panel"><span class="micro-label">聆聽兩地客語</span><h2 class="question">你聽到了熟悉的客語聲音嗎？</h2><div class="grid2">${audioCard('tw','臺灣海陸客語','臺灣客語語音')}${audioCard('id','印尼山口洋客語','山口洋客語語音')}</div></section>
    <section class="panel photo-context">${photo('singkawang','community-photo')}<div><span class="micro-label">印尼・西加里曼丹</span><h2>山口洋的客家社群</h2><p>客語、廟宇與節慶活動，延續在地客家社群的日常生活。</p></div></section><section class="panel soft"><div class="grid2"><div><div class="micro-label">聆聽問題</div><h2>哪些地方聽起來熟悉？</h2><p>語調、個別詞語，還是整句的大意？你注意到哪些熟悉的聲音？</p></div><div><div class="micro-label">連回課文</div><h2>海外也有客語生活</h2><p>早期限制政策不等於每一個客家社群都停止使用客語。家庭、社區與日常交往都可能影響語言延續。</p></div></div></section>`;
  }
  function historyStage(){
    const dat=[
      {year:'1772年前後',title:'到婆羅洲尋找新生活',desc:'羅芳伯來到西加里曼丹，參與當地華人移民社群。採金、農業與商業，讓移民逐漸建立新的生活。',q:'想想看：一群人遠離原鄉，到新地方工作，除了賺錢，還需要解決哪些事情？'},
      {year:'1777年',title:'蘭芳公司聯盟建立',desc:'羅芳伯在曼多爾一帶整合採金組織。這裡的「公司」並不等同今天只做買賣的股份有限公司，還涉及社群事務、治理及地方秩序。',q:'如果有許多人一起採金、住在同一地區，誰來處理糾紛與共同事務？'},
      {year:'1884年',title:'蘭芳公司走入歷史',desc:'在礦業變化、地方衝突及荷蘭殖民勢力擴張等因素下，蘭芳公司於1884年被解散。',q:'我們能從這個故事，看到海外客家人在當地做過哪些努力？'}
    ];
    const x=dat[state.lanfang];
    return `<section class="panel"><div class="micro-label">歷史故事 · 三幕式導覽</div><h2>從採金移民到地方社群</h2><div class="meter">${dat.map((d,i)=>`<button data-action="history" data-index="${i}" class="${i===state.lanfang?'active':''}">${d.year}</button>`).join('')}</div>
    <div class="histcard" style="margin-top:16px"><div class="year">${x.year}</div><h3>${x.title}</h3><p>${x.desc}</p><div class="answer-box" style="margin-top:16px">${x.q}</div></div></section>
    <section class="panel photo-context">${photo('singkawang','history-photo')}<div><span class="micro-label">從過去走向現在</span><h2>西加里曼丹至今仍有活躍的客家社群</h2><p>這張照片是現代山口洋的廟宇景觀，不是18世紀蘭芳公司的歷史影像。</p></div></section><section class="panel"><h2>蘭芳公司做哪些事？</h2><div class="info-tiles"><div class="tile"><strong>⛏ 採金與經濟</strong>組織礦業生產，並發展農業與市場。</div><div class="tile"><strong>🏘 社群治理</strong>協調群體內部的共同事務與地方秩序。</div><div class="tile"><strong>🤝 對外關係</strong>與當地政治勢力及其他社群互動。</div></div><p class="muted">「蘭芳公司」兼具經濟與地方治理功能，其政治組織性質仍有不同學術詮釋。</p></section>`;
  }
  function dumplingSVG(which){
    const id=which==='tw'?'twfood':'idfood';
    const color=which==='tw'?'#e0e0c2':'#e2e9d8';
    return `<svg viewBox="0 0 350 230" role="img" aria-label="粄食外形示意插畫，非食物實景照片"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><ellipse cx="174" cy="180" rx="137" ry="31" fill="#88aba4" opacity=".32"/><ellipse cx="174" cy="171" rx="135" ry="37" fill="#f5f8f2" stroke="#cadbd3" stroke-width="5"/>${which==='tw'?
      '<path d="M78 157 Q69 113 106 94 Q150 64 172 98 Q202 130 177 161Z" fill="url(#twfood)" stroke="#a1b6a2" stroke-width="4"/><path d="M156 157 Q150 115 188 92 Q224 76 255 116 Q271 142 247 159Z" fill="url(#twfood)" stroke="#a1b6a2" stroke-width="4"/><path d="M93 133 Q134 102 162 140 M175 136 Q207 106 247 140" stroke="#b4c5ae" stroke-width="5" stroke-linecap="round" fill="none"/>':
      '<path d="M65 151 Q75 107 112 111 Q149 119 163 156Z" fill="url(#idfood)" stroke="#a0b7a2" stroke-width="4"/><path d="M137 156 Q146 102 192 109 Q222 114 239 158Z" fill="url(#idfood)" stroke="#a0b7a2" stroke-width="4"/><path d="M226 157 Q228 121 263 117 Q288 124 300 156Z" fill="url(#idfood)" stroke="#a0b7a2" stroke-width="4"/><path d="M85 141 Q114 123 144 143 M163 142 Q193 124 218 145 M247 144 Q270 134 287 148" fill="none" stroke="#bfd1bd" stroke-width="4"/>'}<circle cx="292" cy="180" r="10" fill="#588e61"/><circle cx="280" cy="187" r="8" fill="#65a66e"/><circle cx="311" cy="177" r="8" fill="#6a9a61"/></svg>`;
  }
  function foodStage(){
    return `<section class="grid2"><div class="food-card"><div class="card-illustration">${photo('twfood','food-photo')}</div><div class="food-body"><span class="tag">臺灣客家</span><h3>菜包／豬籠粄</h3><p>常見鹹餡：蘿蔔絲、蘿蔔乾、香菇等，外皮以米製作。</p></div></div><div class="food-card"><div class="card-illustration">${photo('idfood','food-photo')}</div><div class="food-body"><span class="tag amber">印尼邦加</span><h3>Choi Pan／菜粄</h3><p>名稱是「菜粄」的在地羅馬字拼寫之一；常見涼薯、韭菜等餡料，也是鹹食。</p></div></div></section>
    <section class="panel"><div class="micro-label">觀察實景照片</div><h2>找找看：相同在哪裡？不同在哪裡？</h2><div class="compare-line"><div><strong>共同點</strong><br>以米製外皮包餡，都是移民社群熟悉的粄食文化。</div><div><strong>差異</strong><br>餡料、調味、外形與搭配醬料可因地方而不同。</div></div><div class="answer-box" style="margin-top:14px">先觀察圖片，再在學習單各寫下一項相同與不同。</div></section>
    <section class="panel soft"><h2>南洋米食都比較甜嗎？</h2><p>某些南洋米食與甜點會使用椰奶、椰絲或椰糖；但山口洋的Choi Pan常是鹹食。臺灣客家粄食也同時有甜、鹹兩類。</p></section>`;
  }
  function festivalStage(){
    const f=[
      {icon:'🏮',photo:'lantern',title:'臺灣：元宵花燈',desc:'看花燈、賞燈會，是熟悉的元宵活動之一。'},
      {icon:'🐉',photo:'dragon',title:'苗栗：𪹚龍',desc:'苗栗客庄具有地方特色的元宵民俗活動。'},
      {icon:'🔥',title:'北埔：油笐火',desc:'人們以火把參與地方慶典，與北埔的地方記憶相連。', link:'https://www.hakka.gov.tw/chhakka/app/data/view?id=25&module=hotnews&serno=2184b505-30da-4372-92d2-c345d0c144a3'},
      {icon:'🎭',photo:'tatung',title:'山口洋：Cap Go Meh',desc:'元宵慶典包含Tatung遊行，展現多族群互動的地方文化。'}
    ];
    return `<section class="panel"><div class="micro-label">快速觀察</div><h2>同樣是元宵，活動為什麼不一樣？</h2><div class="grid4">${f.map(x=>`<div class="festival-card">${x.photo?photo(x.photo,'festival-photo'):`<div class="festival-symbol" aria-hidden="true">${x.icon}</div>`}<h3>${x.title}</h3><p>${x.desc}</p>${x.link?`<a class="festival-source" href="${x.link}" target="_blank" rel="noopener noreferrer">查看活動照片 ↗</a>`:''}</div>`).join('')}</div><div class="answer-box" style="margin-top:17px">選一個例子：它和你熟悉的元宵節有哪些相同或不同？</div></section>`;
  }
  function endingStage(){
    const cards=[
      {name:'保留',desc:'保有與原鄉相連的語言、食物或節慶元素',example:'不同地方仍能看見「客家粄食」這種文化線索。'},
      {name:'改變',desc:'生活環境、材料、語言使用情境產生變化',example:'臺灣與印尼菜粄的內餡、做法有各自的在地特色。'},
      {name:'融合',desc:'與其他族群、地方文化相遇並交流',example:'山口洋元宵活動展現不同族群的共同參與。'}
    ];
    return `<section class="panel"><div class="micro-label">最後的文化提問</div><h2 class="question">你今天最有印象的是哪一個例子？<br>它讓你想到「保留、改變」還是「融合」？</h2><div class="grid3">${cards.map(c=>`<button type="button" class="reflection ${state.reflection===c.name?'active':''}" data-action="reflect" data-value="${c.name}" style="text-align:left"><strong>${c.name}</strong><p>${c.desc}</p></button>`).join('')}</div>
    <div class="answer-box" style="margin-top:15px">${cards.find(c=>c.name===state.reflection).example}</div></section>
    <section class="panel soft"><div class="grid2"><div><div class="micro-label">課程總結</div><div class="lesson-outro">飄洋過海，客家文化在不同地方繼續生活。</div><p>臺灣與印尼的客家人有歷史連結，也有各自的社會環境與文化發展。</p></div><div><h2>收回學習單前</h2><p>選一個今天的實例，寫出你看到的文化現象與理由。</p><a href="worksheet.html" target="_blank" rel="noopener" class="action" style="display:inline-block;text-decoration:none;margin-top:10px">開啟可列印學習單 ↗</a></div></div></section>`;
  }
  function updateAudioPlayers(){
    // 音檔由瀏覽器原生audio控制播放；file選擇事件由document監聽。
  }
  const vocabPinyin={
    qishi:['hi24 she11','hi31 sii55'], zuji:['zu24 sid2','zu31 xid5'],liuli:['liu55 li33','liu11 liag5'],tusheng:['tu24 sen53 tu24 zhong24','tu31 sen24 tu31 zong31'],mxdd:['m55 hiau24 ded5','m11 hiau31 ded2'],shuru:['shu33 nen11 shu33','shu55 nen55 e31'],xi:['siag5','xiag2'],guimo:['gui53 mu55','gui24 mu11']
  };
  function openDialog(title,tag,content){
    document.getElementById('dialogTitle').textContent=title;
    document.getElementById('dialogTag').textContent=tag;
    document.getElementById('dialogContent').innerHTML=content;
    overlay.hidden=false;document.getElementById('dialogClose').focus();
  }
  function showVocab(id){
    const w=DATA.vocab.find(x=>x.id===id);if(!w)return;
    const p=vocabPinyin[id];
    const lines=[['海陸腔',w.hailu,p[0],'hailu'],['四縣腔',w.sixian,p[1],'sixian']].map(x=>`<div class="dialog-dialect"><span><strong>${esc(x[0])}：</strong>${esc(x[1])}</span><small class="vocab-pinyin">${esc(formatPinyin(x[2],x[3]))}</small></div>`).join('');
    openDialog(w.hailu===w.sixian?w.hailu:`${w.hailu}／${w.sixian}`,'詞彙解釋',`${lines}<p><strong>詞義：</strong>${esc(w.definition)}</p><p><strong>補充：</strong>${esc(w.note)}</p>`);
  }
  function showSources(){
    openDialog('資料與圖片來源','文獻與圖像',`<div class="sources-list">${([{label:'客委會｜110年全國客家人口暨語言基礎資料調查研究（縣市人口數及比例）',url:'https://www.hakka.gov.tw/File/Attach/37585/File_96737.pdf'},{label:'國家文化記憶庫｜新竹市的方言區劃：客家語',url:'https://tcmb.culture.tw/zh-tw/detail?id=170548&indexCode=Culture_Object'},{label:'臺中市客委會｜客語腔調分布',url:'https://www.hakka.taichung.gov.tw/381494/post'},...DATA.sources]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}${[`<a href="${PHOTO_SOURCES.twfood.page}" target="_blank" rel="noopener noreferrer">臺灣客家菜包・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.idfood.page}" target="_blank" rel="noopener noreferrer">印尼邦加客家菜粄・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.lantern.page}" target="_blank" rel="noopener noreferrer">臺灣元宵花燈・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.dragon.page}" target="_blank" rel="noopener noreferrer">苗栗𪹚龍・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.tatung.page}" target="_blank" rel="noopener noreferrer">山口洋元宵Tatung・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.singkawang.page}" target="_blank" rel="noopener noreferrer">山口洋廟宇・圖片來源 ↗</a>`].join('')}</div>`);
  }
  function closeDialog(){overlay.hidden=true;}
  document.addEventListener('click',e=>{
    if(e.target===overlay){closeDialog();return;}
    const el=e.target.closest('[data-action]');if(!el)return;
    const action=el.dataset.action;
    if(action==='jump')goto(Number(el.dataset.index));
    if(action==='reveal'){state.reveal=!state.reveal;render();}
    if(action==='map-view'){state.mapView=el.dataset.view;state.place=state.mapView==='taiwan'?'hsinchu':'intro';render();}
    if(action==='map-point'){if(state.mapView==='overview'&&el.dataset.place==='origin'){showMigrationChoice();}else{state.place=el.dataset.place;updateMapInfo();body.querySelectorAll('.county-pin').forEach(p=>p.classList.toggle('selected',p.dataset.place===state.place));body.querySelectorAll('.county-chips button').forEach(p=>p.classList.toggle('active',p.dataset.place===state.place));}}
    if(action==='migration-select'){
      state.migrationRoute=el.dataset.destination;
      state.place=state.migrationRoute==='taiwan'?'taiwan':'singkawang';
      closeDialog();render();
    }
    if(action==='chunk'){state.chunk=Number(el.dataset.index);render();}
    if(action==='vocab')showVocab(el.dataset.vocab);
    if(action==='poll'){const i=Number(el.dataset.index);state.poll=state.poll.includes(i)?state.poll.filter(x=>x!==i):[...state.poll,i];render();}
    if(action==='history'){state.lanfang=Number(el.dataset.index);render();}
    if(action==='reflect'){state.reflection=el.dataset.value;render();}
  });
  document.addEventListener('change',e=>{
    if(!e.target.matches('[data-audio]'))return;
    const kind=e.target.dataset.audio;
    const file=e.target.files&&e.target.files[0];if(!file)return;
    if(state.audioTemporary[kind]&&state.audio[kind]) URL.revokeObjectURL(state.audio[kind]);
    state.audio[kind]=URL.createObjectURL(file);state.audioTemporary[kind]=true;render();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeDialog();document.getElementById('sidebar').classList.remove('open');return;}
    if(!overlay.hidden||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
    if((e.key==='Enter'||e.key===' ') && e.target.matches('.map-svg .pin')){e.preventDefault();if(state.mapView==='overview'&&e.target.dataset.place==='origin'){showMigrationChoice();}else{state.place=e.target.dataset.place;updateMapInfo();}return;}
    if(e.key==='ArrowRight' || e.key==='PageDown'){e.preventDefault();goto(state.stage+1);}
    if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();goto(state.stage-1);}
    if(e.key.toLowerCase()==='f'){document.getElementById('fullscreenToggle').click();}
  });
  document.querySelectorAll('[data-dialect]').forEach(el=>el.addEventListener('click',()=>{state.dialect=el.dataset.dialect;render();}));
  document.getElementById('pinyinToggle').addEventListener('click',()=>{state.pinyin=!state.pinyin;render();});
  document.getElementById('toneModeToggle').addEventListener('click',()=>{state.toneMode=state.toneMode==='value'?'shape':'value';render();});
  document.getElementById('fontToggle').addEventListener('click',()=>{state.fontUp=state.fontUp>1?1:1.27;render();});
  document.getElementById('nextBtn').addEventListener('click',()=>goto(state.stage===7?0:state.stage+1));
  document.getElementById('prevBtn').addEventListener('click',()=>goto(state.stage-1));
  document.getElementById('mapHome').addEventListener('click',()=>goto(0));
  document.getElementById('viewSources').addEventListener('click',showSources);
  document.getElementById('mobileMenu').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('dialogClose').addEventListener('click',closeDialog);
  document.getElementById('fullscreenToggle').addEventListener('click',()=>{
    if(document.fullscreenElement)document.exitFullscreen(); else if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
  });
  render();
})();


/* 內建課堂工具：不再需要另外上傳tools.js。 */
/* beta V6.0.1 課堂工具：獨立原生JavaScript，無後端、無帳號、無網路傳送。 */
(() => {
  'use strict';
  const overlay = document.getElementById('toolOverlay');
  const content = document.getElementById('toolContent');
  const title = document.getElementById('toolTitle');
  if (!overlay || !content || !title) return;
  let active = '';
  const sw = { running:false, elapsed:0, started:0 };
  const timer = { seconds:60, remaining:60*1000, running:false, until:0, finished:false };
  const wheel = { names:['1號','2號','3號','4號','5號','6號','7號','8號'], picked:[], exclude:true, spinning:false, rotation:0, last:'' };
  const presets = [[15,'15秒'],[30,'30秒'],[60,'1分鐘'],[120,'2分鐘'],[180,'3分鐘'],[300,'5分鐘']];
  const fmt = ms => {
    const seconds=Math.floor(Math.max(0,ms)/1000), cent=Math.floor((Math.max(0,ms)%1000)/10);
    const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60;
    return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(cent).padStart(2,'0');
  };
  const fmtTime = ms => {
    const s=Math.ceil(Math.max(0,ms)/1000);
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  };
  function openTool(kind){
    active=kind; overlay.hidden=false;
    title.textContent=({stopwatch:'碼錶',countdown:'倒數計時器',spinner:'輪盤抽籤'})[kind];
    render();document.getElementById('toolClose').focus();
  }
  function closeTool(){overlay.hidden=true;active='';}
  function stopwatchValue(){return sw.elapsed+(sw.running?Date.now()-sw.started:0);}
  function timerValue(){return timer.running?Math.max(0,timer.until-Date.now()):timer.remaining;}
  function render(){
    if (active==='stopwatch'){
      content.innerHTML=`<div class="tool-clock" id="stopwatchDisplay" aria-live="off">${fmt(stopwatchValue())}</div>
       <div class="tool-actions"><button class="tool-primary" data-util="sw-toggle">${sw.running?'暫停':sw.elapsed?'繼續':'開始'}</button>
       <button class="tool-secondary" data-util="sw-reset">歸零</button></div>`;
    } else if (active==='countdown') {
      content.innerHTML=`<div class="tool-presets" role="group" aria-label="倒數時間">${presets.map(([secs,label])=>`<button class="preset ${timer.seconds===secs?'active':''}" data-util="set-preset" data-seconds="${secs}" aria-pressed="${timer.seconds===secs}">${label}</button>`).join('')}</div>
      <div class="tool-clock countdown-clock ${timer.finished?'timer-done':''}" id="countdownDisplay">${fmtTime(timerValue())}</div>
      <div class="timer-end-caption" id="timerStatus">${timer.finished?'時間到！':timer.running?'倒數中':''}</div>
      <div class="tool-actions"><button class="tool-primary" data-util="timer-toggle">${timer.running?'暫停':timer.remaining<timer.seconds&&!timer.finished?'繼續':'開始'}</button>
      <button class="tool-secondary" data-util="timer-reset">重設</button></div>`;
    } else if(active==='spinner'){
      content.innerHTML=`<div class="spinner-layout"><div class="wheel-panel">
       <div class="wheel-surround"><div class="wheel-pointer" aria-hidden="true"></div><canvas id="wheelCanvas" width="640" height="640" aria-label="旋轉抽籤輪盤"></canvas><div class="wheel-hub" aria-hidden="true">客</div></div>
       <div id="wheelResult" class="wheel-result" aria-live="polite">${wheel.last?`抽中：${escapeHTML(wheel.last)}`:'按「開始抽籤」旋轉輪盤'}</div>
       <div class="tool-actions"><button class="tool-primary" data-util="wheel-spin" ${wheel.spinning?'disabled':''}>${wheel.spinning?'抽籤中……':'開始抽籤'}</button><button class="tool-secondary" data-util="wheel-clear">重新抽籤</button></div></div>
       <div class="wheel-settings"><label for="wheelNames">學生姓名／座號（一行一人，也可用逗號分隔）</label>
       <textarea id="wheelNames" rows="10" placeholder="01\n02\n03\n04" ${wheel.spinning?'disabled':''}>${escapeHTML(wheel.names.join('\n'))}</textarea>
       <label class="wheel-check"><input id="wheelExclude" type="checkbox" ${wheel.exclude?'checked':''} ${wheel.spinning?'disabled':''}/>抽過的人暫不重複</label>
       <p id="wheelStatus" class="wheel-status">${wheel.names.length}人｜已抽${wheel.picked.length}人｜可抽${getPool().length}人</p>
       <div class="picked-label">已抽中</div><div id="pickedNames" class="picked-names">${wheel.picked.length?wheel.picked.map(x=>`<span>${escapeHTML(x)}</span>`).join(''):'尚無紀錄'}</div>
       </div></div>`;
      drawWheel();
    }
  }
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));}
  function parseNames(input){return [...new Set(input.split(/[\n,，、;；]+/).map(s=>s.trim()).filter(Boolean))].slice(0,120);}
  function getPool(){return wheel.exclude?wheel.names.filter(n=>!wheel.picked.includes(n)):wheel.names;}
  function drawWheel(){
    const canvas=document.getElementById('wheelCanvas'); if(!canvas)return;
    const ctx=canvas.getContext('2d'); if(!ctx)return;
    const a=getPool(); const n=a.length; const mid=320,r=296;
    ctx.clearRect(0,0,640,640);
    if(n===0){ctx.fillStyle='#e7f1ef';ctx.beginPath();ctx.arc(mid,mid,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#305760';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.fillText('全部抽完了',mid,mid);return;}
    const colors=['#24677a','#d49855','#317e81','#b9634e','#426d98','#b28a50','#5b8982','#a66a77'];
    for(let i=0;i<n;i++){
      const start=-Math.PI/2+i*2*Math.PI/n, end=-Math.PI/2+(i+1)*2*Math.PI/n;
      ctx.beginPath();ctx.moveTo(mid,mid);ctx.arc(mid,mid,r,start,end);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle='#ffffffa8';ctx.lineWidth=2;ctx.stroke();
      ctx.save();ctx.translate(mid,mid);ctx.rotate((start+end)/2);
      ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.shadowColor='#16323eaa';ctx.shadowBlur=4;
      const font=n>40?13:n>25?16:n>15?21:n>8?25:30;
      ctx.font=`bold ${font}px sans-serif`;
      const label=n>36?String(i+1):a[i].slice(0,9);
      ctx.fillText(label,r-22,0,r*.72);ctx.restore();
    }
    ctx.beginPath();ctx.arc(mid,mid,r,0,2*Math.PI);ctx.strokeStyle='#d6e3d9';ctx.lineWidth=8;ctx.stroke();
  }
  function randomIndex(length){
    if(globalThis.crypto?.getRandomValues){const arr=new Uint32Array(1);globalThis.crypto.getRandomValues(arr);return arr[0]%length;}
    return Math.floor(Math.random()*length);
  }
  let audioCtx;
  function ding(){
    try{
      const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
      audioCtx=audioCtx||new AudioContext();if(audioCtx.state==='suspended') audioCtx.resume().catch(()=>{});
      [880,1174.66,1567.98].forEach((freq,i)=>{
        const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),now=audioCtx.currentTime+i*.18;
        osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.14,now+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+.24);
        osc.connect(gain).connect(audioCtx.destination);osc.start(now);osc.stop(now+.25);
      });
    }catch(_){}
  }
  document.addEventListener('click',e=>{
    const launch=e.target.closest('[data-tool]');if(launch){openTool(launch.dataset.tool);return;}
    if(e.target===overlay||e.target.closest('#toolClose')){closeTool();return;}
    const el=e.target.closest('[data-util]');if(!el)return;
    const op=el.dataset.util;
    if(op==='sw-toggle'){if(sw.running){sw.elapsed=stopwatchValue();sw.running=false;}else{sw.started=Date.now();sw.running=true;} render();}
    if(op==='sw-reset'){sw.running=false;sw.elapsed=0;sw.started=0;render();}
    if(op==='set-preset'){timer.seconds=Number(el.dataset.seconds);timer.remaining=timer.seconds*1000;timer.running=false;timer.finished=false;render();}
    if(op==='timer-toggle'){
      if(timer.running){timer.remaining=timerValue();timer.running=false;}
      else {if(timer.finished||timer.remaining<=0){timer.remaining=timer.seconds*1000;timer.finished=false;}timer.until=Date.now()+timer.remaining;timer.running=true;}
      render();
    }
    if(op==='timer-reset'){timer.running=false;timer.remaining=timer.seconds*1000;timer.finished=false;render();}
    if(op==='wheel-clear'){if(wheel.spinning)return;wheel.picked=[];wheel.rotation=0;wheel.last='';render();}
    if(op==='wheel-spin')spin();
  });
  document.addEventListener('input',e=>{
    if(e.target.id!=='wheelNames'||wheel.spinning)return;
    const names=parseNames(e.target.value);wheel.names=names;wheel.picked=wheel.picked.filter(n=>names.includes(n));wheel.last='';wheel.rotation=0;
    drawWheel();
    const canvas=document.getElementById('wheelCanvas');if(canvas){canvas.style.transition='none';canvas.style.transform='rotate(0deg)';}
    const result=document.getElementById('wheelResult');if(result)result.textContent='按「開始抽籤」旋轉輪盤';
    const picked=document.getElementById('pickedNames');if(picked){picked.replaceChildren(...wheel.picked.map(name=>{const span=document.createElement('span');span.textContent=name;return span;}));if(!wheel.picked.length)picked.textContent='尚無紀錄';}
    const status=document.getElementById('wheelStatus');if(status)status.textContent=`${names.length}人｜已抽${wheel.picked.length}人｜可抽${getPool().length}人`;
  });
  document.addEventListener('change',e=>{
    if(e.target.id!=='wheelExclude'||wheel.spinning)return;
    wheel.exclude=e.target.checked;wheel.rotation=0;wheel.last='';render();
  });
  function spin(){
    if(wheel.spinning)return;const pool=getPool();if(!pool.length){const r=document.getElementById('wheelResult');if(r)r.textContent='已全部抽完，請按「重新抽籤」。';return;}
    wheel.spinning=true;
    const canvas=document.getElementById('wheelCanvas');
    // 上一次結果先保留在輪盤上；只有下一次開始抽籤才重新分配剩餘名單。
    if(canvas){canvas.style.transition='none';canvas.style.transform='rotate(0deg)';}
    wheel.rotation=0;
    drawWheel();
    const n=pool.length,winner=randomIndex(n),result=pool[winner];
    const current=((wheel.rotation%360)+360)%360;
    const desired=-((winner+.5)*360/n);
    const adjustment=((desired-current)%360+360)%360;
    wheel.rotation+=360*(5+Math.floor(Math.random()*2))+adjustment;
    if(canvas){canvas.style.transition='transform 4.4s cubic-bezier(.12,.72,.12,1)';canvas.style.transform=`rotate(${wheel.rotation}deg)`;}
    const spinButton=document.querySelector('[data-util="wheel-spin"]');if(spinButton){spinButton.disabled=true;spinButton.textContent='抽籤中……';}
    window.setTimeout(()=>{
      wheel.last=result;wheel.picked.push(result);wheel.spinning=false;
      // 停在抽中的名字上，讓全班能看清楚結果；不立即重畫成剩餘名單。
      if(active==='spinner'&&!overlay.hidden){
        const resultBox=document.getElementById('wheelResult');
        if(resultBox)resultBox.textContent=`抽中：${result}`;
        const spinBtn=document.querySelector('[data-util="wheel-spin"]');
        if(spinBtn){spinBtn.disabled=false;spinBtn.textContent='再抽一次';}
        const status=document.getElementById('wheelStatus');
        if(status)status.textContent=`${wheel.names.length}人｜已抽${wheel.picked.length}人｜可抽${getPool().length}人`;
        const picked=document.getElementById('pickedNames');
        if(picked){picked.replaceChildren(...wheel.picked.map(name=>{const span=document.createElement('span');span.textContent=name;return span;}));}
      }
    },4470);
  }
  function tick(){
    if(timer.running&&Date.now()>=timer.until){timer.remaining=0;timer.running=false;timer.finished=true;ding();if(active==='countdown'&&!overlay.hidden)render();}
    if(overlay.hidden)return;
    if(active==='stopwatch'){
      const el=document.getElementById('stopwatchDisplay');if(el)el.textContent=fmt(stopwatchValue());
    } else if(active==='countdown'){
      const el=document.getElementById('countdownDisplay');if(el)el.textContent=fmtTime(timerValue());
    }
  }
  window.setInterval(tick,60);
  document.addEventListener('keydown',e=>{
    if(overlay.hidden)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeTool();}
    else if(['ArrowRight','ArrowLeft','PageUp','PageDown','f','F'].includes(e.key))e.stopImmediatePropagation();
  },true);
})();

