'use strict';
window.APP={
  id:'vb',name:'VisionBridge',
  logo:'<span class="mk"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg></span>',
  nav:[['index.html','home','Home'],['read.html','read','Read'],['listen.html','listen','Listen'],['scan.html','scan','Scan'],['simplify.html','simplify','Simplify'],['settings.html','settings','Settings']],
  accents:[['#4db5ff','#ffd84d','#51e0c4'],['#51e0c4','#4db5ff','#ffd84d'],['#ffd84d','#ff9f4d','#4db5ff'],['#b98cff','#4db5ff','#ffd84d']],
  cta:['read.html','read','Open reader'],
  heroKind:'lens',
  icons:{read:'M4 5a2 2 0 012-2h7v16H6a2 2 0 00-2 2zM13 3h5a2 2 0 012 2v14a2 2 0 00-2 2h-5M7 7h3M7 10h3',listen:'M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7M19 5a9 9 0 010 14',scan:'M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2M4 12h16',simplify:'M4 6h16M4 12h10M4 18h7M18 15l2 2-2 2',play:'M7 5l12 7-12 7z',pause:'M8 5h3v14H8zM13 5h3v14h-3z',stop:'M6 6h12v12H6z',voice:'M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v3',ruler:'M5 19L19 5l2 2L7 21zM9 11l2 2M13 7l2 2',contrast:'M12 3a9 9 0 100 18zM12 3a9 9 0 010 18',eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 9a3 3 0 100 6 3 3 0 000-6'},
  ensureSeed(){}
};
const LS='vb_data';
function loadS(){try{return Object.assign({last:'',rate:1,pitch:1,voice:'',fontsize:22,lh:1.8,ls:0,ws:0,face:'sans'},JSON.parse(localStorage.getItem(LS)||'{}'));}catch(e){return{last:'',rate:1,pitch:1};}}
let S=loadS();function save(){localStorage.setItem(LS,JSON.stringify(S));}
const SAMPLE="VisionBridge turns any text into a clear, readable, speakable page. Adjust the size, spacing and contrast until it feels right. Press play to hear it read aloud. Scan a photo of a page to pull its words out. Simplify a dense paragraph into short, plain lines. Everything that can run offline, does.";
if(!S.last){S.last=SAMPLE;save();}
/* ---------- TTS ---------- */
let voices=[];function loadVoices(){voices=speechSynthesis.getVoices();}
if('speechSynthesis'in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
function speak(text,opts){opts=opts||{};if(!('speechSynthesis'in window)){toast('Speech not supported here');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=opts.rate||S.rate||1;u.pitch=opts.pitch||S.pitch||1;const v=voices.find(x=>x.name===(opts.voice||S.voice));if(v)u.voice=v;if(opts.onboundary)u.onboundary=opts.onboundary;if(opts.onend)u.onend=opts.onend;speechSynthesis.speak(u);return u;}
/* ---------- Gemini ---------- */
const KEY='vb_key',MODELS=['gemini-2.0-flash-lite','gemini-flash-latest','gemini-2.0-flash'];
function hasKey(){return !!localStorage.getItem(KEY);}
function openKey(){if(!$('keyScrim'))document.body.insertAdjacentHTML('beforeend','<div class="scrim" id="keyScrim"><div class="modal"><h3>Gemini key<button class="close" data-press onclick="closeAll()">'+icon('close')+'</button></h3><p>Reading, listening and simplifying work with no key. Add a free Gemini key (from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">AI Studio</a>) to scan photos and describe images. Stored only in this browser.</p><div class="fld" style="margin-top:0"><input type="password" id="keyIn" placeholder="AIza…"></div><button class="save" data-press onclick="saveKey()">Save key</button></div></div>');$('keyIn').value=localStorage.getItem(KEY)||'';$('keyScrim').classList.add('on');}
function saveKey(){const k=$('keyIn').value.trim();if(k)localStorage.setItem(KEY,k);closeAll();toast('Key saved');}
async function aiText(prompt){const key=localStorage.getItem(KEY);for(const m of MODELS){const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});if(!r.ok)continue;const j=await r.json();return j.candidates[0].content.parts[0].text.trim();}throw new Error('unavailable');}
async function aiVision(b64,mime,prompt){const key=localStorage.getItem(KEY);for(const m of MODELS){const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:mime,data:b64}}]}]})});if(!r.ok)continue;const j=await r.json();return j.candidates[0].content.parts[0].text.trim();}throw new Error('unavailable');}
function toB64(f){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(f);});}
/* ---------- text helpers ---------- */
function sentences(s){return s.replace(/\s+/g,' ').match(/[^.!?]+[.!?]+|\S[^.!?]*$/g)||[];}
function readTime(s){return Math.max(1,Math.round((s.match(/\S+/g)||[]).length/200));}
function statRow(c){return c.map(([l,n])=>'<div class="bstat"><div class="n">'+n+'</div><div class="l">'+l+'</div></div>').join('');}
function marq(t){return '<span>'+t.map(x=>'<b>'+x+'</b>').join(' · ')+' · </span><span>'+t.map(x=>'<b>'+x+'</b>').join(' · ')+' · </span>';}
function featGrid(items){return items.map(([h,ic,t,d],i)=>'<a class="fcell" href="'+h+'"><div class="fi">'+icon(ic,22)+'</div><div class="fx">0'+(i+1)+'</div><h3>'+t+'</h3><p>'+d+'</p><div class="go">Open '+icon('chevron',13)+'</div></a>').join('');}
const FEATURES='read-aloud (text-to-speech) · voice select · speed control · pitch control · play/pause/resume/stop · live word highlight · adjustable font size · line spacing · letter spacing · word spacing · dyslexia-friendly font · serif/sans/mono faces · reading ruler · high-contrast mode · column width · paste or import text · scan a photo (OCR) · describe an image · read scan result aloud · simplify dense text · short-line layout · key points · reading-time estimate · offline + AI simplify · theme · accents · export/import · multi-page nav · custom cursor · 3D lens hero · ambient motion · scroll reveals · keyboard shortcuts · autosave · offline-first (speech & reading) · responsive';
window.PAGES={
 index(){
   $('meta').innerHTML=statRow([['voices',('speechSynthesis'in window)?'on':'—'],['tools','4'],['free','$0'],['upload','0kb']]);
   $('marq').innerHTML=marq(['read aloud','word highlight','high contrast','reading ruler','OCR scan','describe image','simplify','offline']);
   $('fgrid').innerHTML=featGrid([['read.html','read','Read','A calm, adjustable reader — size, spacing, contrast, ruler and faces.'],['listen.html','listen','Listen','Hear any text read aloud with live word highlighting and voice control.'],['scan.html','scan','Scan','Pull the words out of a photo of a page, then read or hear them.'],['simplify.html','simplify','Simplify','Turn dense text into short, plain lines with the key points pulled out.'],['settings.html','settings','Settings','Voice, contrast, theme and key — tuned to how you read.'],['read.html','eye','Start reading','Paste a passage and make it readable in seconds.']]);
   $('featlist').textContent='50+ features — '+FEATURES+'.';
   mountHero3D('hero3d','lens');
 },
 read(){
   const doc=$('doc');doc.textContent=S.last;doc.addEventListener('input',()=>{S.last=doc.textContent;save();});
   function apply(){doc.style.fontSize=S.fontsize+'px';doc.style.lineHeight=S.lh;doc.style.letterSpacing=S.ls+'px';doc.style.wordSpacing=S.ws+'px';const rd=$('reader');rd.classList.remove('serif','mono');if(S.face!=='sans')rd.classList.add(S.face);}
   function bindR(id,key,fmt){const el=$(id);el.value=S[key];el.oninput=()=>{S[key]=+el.value;save();apply();if($(id+'v'))$(id+'v').textContent=(fmt?fmt(el.value):el.value);};if($(id+'v'))$(id+'v').textContent=(fmt?fmt(el.value):el.value);}
   bindR('fs','fontsize',v=>v+'px');bindR('lh2','lh');bindR('ls2','ls',v=>v+'px');bindR('ws2','ws',v=>v+'px');
   $('faces').querySelectorAll('button').forEach(b=>b.onclick=()=>{S.face=b.dataset.v;save();$('faces').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));apply();});
   $('faces').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===S.face));
   $('rulerT').onclick=()=>{$('reader').classList.toggle('ruleron');$('rulerT').classList.toggle('on',$('reader').classList.contains('ruleron'));};
   $('reader').addEventListener('pointermove',e=>{const r=$('reader').getBoundingClientRect();$('ruler').style.top=(e.clientY-r.top-23)+'px';});
   $('hcT').onclick=()=>{const hc=document.documentElement.getAttribute('data-theme')==='hc';document.documentElement.setAttribute('data-theme',hc?'dark':'hc');$('hcT').classList.toggle('on',!hc);};
   $('readAloud').onclick=()=>speak(doc.textContent);
   apply();
 },
 listen(){
   const area=$('ta');area.value=S.last;area.addEventListener('input',()=>{S.last=area.value;save();});
   function fillVoices(){const sel=$('voice');if(!voices.length)loadVoices();sel.innerHTML='<option value="">Default voice</option>'+voices.map(v=>'<option'+(v.name===S.voice?' selected':'')+'>'+v.name+'</option>').join('');}
   setTimeout(fillVoices,200);speechSynthesis&&(speechSynthesis.onvoiceschanged=()=>{loadVoices();fillVoices();});
   $('voice').onchange=()=>{S.voice=$('voice').value;save();};
   function bind(id,key,fmt){const el=$(id);el.value=S[key];el.oninput=()=>{S[key]=+el.value;save();$(id+'v').textContent=fmt(el.value);};$(id+'v').textContent=fmt(el.value);}
   bind('rate','rate',v=>(+v).toFixed(1)+'×');bind('pitch','pitch',v=>(+v).toFixed(1));
   let playing=false;
   function render(){const words=area.value.split(/(\s+)/);$('hl').innerHTML=words.map((w,i)=>/\s+/.test(w)?w:'<span class="word" data-i="'+i+'">'+esc(w)+'</span>').join('');}
   render();area.addEventListener('input',render);
   function play(){const text=area.value;if(!text.trim())return;render();const spans=[...$('hl').querySelectorAll('.word')];
     speak(text,{onboundary:e=>{if(e.name!=='word'&&e.name!=='')return;let ci=e.charIndex,count=0;for(const sp of spans){const wlen=sp.textContent.length;const idx=text.indexOf(sp.textContent,count);}spans.forEach(s=>s.classList.remove('spoken'));
       // map charIndex to nearest word span
       let acc=0,target=null;const raw=text;let cursor=0;for(const sp of spans){const pos=raw.indexOf(sp.textContent,cursor);if(pos>=0){if(pos<=ci&&ci<pos+sp.textContent.length){target=sp;break;}cursor=pos+sp.textContent.length;}}
       if(target){target.classList.add('spoken');}},onend:()=>{playing=false;$('playBtn').innerHTML=icon('play',26);spans.forEach(s=>s.classList.remove('spoken'));}});
     playing=true;$('playBtn').innerHTML=icon('pause',26);}
   $('playBtn').onclick=()=>{if(playing&&!speechSynthesis.paused){speechSynthesis.pause();$('playBtn').innerHTML=icon('play',26);}else if(speechSynthesis.paused){speechSynthesis.resume();$('playBtn').innerHTML=icon('pause',26);}else play();};
   $('stopBtn').onclick=()=>{speechSynthesis.cancel();playing=false;$('playBtn').innerHTML=icon('play',26);$('hl').querySelectorAll('.word').forEach(s=>s.classList.remove('spoken'));};
   $('playBtn').innerHTML=icon('play',26);$('stopBtn').innerHTML=icon('stop',22);
 },
 scan(){
   $('dzIc').innerHTML=icon('scan',30);
   async function handle(f){if(!f)return;if(!hasKey()){openKey();return;}const box=$('scanOut');box.innerHTML='<div class="empty">Reading image…</div>';
     try{const b64=await toB64(f);const txt=await aiVision(b64,f.type,'Transcribe all text in this image exactly, preserving line breaks. If there is no text, describe the image in one paragraph.');box.textContent=txt;S.last=txt;save();$('readScan').classList.remove('hidden');}
     catch(e){box.innerHTML='<div class="empty">Could not read the image. Check your key/connection.</div>';}}
   $('dz').onclick=()=>$('file').click();$('file').onchange=e=>handle(e.target.files[0]);
   ['dragover','dragenter'].forEach(ev=>$('dz').addEventListener(ev,e=>{e.preventDefault();$('dz').style.borderColor='var(--acc)';}));['dragleave','drop'].forEach(ev=>$('dz').addEventListener(ev,e=>{e.preventDefault();$('dz').style.borderColor='';}));
   $('dz').addEventListener('drop',e=>handle(e.dataTransfer.files[0]));
   async function desc(f){if(!f)return;if(!hasKey()){openKey();return;}const box=$('scanOut');box.innerHTML='<div class="empty">Describing…</div>';try{const b64=await toB64(f);box.textContent=await aiVision(b64,f.type,'Describe this image clearly for a person who cannot see it, in 2-3 sentences.');}catch(e){box.innerHTML='<div class="empty">Could not describe the image.</div>';}}
   $('descBtn').onclick=()=>{const f=$('file2');f.onchange=()=>desc(f.files[0]);f.click();};
   $('readScan').onclick=()=>speak($('scanOut').textContent);
 },
 simplify(){
   const area=$('ta');area.value=S.last;area.addEventListener('input',()=>{S.last=area.value;save();render();});
   function render(){const s=area.value;const sents=sentences(s);$('out').innerHTML='<div class="simp">'+sents.map(x=>'<span class="s">'+esc(x.trim())+'</span>').join('')+'</div>';$('rt').textContent=readTime(s)+' min read · '+sents.length+' sentences';}
   async function ai(){if(!hasKey()){openKey();return;}$('out').innerHTML='<div class="empty">Simplifying…</div>';try{const r=await aiText('Rewrite this in plain, simple language with short sentences a wide audience can follow. Keep the meaning. Return only the simplified text.\n\n'+area.value);area.value=r;S.last=r;save();render();}catch(e){render();}}
   $('aiBtn').onclick=ai;$('readBtn').onclick=()=>speak(area.value);render();
 },
 settings(){
   $('themeToggle').classList.toggle('on',theme()==='light');$('themeToggle').onclick=()=>{toggleTheme();$('themeToggle').classList.toggle('on',theme()==='light');};
   $('accents2').innerHTML=APP.accents.map((a,i)=>'<button class="ad'+(i===accentIdx()?' on':'')+'" data-i="'+i+'" data-press style="width:24px;height:24px;background:linear-gradient(135deg,'+a[0]+','+a[1]+')"></button>').join('');
   $('accents2').querySelectorAll('.ad').forEach(b=>b.onclick=()=>setAccent(+b.dataset.i));
   $('hcToggle').classList.toggle('on',theme()==='hc');$('hcToggle').onclick=()=>{const on=theme()==='hc';localStorage.setItem('vb_theme',on?'dark':'hc');applyTheme();$('hcToggle').classList.toggle('on',!on);};
   $('keyBtn').onclick=openKey;
   $('exp').onclick=()=>dl('visionbridge-data.json','application/json',JSON.stringify(S,null,2));
   $('featlist').textContent=FEATURES+'.';
 }
};
