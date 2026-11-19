/* 客語聲調、聲母互動查詢：臺灣海陸腔及四縣腔，無音訊合成。 */
/* V1.0.0：語音工具與「生活中的科學　客語詞彙篇」同步（元音表、韻母配字表以教育部拼音顯示，IPA送氣符號上標，文白讀標記加括號，原始圖表與連讀變調不顯示腔調鈕）。 */
(()=>{
'use strict';
const root=document.getElementById('phonologyOverlay'), target=document.getElementById('phonologyContent');
if(!root||!target)return;
const assets='assets/images/phonology/';
const toneData={
 hailu:[['陰平','53','ˋ',5,3],['陽平','55','',5,5],['上聲','24','ˊ',2,4],['陰去','11','ˇ',1,1],['陽去','33','＋',3,3],['陰入','5','',5,5],['陽入','2','ˋ',2,2]],
 sixian:[['陰平','24','ˊ',2,4],['陽平','11','ˇ',1,1],['上聲','31','ˋ',3,1],['去聲','55','',5,5],['陰入','2','ˋ',2,2],['陽入','5','',5,5]]
};
const colors=['#007f9c','#be781c','#2a9255','#8154b9','#dc4267','#4960c4','#94602f'];
// 兩腔各自獨立列出：四縣 j/q/x，海陸 zh/ch/sh/rh。零聲母單獨顯示。
// pinyin, IPA, manner, place, 例字（僅填已提供或可核對的例字）
const shared=[
 ['b','p','不送氣清塞音','雙脣音','比、晡'],['p','pʰ','送氣清塞音','雙脣音','爬、牌'],['m','m','鼻音','雙脣音','麻、米'],
 ['f','f','清擦音','脣齒音','飛、華'],['v','v','濁擦音','脣齒音','還、畏'],
 ['d','t','不送氣清塞音','齒齦音','答、垤'],['t','tʰ','送氣清塞音','齒齦音','淡、圖'],['n','n','鼻音','齒齦音','挼、內'],['l','l','邊音','齒齦音','李、露'],
 ['z','ts','不送氣清塞擦音','齒齦音','炸'],['c','tsʰ','送氣清塞擦音','齒齦音','茶'],['s','s','清擦音','齒齦音','洗、新'],
 ['g','k','不送氣清塞音','軟顎音','街、關'],['k','kʰ','送氣清塞音','軟顎音','卡、庫'],['ng','ŋ','鼻音','軟顎音','我、危'],['h','h','清擦音','聲門音','客、係'],
 ['Ø','Ø','零聲母','—','愛、安']
];
const specific={
 hailu:[['zh','tʃ','不送氣清塞擦音','齦硬顎音','站、紙'],['ch','tʃʰ','送氣清塞擦音','齦硬顎音','尺、場'],['sh','ʃ','清擦音','齦硬顎音','石、食'],['rh','ʒ','濁擦音','齦硬顎音','已、一']],
 sixian:[['j','tɕ','不送氣清塞擦音','齦硬顎音','酒'],['q','tɕʰ','送氣清塞擦音','齦硬顎音','七'],['x','ɕ','清擦音','齦硬顎音','寫']]
};
const places=['雙脣音','脣齒音','齒齦音','齦硬顎音','軟顎音','聲門音'];
const manners=['鼻音','不送氣清塞音','送氣清塞音','不送氣清塞擦音','送氣清塞擦音','清擦音','濁擦音','邊音'];
let tab='tones',dialect='hailu',selected='陰平',showAll=false,selectedInitial='b';
const rimeData=window.HakkaRimeData||null;let rimeBlock=0,selectedRime='a',rimeSearch='';
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function titleText(){document.getElementById('phonologyTitle').textContent=tab==='consonants'?'客語聲母互動表':tab==='vowels'?'新竹海陸腔元音表':tab==='rimes'?'新竹海陸腔韻母配字表':tab==='sandhi'?'客語連讀變調':tab==='references'?'聲調原始參考圖':'五度聲調互動圖';}
function render(){titleText();document.querySelectorAll('[data-phon-tab]').forEach(x=>{const a=x.dataset.phonTab===tab;x.classList.toggle('active',a);x.setAttribute('aria-pressed',a)});document.querySelectorAll('[data-phon-dialect]').forEach(x=>{const a=x.dataset.phonDialect===dialect;x.classList.toggle('active',a);x.setAttribute('aria-pressed',a)});
 const hailuOnly=tab==='vowels'||tab==='rimes';
 // 元音、韻母配字表只有海陸腔；原始圖表、連讀變調兩腔並列，內容不隨腔調切換。這四頁都不顯示腔調鈕，免得按了沒有反應。
 const noDialect=hailuOnly||tab==='references'||tab==='sandhi';const dialectBar=root.querySelector('.phonology-dialects');if(dialectBar)dialectBar.hidden=noDialect;
 const modalityLabel=root.querySelector('.phonology-head .micro-label');if(modalityLabel)modalityLabel.textContent=hailuOnly?'新竹海陸腔・教師提供資料':'海陸腔／四縣腔';
 target.innerHTML=tab==='vowels'?renderVowels():tab==='rimes'?renderRimes():tab==='consonants'?renderInitials():tab==='references'?renderReferences():tab==='sandhi'?renderSandhi():renderTones();}
function renderTones(){const rows=toneData[dialect],y=n=>218-(n-1)*42;
 let lines=Array.from({length:5},(_,i)=>{const n=i+1;return `<line x1="46" y1="${y(n)}" x2="618" y2="${y(n)}" stroke="#d6e5e8" stroke-dasharray="4 6"/><text x="20" y="${y(n)+6}" font-size="18" fill="#395e66">${n}</text>`}).join('');
 lines+=rows.map((r,i)=>{const isShort=r[0].endsWith('入');const startX=75,endX=isShort?172:567;const active=showAll||r[0]===selected;const slight=showAll?(i-rows.length/2)*2:0;return `<path class="tone-path ${active?'':'muted'}" style="stroke:${colors[i]};animation-delay:${showAll?i*110:0}ms" d="M ${startX} ${y(r[3])+slight} L ${endX} ${y(r[4])+slight}"/><text x="${isShort?182:576}" y="${y(r[4])+slight+5}" font-size="14" fill="${active?colors[i]:'#c3cbd0'}">${active?`${r[0]} ${r[1]}`:''}</text>`}).join('');
 return `<div class="phonology-toolbarline"><p class="phonology-headerline">點擊聲調，只突出該調的音高走向；入聲以短線表示。</p><button class="phonology-all ${showAll?'active':''}" data-phon-action="all">${showAll?'返回單一聲調':'全部同步顯示'}</button></div><svg class="phonology-tone-chart" viewBox="0 0 700 252" role="img" aria-label="${dialect==='hailu'?'海陸':'四縣'}腔五度聲調互動圖，1最低5最高">${lines}<text x="69" y="242" fill="#546f78" font-size="13">起點</text><text x="544" y="242" fill="#546f78" font-size="13">終點</text></svg><div class="phonology-tone-buttons">${rows.map((r,i)=>`<button class="${!showAll&&selected===r[0]?'active':''}" data-phon-tone="${r[0]}">${r[0]} ${r[1]}</button>`).join('')}</div><div class="phonology-tone-stat">${showAll?'同時比較全部聲調':`${selected}：${(rows.find(r=>r[0]===selected)||rows[0])[1]}（${(rows.find(r=>r[0]===selected)||rows[0])[2]||'不標調號'}）`}</div><table class="phonology-small-table"><thead><tr><th>調名</th><th>調值</th><th>調型符號</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]||'不標'}</td></tr>`).join('')}</tbody></table><p class="phonology-note">海陸與四縣調型依本課校訂對照。圖形只示意聲調的相對音高與方向，不代表實際發音的精確音高或時長。</p>`;
}
function renderInitials(){const inventory=[...shared,...specific[dialect]];if(!inventory.some(r=>r[0]===selectedInitial))selectedInitial='b';
 const rows=manners.map(m=>`<tr><td>${m}</td>${places.map(place=>{const arr=inventory.filter(r=>r[2]===m&&r[3]===place);return `<td>${arr.map(r=>`<button data-phon-initial="${r[0]}" class="${r[0]===selectedInitial?'active':''}" aria-label="${r[0]}，${r[2]}" title="${r[0]} /${r[1]}/">${r[0]}</button>`).join('')}</td>`}).join('')}</tr>`).join('');
 const item=inventory.find(r=>r[0]===selectedInitial)||inventory[0];return `<p class="phonology-consonant-key">點選表中的拼音聲母，可查看國際音標、發音部位及發音方法。切換腔調會顯示該腔聲母。</p><div class="phonology-wrap"><table class="phonology-grid"><thead><tr><th>發音方法／部位</th>${places.map(p=>`<th>${p}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><div class="phonology-detail" aria-live="polite"><strong>${escapeHTML(item[0])}</strong>　<big>/${escapeHTML(item[1])}/</big><div>發音部位：${item[3]}｜發音方法：${item[2]}</div><div>${item[0]==='Ø'?'零聲母通常不另外標記。':`例字：${escapeHTML(item[4])}`}</div></div><p class="phonology-note">教育部拼音的b、p分別對應IPA /p/、/pʰ/，不是依英語字母讀音。鼻音ng通常對應/ŋ/；在特定高前元音環境可有硬顎化現象。例字取自本課教師提供的表格與教育部資料；不同腔調的例字讀音仍需配合該腔詞彙理解。</p><p class="phonology-note">資料參考：<a href="https://language.moe.gov.tw/uploads/files/17580037081691.pdf" target="_blank" rel="noopener">教育部《臺灣客語拼音方案》</a>。表中IPA依此方案與曾櫳震老師提供的分類呈現，不提供未經確認的機器發音。</p>`;}
function renderReferences(){const names=[['tone-table-1.png','傳統調類、調值與調型表'],['tone-table-2.png','八聲調名稱對照'],['tone-hailu-diagram.png','海陸腔五度聲調表記'],['tone-sixian-diagram.png','四縣腔五度聲調表記'],['tone-mandarin-diagram.png','華語五度聲調表記']];return `<p class="phonology-note">以下直接使用教師提供的原始圖檔，不重新繪製。</p><div class="phonology-ref-grid">${names.map(([fn,label])=>`<figure><a href="${assets+fn}" target="_blank" rel="noopener"><img src="${assets+fn}" alt="${label}" loading="lazy"/></a><figcaption>${label}（點擊放大）</figcaption></figure>`).join('')}</div>`;}
function renderSandhi(){const names=[['sandhi-hailu-1.png','海陸腔連讀變調規則（一）'],['sandhi-hailu-2.png','海陸腔連讀變調規則（二）'],['sandhi-sixian.png','四縣腔連讀變調規則']];return `<p class="phonology-note">連讀變調是進階補充。此處完整呈現教師提供的圖表與例字，不加入未核對的額外規則。</p><div class="phonology-ref-grid">${names.map(([fn,label])=>`<figure><a href="${assets+fn}" target="_blank" rel="noopener"><img src="${assets+fn}" alt="${label}" loading="lazy"/><figcaption>${label}（點擊放大）</figcaption></a></figure>`).join('')}</div>`;}
// ── V1.1.1：元音表與韻母配字表的原始資料以IPA記錄（取自論文附錄）；
//    網站改以教育部臺灣客語拼音顯示，對照表在 phonology-moe-map.js，方括號內附原表的IPA。
const moeMap=window.HakkaMoeMap||{initials:{},finals:{}};
const moeInitial=h=>moeMap.initials[h]??h;
const moeFinal=f=>moeMap.finals[f]??f;
// IPA的送氣符號一律上標：資料檔已用 ʰ；這裡再保險一次，也用來整理搜尋時輸入的字。
const ipaShow=s=>String(s).replace(/^(p|t|k|ts|tʃ)h$/,'$1ʰ');
// 元音表例字的寫法是「聲母－例字」，把聲母由IPA換成拼音。
// 原表在例字後以「文」「白」「罕」標記文讀、白讀、罕用；顯示時加上括號，例如「林白」→「林（白）」。只處理「一個字＋標記」的寫法，雙字詞不動。
const markReading=v=>{const a=[...String(v)];return a.length===2&&'文白罕'.includes(a[1])?`${a[0]}（${a[1]}）`:String(v);};
const moeExample=ex=>{const i=ex.indexOf('－');if(i<0)return markReading(ex);const head=ex.slice(0,i);return (moeMap.initials[head]??head)+'－'+markReading(ex.slice(i+1));};
function renderVowels(){
 if(!rimeData)return '<p>元音資料尚未載入，請重新開啟網站。</p>';
 const rows=rimeData.vowels.map(v=>`<tr><td>${escapeHTML(v.type)}</td><td class="pv-pinyin">${escapeHTML(v.name)}</td><td class="pv-ipa">[${escapeHTML(v.ipa)}]</td><td>${v.examples.length?escapeHTML(v.examples.map(moeExample).join('、')):'—'}</td><td>${escapeHTML(v.note||'—')}</td></tr>`).join('');
 return `<p class="phonology-note">依教師提供的「教育部拼音方案／國際音標／備註／例字」資料整理。IPA以方括號標示音值。例字欄的寫法是「聲母－例字」，聲母原表以IPA記錄，這裡改以教育部拼音顯示。</p><div class="phon-vowel-scroll"><table class="phon-vowel-table"><thead><tr><th>韻類</th><th>拼音方案</th><th>國際音標</th><th>例字（聲母－例字）</th><th>備註</th></tr></thead><tbody>${rows}</tbody></table></div><p class="phonology-note">〔註1〕${escapeHTML(rimeData.footnotes[0])}</p><p class="phonology-note">/a/與/ɑ/之間的關係，依教師原表說明為「在教育部拼音方案中視為同音位」，並列呈現供比較；不據此新增音位對立。</p><p class="phonology-note">要查某個聲母與韻母有哪些例字，可切換至「韻母配字表」。</p>`;
}
function renderRimes(){
 if(!rimeData)return '<p>韻母資料尚未載入，請重新開啟網站。</p>';
 const blocks=rimeData.blocks, b=blocks[rimeBlock];if(!b.finals.includes(selectedRime))selectedRime=b.finals[0];
 const finals=blocks.reduce((n,x)=>n+x.finals.length,0);
 const initialLabel=h=>`${escapeHTML(moeInitial(h))}<small>[${escapeHTML(ipaShow(h))}]</small>`;
 const tabs=blocks.map((x,i)=>`<button type="button" class="${i===rimeBlock?'active':''}" data-phon-block="${i}" aria-pressed="${i===rimeBlock}">${escapeHTML(x.label.split('｜')[0])}<small>${x.finals.length}韻</small></button>`).join('');
 const headBtns=b.finals.map(x=>`<button type="button" data-phon-rime="${escapeHTML(x)}" class="${x===selectedRime?'active':''}" aria-pressed="${x===selectedRime}" title="IPA [${escapeHTML(x)}]">${escapeHTML(moeFinal(x))}</button>`).join('');
 const col=b.finals.indexOf(selectedRime);const matches=rimeData.heads.map(h=>[h,b.rows[h][col]]).filter(x=>x[1]!=='○');
 const activeCards=matches.map(([h,word])=>`<div class="phon-rime-pair"><span class="phon-rime-initial">${initialLabel(h)}</span><span class="phon-rime-example">${escapeHTML(markReading(word))}</span></div>`).join('');
 const first=`<section class="phon-rime-selection" aria-live="polite"><div><strong>韻母 <span class="phon-rime-name">${escapeHTML(moeFinal(selectedRime))}</span></strong> <span class="phon-rime-ipa">IPA [${escapeHTML(selectedRime)}]</span><p>本韻母在教師原表中的例字：${matches.length}筆。${matches.length===0?'原表未列例字。':''}</p></div><div class="phon-rime-pairs">${activeCards||'<em>○　未列例字</em>'}</div></section>`;
 const table=`<details class="phon-rime-matrix"><summary>展開${escapeHTML(b.label)}完整矩陣（可左右捲動）</summary><div class="phon-rime-scroll"><table class="phon-rime-table"><thead><tr><th scope="col">聲母＼韻母</th>${b.finals.map(f=>`<th scope="col" class="${f===selectedRime?'is-selected':''}"><button type="button" data-phon-rime="${escapeHTML(f)}" title="IPA [${escapeHTML(f)}]">${escapeHTML(moeFinal(f))}</button></th>`).join('')}</tr></thead><tbody>${rimeData.heads.map(h=>`<tr><th scope="row">${initialLabel(h)}</th>${b.rows[h].map((v,j)=>`<td class="${b.finals[j]===selectedRime?'is-selected':''} ${v==='○'?'is-empty':''}">${escapeHTML(markReading(v))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
 let searchResults='';
 if(rimeSearch){
  // 以例字或教育部拼音搜尋；輸入含IPA專用符號（如 ŋ、ʃ、ɑ）時才比對原表的IPA，避免 p、t、k 這類字母兩套系統混在一起。
  const q=rimeSearch,ql=q.toLowerCase(),asIpa=/[^\x00-\x7F]/.test(q)&&!/[㐀-鿿\u{20000}-\u{3ffff}]/u.test(q);const found=[];
  blocks.forEach((bk,i)=>{rimeData.heads.forEach(h=>{bk.rows[h].forEach((v,j)=>{if(v==='○')return;const f=bk.finals[j];if(v.includes(q)||moeInitial(h).toLowerCase()===ql||moeFinal(f)===ql||(asIpa&&(h===ipaShow(q)||f===q))){found.push({i,f,h,v})}})})});
  const view=found.slice(0,90);searchResults=`<section class="phon-rime-search-results"><h3>搜尋「${escapeHTML(q)}」：${found.length}筆</h3>${view.map(t=>`<button type="button" data-phon-search-result="${t.i}|${escapeHTML(t.f)}">${escapeHTML(moeInitial(t.h))}＋${escapeHTML(moeFinal(t.f))}：<strong>${escapeHTML(markReading(t.v))}</strong></button>`).join('')||'<p>沒有符合的例字。請更換關鍵字。</p>'}${found.length>90?'<p>結果較多，僅顯示前90筆。</p>':''}</section>`;}
 return `<p class="phonology-note">收錄教師提供的5張聲韻配字表，共${finals}欄韻母。可按「表一～表五」切換，再點韻母查看例字；完整對照矩陣可展開。聲母、韻母以教育部拼音顯示，方括號內是原表的IPA。</p><div class="phon-rime-toolbar"><label for="phonRimeQuery">搜尋例字、聲母或韻母（教育部拼音）</label><input type="search" id="phonRimeQuery" placeholder="例如：粄、iang、c" value="${escapeHTML(rimeSearch)}" autocomplete="off"><button type="button" data-phon-action="find-rime">搜尋</button><button type="button" data-phon-action="clear-rime">清除</button></div>${searchResults}<div class="phon-rime-block-tabs">${tabs}</div><h3 class="phon-rime-block-heading">${escapeHTML(b.label)}</h3><div class="phon-rime-list">${headBtns}</div>${first}${table}<p class="phonology-note">${escapeHTML(rimeData.legend)}</p><p class="phonology-note">這是「新竹海陸腔」的教師自編配字參考表，沒有同步提供四縣腔版本，因此此頁不隨上方腔調切換。原表以IPA記錄聲母與韻母，本頁依教育部臺灣客語拼音方案轉寫顯示。[a]與[ɑ]在拼音方案同寫作a；[ŋ]與[ɲ]同寫作ng，因此聲母ng有兩列，以方括號內的IPA區別。</p>`;
}
document.getElementById('phonologyLaunch')?.addEventListener('click',()=>{root.hidden=false;render();document.getElementById('phonologyClose').focus();});
document.getElementById('phonologyClose')?.addEventListener('click',()=>root.hidden=true);
root.addEventListener('click',e=>{if(e.target===root){root.hidden=true;return}const x=e.target.closest('button');if(!x)return;if(x.dataset.phonTab){tab=x.dataset.phonTab;render();return;}if(x.dataset.phonBlock!==undefined){rimeBlock=Number(x.dataset.phonBlock);selectedRime=rimeData.blocks[rimeBlock].finals[0];render();return;}if(x.dataset.phonRime){selectedRime=x.dataset.phonRime;render();return;}if(x.dataset.phonSearchResult){const [g,f]=x.dataset.phonSearchResult.split('|');rimeBlock=Number(g);selectedRime=f;rimeSearch='';render();return;}if(x.dataset.phonAction==='find-rime'){rimeSearch=root.querySelector('#phonRimeQuery')?.value.trim()||'';render();return;}if(x.dataset.phonAction==='clear-rime'){rimeSearch='';render();return;}if(x.dataset.phonDialect){dialect=x.dataset.phonDialect;selected='陰平';selectedInitial='b';showAll=false;render();return;}if(x.dataset.phonTone){selected=x.dataset.phonTone;showAll=false;render();return;}if(x.dataset.phonAction==='all'){showAll=!showAll;render();return;}if(x.dataset.phonInitial){selectedInitial=x.dataset.phonInitial;render();return;}});
root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='phonRimeQuery'){e.preventDefault();rimeSearch=e.target.value.trim();render();root.querySelector('#phonRimeQuery')?.focus();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden){e.preventDefault();e.stopImmediatePropagation();root.hidden=true;}});
})();
