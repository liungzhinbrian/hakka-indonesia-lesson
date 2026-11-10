/* 教師操作網站：不使用框架、網路API或伺服器。
   修改課文請到 content.js；修改固定音檔路徑請修改 BUILTIN_AUDIO。
*/
(() => {
  'use strict';
  const DATA = window.LESSON_DATA;
  if (!DATA) { document.getElementById('stageBody').textContent='找不到content.js，請確認檔案放在同一資料夾。'; return; }
  const STAGES = [
    {name:'認識印尼',sub:'地圖與移民路線',time:'0～5分鐘',heading:'千島之國，客家在哪裡？',lead:'從原鄉到南洋，客家人如何在新的環境中延續自己的語言與生活？'},
    {name:'課文閱讀',sub:'雙腔課文與詞彙',time:'5～10分鐘',heading:'行讀客家世界：印尼客家之旅',lead:'從課文認識印尼客家人的移民與生活。'},
    {name:'移民與蘭芳',sub:'採礦、經商、組織',time:'10～17分鐘',heading:'客家人為何來到南洋？',lead:'從移民、採礦到蘭芳公司，認識海外客家人的歷史。'},
    {name:'尋找客家味',sub:'菜粄與粽子',time:'17～25分鐘',heading:'熟悉的客家味，到了印尼有什麼不一樣？',lead:'比較臺灣與印尼的菜粄和粽子，觀察飲食文化的延續與變化。'},
    {name:'元宵文化',sub:'臺灣與山口洋',time:'25～32分鐘',heading:'元宵節，原來可以這樣過！',lead:'從臺灣客庄到印尼山口洋，看看節慶如何展現地方特色。'},
    {name:'海外客語',sub:'聽見山口洋',time:'32～36分鐘',heading:'隔著海洋，還聽得見熟悉的客話嗎？',lead:'聽聽臺灣海陸客語與山口洋河婆客語，有哪些熟悉或不同的地方。'},
    {name:'語言傳承',sub:'政策、家庭與社區',time:'36～42分鐘',heading:'客家人不少，為什麼客語仍面臨傳承挑戰？',lead:'從語言政策與家庭生活，認識海外客語的使用環境與傳承。'},
    {name:'文化統整',sub:'保留、改變、融合',time:'42～45分鐘',heading:'飄洋過海之後，客家文化變了嗎？',lead:'回顧飲食、節慶與語言的線索，說明文化如何延續、改變與融合。'}
  ];  /* 固定播放教師提供的臺灣海陸及山口洋河婆客語語料。 */
  const BUILTIN_AUDIO = {tw:'assets/audio/taiwan-hailu.wav', id:'assets/audio/singkawang-hopo.wav'};
  const LANFANG_YOUTUBE = 'https://www.youtube.com/watch?v=pwxlliP1mqQ';
  const FESTIVAL_YOUTUBE = 'https://www.youtube.com/watch?v=FEBVKPOcH7k&t=70s';
  const state = {migrationRoute:'',mapView:'overview',stage:0,dialect:'hailu',pinyin:true,toneMode:'value',fontUp:1,chunk:0,geoCamera:{x:0,y:0,w:1020,h:680},twZoom:1,twCenter:{x:340,y:355},indoZoom:1,indoCenter:{x:510,y:250},readingParagraph:1,reveal:false,place:'intro',poll:[],lanfang:0,food:0,foodTopic:'caibao',foodPos:{tw:0,id:0,zong_tw:0,zong_id:0},foodPaused:{tw:false,id:false,zong_tw:false,zong_id:false},reflection:'保留',festivalView:'home',festivalTopic:0,festivalPhoto:{lantern:0,dragon:0,beipu:0},audio:{tw:BUILTIN_AUDIO.tw,id:BUILTIN_AUDIO.id},audioTemporary:{tw:false,id:false}};
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
    beipu: { url:'assets/images/beipu-yuhanghuo.jpg', page:'', credit:'授課教師提供', alt:'北埔油笐火活動夜景' },
    singkawang: { url:'https://commons.wikimedia.org/wiki/Special:FilePath/Singkawang_temple_101221-10576.jpg?width=960', page:'https://commons.wikimedia.org/wiki/File:Singkawang_temple_101221-10576.jpg', credit:'Wibowo Djatmiko', alt:'山口洋三教合一廟宇夜景' },
    singkawang2: {url:'https://commons.wikimedia.org/wiki/Special:FilePath/Singkawang_temple_101221-10563.JPG?width=960', page:'https://commons.wikimedia.org/wiki/File:Singkawang_temple_101221-10563.JPG', credit:'Wibowo Djatmiko', alt:'山口洋廟宇實景'},
    luo: {url:'https://commons.wikimedia.org/wiki/Special:FilePath/Luo_Fangbo.jpg?width=700',page:'https://commons.wikimedia.org/wiki/File:Luo_Fangbo.jpg',credit:'Wikimedia Commons／羅芳伯後世圖像',alt:'羅芳伯的後世畫像'},
  };
  function photo(key, cls=''){ const x=PHOTO_SOURCES[key];if(!x)return ''; const credit=x.page?`<a href="${esc(x.page)}" target="_blank" rel="noopener noreferrer">圖片來源：${esc(x.credit)} ↗</a>`:`<span>圖片來源：${esc(x.credit)}</span>`;return `<figure class="real-photo ${cls}"><img src="${esc(x.url)}" alt="${esc(x.alt)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.parentElement.classList.add('photo-failed')"><figcaption>${credit}</figcaption></figure>`; }
  const sidePanel=document.getElementById('sidebar');
  const navButton=document.getElementById('mobileMenu');
  const navBackdrop=document.getElementById('navBackdrop');
  function openNavigation(){
    sidePanel.classList.add('open');
    sidePanel.setAttribute('aria-hidden','false');
    navButton.setAttribute('aria-expanded','true');
    navButton.setAttribute('aria-label','關閉章節導覽');
    navBackdrop.hidden=false;
    sidePanel.querySelector('.nav-step.active')?.focus();
  }
  function closeNavigation(returnFocus=false){
    const wasOpen=sidePanel.classList.contains('open');
    sidePanel.classList.remove('open');
    sidePanel.setAttribute('aria-hidden','true');
    navButton.setAttribute('aria-expanded','false');
    navButton.setAttribute('aria-label','開啟章節導覽');
    navBackdrop.hidden=true;
    if(returnFocus&&wasOpen)navButton.focus();
  }
  function toggleNavigation(){sidePanel.classList.contains('open')?closeNavigation(true):openNavigation();}
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
    const fn=[introStage,readingStage,historyStage,foodStage,festivalStage,audioStage,policyStage,endingStage][state.stage];
    body.innerHTML=fn();
    if(window.renderCultureVocab&&state.stage>=2&&state.stage<=6){window.renderCultureVocab(body,state.stage,state.dialect,state.toneMode,formatPinyin);}
    startFoodTicker();
    body.querySelectorAll(".teacher-note,.read-tip,.map-note").forEach(el=>el.remove());
    if(state.stage===0){updateMapInfo();if(state.mapView==='taiwan'){updateTaiwanZoom();bindTaiwanPan();}}
    if(state.stage===5) updateAudioPlayers();
    closeNavigation();
  }
  function goto(i,transition=false){
    if(transition && state.stage===0 && i===1){openJourneyTransition();return;}
    stopIndoCamera();resetGeoCamera();state.stage=Math.max(0,Math.min(7,i));
    render();window.scrollTo({top:0,behavior:'instant'});main.scrollTop=0;
  }
  const transitionOverlay=document.getElementById('journeyOverlay');
  function openJourneyTransition(){
    if(!transitionOverlay){goto(1);return;}
    const frame=document.getElementById('journeyPixelFrame');
    frame.src='journey-pixel.html?embed=1&play='+Date.now();
    transitionOverlay.hidden=false;
    document.getElementById('journeySkip')?.focus();
  }
  function closeJourneyTransition(){
    if(transitionOverlay)transitionOverlay.hidden=true;
    const frame=document.getElementById('journeyPixelFrame');if(frame)frame.removeAttribute('src');
    goto(1,false);
  }
  window.addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='hakkaJourneyStart'&&!transitionOverlay.hidden)closeJourneyTransition();});
  document.getElementById('journeyStart')?.addEventListener('click',closeJourneyTransition);
  document.getElementById('journeySkip')?.addEventListener('click',closeJourneyTransition);

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
  // 印尼客家社群位置：與臺灣地圖採用同一種擴散光暈，但不以光圈大小代表人口數量。
  const ID_PLACES = [
    {id:'singkawang',name:'山口洋',x:329,y:192,lx:355,ly:174},
    {id:'pontianak',name:'坤甸',x:337,y:211,lx:366,ly:253},
    {id:'bangka',name:'邦加島',x:273,y:252,lx:174,ly:233},
    {id:'jakarta',name:'雅加達',x:287,y:334,lx:198,ly:361},
    {id:'surabaya',name:'泗水',x:405,y:355,lx:429,ly:352}
  ];
  function indoPin(c){
    const selected=state.place===c.id?'selected':'';
    return `<g class="pin county-pin indo-pin ${selected}" role="button" tabindex="0" data-action="map-point" data-place="${c.id}" aria-label="查看${c.name}客家社群">
      <circle class="pulse-ring" cx="${c.x}" cy="${c.y}" r="15"/>
      <circle class="pulse-ring delay" cx="${c.x}" cy="${c.y}" r="15"/>
      <circle class="halo" cx="${c.x}" cy="${c.y}" r="30"/>
      <path class="pin-leader" d="M${c.x} ${c.y} L${c.lx<c.x?c.lx+85:c.lx-7} ${c.ly-6}"/>
      <circle class="core" cx="${c.x}" cy="${c.y}" r="7"/>
      <text x="${c.lx}" y="${c.ly}">${c.name}</text>
    </g>`;
  }
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function taiwanViewBox(){
    const w=680/state.twZoom,h=710/state.twZoom;
    return `${clamp(state.twCenter.x-w/2,0,680-w).toFixed(1)} ${clamp(state.twCenter.y-h/2,0,710-h).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
  }
  function updateTaiwanZoom(){
    const svg=document.querySelector('.map-svg.map-taiwan');if(!svg)return;
    svg.setAttribute('viewBox',taiwanViewBox());
    const label=document.getElementById('taiwanZoomLabel');if(label)label.textContent=`${Math.round(state.twZoom*100)}%`;
    document.querySelectorAll('[data-action="map-zoom"]').forEach(b=>{
      if(b.dataset.zoom==='in')b.disabled=state.twZoom>=2.49;
      if(b.dataset.zoom==='out')b.disabled=state.twZoom<=1.01;
    });
  }
  // 印尼聚居地：點擊標記後視角平滑放大，並可返回全圖。
  let indoFrame=0;
  function stopIndoCamera(){if(indoFrame)cancelAnimationFrame(indoFrame);indoFrame=0;}
  function indoBox(zoom=state.indoZoom,center=state.indoCenter){
    const w=1020/zoom,h=500/zoom;
    return {x:clamp(center.x-w/2,0,1020-w),y:clamp(center.y-h/2,0,500-h),w,h};
  }
  function indoViewBox(){const b=indoBox();return `${b.x.toFixed(2)} ${b.y.toFixed(2)} ${b.w.toFixed(2)} ${b.h.toFixed(2)}`;}
  function focusIndonesia(place){
    const target=ID_PLACES.find(c=>c.id===place);if(!target)return;
    stopIndoCamera();
    const svg=document.querySelector('.map-svg.map-indonesia');if(!svg)return;
    const from=indoBox(),to=indoBox(2.1,{x:target.x,y:target.y});
    state.indoZoom=2.1;state.indoCenter={x:target.x,y:target.y};
    const begin=performance.now(),duration=650;
    function frame(now){
      if(!svg.isConnected){indoFrame=0;return;}
      const t=clamp((now-begin)/duration,0,1),u=t*t*(3-2*t);
      const b={};for(const key of ['x','y','w','h'])b[key]=from[key]+(to[key]-from[key])*u;
      svg.setAttribute('viewBox',`${b.x.toFixed(2)} ${b.y.toFixed(2)} ${b.w.toFixed(2)} ${b.h.toFixed(2)}`);
      if(t<1)indoFrame=requestAnimationFrame(frame);else indoFrame=0;
    }
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){svg.setAttribute('viewBox',indoViewBox());return;}
    indoFrame=requestAnimationFrame(frame);
  }
  function resetIndonesia(){
    stopIndoCamera();state.indoZoom=1;state.indoCenter={x:510,y:250};
    const svg=document.querySelector('.map-svg.map-indonesia');if(svg)svg.setAttribute('viewBox',indoViewBox());
  }
  // 臺灣地圖在放大時以滑鼠、觸控或觸控筆拖曳；完整視圖不拖動。
  let ignoreMapClickUntil=0;
  function bindTaiwanPan(){
    const svg=document.querySelector('.map-svg.map-taiwan');if(!svg)return;
    let drag=null;
    svg.addEventListener('pointerdown',e=>{
      if(state.twZoom<=1||e.button!==0||e.target.closest('.pin'))return;
      const vb=svg.viewBox.baseVal;
      drag={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,cx:state.twCenter.x,cy:state.twCenter.y,w:vb.width,h:vb.height,moved:false};
      svg.setPointerCapture(e.pointerId);e.preventDefault();
    });
    svg.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.pointerId)return;
      const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;
      if(Math.hypot(dx,dy)>5)drag.moved=true;
      const scale=Math.min(svg.clientWidth/drag.w,svg.clientHeight/drag.h);
      if(!(scale>0))return;
      state.twCenter={x:drag.cx-dx/scale,y:drag.cy-dy/scale};
      updateTaiwanZoom();
    });
    const endDrag=()=>{if(drag?.moved)ignoreMapClickUntil=performance.now()+400;drag=null;};
    svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);svg.addEventListener('lostpointercapture',endDrag);
  }
  // 路線動畫與地圖鏡頭分開處理：目的地是實際標註位置，鏡頭只改變觀看範圍。
  const GEO_FULL={x:0,y:0,w:1020,h:680};
  let geoFrame=0;
  function geoViewBox(){
    const b=state.geoCamera;
    return `${b.x.toFixed(2)} ${b.y.toFixed(2)} ${b.w.toFixed(2)} ${b.h.toFixed(2)}`;
  }
  function stopGeoCamera(){
    if(geoFrame)cancelAnimationFrame(geoFrame);
    geoFrame=0;
  }
  function resetGeoCamera(){
    stopGeoCamera();
    state.geoCamera={...GEO_FULL};
    const svg=document.querySelector('.map-svg.map-geo');
    if(svg)svg.setAttribute('viewBox',geoViewBox());
  }
  function startGeoJourney(){
    stopGeoCamera();
    const svg=document.querySelector('.map-svg.map-geo');
    if(!svg||!state.migrationRoute)return;
    state.geoCamera={...GEO_FULL};
    svg.setAttribute('viewBox',geoViewBox());
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    // 從全圖開始，隨著遷移路線的描繪，逐漸聚焦到目的地。
    // 南洋線以涵蓋全部四個目的地為準，避免只看得到山口洋。
    const towardTaiwan=state.migrationRoute==='taiwan';
    const frames=towardTaiwan?[
      {at:0,box:{...GEO_FULL}},
      {at:.16,box:{...GEO_FULL}},
      {at:.57,box:{x:216,y:32,w:690,h:460}},
      {at:1,box:{x:324,y:28,w:500,h:333}}
    ]:[
      {at:0,box:{...GEO_FULL}},
      {at:.12,box:{...GEO_FULL}},
      {at:.53,box:{x:170,y:125,w:760,h:507}},
      {at:1,box:{x:210,y:276,w:600,h:400}}
    ];
    const duration=towardTaiwan?4600:5900;
    const start=performance.now();
    function tick(now){
      if(!svg.isConnected||state.stage!==0||state.mapView!=='overview'){geoFrame=0;return;}
      const progress=clamp((now-start)/duration,0,1);
      let i=0;
      while(i<frames.length-2&&progress>frames[i+1].at)i++;
      const a=frames[i],b=frames[i+1];
      const u=clamp((progress-a.at)/(b.at-a.at),0,1);
      const eased=u*u*(3-2*u);
      const v={};
      for(const k of ['x','y','w','h'])v[k]=a.box[k]+(b.box[k]-a.box[k])*eased;
      state.geoCamera=v;
      svg.setAttribute('viewBox',geoViewBox());
      if(progress<1)geoFrame=requestAnimationFrame(tick);
      else geoFrame=0;
    }
    geoFrame=requestAnimationFrame(tick);
  }
  function mapComponent(){
    const tabs=[['overview','東亞與東南亞'],['taiwan','臺灣客家人口'],['indonesia','印尼客家聚居地']]
      .map(([id,label])=>`<button type="button" class="map-tab ${state.mapView===id?'active':''}" data-action="map-view" data-view="${id}" aria-pressed="${state.mapView===id}">${label}</button>`).join('');
    let title='',map='';
    if(state.mapView==='overview'){
      title='從廣東、福建出發，客家人走向哪裡？';
      const nanyangRoutes=[
        {place:'山口洋',x:378,y:459,d:'M471 139 C446 264 407 368 378 459'},
        {place:'邦加島',x:338,y:501,d:'M471 139 C419 248 366 399 338 501'},
        {place:'雅加達',x:372,y:566,d:'M471 139 C416 308 388 472 372 566'},
        {place:'泗水',x:446,y:580,d:'M471 139 C465 308 447 469 446 580'}
      ];
      const route=state.migrationRoute==='taiwan'
        ? `<path class="migration-path" pathLength="100" d="M471 139 Q520 103 545 126" marker-end="url(#migrationArrow)"/><circle class="route-destination" cx="545" cy="126" r="24"/>`
        : state.migrationRoute==='nanyang'
          ? nanyangRoutes.map((p,i)=>`<path class="migration-path nanyang-path" pathLength="100" d="${p.d}" style="animation-delay:${(i*.48).toFixed(2)}s" aria-label="原鄉至${p.place}的遷移方向"/><circle class="route-destination" cx="${p.x}" cy="${p.y}" r="20" style="animation-delay:${(3.25+i*.48).toFixed(2)}s"/>`).join('')
          : '';
      map=`<svg class="map-svg map-geo" viewBox="${geoViewBox()}" role="img" aria-label="東亞與東南亞地圖。點選廣東、福建客家原鄉選擇遷移方向。">
        <image href="assets/images/asia-coast-accurate.svg" width="1020" height="680"/>
        <defs><marker id="migrationArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#ffc874"/></marker></defs>
        ${route}
        ${makePin(471,139,'廣東、福建原鄉','origin',290,113,'origin-pin')}
        ${makePin(545,126,'臺灣','taiwan',572,102)}
        ${makePin(378,459,'山口洋','singkawang',403,453)}
        ${makePin(338,501,'邦加島','bangka',243,525)}
        ${makePin(372,566,'雅加達','jakarta',255,566)}
        ${makePin(446,580,'泗水','surabaya',465,595)}
        <text class="geo-label" x="475" y="376">南海</text><text class="geo-label" x="619" y="492">印尼群島</text><text class="geo-label" x="575" y="255">菲律賓</text>
      </svg>`;
    }else if(state.mapView==='taiwan'){
      title='臺灣的客家人，分布在哪些縣市？';
      map=`<svg class="map-svg map-taiwan" viewBox="${taiwanViewBox()}" role="img" aria-label="臺灣客家人口熱區地圖，點選十個縣市的光暈標記查看客家人口及客語腔調。">
        <image href="assets/images/taiwan-hakka-heatmap-v6.svg" width="680" height="710"/>
        <image class="county-boundaries" href="assets/images/taiwan-county-lines.png" x="74" y="57" width="486.2" height="629.7" preserveAspectRatio="none" opacity=".65" style="pointer-events:none"/>
        ${TW_COUNTIES.map(countyPin).join('')}
      </svg>`;
    } else {
      title='印尼的客家人，聚居在哪些地方？';
      map=`<svg class="map-svg map-indonesia" viewBox="${indoViewBox()}" role="img" aria-label="印尼海岸線與客家社群位置，點選圖釘認識地點。">
        <image href="assets/images/indonesia-coast-accurate.svg" width="1020" height="500"/>
        ${ID_PLACES.map(indoPin).join('')}
        <text class="geo-label" x="458" y="113">加里曼丹</text><text class="geo-label" x="147" y="180">蘇門答臘</text><text class="geo-label" x="348" y="400">爪哇島</text>
      </svg>`;
    }
    return `<section class="map-panel" id="mapPanel"><div class="map-header"><div><span class="micro-label">地理探索</span><h2>${title}</h2></div></div>
       <div class="map-tabs" role="group" aria-label="切換地圖主題">${tabs}</div>
       <div class="map-viewport ${state.mapView==='taiwan'?'zoomable-map':''}">${map}
         ${state.mapView==='taiwan'?`<div class="map-zoom-controls" role="group" aria-label="縮放臺灣地圖"><button type="button" data-action="map-zoom" data-zoom="out" aria-label="縮小臺灣地圖" ${state.twZoom<=1?'disabled':''}>−</button><span id="taiwanZoomLabel">${Math.round(state.twZoom*100)}%</span><button type="button" data-action="map-zoom" data-zoom="in" aria-label="放大臺灣地圖" ${state.twZoom>=2.5?'disabled':''}>＋</button><button type="button" data-action="map-zoom" data-zoom="reset" aria-label="恢復原始比例">還原</button></div>`:''}
         ${state.mapView==='overview'&&state.migrationRoute?`<div class="geo-camera-controls" role="group" aria-label="遷移路線檢視"><button type="button" data-action="geo-replay">重播路線</button><button type="button" data-action="geo-reset">返回全圖</button></div>`:''}
         ${state.mapView==='indonesia'&&state.indoZoom>1?`<div class="geo-camera-controls"><button type="button" data-action="indo-reset">返回全圖</button></div>`:''}
       </div>
    </section>`;
  }
  function mapSidePanel(){
    if(state.mapView==='taiwan'){
      const top=[...TW_COUNTIES].sort((a,b)=>b.ratio-a.ratio).slice(0,5);
      return `<aside class="panel intro-side distribution-panel"><span class="micro-label">客委會｜2021年調查</span><h2>客家人口比例</h2>
        <div class="map-info map-info-side" id="mapInfo" aria-live="polite"></div><div class="county-ratios">${top.map(c=>`<button type="button" class="ratio-row ratio-button" data-action="map-point" data-place="${c.id}"><span>${c.name}</span><span class="ratio-track"><span style="width:${c.ratio}%"></span></span><strong>${c.ratio}%</strong></button>`).join('')}</div>
        <h3 class="location-list-title">選擇縣市</h3>
        <div class="location-chips county-chips">${TW_COUNTIES.map(c=>`<button type="button" class="${state.place===c.id?'active':''}" data-action="map-point" data-place="${c.id}">${c.name}</button>`).join('')}</div>
        <p class="prompt-side">為什麼客家人口較多的地區，仍然需要客語課？</p>
      </aside>`;
    }
    if(state.mapView==='indonesia'){
      return `<aside class="panel intro-side distribution-panel"><span class="micro-label">印尼客家聚落</span><h2>跨島嶼的客家生活</h2>
      <div class="map-info map-info-side" id="mapInfo" aria-live="polite"></div><p>從西加里曼丹的山口洋、坤甸，到邦加和爪哇島的城市，探索不同地方的客家社群。</p>
      <div class="location-chips"><button data-action="map-point" data-place="singkawang">山口洋</button><button data-action="map-point" data-place="pontianak">坤甸</button><button data-action="map-point" data-place="bangka">邦加</button><button data-action="map-point" data-place="jakarta">雅加達</button><button data-action="map-point" data-place="surabaya">泗水</button></div>
      <p class="prompt-side">這些客家社群都在同一座島上嗎？</p></aside>`;
    }
    return `<aside class="panel intro-side country-facts"><div class="micro-label">認識印尼 Indonesia</div><h2>千島之國，多語社會</h2>
      <div class="country-numbers"><div><span>印尼總人口（2026年推估）</span><strong>約2.87億</strong></div><div><span>華人占比（2010年普查）</span><strong>約1.2%</strong></div></div>
      <div class="population-compare" aria-label="臺灣客家人口與印尼華人人口比較">
        <div class="population-compare-title">人數比一比：比例小，不代表人數少</div>
        <div class="population-compare-pair">
          <div class="population-compare-item"><span>臺灣客家人口</span><strong>約467萬人</strong><small>2021年客委會調查推估</small></div>
          <div class="population-compare-item"><span>印尼華人人口</span><strong>約283萬人</strong><small>2010年人口普查</small></div>
        </div>
        <p class="population-compare-note">兩組資料年份與族群定義不同；「印尼華人」不等於「印尼客家人」。</p>
      </div>
      <p class="country-language"><b>國家官方語言：</b>印尼語（Bahasa Indonesia）</p>
      <div class="country-heritage"><b>印尼華人保留的部分傳承語言</b><div class="heritage-tags"><span>福建話（閩南語）</span><span>潮汕話（閩語）</span><span>廣府話（粵語）</span><span>客語</span></div></div>
      <p class="source-mini">資料：<a href="https://www.bps.go.id/en/statistics-table/2/MTk3NSMy/mid-year-population-" target="_blank" rel="noopener">印尼統計局（2026年人口推估）</a>、<a href="https://www.atlantis-press.com/article/25889515.pdf" target="_blank" rel="noopener">印尼2010年族群普查</a>、<a href="https://www.ly.gov.tw/Pages/Detail.aspx?nodeid=56071&amp;pid=253058" target="_blank" rel="noopener">臺灣客委會2021年調查</a>。不宜將2010年1.2%直接套用於2026年總人口。</p>
      <div class="map-info map-info-side" id="mapInfo" aria-live="polite"></div>
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
    const title=(which)=>DATA.title[which];
    return `<section class="panel"><div class="row spacebetween"><div><div class="micro-label">課文閱讀</div><h2 style="margin-top:5px">${esc(title('hailu').text)}</h2>${state.pinyin?`<div class="reading-title-pinyin">${state.dialect==='both'?`<span>海陸：${esc(formatPinyin(title('hailu').pinyin,'hailu'))}</span><span>四縣：${esc(formatPinyin(title('sixian').pinyin,'sixian'))}</span>`:esc(formatPinyin(title(state.dialect).pinyin,state.dialect))}</div>`:''}</div><span class="tag amber">點擊底線詞語查看註解</span></div>
      <nav class="reading-paragraph-nav" aria-label="跳至課文段落">${DATA.rows.map(r=>`<button type="button" data-action="reading-paragraph" data-paragraph="${r.id}" class="${state.readingParagraph===r.id?'active':''}" aria-label="閱讀課文第${r.id}段">${r.id}</button>`).join('')}</nav>
      <div class="reading-panel reading-all">${DATA.rows.map(r=>`<div id="reading-row-${r.id}" class="reading-anchor">${readingUnit(r)}</div>`).join('')}</div>
      <div class="vocab-strip">${DATA.vocab.map(v=>`<button data-action="vocab" data-vocab="${v.id}">${esc(state.dialect==='sixian'?v.sixian:v.hailu)}</button>`).join('')}</div>
    </section>`;
  }
  // 比較音檔隨網站打包，開啟頁面即可播放；不顯示上傳欄位。
  function audioCard(id,title,subtitle){
    const file=BUILTIN_AUDIO[id];
    return `<div class="audio-chooser audio-fixed"><span class="micro-label">${id==='tw'?'音檔 A':'音檔 B'}</span><h3>${title}</h3><p class="audio-note">${subtitle}</p>
      <audio id="audio-${id}" controls preload="metadata" src="${esc(file)}">此瀏覽器無法播放音檔。</audio>
    </div>`;
  }
  const INFO_CARDS={
    'singkawang-language':{title:'山口洋的河婆客語',tag:'語言',body:'山口洋（Singkawang）位於印尼西加里曼丹。當地不少客家人使用河婆客語，與廣東揭西一帶的河婆話具有歷史聯繫。客語在家人、鄰里、市場及不同世代間的使用情況，也反映當地社群的生活環境。',source:'https://english.hakka.gov.tw/Content/Content?LanguageType=ENG&NodeID=769&PageID=43423'},
    'singkawang-temple':{title:'廟宇：地方社群相聚的空間',tag:'信仰',body:'山口洋的廟宇既是信仰活動場所，也與地方節慶、社會網絡及社群記憶相連。不同祖籍、語言與信仰背景的人，都可能參與當地的活動。',photo:'singkawang2',source:'https://www.cambridge.org/core/journals/modern-asian-studies/article/in-the-shadow-of-the-bri-the-figurative-infrastructures-of-chinese-religion-along-the-maritime-silk-road/E2A66B6F830D3719DAC334145712F195'},
    'singkawang-festival':{title:'Cap Go Meh：山口洋的元宵',tag:'節慶',body:'山口洋的農曆正月十五以Cap Go Meh慶典聞名，活動中可見Tatung遊行、廟宇信仰及各種地方文化元素。這也是學生觀察海外客家文化與不同族群互動的具體例子。',source:'https://english.hakka.gov.tw/Content/Content?LanguageType=ENG&NodeID=769&PageID=43423'},
    'singkawang-history':{title:'從礦業移民到港口城鎮',tag:'歷史',body:'18世紀西婆羅洲金礦開發吸引廣東客家移民前來。山口洋曾是與內陸礦區往來的港口；即使後來採礦與社會環境改變，客家社群仍在這座城市延續生活。',source:'https://www.persee.fr/doc/arch_0044-8613_2006_num_72_1_4042'},
    'lang-indo':{title:'印尼：語言政策如何影響下一代？',tag:'語言傳承',body:'課文記錄1966年至2000年前後的華文教育受限制時期。對部分華人家庭而言，原先在學校學習華文的途徑減少；國家語言印尼語以及地方語言，則在不同生活場合持續使用。客語能否繼續被孩子學會，也和家庭及社區的使用機會有關。',source:'https://english.hakka.gov.tw/Content/Content?LanguageType=ENG&NodeID=769&PageID=43445'},
    'lang-taiwan':{title:'臺灣：從學校到家庭的語言環境',tag:'語言傳承',body:'過去臺灣推行國語政策，學校與公共領域的本土語言使用空間受到限制。如今學校開設客語課程，但孩子在家庭、朋友之間是否經常聽到或使用客語，仍會影響語言傳承。',source:'https://www.hakka.gov.tw/'},
    'lang-family':{title:'家庭：有人和孩子講客語嗎？',tag:'日常生活',body:'學校能提供接觸與學習客語的機會；若家中也有人願意以客語聊天、講故事，孩子就有更多練習和使用語言的情境。不同家庭的語言選擇可能不一樣。'},
    'lang-community':{title:'社區：客語在哪些地方出現？',tag:'日常生活',body:'市場、店家、廟會、社區活動及同儕聊天，都可能成為使用客語的場合。可以請學生想一想：自己在哪裡聽過客語？有沒有機會用客語回答？'},
    'lf-arrival':{title:'18世紀：離開原鄉，來到西婆羅洲',tag:'蘭芳故事',body:'廣東客家人循海上商貿與移民路線來到西婆羅洲。當地礦產吸引移民，採金、農業與商業使華人聚落逐步發展。羅芳伯也是當時來到西婆羅洲的客家移民之一。',source:'https://journals.gmu.edu/whc/article/download/3678/2073?inline=1'},
    'lf-mining':{title:'金礦與「公司」',tag:'蘭芳故事',body:'這裡的「公司」（kongsi）原是移民群體協作的組織形式，不是今天只做買賣的商業公司。礦工需要協調開採、勞動、資源分配，也得面對外部競爭與地方關係。',source:'https://journal-itb.org/sostek/volumes/2016/15/issues/2/benarkah-ada-republik-lanfang-kongsi-di-kalimantan-barat.html'},
    'lf-1777':{title:'1777年：羅芳伯與蘭芳公司',tag:'蘭芳故事',body:'羅芳伯整合移民與採金組織，蘭芳公司在西婆羅洲曼多爾一帶形成具有自治性質的社群組織。它不只處理採金生產，也涉及人事選任、治安、糾紛與對外往來。',photo:'luo',source:'https://hakka.ncu.edu.tw/hakka_periodical/upload/2016/09/3-1-3%E5%AE%A2%E5%AE%B6%E4%BA%BA%E7%9A%84%E5%A4%A7%E4%BC%AF%E5%85%AC-%E8%98%AD%E8%8A%B3%E5%85%AC%E5%8F%B8%E7%9A%84%E7%BE%85%E8%8A%B3%E4%BC%AF%E5%8F%8A%E5%85%B6%E4%BA%8B%E6%A5%AD.pdf'},
    'lf-govern':{title:'蘭芳公司為何被稱為「共和國」？',tag:'蘭芳故事',body:'蘭芳公司的組織具有集體議事、首領選任與地方治理功能，因此常被後世稱為「蘭芳共和國」。不過，它與現代民主共和國的制度並不相同；學者仍從當時的礦業社群、地方政治與殖民歷史來理解其性質。',source:'https://journals.gmu.edu/whc/article/download/3678/2073?inline=1'},
    'lf-1884':{title:'1884年：自治組織走入歷史',tag:'蘭芳故事',body:'19世紀後期，礦業、地方政治與荷蘭殖民擴張持續改變西婆羅洲。蘭芳公司於1884年被荷蘭殖民勢力解散，但當地客家社群並未因此消失。',source:'https://journal-itb.org/sostek/volumes/2016/15/issues/2/benarkah-ada-republik-lanfang-kongsi-di-kalimantan-barat.html'}
  };
  function infoTile(id,kicker,title,summary,photoKey=''){
    return `<button type="button" class="story-info-card" data-action="story-info" data-card="${id}" aria-label="了解${esc(title)}">
      ${photoKey?`<div class="story-card-photo">${photo(photoKey)}</div>`:''}
      <span class="micro-label">${esc(kicker)}</span><strong>${esc(title)}</strong><span>${esc(summary)}</span><span class="story-more">點擊了解更多 ＋</span>
    </button>`;
  }
  function showStoryInfo(id){
    if(id==='singkawang-festival'){showFestivalVideo();return;}
    if(id==='lang-family'){
      openDialog('家庭：有人和孩子講客語嗎？','日常生活',`<p class="story-detail-text">學校能提供接觸與學習客語的機會；若家中也有人願意以客語聊天、講故事，孩子就有更多練習和使用語言的情境。</p><p class="story-detail-text">請觀察2010年及2020年家庭主要使用語言的地域分布。圖例與普查統計口徑可能不同，不能直接把色塊變化當作語言人口增減。</p><div class="family-language-compare"><figure><a target="_blank" rel="noopener" href="assets/images/family-languages/taiwan-home-language-2010.webp"><img src="assets/images/family-languages/taiwan-home-language-2010.webp" alt="2010年臺灣家庭主要使用語言分布" loading="lazy"></a><figcaption>2010年家庭主要使用語言（點圖放大）</figcaption></figure><figure><a target="_blank" rel="noopener" href="assets/images/family-languages/taiwan-home-language-2020.png"><img src="assets/images/family-languages/taiwan-home-language-2020.png" alt="2020年臺灣家庭主要使用語言分布" loading="lazy"></a><figcaption>2020年家庭主要使用語言（點圖放大）</figcaption></figure></div>`);
      return;
    }
    const item=INFO_CARDS[id];if(!item)return;
    openDialog(item.title,item.tag,`${item.photo?photo(item.photo,'story-detail-photo'):''}<p class="story-detail-text">${esc(item.body)}</p>${item.source?`<p class="story-source"><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">閱讀資料來源 ↗</a></p>`:''}`);
  }
  function showLanfangVideo(){
    openDialog('蘭芳公司：18世紀的客家移民史','客家公共傳播基金會 × 臺灣吧・客語版',
      `<div class="video-player-frame festival-video-frame"><iframe title="蘭芳公司：18世紀的客家移民史（客語版）" src="https://www.youtube-nocookie.com/embed/pwxlliP1mqQ?rel=0" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
       <div class="video-player-bottom"><span>超狂的客家移民史：18世紀誕生於婆羅洲的「蘭芳公司」</span><a href="${esc(LANFANG_YOUTUBE)}" target="_blank" rel="noopener noreferrer">在YouTube觀看原始影片 ↗</a></div>`);
    overlay.querySelector('.dialog')?.classList.add('video-dialog');
  }
  function showFestivalVideo(){
    // 使用官方嵌入播放器播放，並保留新視窗連結；關閉彈窗會卸載 iframe。
    openDialog('山口洋元宵節：Cap Go Meh','印尼・西加里曼丹',
      `<div class="festival-video-intro">相傳山口洋元宵乩童遊行與早期防疫祈福的民間故事有關；節慶也有達雅族人參與。觀看影片，觀察不同族群如何共同參與。</div>
       <div class="video-player-frame festival-video-frame"><iframe title="山口洋元宵節 Cap Go Meh 影片" src="https://www.youtube-nocookie.com/embed/FEBVKPOcH7k?start=70&rel=0" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
       <div class="video-player-bottom"><span>山口洋元宵慶典影片</span><a href="${esc(FESTIVAL_YOUTUBE)}" target="_blank" rel="noopener noreferrer">在YouTube開啟影片 ↗</a></div>`);
    overlay.querySelector('.dialog')?.classList.add('video-dialog');
  }
  function policyStage(){
    const poll=['家裡或親戚聚會','學校客語課','市場、商店或街上','社區活動與廟會','平常很少聽到'];
    return `<section class="panel"><div class="micro-label">語言與生活</div><h2 class="question">有客家人居住的地方，客語就一定會代代相傳嗎？</h2><div class="story-grid two">
      ${infoTile('lang-indo','印尼','華文教育的歷史變化','1960年代後期，學校與公共語言環境有哪些變化？')}
      ${infoTile('lang-taiwan','臺灣','國語政策與本土語言','不同年代的語言政策，怎麼影響日常的語言選擇？')}
      ${infoTile('lang-family','生活場景','家庭裡說什麼語言？','家人之間的語言習慣，會影響孩子接觸客語的機會。')}
      ${infoTile('lang-community','生活場景','走進市場與社區','語言除了在課本裡，還能在哪些地方聽到？')}
    </div></section>
    <section class="panel soft"><span class="micro-label">大家想一想</span><h2>你平常在哪裡比較容易聽到客語？</h2><div class="poll">${poll.map((p,i)=>`<button class="${state.poll.includes(i)?'active':''}" data-action="poll" data-index="${i}">${p}</button>`).join('')}</div><div class="selection-output">${state.poll.length?`目前選擇：${state.poll.map(i=>poll[i]).join('、')}`:'可以複選'}</div></section>`;
  }
  function audioStage(){
    return `<section class="panel"><span class="micro-label">聆聽兩地客語</span><h2 class="question">聽聽看，是不是很熟悉呢？</h2><div class="grid2">${audioCard('tw','臺灣海陸客語','臺灣海陸客語語料')}${audioCard('id','山口洋河婆客語','印尼西加里曼丹・河婆客語語料')}</div></section>
    <section class="panel singkawang-hero"><div class="singkawang-intro">${photo('singkawang','community-photo')}<div><span class="micro-label">印尼・西加里曼丹</span><h2>山口洋：客語、廟宇與生活文化</h2><p>山口洋曾與西婆羅洲的金礦移民、港口往來密切相關。今天仍能在城市生活、廟宇信仰與節慶活動中觀察客家文化的延續與變化。</p></div></div>
      <div class="story-grid two">${infoTile('singkawang-language','聲音','河婆客語','認識山口洋客語的來源與日常使用。')}${infoTile('singkawang-history','歷史','從礦區到城市','港口、礦業與移民怎樣形塑社群？')}${infoTile('singkawang-temple','信仰','山口洋的廟宇','看看寺廟與社群生活的關係。','singkawang2')}${infoTile('singkawang-festival','節慶影片','Cap Go Meh元宵','點擊觀看山口洋元宵活動影片。')}</div></section>`;
  }
  function historyStage(){
    const scenes=[
      {year:'18世紀',title:'跨海遷移',text:'客家移民從中國東南沿海來到西婆羅洲。',key:'lf-arrival'},
      {year:'18世紀後期',title:'採金與聚落',text:'礦業、農業與商業帶動聚落發展。',key:'lf-mining'},
      {year:'1777年',title:'蘭芳公司',text:'羅芳伯整合採金社群，建立自治組織。',key:'lf-1777'},
      {year:'1884年',title:'歷史轉折',text:'荷蘭殖民勢力解散蘭芳公司。',key:'lf-1884'}
    ];
    return `<section class="panel"><span class="micro-label">一段西婆羅洲客家人的歷史</span><h2>蘭芳公司：從移民採金到地方自治</h2>
    <div class="lf-story" id="lanfangStory">
      <div class="lf-story-head"><div><span>十八世紀・西婆羅洲</span><h3>跟著故事看蘭芳公司的形成</h3></div><button type="button" class="action" data-action="lanfang-play" id="lanfangPlay">▶ 播放短動畫</button></div>
      <svg viewBox="0 0 960 245" role="img" aria-label="蘭芳公司發展示意動畫：從跨海移民、採金、建立聚落到1777年公司成立，並於1884年結束。">
        <defs><linearGradient id="lfSea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#153947"/><stop offset="1" stop-color="#276879"/></linearGradient></defs>
        <rect width="960" height="245" rx="20" fill="url(#lfSea)"/>
        <path d="M0 171 Q130 148 230 173 T470 176 T710 169 T960 171 V245 H0Z" fill="#4f8780" opacity=".44"/>
        <path d="M0 188 Q145 174 248 191 T505 188 T760 188 T960 186" fill="none" stroke="#9bd2c8" stroke-width="3" opacity=".38"/>
        <path d="M40 105 Q140 60 235 110" fill="none" stroke="#f1cc8e" stroke-width="3.2" stroke-dasharray="9 9" opacity=".9"/>
        <g class="lf-animation-boat"><path d="M42 137 L112 137 L96 159 L60 159Z" fill="#f1c990"/><path d="M78 131 V85" stroke="#fff1cd" stroke-width="4"/><path d="M83 91 L83 130 L111 129Z" fill="#f8e3bb"/></g>
        <g class="lf-animation-gold"><path d="M312 168 L343 100 L372 168Z" fill="#c5a47c" stroke="#dfc69b" stroke-width="2"/><path d="M347 102 L360 151 L340 140Z" fill="#e9c68d"/><circle cx="352" cy="84" r="10" fill="#ffcd78"/><circle cx="391" cy="133" r="7" fill="#ffcd78"/></g>
        <g class="lf-animation-village"><path d="M517 143 L561 110 L605 143 V186 H517Z" fill="#f7d7a2"/><path d="M505 144 L561 99 L616 144" fill="none" stroke="#a96b51" stroke-width="8"/><rect x="544" y="153" width="28" height="33" fill="#996751"/><path d="M618 158 L640 137 L661 158 V189 H618Z" fill="#d3b18a"/></g>
        <g class="lf-animation-badge"><circle cx="789" cy="140" r="48" fill="#f9cc81"/><circle cx="789" cy="140" r="42" fill="none" stroke="#b76e4d" stroke-width="2"/><text x="789" y="148" font-size="39" text-anchor="middle" font-weight="800" fill="#5c4634">蘭芳</text></g>
        <g fill="#e2f3ec" font-size="20" text-anchor="middle" font-weight="700"><text x="102" y="224">遷移</text><text x="346" y="224">採金</text><text x="568" y="224">聚落</text><text x="789" y="224">公司</text></g>
      </svg>
      <div class="lf-story-steps">${scenes.map((it,i)=>`<button type="button" data-action="story-info" data-card="${it.key}"><span class="lf-step-n">${i+1}</span><strong>${it.year}</strong><span>${it.title}</span></button>`).join('')}</div>
    </div>
    <div class="story-grid three" style="margin-top:22px">
      ${infoTile('lf-arrival','移民','為什麼渡海而來？','從廣東原鄉來到婆羅洲。')}
      ${infoTile('lf-mining','採礦','金礦與公司組織','這裡的「公司」是怎麼運作的？')}
      ${infoTile('lf-1777','1777年','羅芳伯與蘭芳公司','看羅芳伯的後世圖像，認識社群領袖。','luo')}
      ${infoTile('lf-govern','地方自治','「蘭芳共和國」之稱','為什麼礦業組織也能管理地方事務？')}
      ${infoTile('lf-1884','歷史轉折','蘭芳公司的結束','1884年之後，當地客家社群仍繼續生活。')}
      ${infoTile('singkawang-history','今日西加里曼丹','從歷史走到山口洋','再看看後來的客家社群。','singkawang2')}
      <button type="button" class="story-info-card lf-video-card" data-action="lanfang-video" aria-label="開啟蘭芳公司客語版動畫影片"><div class="story-card-photo"><img src="assets/images/lanfang-video-cover.jpg" alt="蘭芳公司客語版動畫影片畫面" loading="lazy"><span class="video-play-symbol" aria-hidden="true">▶</span></div><span class="micro-label">客傳會 × 臺灣吧</span><strong>蘭芳公司動畫｜客語版</strong><span>觀看羅芳伯與西婆羅洲的客家移民史。</span><span class="story-more">點擊觀看影片 ＋</span></button>
    </div></section>`;
  }
  // Separate photo albums let students compare two regional foods side by side.
  // These are remote images with explicit links to the original source pages.
  const FOOD_PHOTOS={
    tw:[
      {src:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/%E5%AE%A2%E5%AE%B6%E8%8F%9C%E5%8C%85.jpg/960px-%E5%AE%A2%E5%AE%B6%E8%8F%9C%E5%8C%85.jpg',label:'客家菜包',caption:'臺灣客家菜包：米皮包著炒香的蘿蔔絲等內餡',source:'客家委員會',page:'https://commons.wikimedia.org/wiki/File:%E5%AE%A2%E5%AE%B6%E8%8F%9C%E5%8C%85.jpg'},
      {src:'https://img.ltn.com.tw/Upload/food/page/2014/08/13/140813-99-0-Tabkm.jpg',label:'豬籠粄',caption:'不同顏色的豬籠粄與切開的內餡',source:'自由時報食譜自由配',page:'https://food.ltn.com.tw/article/99'},
      {src:'https://www.jdx32tw.com/archive/image/product1/images/1776763166838.webp',label:'客家菜包切面',caption:'草綠色米皮與菜包的鹹餡',source:'九鼎軒',page:'https://www.jdx32tw.com/product_d.php?id=139&lang=tw&tb=1'}
    ],
    id:[
      {src:'assets/images/choi-pan-bowl.jpg',label:'Choi Pan',caption:'在蒸盤中鋪上葉片，擺放白色菜粄與蒜酥。',source:'授課教師提供',page:''},
      {src:'assets/images/choi-pan-table.jpg',label:'Choi Pan與醬料',caption:'桌上菜粄、佐料與醬汁的實際食用場景。',source:'授課教師提供',page:''}
    ],
    zong_tw:[
      {src:'assets/images/user-zongzi/PANCHUNG(TW).jpg',label:'臺灣客家粽內餡',caption:'客家粽切面：觀察米皮與鹹餡。',source:'授課教師提供',page:''},
      {src:'assets/images/user-zongzi/PANCHUNG2(TW).jpg',label:'臺灣客家粽剖面',caption:'臺灣客家粽切開後的內餡與包裹葉材。',source:'授課教師提供',page:''},
      {src:'https://yuann.tw/archive/8309/33505685126_d741a1ce62_b.jpg',label:'臺灣客家粽',caption:'以粽葉包裹的客家鹹粽，觀察葉片、繩結與外形。',source:'隨裕而安・頭份客家粽',page:'https://yuann.tw/%E9%A0%AD%E4%BB%BD%E9%98%BF%E7%A7%80%E5%AB%82%E5%AE%A2%E5%AE%B6%E7%B2%BD-%E9%85%8D%E6%96%99%E7%B0%A1%E5%96%AE%E8%B6%85%E5%A5%BD%E5%90%83/'},
      {src:'https://imgproxy.icook.network/safe/rt%3Afit/w%3A1242/el%3A0/q%3A80/plain/http%3A%2F%2Ftokyo-kitchen.icook.tw.s3.amazonaws.com%2Fuploads%2Frecipe%2Fcover%2F340450%2Fde34f58d0c3f6dd9.jpg',label:'客家粄粽',caption:'臺灣客家粄粽的包裹方式，與一般糯米鹹粽可再比較。',source:'愛料理・客家粿粽／粄粽',page:'https://icook.tw/recipes/340450'}
    ],
    zong_id:[
      {src:'assets/images/user-zongzi/BAKCANG2(In).jpg',label:'邦加粽子內餡',caption:'印尼邦加粽子剖面與葉材，觀察糯米與肉餡。',source:'授課教師提供',page:''},
      {src:'assets/images/user-zongzi/BAKCANG(In).jpg',label:'邦加粽子介紹圖',caption:'邦加粽子斑蘭葉包裹方式的宣傳示意圖（非實景照片）。',source:'授課教師提供・宣傳示意',page:''},
      {src:'https://img-global.cpcdn.com/recipes/cfc394e40a979d05/680x781cq80/kue-bakcang-bangka-foto-resep-utama.jpg',label:'邦加Bakcang',caption:'邦加粽子的綠葉包裹外觀；當地有使用斑蘭葉的做法。',source:'Cookpad・Kue Bak Cang Bangka',page:'https://cookpad.com/id/resep/15368273'},
      {src:'https://img-global.cpcdn.com/recipes/6a62aaba6964def1/1200x630cq80/photo.jpg',label:'邦加Nyuk Cung',caption:'觀察邦加粽子的葉材、外形與綁法。',source:'Cookpad・Bacang Bangka',page:'https://cookpad.com/id/resep/15141993'}
    ]
  };
  let foodTicker=null;
  function foodCarousel(kind){
    const slides=FOOD_PHOTOS[kind];const ix=state.foodPos[kind]%slides.length;const slide=slides[ix];
    return `<div class="food-carousel" data-food-carousel="${kind}" aria-label="${({tw:'臺灣菜包',id:'印尼Choi Pan',zong_tw:'臺灣客家粽',zong_id:'印尼邦加粽子'}[kind]||'食物')}圖片輪播">
      <div class="food-slide-viewport">
        <img class="food-slide-image" src="${esc(slide.src)}" alt="${esc(slide.caption)}" loading="eager" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.hidden=false">
        <div class="food-image-error" hidden>照片暫時無法顯示。${slide.page?`<a href="${esc(slide.page)}" target="_blank" rel="noopener noreferrer">查看原圖 ↗</a>`:""}</div>
        <button class="food-slide-arrow prev" data-action="food-prev" data-food="${kind}" type="button" aria-label="上一張照片">‹</button>
        <button class="food-slide-arrow next" data-action="food-next" data-food="${kind}" type="button" aria-label="下一張照片">›</button>
        <span class="food-slide-count">${ix+1}／${slides.length}</span>
      </div>
      <div class="food-slide-footer">
        <div class="food-slide-caption"><strong>${esc(slide.label)}</strong><span>${esc(slide.caption)}</span>${slide.page?`<a href="${esc(slide.page)}" target="_blank" rel="noopener noreferrer">照片來源：${esc(slide.source)} ↗</a>`:`<span class="food-local-credit">照片來源：${esc(slide.source)}</span>`}</div>
        <div class="food-slide-controls"><div class="food-slide-dots" role="group" aria-label="選擇照片">${slides.map((_,i)=>`<button type="button" class="${i===ix?'active':''}" aria-label="顯示第${i+1}張照片" aria-pressed="${i===ix}" data-action="food-dot" data-food="${kind}" data-slide="${i}"></button>`).join('')}</div>
          <button type="button" class="food-play-toggle" data-action="food-play" data-food="${kind}" aria-label="${state.foodPaused[kind]?'開始':'暫停'}自動輪播">${state.foodPaused[kind]?'▶ 播放':'Ⅱ 暫停'}</button></div>
      </div>
    </div>`;
  }
  function refreshFoodCarousel(kind){
    const panel=body.querySelector(`[data-food-carousel="${kind}"]`);
    if(panel)panel.outerHTML=foodCarousel(kind);
  }
  function startFoodTicker(){
    if(foodTicker!==null)window.clearInterval(foodTicker);
    foodTicker=null;
    if(state.stage!==3)return;
    foodTicker=window.setInterval(()=>{
      if(state.stage!==3||!overlay.hidden||document.hidden)return;
      for(const kind of (state.foodTopic==='zongzi'?['zong_tw','zong_id']:['tw','id'])){
        const panel=body.querySelector(`[data-food-carousel="${kind}"]`);
        if(!panel||panel.matches(':hover')||state.foodPaused[kind])continue;
        state.foodPos[kind]=(state.foodPos[kind]+1)%FOOD_PHOTOS[kind].length;
        refreshFoodCarousel(kind);
      }
    },6500);
  }
  function dumplingSVG(which){
    const id=which==='tw'?'twfood':'idfood';
    const color=which==='tw'?'#e0e0c2':'#e2e9d8';
    return `<svg viewBox="0 0 350 230" role="img" aria-label="粄食外形示意插畫，非食物實景照片"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><ellipse cx="174" cy="180" rx="137" ry="31" fill="#88aba4" opacity=".32"/><ellipse cx="174" cy="171" rx="135" ry="37" fill="#f5f8f2" stroke="#cadbd3" stroke-width="5"/>${which==='tw'?
      '<path d="M78 157 Q69 113 106 94 Q150 64 172 98 Q202 130 177 161Z" fill="url(#twfood)" stroke="#a1b6a2" stroke-width="4"/><path d="M156 157 Q150 115 188 92 Q224 76 255 116 Q271 142 247 159Z" fill="url(#twfood)" stroke="#a1b6a2" stroke-width="4"/><path d="M93 133 Q134 102 162 140 M175 136 Q207 106 247 140" stroke="#b4c5ae" stroke-width="5" stroke-linecap="round" fill="none"/>':
      '<path d="M65 151 Q75 107 112 111 Q149 119 163 156Z" fill="url(#idfood)" stroke="#a0b7a2" stroke-width="4"/><path d="M137 156 Q146 102 192 109 Q222 114 239 158Z" fill="url(#idfood)" stroke="#a0b7a2" stroke-width="4"/><path d="M226 157 Q228 121 263 117 Q288 124 300 156Z" fill="url(#idfood)" stroke="#a0b7a2" stroke-width="4"/><path d="M85 141 Q114 123 144 143 M163 142 Q193 124 218 145 M247 144 Q270 134 287 148" fill="none" stroke="#bfd1bd" stroke-width="4"/>'}<circle cx="292" cy="180" r="10" fill="#588e61"/><circle cx="280" cy="187" r="8" fill="#65a66e"/><circle cx="311" cy="177" r="8" fill="#6a9a61"/></svg>`;
  }
  function foodStage(){
    const isZong=state.foodTopic==='zongzi';
    const nav=`<nav class="food-topic-tabs" aria-label="選擇食物比較主題"><button class="${!isZong?'active':''}" type="button" data-action="food-topic" data-topic="caibao" aria-pressed="${!isZong}">菜包 × Choi Pan</button><button class="${isZong?'active':''}" type="button" data-action="food-topic" data-topic="zongzi" aria-pressed="${isZong}">臺灣客家粽 × 邦加粽子</button></nav>`;
    if(isZong)return `${nav}<section class="grid2 food-comparison">
      <div class="food-card">${foodCarousel('zong_tw')}<div class="food-body"><span class="tag">臺灣客家</span><h3>客家粽</h3><p>常以粽葉包裹糯米與鹹餡，餡料與作法依地方、家庭而不同。</p></div></div>
      <div class="food-card">${foodCarousel('zong_id')}<div class="food-body"><span class="tag amber">印尼・邦加島</span><h3>Bakcang／Nyuk Cung</h3><p>邦加部分做法以斑蘭葉包裹，也有使用椰奶處理糯米、搭配肉類與蝦米等配料的食譜。</p></div></div>
    </section><section class="panel teaching-reveal"><div class="micro-label">觀察與比較・先討論，再揭曉</div><h2>相同的粽子，會因環境而改變哪些材料？</h2><p class="reveal-instruction">先觀察兩地照片，請小組說出一項共同點與一項差異，再點開資訊卡。</p><div class="reveal-grid"><details class="reveal-card"><summary><span>共同的傳統</span><span class="reveal-hint">點擊揭曉</span></summary><p>包葉、糯米、內餡以及節慶飲食。</p></details><details class="reveal-card"><summary><span>在地的變化</span><span class="reveal-hint">點擊揭曉</span></summary><p>包裹葉材、調味材料、餡料與製作方式。</p></details></div></section>`;
    return `${nav}<section class="grid2 food-comparison">
      <div class="food-card">${foodCarousel('tw')}<div class="food-body"><span class="tag">臺灣客家</span><h3>菜包／豬籠粄</h3><p>常見鹹餡包含蘿蔔絲、香菇等，米製外皮可呈現不同形狀。</p></div></div>
      <div class="food-card">${foodCarousel('id')}<div class="food-body"><span class="tag amber">印尼・西加里曼丹</span><h3>Choi Pan／菜粄</h3><p>常見涼薯、韭菜等餡料，通常搭配蒜酥或醬汁食用。</p></div></div>
    </section>
    <section class="panel teaching-reveal"><div class="micro-label">觀察兩地粄食・先討論，再揭曉</div><h2>看一看：相同在哪裡？不同在哪裡？</h2><p class="reveal-instruction">五組學生先觀察圖片並討論，發表後由教師依序打開資訊卡。</p><div class="reveal-grid"><details class="reveal-card"><summary><span>相似的地方</span><span class="reveal-hint">點擊揭曉</span></summary><p>米製外皮與包餡的做法，保留熟悉的客家米食特色。</p></details><details class="reveal-card"><summary><span>各地的變化</span><span class="reveal-hint">點擊揭曉</span></summary><p>外形、餡料、調味與食用方式，隨地方飲食文化發展。</p></details></div><details class="reveal-card reveal-wide"><summary><span>南洋米食都比較甜嗎？</span><span class="reveal-hint">想一想，再揭曉</span></summary><p>某些南洋米食與甜點會使用椰奶、椰絲或椰糖；但Choi Pan通常是鹹食。臺灣客家粄食也同時有甜、鹹兩類。</p></details></section>`;
  }
  const FESTIVAL_PHOTOS={
    lantern:[
      {src:'https://image.nexttv.com.tw/material/news/img/2024/02/20240223204300YFPr.png',caption:'2024臺灣燈會・臺南主燈',source:'壹新聞',url:'https://www.nexttv.com.tw/NextTV/News/Home/Life/2024-02-23/1493940.html'},
      {src:'https://media.taiwan.net.tw/zh-tw/Portal/Media/EncryptedCoverImage?f=AQAAANCMnd8BFdERjHoAwE%2FCl%2BsBAAAA9h6RcxMeWUyWMoY60yrloAAAAAACAAAAAAAQZgAAAAEAACAAAADGfh7uH%2BHHvjg16Oix5u6JqEOQHQ5W7koQud22oiAh8gAAAAAOgAAAAAIAACAAAAD24UAeVYNGtHtphJlL749Les5p%2Fa%2Bt9%2Bj%2FMm%2Bxd3m3HjAAAACgHnn71mE5RD5Ye%2FrV7drVT6QppQBBrJ%2BRqSCPlod%2FCI0AcFM1YMBXC0eDQngjkhlAAAAAj5q8onpBJC8sYA5rnTSbDZXCKcu4fa6dHNEkFpsbgaBHztf%2FMpRtiU508Kjss%2FfarWW%2FJ10RUzZ2WFREoCR6qg%3D%3D',caption:'2025臺灣燈會・光環境',source:'交通部觀光署',url:'https://media.taiwan.net.tw/zh-tw/portal/media/collection/47258_ph_20250324'},
      {src:'https://s.yimg.com/ny/api/res/1.2/qYPUTKbRin.kAXHJN0lX2w--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTQ4MA--/https%3A/media.zenfs.com/zh-tw/libertytimes_786/031a3e659c0d6c028be08f9fc62fa15b',caption:'新埔花燈踩街迎天穿',source:'自由時報／Yahoo新聞',url:'https://www.hakka.gov.tw/chhakka/app/data/view?id=25&module=hotnews&serno=9a0eb6de-678f-4428-941f-6468de130f31'}
    ],
    dragon:[
      {src:'https://resource.iyp.tw/static.iyp.tw/32272/files/926a1e2f-2442-412d-8760-8e2ed0841e17.jpg',caption:'2025苗栗𪹚龍・𪹚龍之夜',source:'苗栗時報',url:'https://www.miaoli-news.com.tw/news-detail-3842798.html'},
      {src:'https://www.tristarnews.com.tw/upload/imgDB/20250206151605j339.jpg',caption:'苗栗𪹚龍・祥龍點睛',source:'三立星報',url:'https://n.yam.com/Article/20250206620196'},
      {src:'https://pgw.udn.com.tw/gw/photo.php?exp=3600&sh=0&sw=0&u=https%3A%2F%2Fuc.udn.com.tw%2Fphoto%2F2025%2F02%2F07%2Fdraft%2F31456393.jpg&x=0&y=0',caption:'苗栗𪹚龍・舞龍隊伍',source:'聯合新聞網',url:'https://woman.udn.com/woman/story/123162/8534198'}
    ],
    beipu:[
      {src:'assets/images/beipu-yuhanghuo.jpg',caption:'北埔油笐火・火把繞行',source:'授課教師提供',url:''},
      {src:'https://www.lookit.tw/upload/51/TX4/8e8509af10514a86a4b1b80a1f0ad62e.jpg',caption:'北埔油笐火・老街夜景',source:'好想去喔',url:'https://www.lookit.tw/travel/40244'},
      {src:'https://photo.settour.com.tw/900x600/https%3A/www.settour.com.tw/ss_img/info/location/HSZ/Z0/HSZ0000080/HSZ0000080_92428.jpg',caption:'北埔油笐火・慈天宮前',source:'東南旅遊',url:'https://trip.settour.com.tw/taiwan/product/GRT0000002444'}
    ]
  };
  const FESTIVAL_TOPICS=[
    {id:'lantern',title:'元宵花燈',subtitle:'臺灣燈會、新埔花燈迎天穿',desc:'從臺灣燈會的大型燈飾，到新埔花燈踩街迎天穿，看見不同地方的節慶創意。'},
    {id:'dragon',title:'苗栗𪹚龍',subtitle:'龍藝、炮火與客庄元宵',desc:'苗栗以祥龍點睛、舞龍及𪹚龍活動，展現獨特的客庄元宵民俗。'},
    {id:'beipu',title:'北埔油笐火',subtitle:'竹火把與老街夜巡',desc:'北埔居民在元宵夜舉起油笐火，走過老街與秀巒山，火光連成長龍。'}
  ];
  function festivalStage(){
    if(state.festivalView==='home'){
      return `<section class="festival-hub"><button class="festival-entry" data-action="festival-view" data-view="tw"><span class="festival-entry-art" aria-hidden="true">🏮</span><span class="festival-entry-body"><span>臺灣客庄</span><strong>臺灣元宵</strong><small>元宵花燈・苗栗𪹚龍・北埔油笐火</small></span><span class="festival-entry-arrow">→</span></button><button class="festival-entry" data-action="festival-view" data-view="id"><span class="festival-entry-art" aria-hidden="true">🎬</span><span class="festival-entry-body"><span>印尼・西加里曼丹</span><strong>山口洋元宵</strong><small>Cap Go Meh・觀看慶典影片</small></span><span class="festival-entry-arrow">→</span></button></section>`;
    }
    if(state.festivalView==='id'){
      return `<section class="panel festival-explore"><div class="festival-explore-head"><button class="festival-back" data-action="festival-view" data-view="home">← 選擇節慶</button><div><div class="micro-label">印尼・西加里曼丹</div><h2>山口洋元宵・Cap Go Meh</h2></div></div><p class="festival-explore-lead">每年農曆正月十五，山口洋的華人會慶祝元宵節（Cap Go Meh）。相傳早期當地曾發生疫情，人們透過乩童祈福、驅邪，逐漸形成大型乩童遊行的節慶特色。活動不只有華人參與，也能看到當地達雅族人的參與，呈現跨族群文化交流。觀看影片時，請觀察各種民俗活動與參與者。</p><button class="festival-main-video" data-action="festival-video"><span class="festival-big-play">▶</span><strong>觀看山口洋元宵節影片</strong><small>點擊開啟影片播放器</small></button></section>`;
    }
    const topic=FESTIVAL_TOPICS[state.festivalTopic];
    const slides=FESTIVAL_PHOTOS[topic.id];
    const n=(state.festivalPhoto[topic.id]||0)%slides.length;
    const img=slides[n];
    return `<section class="panel festival-explore"><div class="festival-explore-head"><button class="festival-back" data-action="festival-view" data-view="home">← 選擇節慶</button><div><div class="micro-label">臺灣元宵</div><h2>${topic.title}</h2></div></div><div class="festival-topic-tabs">${FESTIVAL_TOPICS.map((t,i)=>`<button data-action="festival-topic" data-index="${i}" class="${i===state.festivalTopic?'active':''}" aria-pressed="${i===state.festivalTopic}">${t.title}</button>`).join('')}</div><div class="festival-showcase"><div class="festival-stage-photo"><img src="${esc(img.src)}" alt="${esc(img.caption)}" loading="eager" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="festival-photo-fallback" hidden>照片無法載入，請按左右箭頭查看其他照片。</div><button class="festival-nav-arrow left" data-action="festival-slide" data-move="prev" aria-label="上一張照片">‹</button><button class="festival-nav-arrow right" data-action="festival-slide" data-move="next" aria-label="下一張照片">›</button><span class="festival-slide-number">${n+1}／${slides.length}</span></div><div class="festival-photo-meta"><div><strong>${esc(img.caption)}</strong><span>${esc(topic.subtitle)}</span></div>${img.url?`<a href="${esc(img.url)}" target="_blank" rel="noopener noreferrer">圖片來源：${esc(img.source)} ↗</a>`:`<span>圖片來源：${esc(img.source)}</span>`}</div><div class="festival-slide-dots">${slides.map((_,i)=>`<button data-action="festival-slide" data-slide="${i}" class="${i===n?'active':''}" aria-label="第${i+1}張照片" aria-pressed="${i===n}"></button>`).join('')}</div></div><p class="festival-explore-lead">${topic.desc}</p></section>`;
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
  function updateAudioPlayers(){}
  const vocabPinyin={
    qishi:['hi24 she11','hi31 sii55'], jiedeng:['ziab5 den24','jiab2 den31'], zuoshengli:['zo11 sen53 li53','zo55 sen24 li24'], zuji:['zu24 sid2','zu31 xid5'],liuli:['liu55 li33','liu11 liag5'],tusheng:['tu24 sen53 tu24 zhong24','tu31 sen24 tu31 zong31'],mxdd:['m55 hiau24 ded5','m11 hiau31 ded2'],shuru:['shu33 nen11 shu33','shu55 nen55 e31'],xi:['siag5','xiag2'],guimo:['gui53 mu55','gui24 mu11']
  };
  function openDialog(title,tag,content){
    stopDialogMedia();
    overlay.querySelector('.dialog')?.classList.remove('video-dialog');
    document.getElementById('dialogTitle').textContent=title;
    document.getElementById('dialogTag').textContent=tag;
    document.getElementById('dialogContent').innerHTML=content;
    document.getElementById('dialogContent').scrollTop=0;
    overlay.hidden=false;document.getElementById('dialogClose').focus();
  }
  function showVocab(id){
    const w=DATA.vocab.find(x=>x.id===id);if(!w)return;
    const p=vocabPinyin[id];
    const lines=[['海陸腔',w.hailu,p[0],'hailu'],['四縣腔',w.sixian,p[1],'sixian']].map(x=>`<div class="dialog-dialect"><span><strong>${esc(x[0])}：</strong>${esc(x[1])}</span><small class="vocab-pinyin">${esc(formatPinyin(x[2],x[3]))}</small></div>`).join('');
    openDialog(w.hailu===w.sixian?w.hailu:`${w.hailu}／${w.sixian}`,'詞彙解釋',`${lines}<p class="vocab-definition"><strong>詞義：</strong>${esc(w.definition)}</p>`);
  }
  function showSources(){
    openDialog('資料與圖片來源','文獻與圖像',`<div class="sources-list">${([{label:'客委會｜110年全國客家人口暨語言基礎資料調查研究（縣市人口數及比例）',url:'https://www.hakka.gov.tw/File/Attach/37585/File_96737.pdf'},{label:'國家文化記憶庫｜新竹市的方言區劃：客家語',url:'https://tcmb.culture.tw/zh-tw/detail?id=170548&indexCode=Culture_Object'},{label:'臺中市客委會｜客語腔調分布',url:'https://www.hakka.taichung.gov.tw/381494/post'},{label:'客家公共傳播基金會×臺灣吧｜蘭芳公司客語版動畫',url:LANFANG_YOUTUBE},...DATA.sources,...FOOD_PHOTOS.tw.map(x=>({label:'臺灣菜包照片｜'+x.source,url:x.page})),...FOOD_PHOTOS.id.filter(x=>x.page).map(x=>({label:'印尼Choi Pan照片｜'+x.source,url:x.page})),...FOOD_PHOTOS.zong_tw.map(x=>({label:'臺灣客家粽照片｜'+x.source,url:x.page})),...FOOD_PHOTOS.zong_id.map(x=>({label:'印尼邦加粽子照片｜'+x.source,url:x.page}))]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}${[`<a href="${PHOTO_SOURCES.twfood.page}" target="_blank" rel="noopener noreferrer">臺灣客家菜包・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.idfood.page}" target="_blank" rel="noopener noreferrer">印尼邦加客家菜粄・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.lantern.page}" target="_blank" rel="noopener noreferrer">臺灣元宵花燈・圖片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.dragon.page}" target="_blank" rel="noopener noreferrer">苗栗𪹚龍・圖片來源 ↗</a>`,`<a href="${FESTIVAL_YOUTUBE}" target="_blank" rel="noopener noreferrer">山口洋元宵Cap Go Meh・影片來源 ↗</a>`,`<a href="${PHOTO_SOURCES.singkawang.page}" target="_blank" rel="noopener noreferrer">山口洋廟宇・圖片來源 ↗</a>`].join('')}</div>`);
  }
  function stopDialogMedia(){overlay.querySelectorAll('video,audio').forEach(media=>{media.pause();});overlay.querySelectorAll('iframe').forEach(frame=>{frame.src='about:blank';});}
  function closeDialog(){stopDialogMedia();overlay.hidden=true;overlay.querySelector('.dialog')?.classList.remove('video-dialog');}
  document.addEventListener('click',e=>{
    if(e.target===overlay){closeDialog();return;}
    const el=e.target.closest('[data-action]');if(!el)return;
    const action=el.dataset.action;
    if(action==='jump')goto(Number(el.dataset.index));
    if(action==='reveal'){state.reveal=!state.reveal;render();}
    if(action==='map-view'){stopIndoCamera();resetGeoCamera();state.mapView=el.dataset.view;state.place=state.mapView==='taiwan'?'hsinchu':'intro';state.indoZoom=1;state.indoCenter={x:510,y:250};render();}
    if(action==='map-point'){
      if(performance.now()<ignoreMapClickUntil)return;
      if(state.mapView==='overview'&&el.dataset.place==='origin'){showMigrationChoice();}
      else{
        state.place=el.dataset.place;updateMapInfo();
        body.querySelectorAll('.county-pin').forEach(p=>p.classList.toggle('selected',p.dataset.place===state.place));
        body.querySelectorAll('.location-chips button').forEach(p=>p.classList.toggle('active',p.dataset.place===state.place));
        if(state.mapView==='taiwan'&&state.twZoom>1){const c=TW_COUNTIES.find(x=>x.id===state.place);if(c){state.twCenter={x:c.x,y:c.y};updateTaiwanZoom();}}
        if(state.mapView==='indonesia'){focusIndonesia(state.place);if(!document.querySelector('[data-action="indo-reset"]')){
          const viewport=document.querySelector('.map-panel .map-viewport');
          if(viewport)viewport.insertAdjacentHTML('beforeend','<div class="geo-camera-controls"><button type="button" data-action="indo-reset">返回全圖</button></div>');
        }}
      }
    }
    if(action==='migration-select'){
      state.migrationRoute=el.dataset.destination;
      state.place=state.migrationRoute==='taiwan'?'taiwan':'singkawang';
      resetGeoCamera();closeDialog();render();startGeoJourney();
    }
    if(action==='geo-reset'){resetGeoCamera();}
    if(action==='indo-reset'){resetIndonesia();const controls=el.closest('.geo-camera-controls');if(controls)controls.remove();}
    if(action==='geo-replay'){resetGeoCamera();render();startGeoJourney();}
    if(action==='map-zoom'){
      const level=el.dataset.zoom;
      if(level==='reset'){state.twZoom=1;state.twCenter={x:340,y:355};}
      else{state.twZoom=clamp(state.twZoom+(level==='in'?.5:-.5),1,2.5);
        const county=TW_COUNTIES.find(c=>c.id===state.place);
        if(county&&state.twZoom>1)state.twCenter={x:county.x,y:county.y};
      }
      updateTaiwanZoom();
    }
    if(action==='reading-paragraph'){
      const id=Number(el.dataset.paragraph);state.readingParagraph=id;
      body.querySelectorAll('.reading-paragraph-nav button').forEach(b=>b.classList.toggle('active',Number(b.dataset.paragraph)===id));
      document.getElementById(`reading-row-${id}`)?.scrollIntoView({behavior:'smooth',block:'start'});
    }

    if(action==='vocab')showVocab(el.dataset.vocab);
    if(action==='poll'){const i=Number(el.dataset.index);state.poll=state.poll.includes(i)?state.poll.filter(x=>x!==i):[...state.poll,i];render();}
    if(action==='history'){state.lanfang=Number(el.dataset.index);render();}
    if(action==='story-info'){showStoryInfo(el.dataset.card);}
    if(action==='lanfang-video'){showLanfangVideo();}
    if(action==='festival-video'){showFestivalVideo();}
    if(action==='festival-view'){state.festivalView=el.dataset.view==='id'?'id':el.dataset.view==='tw'?'tw':'home';render();return;}
    if(action==='festival-topic'){state.festivalTopic=Math.max(0,Math.min(2,Number(el.dataset.index)||0));render();return;}
    if(action==='festival-slide'){
      const key=FESTIVAL_TOPICS[state.festivalTopic].id;
      const total=FESTIVAL_PHOTOS[key].length;
      const direct=el.dataset.slide;
      state.festivalPhoto[key]=direct!==undefined?Number(direct):(state.festivalPhoto[key]+(el.dataset.move==='next'?1:total-1))%total;
      render();return;
    }
    if(action==='lanfang-play'){const story=document.getElementById('lanfangStory');if(story){story.classList.remove('is-playing');void story.offsetWidth;story.classList.add('is-playing');el.textContent='↻ 重播動畫';el.setAttribute('aria-label','重播蘭芳公司動畫');}}
    if(action==='food-topic'){
      const topic=el.dataset.topic;if(!['caibao','zongzi'].includes(topic))return;
      state.foodTopic=topic;render();return;
    }
    if(action==='food-next'||action==='food-prev'||action==='food-dot'){
      const kind=el.dataset.food;if(!FOOD_PHOTOS[kind])return;
      const n=FOOD_PHOTOS[kind].length;
      state.foodPos[kind]=action==='food-dot'?Number(el.dataset.slide):(state.foodPos[kind]+(action==='food-next'?1:n-1))%n;
      refreshFoodCarousel(kind);
    }
    if(action==='food-play'){
      const kind=el.dataset.food;if(!FOOD_PHOTOS[kind])return;
      state.foodPaused[kind]=!state.foodPaused[kind];refreshFoodCarousel(kind);
    }
    if(action==='reflect'){state.reflection=el.dataset.value;render();}
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(transitionOverlay&&!transitionOverlay.hidden){closeJourneyTransition();return;}closeDialog();closeNavigation(true);return;}
    if(!overlay.hidden||(transitionOverlay&&!transitionOverlay.hidden)||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
    if((e.key==='Enter'||e.key===' ') && e.target.matches('.map-svg .pin')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}
    if(e.key.toLowerCase()==='m' && !e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();toggleNavigation();return;}
    if(e.key==='ArrowRight' || e.key==='PageDown'){e.preventDefault();goto(state.stage+1,true);}
    if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();goto(state.stage-1);}
    if(e.key.toLowerCase()==='f'){document.getElementById('fullscreenToggle').click();}
  });
  document.querySelectorAll('[data-dialect]').forEach(el=>el.addEventListener('click',()=>{state.dialect=el.dataset.dialect;render();}));
  document.getElementById('pinyinToggle').addEventListener('click',()=>{state.pinyin=!state.pinyin;render();});
  document.getElementById('toneModeToggle').addEventListener('click',()=>{state.toneMode=state.toneMode==='value'?'shape':'value';render();});
  document.getElementById('fontToggle').addEventListener('click',()=>{state.fontUp=state.fontUp>1?1:1.27;render();});
  document.getElementById('nextBtn').addEventListener('click',()=>goto(state.stage===7?0:state.stage+1,true));
  document.getElementById('prevBtn').addEventListener('click',()=>goto(state.stage-1));
  document.getElementById('mapHome').addEventListener('click',()=>goto(0));
  document.getElementById('viewSources').addEventListener('click',showSources);
  document.getElementById('mobileMenu').addEventListener('click',toggleNavigation);
  navBackdrop.addEventListener('click',()=>closeNavigation(true));
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

