/* 教師操作網站：不使用框架、網路API或伺服器。
   修改課文請到 content.js；修改固定音檔路徑請修改 BUILTIN_AUDIO。
*/
(() => {
  'use strict';
  const DATA = window.LESSON_DATA;
  if (!DATA) { document.getElementById('stageBody').textContent='找不到content.js，請確認檔案放在同一資料夾。'; return; }
  const STAGES = [
    {name:'認識印尼',sub:'人口、語言與移民路線',time:'0～5分鐘',heading:'千島之國，客家在哪裡？',lead:'認識原鄉、臺灣與南洋的客家移民與地理分布。'},
    {name:'課文閱讀',sub:'雙腔課文、8個詞彙',time:'5～14分鐘',heading:'行讀客家世界：印尼客家之旅',lead:'看課本、朗讀重點句，點擊詞彙可開啟註解。'},
    {name:'語言傳承',sub:'政策與生活經驗',time:'14～20分鐘',heading:'客家人不少，為什麼客語仍面臨傳承挑戰？',lead:'從課文中的印尼語言政策，連結臺灣的歷史與學生生活。'},
    {name:'海外客語',sub:'聽見山口洋',time:'20～24分鐘',heading:'隔著海洋，還聽得見熟悉的客話嗎？',lead:'聽一聽臺灣與山口洋的客語，找出熟悉的聲音。'},
    {name:'蘭芳公司',sub:'羅芳伯與海外移民',time:'24～32分鐘',heading:'蘭芳公司，真的只是一間公司嗎？',lead:'從採金移民到地方組織，認識18世紀海外客家人的歷史。'},
    {name:'尋找客家味',sub:'臺灣菜包與印尼菜粄',time:'32～39分鐘',heading:'看起來相似的粄，吃起來也一樣嗎？',lead:'從米食的名稱、食材與內餡，觀察文化在不同地方的延續與變化。'},
    {name:'元宵文化',sub:'花燈、𪹚龍與油笐火',time:'39～42分鐘',heading:'元宵節，原來可以這樣過！',lead:'從臺灣客庄到印尼山口洋，看看節慶如何展現地方特色。'},
    {name:'文化統整',sub:'保留、改變、融合',time:'42～45分鐘',heading:'飄洋過海之後，客家文化變了嗎？',lead:'回顧今天的探索，從一個具體案例說明你的觀察。'}
  ];
  /* 加入正式、已取得使用權的音檔後可把這裡改為相對路徑，例如 'assets/audio/taiwan-hailu.mp3'。*/
  const BUILTIN_AUDIO = {tw:'', id:''};
  // 完成教案後，把PDF放在assets/docs，再填入相對路徑即可啟用下載。
  const LESSON_PLAN_FILE = '';
  const COUNTY_DATA = {
    hsinchu:{name:'新竹縣',count:387000,ratio:67.8,primary:'海陸腔',others:'北四縣腔、饒平腔'},
    hsinchuCity:{name:'新竹市',count:137000,ratio:30.3,primary:'海陸腔',others:'四縣腔'},
    taoyuan:{name:'桃園市',count:905000,ratio:39.9,primary:'四縣腔',others:'海陸腔、饒平腔'},
    miaoli:{name:'苗栗縣',count:339000,ratio:62.5,primary:'四縣腔',others:'海陸腔、饒平腔'},
    taichung:{name:'臺中市',count:493000,ratio:17.5,primary:'大埔腔',others:'四縣腔'},
    yunlin:{name:'雲林縣',count:58000,ratio:8.5,primary:'詔安腔',others:'四縣腔'},
    kaohsiung:{name:'高雄市',count:407000,ratio:14.7,primary:'南四縣腔',others:'四縣腔'},
    pintung:{name:'屏東縣',count:188000,ratio:23.1,primary:'南四縣腔',others:'四縣腔'},
    hualien:{name:'花蓮縣',count:111000,ratio:34.2,primary:'海陸腔、四縣腔',others:'—'},
    taitung:{name:'臺東縣',count:44000,ratio:20.6,primary:'海陸腔、四縣腔',others:'—'}
  };
  const COUNTY_SOURCE = 'https://www.hakka.gov.tw/chhakka/app/data/doc?aplistdn=&detailNo=96737&id=83&module=basicInformation&preview=&serno=37585&type=s';
  const state = {migrationRoute:null,mapView:'overview',stage:0,dialect:'hailu',pinyin:true,toneMode:'value',fontUp:1,chunk:0,reveal:false,place:'intro',poll:[],lanfang:0,food:0,reflection:'保留',audio:{tw:BUILTIN_AUDIO.tw,id:BUILTIN_AUDIO.id},audioTemporary:{tw:false,id:false}};
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
    document.getElementById('stageEyebrow').textContent=`第${state.stage+1}站`;
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
    body.querySelectorAll('.teacher-note,.read-tip,.citation,.map-note').forEach(el=>el.remove());
    if(state.stage===0) updateMapInfo();
    if(state.stage===3) updateAudioPlayers();
    document.getElementById('sidebar').classList.remove('open');
  }
  function goto(i){state.stage=Math.max(0,Math.min(7,i)); render();window.scrollTo({top:0,behavior:'instant'}); main.scrollTop=0;}
  function introStage(){
    return `<section class="intro-layout">${mapComponent()}${mapSidePanel()}</section>`;
  }
  function makePin(x,y,name,id,labelX,labelY,cls=''){
    return `<g class="pin ${cls}" role="button" tabindex="0" data-action="map-point" data-place="${id}" aria-label="查看${name}"><circle class="halo" cx="${x}" cy="${y}" r="29"/><circle class="core" cx="${x}" cy="${y}" r="8"/><text x="${labelX}" y="${labelY}">${name}</text></g>`;
  }
  function makeCountyPin(x,y,name,id,labelX,labelY){
    const ratio=COUNTY_DATA[id]?.ratio||0;
    const intensity=ratio>=60?'hot':ratio>=30?'warm':ratio>=20?'mild':'light';
    return `<g class="pin county-pin ${intensity}" role="button" tabindex="0" data-action="map-point" data-place="${id}" aria-label="查看${name}客家人口與腔調"><circle class="halo pulse-1" cx="${x}" cy="${y}" r="17"/><circle class="halo pulse-2" cx="${x}" cy="${y}" r="17"/><circle class="core" cx="${x}" cy="${y}" r="6"/><text x="${labelX}" y="${labelY}">${name}</text></g>`;
  }
  function mapComponent(){
    const tabs=[['overview','東亞與東南亞'],['taiwan','臺灣客家人口'],['indonesia','印尼客家聚居地']].map(([id,label])=>`<button type="button" class="map-tab ${state.mapView===id?'active':''}" data-action="map-view" data-view="${id}" aria-pressed="${state.mapView===id}">${label}</button>`).join('');
    let title='',map='',note='';
    if(state.mapView==='overview'){
      title='從共同原鄉，走向不同的家園';
      map=`<svg class="map-svg map-geo" viewBox="0 0 1020 680" role="img" aria-label="使用真實海岸線地理資料的東亞與東南亞地圖，臺灣在中國東南外海、山口洋位於西加里曼丹。">
      <image href="assets/images/asia-coast-accurate.svg" width="1020" height="680"/>
      <defs><marker id="overviewArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#f6b76c"/></marker></defs>
      ${state.migrationRoute==='taiwan'?'<path class="migration-route" d="M471 139 Q520 103 545 126" marker-end="url(#overviewArrow)"/>':''}
      ${state.migrationRoute==='nanyang'?'<path class="migration-route" d="M471 139 Q445 285 378 459" marker-end="url(#overviewArrow)"/>':''}
      ${makePin(471,139,'客家原鄉','origin',347,112)}
      ${makePin(545,126,'臺灣','taiwan',570,105)}
      ${makePin(378,459,'山口洋','singkawang',403,454)}
      ${makePin(338,501,'邦加島','bangka',248,522)}
      ${makePin(398,569,'爪哇島','java',431,591)}
      <text class="geo-label" x="475" y="376">南海</text><text class="geo-label" x="620" y="491">印尼群島</text><text class="geo-label" x="575" y="255">菲律賓</text>
      </svg>`;
      note='';
    } else if(state.mapView==='taiwan'){
      title='臺灣：客家人口在哪裡比較集中？';
      map=`<svg class="map-svg map-taiwan" viewBox="0 0 680 710" role="img" aria-label="臺灣本島真實海岸線及客家人口分布熱區示意，北臺灣與花東等地較明顯。">
      <image href="assets/images/taiwan-hakka-heatmap.svg" width="680" height="710"/>
      ${makeCountyPin(383,152,'桃園市','taoyuan',410,138)}
      ${makeCountyPin(348,177,'新竹縣','hsinchu',205,195)}
      ${makeCountyPin(324,167,'新竹市','hsinchuCity',200,147)}
      ${makeCountyPin(305,227,'苗栗縣','miaoli',193,247)}
      ${makeCountyPin(275,296,'臺中市','taichung',169,310)}
      ${makeCountyPin(239,372,'雲林縣','yunlin',134,376)}
      ${makeCountyPin(262,478,'高雄市','kaohsiung',151,475)}
      ${makeCountyPin(302,536,'屏東縣','pintung',178,557)}
      ${makeCountyPin(424,332,'花蓮縣','hualien',447,331)}
      ${makeCountyPin(376,450,'臺東縣','taitung',404,457)}
      </svg>`;
      note='';
    } else {
      title='印尼：客家社群分布在哪些地方？';
      map=`<svg class="map-svg map-indonesia" viewBox="0 0 1020 500" role="img" aria-label="具有真實海岸線的印尼地圖，標示有資料支持的客家社群與歷史聚居地。">
      <image href="assets/images/indonesia-coast-accurate.svg" width="1020" height="500"/>
      ${makePin(56,99,'亞齊','aceh',87,75)}
      ${makePin(329,192,'山口洋','singkawang',355,177)}
      ${makePin(337,211,'坤甸','pontianak',357,248)}
      ${makePin(273,252,'邦加島','bangka',176,235)}
      ${makePin(287,334,'雅加達','jakarta',199,362)}
      ${makePin(405,355,'泗水','surabaya',427,354)}
      <text class="geo-label" x="458" y="113">加里曼丹</text><text class="geo-label" x="147" y="180">蘇門答臘</text><text class="geo-label" x="350" y="401">爪哇島</text><text class="geo-label" x="705" y="400">印尼東部群島</text>
      </svg>`;
      note='';
    }
    return `<section class="map-panel" id="mapPanel"><div class="map-header"><div><span class="micro-label" style="color:#f5c385">地理探索 · 真實海岸線</span><h2>${title}</h2></div>${state.mapView==='overview'?'<button type="button" class="ghost" data-action="migration-options">選擇移民方向</button>':''}</div>
      <div class="map-tabs" role="group" aria-label="切換地圖主題">${tabs}</div>
      <div class="map-viewport">${map}</div><div class="map-info" id="mapInfo"></div>
    </section>`;
  }
  function mapSidePanel(){
    if(state.mapView==='taiwan'){
      const data=['hsinchu','miaoli','taoyuan','hualien','hsinchuCity'];
      return `<aside class="panel intro-side distribution-panel"><span class="micro-label">客家委員會｜110年調查</span><h2>哪些縣市的客家人口比例較高？</h2>
      <div class="county-ratios">${data.map(id=>{const x=COUNTY_DATA[id];return `<button class="ratio-row ratio-button" data-action="map-point" data-place="${id}" aria-label="查看${x.name}客家人口資料"><span>${x.name}</span><span class="ratio-track"><span style="width:${x.ratio}%"></span></span><strong>${x.ratio}%</strong></button>`;}).join('')}</div>
      <p class="prompt-side">點擊地圖上的縣市，認識客家人口與當地客語腔調。</p></aside>`;
    }
    if(state.mapView==='indonesia'){
      return `<aside class="panel intro-side distribution-panel"><span class="micro-label">海外客家社群</span><h2>客家人不只住在西加里曼丹</h2><p>點選地圖上的地名，看看西加里曼丹、邦加，以及爪哇、蘇門答臘的客家聚居與社團活動。</p>
      <div class="location-chips"><button data-action="map-point" data-place="singkawang">山口洋</button><button data-action="map-point" data-place="pontianak">坤甸</button><button data-action="map-point" data-place="bangka">邦加</button><button data-action="map-point" data-place="aceh">亞齊</button><button data-action="map-point" data-place="jakarta">雅加達</button><button data-action="map-point" data-place="surabaya">泗水</button></div>
      <p class="prompt-side">這些客家社群都在同一座島上嗎？</p>
      </aside>`;
    }
    return `<aside class="panel intro-side"><div class="micro-label">先猜一猜</div><h2 class="question">印尼有多少人口？<br>有多少種地方語言？</h2><p class="muted">先猜猜看，再揭曉。</p>
        <div class="stat"><div class="micro-label">印尼人口</div><div class="number">${state.reveal?'2.87億':'？'}</div><small>${state.reveal?'2026年年中估計｜BPS':'先猜一猜'}</small></div>
        <div class="stat"><div class="micro-label">已盤點地方語言</div><div class="number">${state.reveal?'718種':'？'}</div><small>${state.reveal?'印尼教育部語言資料庫':'先猜一猜'}</small></div>
        <button class="action" data-action="reveal">${state.reveal?'收起數據':'揭曉答案'}</button>
        <p class="citation">印尼語是國家語言，各地還有許多地方語言。兩個數字採不同資料來源與統計年度。</p></aside>`;
  }
  function updateMapInfo(){
    const e=document.getElementById('mapInfo');if(!e)return;
    if(state.mapView==='taiwan'){
      const x=COUNTY_DATA[state.place];
      if(!x){e.innerHTML='<strong>臺灣客家人口與腔調</strong><div>點擊地圖上的縣市，查看客家人口數、人口比例與主要腔調。</div>';return;}
      const count=(x.count/10000).toFixed(1);
      e.innerHTML=`<strong>${esc(x.name)}</strong><div class="county-stats"><span>客家人口約<strong>${count}萬人</strong></span><span>比例<strong>${x.ratio}%</strong></span></div><div class="dialect-list">主要腔調：<b>${esc(x.primary)}</b><br>其他腔調：${esc(x.others)}</div>`;
      return;
    }
    if(state.mapView==='overview'){
      const items={
        intro:['客家人從哪裡出發？','點擊「客家原鄉」，選擇往臺灣或往南洋的移民方向。'],
        origin:['廣東、福建客家原鄉','選擇移民方向，觀看歷史遷徙路線。'],
        taiwan:['臺灣','客家移民在臺灣形成不同的客庄聚落。'],
        singkawang:['山口洋｜Singkawang','位於印尼西加里曼丹，有活躍的客家社群。'],
        bangka:['邦加島｜Bangka','錫礦產業與客家移民歷史密切相關。'],
        java:['爪哇島｜Java','印尼主要人口與城市集中地之一。']
      };
      const r=state.migrationRoute;
      if(r){e.innerHTML=`<strong>${r==='taiwan'?'往臺灣移民':'往南洋移民'}</strong><div>${r==='taiwan'?'客家移民由廣東、福建等地渡海抵達臺灣。':'客家移民從中國南方出海，前往婆羅洲與南洋各地定居。'}　<button class="route-reset" data-action="migration-options">改選方向</button></div>`;return;}
      const item=items[state.place]||items.intro;
      e.innerHTML=`<strong>${item[0]}</strong><div>${item[1]}</div>`;return;
    }
    const items={
      intro:['印尼客家社群','點擊地點，查看當地客家社群與歷史。'],
      singkawang:['山口洋｜Singkawang','位於西加里曼丹，以客語文化及元宵活動聞名。'],
      pontianak:['坤甸｜Pontianak','西加里曼丹城市，有客家與其他華人移民社群。'],
      java:['爪哇島｜Java','雅加達、泗水等地有客家社團。'],
      bangka:['邦加島｜Bangka','錫礦開採與客家移民的歷史發展密切相關。'],
      aceh:['亞齊｜Aceh','位於蘇門答臘北部，歷史上有客家移民社群。'],
      jakarta:['雅加達｜Jakarta','印尼首都都會區，具有客家社團與都市移民社群。'],
      surabaya:['泗水｜Surabaya','東爪哇城市，有客家會館及社群文化活動。']
    };
    const x=items[state.place]||items.intro;
    e.innerHTML=`<strong>${x[0]}</strong><div>${x[1]}</div>`;
  }
  function showMigrationOptions(){
    openDialog('客家人往哪裡遷移？','客家原鄉・移民方向',`<div class="migration-options"><button type="button" data-action="migration-select" data-route="taiwan"><strong>往臺灣移民</strong><span>廣東、福建 → 臺灣</span></button><button type="button" data-action="migration-select" data-route="nanyang"><strong>往南洋移民</strong><span>廣東、福建 → 婆羅洲與南洋</span></button></div>`);
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
     </div><p class="citation">兩地的制度背景、政策目標與實施方式並不完全相同。比較的是語言政策及生活環境如何影響語言使用，不是認定兩者完全相同。</p></section>
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
    return `<section class="panel"><span class="micro-label">聆聽兩地客語</span><h2 class="question">你聽到了熟悉的客語聲音嗎？</h2><div class="grid2">${audioCard('tw','臺灣海陸客語','臺灣客語語音')}${audioCard('id','印尼山口洋客語','山口洋客語語音')}</div><p class="citation">可選擇兩段錄音，聽聽臺灣與印尼客語的異同。</p></section>
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
    <section class="panel soft"><h2>南洋米食都比較甜嗎？</h2><p>某些南洋米食與甜點會使用椰奶、椰絲或椰糖；但山口洋的Choi Pan常是鹹食。臺灣客家粄食也同時有甜、鹹兩類。</p><p class="muted">避免把整個南洋、或整個臺灣的飲食文化概括成單一口味。</p></section>`;
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
    <div class="answer-box" style="margin-top:15px">${cards.find(c=>c.name===state.reflection).example}</div><p class="citation">一個案例可以同時有保留、改變與融合，不必硬分成互斥的類別。</p></section>
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
    openDialog(w.hailu===w.sixian?w.hailu:`${w.hailu}／${w.sixian}`,'課文詞彙註解',`${lines}<p><strong>詞義：</strong>${esc(w.definition)}</p><p><strong>補充：</strong>${esc(w.note)}</p>`);
  }
  function showSources(){
    openDialog('資料與圖片來源','文獻與圖像',`<div class="sources-list">${DATA.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}<a href="${COUNTY_SOURCE}" target="_blank" rel="noopener noreferrer">客家委員會《110年全國客家人口暨語言基礎資料調查研究》（各縣市人口數與比例） ↗</a>${[`<a href="${PHOTO_SOURCES.twfood.page}" target="_blank" rel="noopener noreferrer">臺灣客家菜包・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.idfood.page}" target="_blank" rel="noopener noreferrer">印尼邦加客家菜粄・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.lantern.page}" target="_blank" rel="noopener noreferrer">臺灣元宵花燈・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.dragon.page}" target="_blank" rel="noopener noreferrer">苗栗𪹚龍・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.tatung.page}" target="_blank" rel="noopener noreferrer">山口洋元宵Tatung・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.singkawang.page}" target="_blank" rel="noopener noreferrer">山口洋廟宇・圖片來源 ↗</a>`].join('')}</div><p class="citation">課文、拼音依提供的雙腔版本整理。照片來源另見各圖片下方連結；分布圖與錄音各有資料範圍。</p>`);
  }
  function closeDialog(){overlay.hidden=true;}
  // 課堂輔助工具：全程在瀏覽器本機執行，不上傳名單或計時資料。
  const toolsOverlay=document.getElementById('toolsOverlay');
  const toolsTabs=document.getElementById('toolsTabs');
  const toolsBody=document.getElementById('toolsBody');
  const stopwatch = {running:false, elapsed:0, startedAt:0};
  const countdown = {running:false, preset:60, remaining:60, endAt:0};
  const wheel = {names:[], picked:[], noRepeat:true, running:false, angle:0, result:''};
  let currentTool='stopwatch';
  let soundContext=null;
  function clockFormat(seconds, precision=false){
    const total=Math.max(0,seconds);
    const m=Math.floor(total/60).toString().padStart(2,'0');
    const sec=Math.floor(total%60).toString().padStart(2,'0');
    return `${m}:${sec}${precision?'.'+Math.floor((total%1)*10):''}`;
  }
  function stopwatchNow(){return stopwatch.elapsed+(stopwatch.running?(Date.now()-stopwatch.startedAt)/1000:0);}
  function countdownNow(){return countdown.running?Math.max(0,(countdown.endAt-Date.now())/1000):countdown.remaining;}
  function chime(){
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      soundContext=soundContext||new AC();
      soundContext.resume().catch(()=>{});
      for(let i=0;i<2;i++){
        const o=soundContext.createOscillator(),g=soundContext.createGain(),t=soundContext.currentTime+i*.28;
        o.type='sine';o.frequency.value=i===0?880:1175;
        g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.03);
        g.gain.exponentialRampToValueAtTime(.0001,t+.22);
        o.connect(g);g.connect(soundContext.destination);o.start(t);o.stop(t+.23);
      }
    }catch(err){/* 沒有音效裝置時仍可使用視覺倒數 */}
  }
  function tickTools(){
    const timerVal=countdownNow();
    if(countdown.running&&timerVal<=0){countdown.running=false;countdown.remaining=0;chime();toolsOverlay.classList.add('timer-finished');}
    const sw=document.getElementById('stopwatchClock');if(sw)sw.textContent=clockFormat(stopwatchNow(),true);
    const cd=document.getElementById('countdownClock');if(cd)cd.textContent=clockFormat(timerVal);
    const top=document.getElementById('toolsToggle');if(top)top.textContent=countdown.running?`◷ ${clockFormat(timerVal)}`:'◷ 課堂工具';
  }
  function wheelPool(){return wheel.noRepeat?wheel.names.filter(x=>!wheel.picked.includes(x)):wheel.names.slice();}
  function wheelVisual(pool){
    if(!pool.length)return '<div class="wheel-disc wheel-empty"><span>載入名單後<br>開始抽籤</span></div>';
    const palette=['#f4b36d','#447d82','#d87557','#90b6ab','#e5ba62','#6a9ca7','#b88b8d','#7cb49f'];
    const n=pool.length,arc=360/n;
    const gradient=`conic-gradient(${pool.map((_,i)=>`${palette[i%palette.length]} ${(i*arc).toFixed(3)}deg ${((i+1)*arc).toFixed(3)}deg`).join(',')})`;
    const names=n<=14?pool.map((name,i)=>`<span class="wheel-label" style="transform:rotate(${((i+.5)*arc).toFixed(2)}deg) translateY(-110px) rotate(${(-((i+.5)*arc)).toFixed(2)}deg)">${esc(name)}</span>`).join(''):`<span class="wheel-center-count">${n}位候選人</span>`;
    return `<div id="wheelDisc" class="wheel-disc" style="background:${gradient};transform:rotate(${wheel.angle}deg)">${names}</div>`;
  }
  function renderTools(){
    const choices=[['stopwatch','碼錶'],['countdown','倒數計時'],['wheel','輪盤抽籤']];
    toolsTabs.innerHTML=choices.map(([id,label])=>`<button type="button" class="tool-tab ${id===currentTool?'active':''}" data-tool-tab="${id}" aria-pressed="${id===currentTool}">${label}</button>`).join('');
    if(currentTool==='stopwatch'){
      toolsBody.innerHTML=`<section class="tool-section"><div class="timer-big" id="stopwatchClock">${clockFormat(stopwatchNow(),true)}</div><p class="tool-label">正向計時</p><div class="tool-buttons"><button class="primary-button" data-tool-action="stopwatch-toggle">${stopwatch.running?'暫停':'開始／繼續'}</button><button class="outline-button" data-tool-action="stopwatch-reset">歸零</button></div></section>`;
    }else if(currentTool==='countdown'){
      const values=[15,30,60,120,180,300];
      toolsBody.innerHTML=`<section class="tool-section"><div class="timer-big ${!countdown.running&&countdown.remaining===0?'time-up':''}" id="countdownClock">${clockFormat(countdownNow())}</div><p class="tool-label">倒數計時，到時響鈴</p><div class="time-presets">${values.map(v=>`<button class="preset ${countdown.preset===v?'active':''}" data-tool-action="preset" data-seconds="${v}">${v<60?v+'秒':v/60+'分鐘'}</button>`).join('')}</div><div class="tool-buttons"><button class="primary-button" data-tool-action="countdown-toggle">${countdown.running?'暫停':'開始／繼續'}</button><button class="outline-button" data-tool-action="countdown-reset">重新設定</button></div></section>`;
    }else{
      const pool=wheelPool();
      toolsBody.innerHTML=`<section class="wheel-tool"><div class="wheel-form"><label for="wheelNamesInput">學生姓名或座號（每行一位）</label><textarea rows="8" id="wheelNamesInput" placeholder="例如：\n1\n2\n3\n或直接貼上班級名單">${esc(wheel.names.join('\n'))}</textarea><div class="tool-buttons"><button class="outline-button" data-tool-action="wheel-load" ${wheel.running?'disabled':''}>更新名單</button><button class="outline-button" data-tool-action="wheel-clear-picks" ${wheel.running?'disabled':''}>重置抽籤紀錄</button></div><label class="tool-checkbox"><input type="checkbox" id="wheelNoRepeat" ${wheel.noRepeat?'checked':''} ${wheel.running?'disabled':''}>抽過的人暫不重複</label><p class="wheel-pool">名單：${wheel.names.length}人　可抽：${pool.length}人</p></div><div class="wheel-area"><div class="wheel-wrap"><div class="wheel-pointer" aria-hidden="true"></div>${wheelVisual(pool)}</div><button class="primary-button spin-btn" data-tool-action="wheel-spin" ${wheel.running||!pool.length?'disabled':''}>${wheel.running?'抽籤中…':'轉動輪盤'}</button><div class="wheel-result" aria-live="polite">${wheel.result?'抽中：'+esc(wheel.result):'準備抽籤'}</div></div></section>`;
    }
    tickTools();
  }
  function openTools(){
    toolsOverlay.hidden=false;toolsOverlay.classList.remove('timer-finished');
    renderTools();document.getElementById('toolsClose').focus();
  }
  function closeTools(){toolsOverlay.hidden=true;}
  document.getElementById('toolsToggle').addEventListener('click',openTools);
  document.getElementById('toolsClose').addEventListener('click',closeTools);
  toolsOverlay.addEventListener('click',e=>{if(e.target===toolsOverlay)closeTools();});
  document.addEventListener('click',e=>{
    const tab=e.target.closest('[data-tool-tab]');if(tab){currentTool=tab.dataset.toolTab;renderTools();return;}
    const el=e.target.closest('[data-tool-action]');if(!el)return;
    const action=el.dataset.toolAction;
    if(action==='stopwatch-toggle'){
      if(stopwatch.running){stopwatch.elapsed=stopwatchNow();stopwatch.running=false;}
      else {stopwatch.startedAt=Date.now();stopwatch.running=true;}
    }
    if(action==='stopwatch-reset'){stopwatch.running=false;stopwatch.elapsed=0;}
    if(action==='preset'){
      countdown.preset=Number(el.dataset.seconds);countdown.remaining=countdown.preset;countdown.running=false;
      toolsOverlay.classList.remove('timer-finished');
    }
    if(action==='countdown-toggle'){
      if(countdown.running){countdown.remaining=countdownNow();countdown.running=false;}
      else {if(countdown.remaining<=0)countdown.remaining=countdown.preset;countdown.endAt=Date.now()+countdown.remaining*1000;countdown.running=true;toolsOverlay.classList.remove('timer-finished');}
    }
    if(action==='countdown-reset'){
      countdown.running=false;countdown.remaining=countdown.preset;toolsOverlay.classList.remove('timer-finished');
    }
    if(action==='wheel-load'){
      const raw=document.getElementById('wheelNamesInput').value;
      wheel.names=[...new Set(raw.split(/[\n\r,，、;；]+/).map(x=>x.trim()).filter(Boolean))].slice(0,60);
      wheel.picked=[];wheel.result='';wheel.angle=0;
    }
    if(action==='wheel-clear-picks'){wheel.picked=[];wheel.result='';wheel.angle=0;}
    if(action==='wheel-spin'){
      const pool=wheelPool();if(wheel.running||!pool.length)return;
      const index=Math.floor(Math.random()*pool.length),chosen=pool[index];
      wheel.running=true;wheel.result='';
      const disc=document.getElementById('wheelDisc');
      const arc=360/pool.length;
      const target=(360-(index+.5)*arc)%360;
      const current=((wheel.angle%360)+360)%360;
      wheel.angle+=6*360+((target-current+360)%360);
      const spinBtn=document.querySelector('.spin-btn');if(spinBtn){spinBtn.disabled=true;spinBtn.textContent='抽籤中…';}
      if(disc){disc.getBoundingClientRect();requestAnimationFrame(()=>{disc.style.transition='transform 4s cubic-bezier(.16,.84,.13,1)';disc.style.transform=`rotate(${wheel.angle}deg)`;});}
      setTimeout(()=>{wheel.running=false;wheel.picked.push(chosen);wheel.result=chosen;if(!toolsOverlay.hidden)renderTools();},4200);
      return;
    }
    renderTools();
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='wheelNoRepeat'){wheel.noRepeat=e.target.checked;wheel.angle=0;renderTools();}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!toolsOverlay.hidden){closeTools();e.stopImmediatePropagation();}});
  setInterval(tickTools,100);
  document.addEventListener('click',e=>{
    if(e.target===overlay){closeDialog();return;}
    const el=e.target.closest('[data-action]');if(!el)return;
    const action=el.dataset.action;
    if(action==='jump')goto(Number(el.dataset.index));
    if(action==='reveal'){state.reveal=!state.reveal;render();}
    if(action==='map-view'){state.mapView=el.dataset.view;state.place='intro';render();}
    if(action==='map-point'){state.place=el.dataset.place;if(state.mapView==='overview'&&state.place==='origin'){showMigrationOptions();}else{updateMapInfo();}}
    if(action==='migration-options'){showMigrationOptions();}
    if(action==='migration-select'){
      state.migrationRoute=el.dataset.route==='taiwan'?'taiwan':'nanyang';
      closeDialog();render();
      const route=document.querySelector('.migration-route');
      if(route){const len=route.getTotalLength();route.style.setProperty('--pathlength',len);}
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
    if((e.key==='Enter'||e.key===' ') && e.target.matches('.map-svg .pin')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}
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
  const lessonPlanLink=document.getElementById('lessonPlanDownload');
  if(LESSON_PLAN_FILE){
    lessonPlanLink.href=LESSON_PLAN_FILE;lessonPlanLink.download='飄洋過海尋客家_教案.pdf';
    lessonPlanLink.textContent='下載正式教案 ↓';lessonPlanLink.classList.remove('is-disabled');
    lessonPlanLink.removeAttribute('aria-disabled');lessonPlanLink.removeAttribute('tabindex');
  }
  render();
})();
