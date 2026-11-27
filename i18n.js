(function(){
const DICT=__I18N__,KEEP=new Set(__KEEP__);
const NUM=/\d+(?:[.,]\d+)*/g;
const VIC=/[À-ỹĐđ]/;
const RULES=[
 [/^Đang mô phỏng mẫu (.+) — hãy nhập số thực tế của doanh nghiệp bạn$/,m=>'Simulating the '+tr(m[1])+' template. Enter your company’s actual figures'],
 [/^Nắng (\d+)° · (.+)$/,m=>'Sun '+m[1]+'° · '+tr(m[2])],
 [/^Lưu ý ESCO tại (.+): tỷ lệ chia sẻ ([\d.,]+)% và thời hạn (\d+) năm là mức tham khảo, sẽ được khảo sát thực tế để thống nhất phương án phù hợp nhất cho hai bên\.$/,m=>'ESCO note for '+tr(m[1])+': the '+m[2].replace(',','.')+'% share and '+m[3]+'-year term are indicative and will be confirmed by a site survey to agree the best option for both parties.'],
];
// đổi định dạng số Việt (1.234,5) sang Anh (1,234.5), giữ nguyên số hiệu văn bản (có dấu / liền kề)
const numEN=(tok,src,at)=>{if(!/[.,]/.test(tok))return tok;const b=src[at-1],a=src[at+tok.length];if(a==='/'||b==='/')return tok;return tok.replace(/[.,]/g,c=>c==='.'?',':'.')};
const tpl=s=>{const nums=[];const t=s.replace(NUM,(m,at)=>{nums.push(numEN(m,s,at));return '#'});return [t,nums]};
const fill=(en,nums)=>{let i=0;return en.replace(/\{(\d)\}|#/g,(m,k)=>k!==undefined?(nums[+k]??''):(nums[i++]??''))};
const sing=s=>s.replace(/(^|[^\d.,])1 (systems|pages|units|years|modules|weeks|shifts|boards|sets)\b/g,(m,a,w)=>a+'1 '+({systems:'system',pages:'page',units:'unit',years:'year',modules:'module',weeks:'week',shifts:'shift',boards:'board',sets:'set'})[w]);
function tr(s){const r=tr0(s);return r===s?r:sing(r)}
function tr0(s){
 const lead=s.match(/^\s*/)[0],trail=s.match(/\s*$/)[0],core=s.trim();if(!core)return s;
 if(KEEP.has(core))return s;
 if(DICT[core]!==undefined)return lead+DICT[core]+trail;
 const [t,nums]=tpl(core);
 if(KEEP.has(t))return s;
 if(DICT[t]!==undefined)return lead+fill(DICT[t],nums)+trail;
 for(const [re,fn] of RULES){const m=core.match(re);if(m)return lead+fn(m)+trail}
 if(!VIC.test(core))return lead+core.replace(NUM,(m,at)=>numEN(m,core,at))+trail;
 window.__i18nMiss&&window.__i18nMiss.add(core);
 return s;
}
const ATTRS=['placeholder','title','aria-label','alt','data-t'];
let lang='vi',busy=false;
const skip=el=>!el||el.closest('script,style,[data-noi18n]')||el.isContentEditable;
function doText(n){const p=n.parentElement;if(skip(p)||p.tagName==='TEXTAREA')return;
 if(n.__vi===undefined||(n.nodeValue!==n.__en&&n.nodeValue!==n.__vi))n.__vi=n.nodeValue;
 if(lang==='en'){const e=tr(n.__vi);n.__en=e;if(n.nodeValue!==e)n.nodeValue=e}else if(n.nodeValue!==n.__vi)n.nodeValue=n.__vi}
function doEl(el){if(skip(el))return;if(el.tagName==='OPTION'&&!el.hasAttribute('value'))el.setAttribute('value',el.textContent);const st=el.__via||(el.__via={});
 for(const a of ATTRS){if(!el.hasAttribute(a))continue;const v=el.getAttribute(a);
  if(st[a]===undefined||(v!==st[a+'_en']&&v!==st[a]))st[a]=v;
  const want=lang==='en'?tr(st[a]):st[a];st[a+'_en']=lang==='en'?want:undefined;if(v!==want)el.setAttribute(a,want)}}
function walk(root){
 if(root.nodeType===3){doText(root);return}
 if(root.nodeType!==1)return;
 doEl(root);
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;
 while(n=w.nextNode()){if(n.nodeType===3){if(n.nodeValue.trim())doText(n)}else doEl(n)}
}
const mo=new MutationObserver(ms=>{if(busy)return;busy=true;
 try{for(const m of ms){if(m.type==='childList')m.addedNodes.forEach(walk);else if(m.type==='characterData')doText(m.target);else if(m.type==='attributes')doEl(m.target)}}finally{busy=false}});
function apply(l,save){
 lang=l;document.documentElement.lang=l;document.documentElement.classList.toggle('en',l==='en');
 busy=true;try{walk(document.head.querySelector('title'));walk(document.body)}finally{busy=false}
 document.querySelectorAll('.lang button').forEach(b=>{const on=b.dataset.l===l;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});
 if(save){try{localStorage.setItem('btmi-lang',l)}catch(e){}const u=new URL(location.href);if(l==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');history.replaceState(history.state,'',u)}
 document.documentElement.classList.remove('i18n-wait');
 dispatchEvent(new Event('resize'));
}
window.BTMI_LANG={set:l=>apply(l,true),get:()=>lang,t:tr};
document.querySelectorAll('.lang button').forEach(b=>b.addEventListener('click',()=>{const l=b.dataset.l;if(l===lang)return;const r=b.getBoundingClientRect(),tr=window.BTMI_VT&&window.BTMI_VT(()=>apply(l,true),{x:r.left+r.width/2,y:r.top+r.height/2});if(!tr)apply(l,true)}));
mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
let init='vi';try{const q=new URLSearchParams(location.search).get('lang');init=q==='en'||q==='vi'?q:(localStorage.getItem('btmi-lang')||'vi')}catch(e){}
apply(init,false);
})();
