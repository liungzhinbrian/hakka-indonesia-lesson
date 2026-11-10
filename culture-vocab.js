/* V7.0.0：文化詞彙彈出式學習視窗。原始調值由教師校訂，依網站切換調值／調型。 */
(()=>{'use strict';
const D={
 2:[['移民','移民','Rhi55 min55','I11 min11','移民'],['南洋','南洋','Nam55 rhong55','Nam11 iong11','南洋（指東南亞地區）'],['做生理','做生理','Zo11 sen53 li53','Zo55 sen11 li24','經商'],['組織','組織','Zu24 zhib5','Zu31 ziib2','組織'],['採礦','採礦','Cai24 kong11','Cai31 kong55','採礦'],['金','金','Gim53','Gim24','金'],['錫','錫','Siag5','Siag2','錫']],
 3:[['菜包','豬籠粄','Coi11 bau53','Zu24 lung11 ban31','菜包'],['粽仔','粽仔','Zung11 er55','Zung55 e31','粽子'],['粄粽','粄粽','Ban24 zung11','Ban31 zung55','粄粽'],['菜頭','蘿蔔','Coi11 teu55','Lo31 ped2','蘿蔔'],['菜脯','菜脯','Coi11 bu24','Coi55 bu31','蘿蔔乾'],['香菇','香菇','Hiong53 gu53','Hiong11 gu24','香菇'],['蝦米','蝦米','Ha55 mi24','Ha11 mi31','蝦米'],['菣香','菣香','Kien11 hiong53','Kien55 hiong24','提香／提味']],
 4:[['正月半','正月半','Zhang53 ngied2 ban11','Zang11 ngied5 ban55','元宵節'],['𪹚龍','𪹚龍','Bong11 liung55','Bong55 liung11','𪹚龍（苗栗元宵民俗）'],['油笐火','油笐火','Rhiu55 gong55 fo24','Iu11 gong24 fo31','油笐火（北埔元宵民俗）'],['鬧熱','鬧熱','Nau33 ngied2','Nau55 ngied5','熱鬧']],
 5:[['腔頭','腔調','Kiong53 teu55','Kiong24 tiau55','腔調']],
 6:[['語言','語言','Ngi53 ngien55','Ngi24 ngien11','語言'],['政策','政策','Zhin11 ced5','Ziin55 ced2','政策'],['屋下','屋下','Vug5 ha53','Vug2 ka24','家裡'],['學校','學校','Hog2 gau24','Hog5 gau31','學校'],['市場','市場','Shi33 chong55','Sii55 cong11','市場'],['街路','街路','Gai53 lu33','Gie11 lu55','街上／市區／鬧區'],['社區','社區','Sha33 ki53','Sa55 ki24','社區'],['宮廟／寺廟','宮廟／寺廟','Giung53 miau33 / si11 maiu33','Giung11 meu55 / sii55 meu55','宮廟／寺廟']]
};

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const TONES={hailu:{'53':'ˋ','55':'','24':'ˊ','11':'ˇ','33':'+','5':'','2':'ˋ'},sixian:{'24':'ˊ','11':'ˇ','31':'ˋ','55':'','2':'ˋ','5':''}};
const IMAGE_INFO={
 '菜包':{src:'assets/images/choi-pan-table.jpg',credit:'課程既有菜粄／Choi Pan照片',note:'觀察米製外皮與內餡'},
 '粽仔':{src:'assets/images/user-zongzi/PANCHUNG(TW).jpg',credit:'教師提供：臺灣粽子剖面照片',note:'觀察糯米和內餡的樣子'},
 '粄粽':{src:'assets/images/user-zongzi/PANCHUNG2(TW).jpg',credit:'教師提供：臺灣客家粄粽剖面照片',note:'外層是米粄，通常看不到完整米粒'},
 '菜頭':{src:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Daikon.Japan.jpg/640px-Daikon.Japan.jpg',credit:'蘿蔔照片（連網載入）',note:'菜頭就是蘿蔔'},
 '菜脯':{src:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Preserved_radish.jpg/640px-Preserved_radish.jpg',credit:'蘿蔔乾照片（連網載入）',note:'將蘿蔔加工保存後的食材'},
 '香菇':{src:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Shiitake_mushroom.jpg/640px-Shiitake_mushroom.jpg',credit:'香菇照片（連網載入）',note:'常用於米食餡料'},
 '蝦米':{src:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Dried_shrimp.jpg/640px-Dried_shrimp.jpg',credit:'蝦米照片（連網載入）',note:'常見的乾燥海產食材'}
};
const overlay=document.getElementById('cultureVocabOverlay');
if(!overlay)return;
let activeStage=3,idx=0,shown=false,dialect='hailu',lastFocus=null;
const words=()=>D[activeStage]||[];
const current=()=>words()[idx];
const fmt=(src)=>String(src).replace(/([a-z]+)(53|55|24|11|33|31|5|2)(?=[^a-z0-9]|$)/gi,(raw,syllable,tone)=>{
 const mode=document.getElementById('toneModeToggle')?.textContent?.includes('調型')?'shape':'value';
 return syllable.toLowerCase()+(mode==='shape'?(TONES[dialect][tone]??tone):[...tone].map(d=>SUP[d]).join(''));
});
function draw(){const w=current();if(!w)return;
 const name=w[dialect==='hailu'?0:1],raw=w[dialect==='hailu'?2:3],im=activeStage===3?IMAGE_INFO[w[0]]:null;
 overlay.querySelector('#cvProgress').textContent=`${dialect==='hailu'?'海陸腔':'四縣腔'}・第${idx+1}／${words().length}詞`;
 overlay.querySelector('#cvHan').textContent=name;
 overlay.querySelector('#cvPinyin').textContent=fmt(raw);
 overlay.querySelector('#cvMeaning').textContent=shown?w[4]:'？';
 overlay.querySelector('#cvMeaning').hidden=!shown;
 overlay.querySelector('#cvGuess').hidden=shown;
 overlay.querySelector('#cvReveal').textContent=shown?'蓋回答案':'揭曉華語詞義';
 overlay.querySelectorAll('[data-cv-dialect]').forEach(b=>{b.classList.toggle('active',b.dataset.cvDialect===dialect);b.setAttribute('aria-pressed',b.dataset.cvDialect===dialect)});
 const image=overlay.querySelector('#cvImage');
 if(im){image.hidden=!shown;image.innerHTML=shown?`<figure><img src="${esc(im.src)}" alt="${esc(w[0])}食物照片" loading="eager"><figcaption>${esc(im.note)} · ${im.url?`<a href="${im.url}" target="_blank" rel="noopener">${esc(im.credit)}</a>`:esc(im.credit)}</figcaption></figure>`:'';}
 else{image.hidden=true;image.innerHTML='';}
}
window.renderCultureVocab=function(host,stage){const list=D[stage]||[];if(!list.length)return;
 host.insertAdjacentHTML('beforeend',`<section class="culture-vocab-launch"><div><span class="micro-label">語言學習 × 文化探索</span><strong>客語詞彙・一起讀、一起猜！</strong></div><button type="button" class="culture-vocab-open" data-cv-open="${stage}">📖 猜一猜詞彙（${list.length}詞）</button></section>`);
};
function open(stage){if(!D[stage])return;activeStage=stage;idx=0;shown=false;lastFocus=document.activeElement;
 const topDial=document.querySelector('[data-dialect].active')?.dataset.dialect;
 dialect=topDial==='sixian'?'sixian':'hailu';overlay.hidden=false;document.body.classList.add('cv-dialog-open');draw();overlay.querySelector('#cvReveal')?.focus();
 document.querySelectorAll('.food-photo-frame').forEach(x=>x.setAttribute('data-paused-by-vocab','true'));
}
function close(){overlay.hidden=true;document.body.classList.remove('cv-dialog-open');lastFocus?.focus?.();}
document.addEventListener('click',e=>{const op=e.target.closest('[data-cv-open]');if(op){open(+op.dataset.cvOpen);return;}
 if(overlay.hidden)return;
 const d=e.target.closest('[data-cv-dialect]');if(d){dialect=d.dataset.cvDialect;shown=false;draw();return;}
 const act=e.target.closest('[data-cv-action]')?.dataset.cvAction;
 if(act==='close'){close();return;}if(!act)return;
 if(act==='reveal')shown=!shown;
 if(act==='prev'){idx=(idx+words().length-1)%words().length;shown=false;}
 if(act==='next'){idx=(idx+1)%words().length;shown=false;}
 if(act==='random'){if(words().length>1)idx=(idx+1+Math.floor(Math.random()*(words().length-1)))%words().length;shown=false;}
 draw();
});
overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
document.addEventListener('keydown',e=>{if(overlay.hidden)return;
 if(e.key==='Escape'){e.preventDefault();close();}
 if(e.key==='ArrowLeft'){idx=(idx+words().length-1)%words().length;shown=false;draw();}
 if(e.key==='ArrowRight'){idx=(idx+1)%words().length;shown=false;draw();}
});
})();
