/* 教師操作網站：不使用框架、網路API或伺服器。
   修改課文請到 content.js；修改固定音檔路徑請修改 BUILTIN_AUDIO。
*/
(() => {
  'use strict';
  const DATA = window.LESSON_DATA;
  if (!DATA) { document.getElementById('stageBody').textContent='找不到content.js，請確認檔案放在同一資料夾。'; return; }
  const STAGES = [
    {name:'認識印尼',sub:'人口、語言與移民路線',time:'0～5分鐘',heading:'千島之國，客家在哪裡？',lead:'從臺灣出發，先認識印尼的地理、人口與多語環境。'},
    {name:'課文閱讀',sub:'雙腔課文、8個詞彙',time:'5～14分鐘',heading:'行讀客家世界：印尼客家之旅',lead:'看課本、朗讀重點句，點擊詞彙可開啟註解。'},
    {name:'語言傳承',sub:'政策與生活經驗',time:'14～20分鐘',heading:'客家人不少，為什麼客語仍面臨傳承挑戰？',lead:'從課文中的印尼語言政策，連結臺灣的歷史與學生生活。'},
    {name:'海外客語',sub:'聽見山口洋',time:'20～24分鐘',heading:'隔著海洋，還聽得見熟悉的客話嗎？',lead:'透過短音檔認識海外客語；本課不進行次方言語音比較訓練。'},
    {name:'蘭芳公司',sub:'羅芳伯與海外移民',time:'24～32分鐘',heading:'蘭芳公司，真的只是一間公司嗎？',lead:'從採金移民到地方組織，認識18世紀海外客家人的歷史。'},
    {name:'尋找客家味',sub:'臺灣菜包與印尼菜粄',time:'32～39分鐘',heading:'看起來相似的粄，吃起來也一樣嗎？',lead:'從米食的名稱、食材與內餡，觀察文化在不同地方的延續與變化。'},
    {name:'元宵文化',sub:'花燈、𪹚龍與油笐火',time:'39～42分鐘',heading:'元宵節，原來可以這樣過！',lead:'從臺灣客庄到印尼山口洋，看看節慶如何展現地方特色。'},
    {name:'文化統整',sub:'保留、改變、融合',time:'42～45分鐘',heading:'漂洋過海之後，客家文化變了嗎？',lead:'回顧今天的探索，從一個具體案例說明你的觀察。'}
  ];
  /* 加入正式、已取得使用權的音檔後可把這裡改為相對路徑，例如 'assets/audio/taiwan-hailu.mp3'。*/
  const BUILTIN_AUDIO = {tw:'', id:''};
  const state = {stage:0,dialect:'hailu',pinyin:true,fontUp:1,chunk:0,reveal:false,place:'intro',poll:[],lanfang:0,food:0,reflection:'保留',audio:{tw:BUILTIN_AUDIO.tw,id:BUILTIN_AUDIO.id},audioTemporary:{tw:false,id:false}};
  const root=document.getElementById('siteShell');
  const body=document.getElementById('stageBody');
  const nav=document.getElementById('lessonNav');
  const main=document.getElementById('main');
  const overlay=document.getElementById('dialogOverlay');
  const labels={'hailu':'海陸腔','sixian':'四縣腔'};
  const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const h = (tag,cls,inside) => `<${tag} class="${cls}">${inside}</${tag}>`;
  function navRender(){
    nav.innerHTML = STAGES.map((s,i)=>`<button type="button" class="nav-step ${i===state.stage?'active':''}" data-action="jump" data-index="${i}" ${i===state.stage?'aria-current="step"':''}><span class="n">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.time)} · ${esc(s.sub)}</small></span></button>`).join('');
  }
  function render(){
    const item=STAGES[state.stage];
    document.getElementById('stepLabel').textContent=item.name;
    document.getElementById('stageEyebrow').textContent=`第${'一二三四五六七八'[state.stage]}站 · ${item.time}`;
    document.getElementById('stageTitle').textContent=item.heading;
    document.getElementById('stageIntro').textContent=item.lead;
    document.getElementById('progressText').textContent=`${String(state.stage+1).padStart(2,'0')} / 08`;
    document.getElementById('progressFill').style.width=`${(state.stage+1)/8*100}%`;
    document.getElementById('prevBtn').disabled=state.stage===0;
    document.getElementById('nextBtn').textContent=state.stage===7?'返回第一站 ↺':'下一步 →';
    document.getElementById('pinyinToggle').textContent=`拼音：${state.pinyin?'開':'關'}`;
    document.getElementById('pinyinToggle').setAttribute('aria-pressed',String(state.pinyin));
    document.getElementById('fontToggle').textContent=state.fontUp>1?'字級－':'字級＋';
    root.style.setProperty('--fontup',state.fontUp);
    document.querySelectorAll('[data-dialect]').forEach(el=>{const on=el.dataset.dialect===state.dialect;el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on));});
    navRender();
    const fn=[introStage,readingStage,policyStage,audioStage,historyStage,foodStage,festivalStage,endingStage][state.stage];
    body.innerHTML=fn();
    if(state.stage===0) updateMapInfo();
    if(state.stage===3) updateAudioPlayers();
    document.getElementById('sidebar').classList.remove('open');
  }
  function goto(i){state.stage=Math.max(0,Math.min(7,i)); render();window.scrollTo({top:0,behavior:'instant'}); main.scrollTop=0;}
  function introStage(){
    return `<section class="intro-layout">${mapComponent()}
      <div class="panel intro-side"><div class="micro-label">開場鉤子</div><h2 class="question">印尼有多少人口？<br>有多少種地方語言？</h2><p class="muted">先請學生猜，再揭曉。</p>
        <div class="stat"><div class="micro-label">印尼人口</div><div class="number">${state.reveal?'2.87億':'？'}</div><small>${state.reveal?'2026年年中估計｜BPS':'先猜一猜'}</small></div>
        <div class="stat"><div class="micro-label">已盤點地方語言</div><div class="number">${state.reveal?'718種':'？'}</div><small>${state.reveal?'印尼教育部語言資料庫':'先猜一猜'}</small></div>
        <button class="action" data-action="reveal">${state.reveal?'收起數據':'揭曉答案'}</button>
        <p class="citation">印尼語是國家語言，各地還有許多地方語言。兩個數字採不同資料來源與統計年度。</p>
      </div></section>
    <div class="teacher-note"><strong>導入建議：</strong>航線代表今天從臺灣出發的虛構課堂旅行；客家移民的歷史路線則是從中國南方原鄉分別通往臺灣與印尼。</div>`;
  }
  function mapComponent(){
    return `<section class="map-panel" id="mapPanel"><div class="map-header"><div><span class="micro-label" style="color:#f5c385">互動地圖 · 簡化方位圖</span><h2 style="margin:5px 0;color:white;font-size:21px">漂洋過海，尋找客家</h2></div><button type="button" class="ghost" data-action="fly">✈ 模擬飛行</button></div>
    <svg class="map-svg" viewBox="0 0 1020 580" role="img" aria-label="依東亞與東南亞相對位置簡化繪製的地圖。點擊地名取得介紹。">
      <defs>
        <radialGradient id="hot"><stop stop-color="#f5bf77" stop-opacity=".42"/><stop offset="1" stop-color="#f5bf77" stop-opacity="0"/></radialGradient>
        <marker id="arrowA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#f6b76c"/></marker>
      </defs>
      <path class="land" d="M 15 25 L 563 25 L 563 77 L 540 95 L 550 122 L 523 134 L 501 160 L 472 154 L 454 174 L 418 162 L 392 179 L 360 170 L 327 193 L 299 176 L 268 192 L 238 179 L 211 194 L 179 186 L 148 205 L 112 189 L 79 205 L 42 191 L 15 173 Z"/>
      <path class="coast" d="M 593 70 Q 611 74 618 92 L 622 126 615 155 600 172 585 155 580 125 584 93 Z"/>
      <path class="coast" d="M 664 154 Q 691 144 714 156 L 725 179 713 201 690 207 668 192 660 171 Z"/>
      <path class="coast" d="M 699 223 Q 718 214 734 225 L 735 242 714 251 700 239 Z"/>
      <path class="coast" d="M 705 258 Q 732 247 754 261 L 748 292 724 304 706 285 Z"/>
      <path class="coast" d="M 304 363 Q 339 338 370 349 L 394 391 362 421 325 411 302 385 Z"/>
      <path class="coast" d="M 388 391 Q 412 382 433 395 L 429 421 405 433 387 418 Z"/>
      <path class="coast" d="M 457 226 Q 515 208 578 222 L 627 270 617 325 592 372 541 402 493 382 457 335 442 282 Z"/>
      <path class="coast" d="M 412 447 Q 466 431 531 436 L 592 444 650 457 664 471 595 478 527 481 462 475 425 468 Z"/>
      <ellipse cx="471" cy="287" rx="92" ry="76" fill="url(#hot)"/>
      <ellipse cx="407" cy="410" rx="46" ry="42" fill="url(#hot)"/>
      <ellipse cx="595" cy="118" rx="42" ry="48" fill="url(#hot)"/>
      <text x="140" y="92" class="country-name">中國南方</text>
      <text x="573" y="61" class="country-name">臺灣</text>
      <text x="666" y="138" class="minor-name">菲律賓</text>
      <text x="500" y="425" class="country-name">印尼</text>
      <text x="517" y="265" class="minor-name">加里曼丹</text>
      <text x="505" y="504" class="minor-name">爪哇島</text>
      <text x="387" y="380" class="minor-name">邦加</text>
      <text x="293" y="344" class="minor-name">蘇門答臘</text>
      <path class="route" d="M 472 141 Q 528 100 586 118" marker-end="url(#arrowA)"/>
      <path class="route" d="M 472 141 Q 478 206 471 287" marker-end="url(#arrowA)"/>
      <path class="route modern" d="M 593 118 Q 553 188 471 287"/>
      <g class="pin" role="button" tabindex="0" data-action="map-point" data-place="origin" aria-label="查看廣東、福建客家原鄉"><circle class="halo" cx="472" cy="141" r="31"/><circle class="core" cx="472" cy="141" r="8"/><text x="390" y="126">客家原鄉</text></g>
      <g class="pin" role="button" tabindex="0" data-action="map-point" data-place="taiwan" aria-label="查看臺灣客庄"><circle class="halo" cx="593" cy="118" r="31"/><circle class="core" cx="593" cy="118" r="8"/><text x="614" y="116">臺灣客庄</text></g>
      <g class="pin" role="button" tabindex="0" data-action="map-point" data-place="singkawang" aria-label="查看印尼山口洋"><circle class="halo" cx="471" cy="287" r="39"/><circle class="core" cx="471" cy="287" r="9"/><text x="402" y="325">山口洋</text></g>
      <g class="pin" role="button" tabindex="0" data-action="map-point" data-place="java" aria-label="查看爪哇島"><circle class="halo" cx="530" cy="462" r="24"/><circle class="core" cx="530" cy="462" r="7"/><text x="550" y="462">爪哇島</text></g>
      <g class="pin" role="button" tabindex="0" data-action="map-point" data-place="bangka" aria-label="查看邦加島"><circle class="halo" cx="407" cy="410" r="24"/><circle class="core" cx="407" cy="410" r="7"/><text x="420" y="409">邦加</text></g>
      <g class="plane"><path d="M0 -11 L5 -4 L15 0 L15 4 L3 3 L0 14 L-3 13 L-4 3 L-15 4 L-15 0 L-4 -4Z"/></g>
    </svg><div class="map-info" id="mapInfo"></div><p class="map-note">此圖依東亞與東南亞的相對位置重新簡化繪製，仍屬教學示意圖，不等於精確國界或人口分布圖。光暈僅表示要介紹的聚居地區。</p></section>`;
  }
  function updateMapInfo(){
    const items={
      intro:['從哪裡出發？','點地圖上的地名，認識本課的移民原鄉、臺灣客庄、印尼爪哇島、邦加島與山口洋。'],
      origin:['廣東、福建等客家原鄉','臺灣與印尼的客家移民，多有從中國南方各地分別遷徙的歷史；不是從臺灣整批移去印尼。'],
      taiwan:['臺灣客庄','新竹、苗栗等地有重要客家聚落。人口集中不等於所有年齡層都會說客語。'],
      singkawang:['山口洋｜Singkawang','位於印尼西加里曼丹，是認識印尼客家社群、客語生活與元宵文化的重要地點。'],
      java:['爪哇島｜Java','課文旅程從爪哇島開始。爪哇島人口稠密，與加里曼丹的位置不同。'],
      bangka:['邦加島｜Bangka','課文提到邦加的錫礦產業，是理解當地華人、客家人謀生方式的線索。']
    };
    const e=document.getElementById('mapInfo');if(e){const s=items[state.place]||items.intro;e.innerHTML=`<strong>${s[0]}</strong><div>${s[1]}</div>`;}
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
    const content=(which)=>{const v=row[which];return `<div class="dialect-col"><span class="dialect-name">${labels[which]}</span><div class="han-text">${highlightWords(v.text,which)}</div>${state.pinyin?`<div class="pinyin-text">${esc(v.pinyin)}</div>`:''}</div>`;};
    return `<div class="reading-unit ${d==='both'?'both':''}"><div class="unit-n">課文第${row.id}段</div>${d==='both'?content('hailu')+content('sixian'):content(d)}</div>`;
  }
  function readingStage(){
    const sets=[{name:'旅程與祖籍',ids:[1,2,3,4,5]},{name:'世代與政策',ids:[6,7,8,9]},{name:'工作與產業',ids:[10,11,12]},{name:'羅芳伯與蘭芳',ids:[13,14]}];
    const group=sets[state.chunk];
    const title=(which)=>DATA.title[which];
    return `<section class="panel"><div class="row spacebetween"><div><div class="micro-label">配合課本閱讀 · 標音可隱藏</div><h2 style="margin-top:5px">${esc(title('hailu').text)}</h2></div><span class="tag amber">點擊底線詞語查看註解</span></div>
      <div class="reading-controls">${sets.map((s,i)=>`<button class="chunk ${i===state.chunk?'active':''}" data-action="chunk" data-index="${i}">${i+1}. ${s.name}</button>`).join('')}</div>
      <div class="reading-panel">${DATA.rows.filter(r=>group.ids.includes(r.id)).map(readingUnit).join('')}</div>
      <div class="vocab-strip">${DATA.vocab.map(v=>`<button data-action="vocab" data-vocab="${v.id}">${esc(state.dialect==='sixian'?v.sixian:v.hailu)}</button>`).join('')}</div>
      <p class="read-tip">請學生直接在課本圈畫詞彙與註記詞義；學習單不重複抄寫。雙腔模式供教師對照，實際跟讀可先選擇一腔。</p>
    </section><div class="teacher-note">課文與拼音依已提供的海陸、四縣文本分別儲存；兩腔用字不同時會一起切換。例如「流利／流掠」「了解／發現」「樹乳樹／樹乳仔」。所有拼音皆以小寫顯示。</div>`;
  }
  function policyStage(){
    const poll=['家裡或親戚聚會','學校客語課','市場、商店或街上','社區活動與廟會','平常很少聽到'];
    return `<section class="panel"><span class="micro-label">從課文回到生活</span><h2 class="question">住在客家人口集中的地方，<br>就一定會說客語嗎？</h2><div class="grid2">
       <div class="policy-col"><span class="tag amber">印尼的歷史背景</span><h3>華文教育與出版曾受限制</h3><p>課文描述1960年代中後期開始的限制；華文學校、出版等政策影響了部分族群語言的學習與使用環境。</p></div>
       <div class="policy-col"><span class="tag">臺灣的歷史背景</span><h3>過去推行國語政策</h3><p>學校與公共場合的語言環境曾以國語為主，本土語言的使用機會與世代傳承受到影響。</p></div>
     </div><p class="citation">兩地的制度背景、政策目標與實施方式並不完全相同。比較的是語言政策及生活環境如何影響語言使用，不是認定兩者完全相同。</p></section>
     <section class="panel soft"><div class="micro-label">課堂提問 · 學習單任務一</div><h2>你平常在哪裡比較容易聽到客語？</h2><div class="poll">${poll.map((p,i)=>`<button class="${state.poll.includes(i)?'active':''}" data-action="poll" data-index="${i}">${p}</button>`).join('')}</div><div class="selection-output">${state.poll.length?`目前選擇：${state.poll.map(i=>poll[i]).join('、')}`:'可以複選，教師可邀請學生分享自己的生活經驗。'}</div><p class="question" style="font-size:19px;margin-top:15px">如果希望客語繼續有人使用，生活中還可以增加哪些使用機會？</p></section>
     <div class="teacher-note"><strong>授課提醒：</strong>不要求學生解釋複雜的社會語言學成因，也不把個人的客語能力當成評價身分認同的標準。</div>`;
  }
  function audioCard(id,title,subtitle){
    const file=state.audio[id];
    return `<div class="audio-chooser"><span class="micro-label">${id==='tw'?'音檔 A':'音檔 B'}</span><h3>${title}</h3><p class="audio-note">${subtitle}</p>
      <input type="file" accept="audio/*" data-audio="${id}" aria-label="載入${title}音檔">
      ${file?`<audio id="audio-${id}" controls preload="metadata" src="${esc(file)}">此瀏覽器無法播放音檔。</audio><div class="audio-status">${state.audioTemporary[id]?'本次臨時選取的本機檔案':'已配置固定音檔'}</div>`:`<div class="audio-status">尚未配置錄音。可從電腦選取MP3／WAV臨時播放；正式發表前請加入取得授權的真實錄音。</div>`}
    </div>`;
  }
  function audioStage(){
    return `<section class="panel"><span class="micro-label">教師先播放，再請學生描述</span><h2 class="question">你聽到了熟悉的客語聲音嗎？</h2><div class="grid2">${audioCard('tw','臺灣海陸客語','選擇一段短而清楚的臺灣海陸客語錄音。')}${audioCard('id','印尼山口洋客語','選擇有明確來源、具使用許可的山口洋客語錄音。')}</div><p class="citation">網站不會以人工合成或其他語言錄音冒充山口洋客語。音檔尚待匯入；這個畫面已支援本機選檔播放與正式音檔設定。</p></section>
    <section class="panel soft"><div class="grid2"><div><div class="micro-label">聆聽問題</div><h2>哪些地方聽起來熟悉？</h2><p>語調、個別詞語，還是整句的大意？學生自由回答即可，不要求精確的語音分析。</p></div><div><div class="micro-label">連回課文</div><h2>海外也有客語生活</h2><p>早期限制政策不等於每一個客家社群都停止使用客語。家庭、社區與日常交往都可能影響語言延續。</p></div></div></section>`;
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
    <section class="panel"><h2>蘭芳公司做哪些事？</h2><div class="info-tiles"><div class="tile"><strong>⛏ 採金與經濟</strong>組織礦業生產，並發展農業與市場。</div><div class="tile"><strong>🏘 社群治理</strong>協調群體內部的共同事務與地方秩序。</div><div class="tile"><strong>🤝 對外關係</strong>與當地政治勢力及其他社群互動。</div></div><p class="muted">因此「蘭芳公司是不是一間公司？」可以當作引導提問。研究者對其政治組織形式有不同詮釋，課堂不必簡化為「亞洲第一個民主共和國」。</p></section>
    <div class="teacher-note"><strong>學習單任務二：</strong>蘭芳公司除了採礦，還處理什麼事情？請學生寫出一項。此段歷史資料參考World History Connected相關研究。</div>`;
  }
  function dumplingSVG(which){
    const id=which==='tw'?'twfood':'idfood';
    const color=which==='tw'?'#e0e0c2':'#e2e9d8';
    return `<svg viewBox="0 0 350 230" role="img" aria-label="粄食外形示意插畫，非食物實景照片"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><ellipse cx="174" cy="180" rx="137" ry="31" fill="#88aba4" opacity=".32"/><ellipse cx="174" cy="171" rx="135" ry="37" fill="#f5f8f2" stroke="#cadbd3" stroke-width="5"/>${which==='tw'?
      '<path d="M78 157 Q69 113 106 94 Q150 64 172 98 Q202 130 177 161Z" fill="url(#twfood)" stroke="#a1b6a2" stroke-width="4"/><path d="M156 157 Q150 115 188 92 Q224 76 255 116 Q271 142 247 159Z" fill="url(#twfood)" stroke="#a1b6a2" stroke-width="4"/><path d="M93 133 Q134 102 162 140 M175 136 Q207 106 247 140" stroke="#b4c5ae" stroke-width="5" stroke-linecap="round" fill="none"/>':
      '<path d="M65 151 Q75 107 112 111 Q149 119 163 156Z" fill="url(#idfood)" stroke="#a0b7a2" stroke-width="4"/><path d="M137 156 Q146 102 192 109 Q222 114 239 158Z" fill="url(#idfood)" stroke="#a0b7a2" stroke-width="4"/><path d="M226 157 Q228 121 263 117 Q288 124 300 156Z" fill="url(#idfood)" stroke="#a0b7a2" stroke-width="4"/><path d="M85 141 Q114 123 144 143 M163 142 Q193 124 218 145 M247 144 Q270 134 287 148" fill="none" stroke="#bfd1bd" stroke-width="4"/>'}<circle cx="292" cy="180" r="10" fill="#588e61"/><circle cx="280" cy="187" r="8" fill="#65a66e"/><circle cx="311" cy="177" r="8" fill="#6a9a61"/></svg>`;
  }
  function foodStage(){
    return `<section class="grid2"><div class="food-card"><div class="card-illustration">${dumplingSVG('tw')}</div><div class="food-body"><span class="tag">臺灣客家</span><h3>菜包／豬籠粄</h3><p>常見鹹餡：蘿蔔絲、蘿蔔乾、香菇等，外皮以米製作。</p></div></div><div class="food-card"><div class="card-illustration">${dumplingSVG('id')}</div><div class="food-body"><span class="tag amber">印尼山口洋</span><h3>Choi Pan／菜粄</h3><p>名稱是「菜粄」的在地羅馬字拼寫之一；常見涼薯、韭菜等餡料，也是鹹食。</p></div></div></section>
    <section class="panel"><div class="micro-label">圖片為示意插畫；可在後續版本替換成授權實景照片</div><h2>找找看：相同在哪裡？不同在哪裡？</h2><div class="compare-line"><div><strong>共同點</strong><br>以米製外皮包餡，都是移民社群熟悉的粄食文化。</div><div><strong>差異</strong><br>餡料、調味、外形與搭配醬料可因地方而不同。</div></div><div class="answer-box" style="margin-top:14px">學生任務：在學習單各記錄一項相同與不同，先觀察再揭曉。</div></section>
    <section class="panel soft"><h2>南洋米食都比較甜嗎？</h2><p>某些南洋米食與甜點會使用椰奶、椰絲或椰糖；但山口洋的Choi Pan常是鹹食。臺灣客家粄食也同時有甜、鹹兩類。</p><p class="muted">避免把整個南洋、或整個臺灣的飲食文化概括成單一口味。</p></section>`;
  }
  function festivalStage(){
    const f=[
      {icon:'🏮',title:'臺灣：元宵花燈',desc:'看花燈、賞燈會，是熟悉的元宵活動之一。'},
      {icon:'🐉',title:'苗栗：𪹚龍',desc:'苗栗客庄具有地方特色的元宵民俗活動。'},
      {icon:'🔥',title:'北埔：油笐火',desc:'人們以火把參與地方慶典，與北埔的地方記憶相連。'},
      {icon:'🎭',title:'山口洋：Cap Go Meh',desc:'元宵慶典包含Tatung遊行，展現多族群互動的地方文化。'}
    ];
    return `<section class="panel"><div class="micro-label">快速觀察 · 3分鐘</div><h2>同樣是元宵，活動為什麼不一樣？</h2><div class="grid4">${f.map(x=>`<div class="festival-card"><span class="festival-symbol" aria-hidden="true">${x.icon}</span><h3>${x.title}</h3><p>${x.desc}</p></div>`).join('')}</div><div class="answer-box" style="margin-top:17px">請學生挑選一個例子：這個地方的元宵活動，和你熟悉的元宵節有什麼相同與不同？</div></section>
    <div class="teacher-note">圖片與短片預留正式教學時替換；目前以符號與文字維持完全離線操作。介紹山口洋活動時，避免只把Tatung視為單一族群的表演。</div>`;
  }
  function endingStage(){
    const cards=[
      {name:'保留',desc:'保有與原鄉相連的語言、食物或節慶元素',example:'不同地方仍能看見「客家粄食」這種文化線索。'},
      {name:'改變',desc:'生活環境、材料、語言使用情境產生變化',example:'臺灣與印尼菜粄的內餡、做法有各自的在地特色。'},
      {name:'融合',desc:'與其他族群、地方文化相遇並交流',example:'山口洋元宵活動展現不同族群的共同參與。'}
    ];
    return `<section class="panel"><div class="micro-label">最後的文化提問</div><h2 class="question">你今天最有印象的是哪一個例子？<br>它讓你想到「保留、改變」還是「融合」？</h2><div class="grid3">${cards.map(c=>`<button type="button" class="reflection ${state.reflection===c.name?'active':''}" data-action="reflect" data-value="${c.name}" style="text-align:left"><strong>${c.name}</strong><p>${c.desc}</p></button>`).join('')}</div>
    <div class="answer-box" style="margin-top:15px">${cards.find(c=>c.name===state.reflection).example}</div><p class="citation">一個案例可以同時有保留、改變與融合，不必硬分成互斥的類別。</p></section>
    <section class="panel soft"><div class="grid2"><div><div class="micro-label">課程總結</div><div class="lesson-outro">漂洋過海，客家文化在不同地方繼續生活。</div><p>臺灣與印尼的客家人有歷史連結，也有各自的社會環境與文化發展。</p></div><div><h2>收回學習單前</h2><p>請學生完成最後一題：選一個今天的實例，寫出你看到的現象及理由。</p><a href="worksheet.html" target="_blank" rel="noopener" class="action" style="display:inline-block;text-decoration:none;margin-top:10px">開啟可列印學習單 ↗</a></div></div></section>`;
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
    const lines=[['海陸腔',w.hailu,p[0]],['四縣腔',w.sixian,p[1]]].map(x=>`<div class="dialog-dialect"><span><strong>${esc(x[0])}：</strong>${esc(x[1])}</span><small>${esc(x[2])}</small></div>`).join('');
    openDialog(w.hailu===w.sixian?w.hailu:`${w.hailu}／${w.sixian}`,'課文詞彙註解',`${lines}<p><strong>詞義：</strong>${esc(w.definition)}</p><p><strong>閱讀提示：</strong>${esc(w.note)}</p><p class="citation">提醒學生直接在課本畫記與註解。</p>`);
  }
  function showSources(){
    openDialog('資料來源與編輯說明','使用資訊',`<div class="sources-list">${DATA.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}</div><p class="citation">課文、拼音依授課教師提供版本整理。示意插畫與方位地圖並非紀實圖片或精確分布圖。尚未附入真實客語錄音，請教師在上課前補入已授權素材。</p>`);
  }
  function closeDialog(){overlay.hidden=true;}
  document.addEventListener('click',e=>{
    if(e.target===overlay){closeDialog();return;}
    const el=e.target.closest('[data-action]');if(!el)return;
    const action=el.dataset.action;
    if(action==='jump')goto(Number(el.dataset.index));
    if(action==='reveal'){state.reveal=!state.reveal;render();}
    if(action==='map-point'){state.place=el.dataset.place;updateMapInfo();}
    if(action==='fly'){
      state.place='singkawang';updateMapInfo();const mp=document.getElementById('mapPanel');if(mp){mp.classList.remove('flying');void mp.offsetWidth;mp.classList.add('flying');}
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
    if((e.key==='Enter'||e.key===' ') && e.target.matches('.map-svg .pin')){e.preventDefault();state.place=e.target.dataset.place;updateMapInfo();return;}
    if(e.key==='ArrowRight' || e.key==='PageDown'){e.preventDefault();goto(state.stage+1);}
    if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();goto(state.stage-1);}
    if(e.key.toLowerCase()==='f'){document.getElementById('fullscreenToggle').click();}
  });
  document.querySelectorAll('[data-dialect]').forEach(el=>el.addEventListener('click',()=>{state.dialect=el.dataset.dialect;render();}));
  document.getElementById('pinyinToggle').addEventListener('click',()=>{state.pinyin=!state.pinyin;render();});
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
