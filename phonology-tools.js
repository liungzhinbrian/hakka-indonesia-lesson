/* 客語聲調、聲母互動查詢：臺灣海陸腔及四縣腔，無音訊合成。 */
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
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function titleText(){document.getElementById('phonologyTitle').textContent=tab==='consonants'?'客語聲母互動表':tab==='sandhi'?'客語連讀變調':tab==='references'?'聲調原始參考圖':'五度聲調互動圖';}
function render(){titleText();document.querySelectorAll('[data-phon-tab]').forEach(x=>{const a=x.dataset.phonTab===tab;x.classList.toggle('active',a);x.setAttribute('aria-pressed',a)});document.querySelectorAll('[data-phon-dialect]').forEach(x=>{const a=x.dataset.phonDialect===dialect;x.classList.toggle('active',a);x.setAttribute('aria-pressed',a)});
 target.innerHTML=tab==='consonants'?renderInitials():tab==='references'?renderReferences():tab==='sandhi'?renderSandhi():renderTones();}
function renderTones(){const rows=toneData[dialect],y=n=>218-(n-1)*42;
 let lines=Array.from({length:5},(_,i)=>{const n=i+1;return `<line x1="46" y1="${y(n)}" x2="618" y2="${y(n)}" stroke="#d6e5e8" stroke-dasharray="4 6"/><text x="20" y="${y(n)+6}" font-size="18" fill="#395e66">${n}</text>`}).join('');
 lines+=rows.map((r,i)=>{const isShort=r[0].endsWith('入');const startX=75,endX=isShort?172:567;const active=showAll||r[0]===selected;const slight=showAll?(i-rows.length/2)*2:0;return `<path class="tone-path ${active?'':'muted'}" style="stroke:${colors[i]};animation-delay:${showAll?i*110:0}ms" d="M ${startX} ${y(r[3])+slight} L ${endX} ${y(r[4])+slight}"/><text x="${isShort?182:576}" y="${y(r[4])+slight+5}" font-size="14" fill="${active?colors[i]:'#c3cbd0'}">${active?`${r[0]} ${r[1]}`:''}</text>`}).join('');
 return `<div class="phonology-toolbarline"><p class="phonology-headerline">點擊聲調，只突出該調的音高走向；入聲以短線表示。</p><button class="phonology-all ${showAll?'active':''}" data-phon-action="all">${showAll?'返回單一聲調':'全部同步顯示'}</button></div><svg class="phonology-tone-chart" viewBox="0 0 700 252" role="img" aria-label="${dialect==='hailu'?'海陸':'四縣'}腔五度聲調互動圖，1最低5最高">${lines}<text x="69" y="242" fill="#546f78" font-size="13">起點</text><text x="544" y="242" fill="#546f78" font-size="13">終點</text></svg><div class="phonology-tone-buttons">${rows.map((r,i)=>`<button class="${!showAll&&selected===r[0]?'active':''}" data-phon-tone="${r[0]}">${r[0]} ${r[1]}</button>`).join('')}</div><div class="phonology-tone-stat">${showAll?'同時比較全部聲調':`${selected}：${(rows.find(r=>r[0]===selected)||rows[0])[1]}（${(rows.find(r=>r[0]===selected)||rows[0])[2]||'不標調號'}）`}</div><table class="phonology-small-table"><thead><tr><th>調名</th><th>調值</th><th>調型符號</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]||'不標'}</td></tr>`).join('')}</tbody></table><p class="phonology-note">海陸與四縣調型依本課校訂對照。圖形只示意聲調的相對音高與方向，不代表實際發音的精確音高或時長。</p>`;
}
function renderInitials(){const inventory=[...shared,...specific[dialect]];if(!inventory.some(r=>r[0]===selectedInitial))selectedInitial='b';
 const rows=manners.map(m=>`<tr><td>${m}</td>${places.map(place=>{const arr=inventory.filter(r=>r[2]===m&&r[3]===place);return `<td>${arr.map(r=>`<button data-phon-initial="${r[0]}" class="${r[0]===selectedInitial?'active':''}" aria-label="${r[0]}，${r[2]}" title="${r[0]} /${r[1]}/">${r[0]}</button>`).join('')}</td>`}).join('')}</tr>`).join('');
 const item=inventory.find(r=>r[0]===selectedInitial)||inventory[0];return `<p class="phonology-consonant-key">點選表中的拼音聲母，可查看國際音標、發音部位及發音方法。切換腔調會顯示該腔聲母。</p><div class="phonology-wrap"><table class="phonology-grid"><thead><tr><th>發音方法／部位</th>${places.map(p=>`<th>${p}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><div class="phonology-detail" aria-live="polite"><strong>${escapeHTML(item[0])}</strong>　<big>/${escapeHTML(item[1])}/</big><div>發音部位：${item[3]}｜發音方法：${item[2]}</div><div>${item[0]==='Ø'?'零聲母通常不另外標記。':`例字：${escapeHTML(item[4])}`}</div></div><p class="phonology-note">教育部拼音的b、p分別對應IPA /p/、/pʰ/，不是依英語字母讀音。鼻音ng通常對應/ŋ/；在特定高前元音環境可有硬顎化現象。例字取自本課教師提供的表格與教育部資料；不同腔調的例字讀音仍需配合該腔詞彙理解。</p><p class="phonology-note">資料參考：<a href="https://language.moe.gov.tw/uploads/files/17580037081691.pdf" target="_blank" rel="noopener">教育部《臺灣客語拼音方案》</a>。表中IPA依此方案與授課教師提供的分類呈現，不提供未經確認的機器發音。</p>`;}
function renderReferences(){const names=[['tone-table-1.png','傳統調類、調值與調型表'],['tone-table-2.png','八聲調名稱對照'],['tone-hailu-diagram.png','海陸腔五度聲調表記'],['tone-sixian-diagram.png','四縣腔五度聲調表記'],['tone-mandarin-diagram.png','華語五度聲調表記']];return `<p class="phonology-note">以下直接使用教師提供的原始圖檔，不重新繪製。</p><div class="phonology-ref-grid">${names.map(([fn,label])=>`<figure><a href="${assets+fn}" target="_blank" rel="noopener"><img src="${assets+fn}" alt="${label}" loading="lazy"/></a><figcaption>${label}（點擊放大）</figcaption></figure>`).join('')}</div>`;}
function renderSandhi(){const names=[['sandhi-hailu-1.png','海陸腔連讀變調規則（一）'],['sandhi-hailu-2.png','海陸腔連讀變調規則（二）'],['sandhi-sixian.png','四縣腔連讀變調規則']];return `<p class="phonology-note">連讀變調是進階補充。此處完整呈現教師提供的圖表與例字，不加入未核對的額外規則。</p><div class="phonology-ref-grid">${names.map(([fn,label])=>`<figure><a href="${assets+fn}" target="_blank" rel="noopener"><img src="${assets+fn}" alt="${label}" loading="lazy"/><figcaption>${label}（點擊放大）</figcaption></a></figure>`).join('')}</div>`;}
document.getElementById('phonologyLaunch')?.addEventListener('click',()=>{root.hidden=false;render();document.getElementById('phonologyClose').focus();});
document.getElementById('phonologyClose')?.addEventListener('click',()=>root.hidden=true);
root.addEventListener('click',e=>{if(e.target===root){root.hidden=true;return}const x=e.target.closest('button');if(!x)return;if(x.dataset.phonTab){tab=x.dataset.phonTab;render();return;}if(x.dataset.phonDialect){dialect=x.dataset.phonDialect;selected='陰平';selectedInitial='b';showAll=false;render();return;}if(x.dataset.phonTone){selected=x.dataset.phonTone;showAll=false;render();return;}if(x.dataset.phonAction==='all'){showAll=!showAll;render();return;}if(x.dataset.phonInitial){selectedInitial=x.dataset.phonInitial;render();return;}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden){e.preventDefault();e.stopImmediatePropagation();root.hidden=true;}});
})();
