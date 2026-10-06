const hero=document.querySelector('.hero'), trail=document.querySelector('.trail'), dialog=document.querySelector('#viewer');
let viewerOrder=[],works=[],selected=0,trailIndex=0,last={x:0,y:0,time:0},idleTimer,trailWorks=[];
function title(w){if(w.project==='市场需求广告')return '社媒宣传视频 '+w.title.replace(/^\d+/,number=>number.padStart(2,'0'));return /^\d|^video|^类型/.test(w.title)?w.project:w.title}
function openWork(i,scope){viewerOrder=scope||works.map((_,index)=>index);selected=(i+works.length)%works.length;const w=works[selected];document.querySelector('#viewer-title').textContent=title(w);document.querySelector('#viewer-category').textContent=w.category+' / '+(w.project==='市场需求广告'?'社媒宣传视频':w.project==='七彩虹广告短片'?'七彩虹电脑广告剧情短片':w.project);document.querySelector('#viewer-number').textContent=String(viewerOrder.indexOf(selected)+1).padStart(2,'0')+' / '+viewerOrder.length;const box=document.querySelector('#viewer-media');box.replaceChildren();const media=document.createElement(w.type==='video'?'video':'img');media.src=w.src;if(w.type==='video'){media.controls=true;media.autoplay=true;media.playsInline=true;media.poster=w.poster}else media.alt=title(w);box.append(media);if(!dialog.open)dialog.showModal();document.body.classList.add('modal-open');}
document.querySelector('#close').onclick=()=>dialog.close();document.querySelector('#previous').onclick=()=>stepWork(-1);document.querySelector('#next').onclick=()=>stepWork(1);dialog.addEventListener('close',()=>{document.querySelector('#viewer-media').replaceChildren();document.body.classList.remove('modal-open')});document.addEventListener('keydown',e=>{if(dialog.open&&e.key==='ArrowRight')stepWork(1);if(dialog.open&&e.key==='ArrowLeft')stepWork(-1)});
function addHeroTrail(clientX,clientY){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!trailWorks.length)return;
  const now=performance.now();
  if(Math.hypot(clientX-last.x,clientY-last.y)<65||now-last.time<95)return;
  const rect=hero.getBoundingClientRect();
  if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return;
  last={x:clientX,y:clientY,time:now};hero.classList.add('moving');
  clearTimeout(idleTimer);idleTimer=setTimeout(()=>hero.classList.remove('moving'),1750);
  const img=document.createElement('img');img.src=trailWorks[trailIndex++%trailWorks.length].poster;
  img.style.left=clientX-rect.left+'px';img.style.top=clientY-rect.top+'px';
  img.style.setProperty('--tilt',((trailIndex%5)-2)*4+'deg');trail.append(img);
  img.addEventListener('animationend',()=>img.remove());
}
hero.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')addHeroTrail(e.clientX,e.clientY)});
// Passive touch events keep native vertical scrolling while rendering the trail.
hero.addEventListener('touchstart',e=>{
  if(e.touches.length!==1)return;
  const touch=e.touches[0];last={x:touch.clientX,y:touch.clientY,time:performance.now()-95};
},{passive:true});
hero.addEventListener('touchmove',e=>{
  if(e.touches.length!==1)return;
  const touch=e.touches[0];addHeroTrail(touch.clientX,touch.clientY);
},{passive:true});
fetch('works.json').then(r=>r.json()).then(data=>{const order=['work-21','work-13','work-16','work-22','work-05','work-26','work-11','work-06','work-23','work-08','work-12','work-20','work-02','work-24','work-14','work-09','work-25','work-07','work-00','work-10','work-01','work-03','work-04','work-15','work-17','work-18','work-19'];works=order.map(id=>data.find(w=>w.id===id)).filter(Boolean);renderMotion();renderMv();renderAds();renderStory();renderSeo();}).catch(()=>{const error=document.createElement('p');error.textContent='作品加载失败，请刷新页面';document.querySelector('#works').append(error);});


fetch('hero-images.json').then(r=>r.json()).then(images=>{trailWorks=images;const idle=document.querySelector('.idle-art');idle.replaceChildren();images.slice(0,3).forEach(w=>{const img=new Image();img.src=w.poster;idle.append(img)});images.forEach(w=>{const preload=new Image();preload.src=w.poster});});

function renderMotion(){
  const videos=[];
  document.querySelectorAll('.motion-project [data-work]').forEach((slot,number)=>{
    const w=works.find(item=>item.id===slot.dataset.work);if(!w)return;
    const figure=document.createElement('figure');figure.className='motion-film';
    const video=document.createElement('video');video.src=w.src;video.poster=w.poster;
    video.controls=true;video.playsInline=true;video.preload='none';
    video.setAttribute('aria-label','MG 动效作品 '+(number+1));
    video.width=w.width;video.height=w.height;
    const caption=document.createElement('figcaption');
    const label=document.createElement('span');label.textContent=String(number+1).padStart(2,'0')+' / MG MOTION';
    const full=document.createElement('button');full.type='button';full.textContent='全屏观看';full.setAttribute('aria-label','全屏观看 MG 动效作品 '+(number+1));
    full.addEventListener('click',()=>openWork(works.indexOf(w)));
    caption.append(label,full);figure.append(video,caption);slot.replaceChildren(figure);
    videos.push(video);
    video.addEventListener('play',()=>videos.forEach(other=>{if(other!==video)other.pause()}));
  });
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)entry.target.pause()}),{threshold:0.05});
    videos.forEach(video=>observer.observe(video));
  }
}
dialog.addEventListener('close',()=>document.querySelectorAll('.motion-film video').forEach(video=>video.pause()));
dialog.addEventListener('toggle',()=>{if(dialog.open)document.querySelectorAll('.motion-film video').forEach(video=>video.pause())});

function stepWork(direction){
  const next=(viewerOrder.indexOf(selected)+direction+viewerOrder.length)%viewerOrder.length;
  openWork(viewerOrder[next],viewerOrder);
}
function renderMv(){
  const ids=['work-21','work-22','work-23','work-24','work-25','work-26'];
  const scope=ids.map(id=>works.findIndex(w=>w.id===id)).filter(i=>i>=0);
  const grid=document.querySelector('.mv-grid');grid.replaceChildren();
  const previews=[];
  scope.forEach((index,number)=>{
    const w=works[index],figure=document.createElement('figure');figure.className='mv-card';
    const button=document.createElement('button');button.type='button';button.className='mv-cover';button.setAttribute('aria-label','播放 MV '+w.title);
    const image=new Image();image.src=w.poster;image.alt=w.title;image.loading='lazy';image.width=w.width;image.height=w.height;
    const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');
    const tag=document.createElement('span');tag.className='mv-play';tag.textContent='PLAY FILM';
    button.append(image,video,tag);
    const preview=()=>{
      if(matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(hover: hover)').matches)return;
      previews.forEach(other=>{if(other!==video)other.pause()});
      if(!video.getAttribute('src'))video.src=w.src;
      video.play().then(()=>{if(button.matches(':hover')||button.matches(':focus-visible'))button.classList.add('is-previewing');else video.pause()}).catch(()=>{});
    };
    const stop=()=>{video.pause();button.classList.remove('is-previewing')};
    button.addEventListener('pointerenter',preview);button.addEventListener('focus',preview);
    button.addEventListener('pointerleave',stop);button.addEventListener('blur',stop);
    button.addEventListener('click',()=>{previews.forEach(v=>v.pause());openWork(index,scope)});
    const caption=document.createElement('figcaption');
    const label=document.createElement('span');label.className='mv-project-label';label.textContent='Project';
    const name=document.createElement('span');name.className='mv-name';name.textContent=w.title.replace(/\(2\)$/,'');
    const meta=document.createElement('span');meta.className='mv-meta';meta.textContent=String(number+1).padStart(2,'0')+' / DIGITAL HUMAN MV';
    caption.append(label,name,meta);figure.append(button,caption);grid.append(figure);previews.push(video);
  });
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting){entry.target.pause();entry.target.parentElement.classList.remove('is-previewing')}}),{threshold:0.1});
  previews.forEach(video=>observer.observe(video));
  dialog.addEventListener('toggle',()=>{if(dialog.open)previews.forEach(video=>video.pause())});
  if(['#music-videos','#mv-title'].includes(location.hash))requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView({behavior:'instant',block:'start'}));
}

function renderAds(){
 const ids=['work-17','work-16','work-19'];
 const names=['社媒宣传视频 01','社媒宣传视频 02','社媒宣传视频 03'];
 const scope=ids.map(id=>works.findIndex(w=>w.id===id)).filter(index=>index>=0);
 const grid=document.querySelector('.ads-grid');grid.replaceChildren();const previews=[];
 scope.forEach((index,number)=>{
  const w=works[index],figure=document.createElement('figure');figure.className='ads-card';
  const button=document.createElement('button');button.type='button';button.className='ads-cover';button.setAttribute('aria-label','播放'+names[number]);
  const image=new Image();image.src=w.poster;image.alt=names[number];image.loading='lazy';image.width=w.width;image.height=w.height;
  const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');
  const play=document.createElement('span');play.className='ads-play';play.textContent='PLAY FILM';button.append(image,video,play);
  const stop=()=>{video.pause();button.classList.remove('is-previewing')};
  const start=()=>{
   if(matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(hover: hover)').matches)return;
   previews.forEach(other=>{if(other!==video)other.pause()});if(!video.getAttribute('src'))video.src=w.src;
   video.play().then(()=>{if(button.matches(':hover')||button.matches(':focus-visible'))button.classList.add('is-previewing');else video.pause()}).catch(()=>{});
  };
  button.addEventListener('pointerenter',start);button.addEventListener('focus',start);button.addEventListener('pointerleave',stop);button.addEventListener('blur',stop);
  button.addEventListener('click',()=>{document.querySelectorAll('.mv-cover video,.ads-cover video').forEach(v=>v.pause());openWork(index,scope);document.querySelector('#viewer-title').textContent=names[number]});
  const caption=document.createElement('figcaption');
  const label=document.createElement('span');label.className='ads-project';label.textContent='Project';
  const name=document.createElement('span');name.className='ads-name';name.textContent=names[number];
  const meta=document.createElement('span');meta.className='ads-meta';meta.textContent=String(number+1).padStart(2,'0')+' / SOCIAL MEDIA FILM';
  caption.append(label,name,meta);figure.append(button,caption);grid.append(figure);previews.push(video);
 });
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting){entry.target.pause();entry.target.parentElement.classList.remove('is-previewing')}}),{threshold:0.1});previews.forEach(video=>observer.observe(video));
 dialog.addEventListener('toggle',()=>{if(dialog.open)previews.forEach(video=>video.pause())});
 if(['#commercials','#ads-title'].includes(location.hash))requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView({behavior:'instant',block:'start'}));
}



function renderStory(){
 const ids=['work-08','work-09','work-10'];
 const names=['奖力','少年戏班画布自救','生活就是如此'];
 const scope=ids.map(id=>works.findIndex(w=>w.id===id)).filter(index=>index>=0);
 const grid=document.querySelector('.story-grid');grid.replaceChildren();const previews=[];
 scope.forEach((index,number)=>{
  const w=works[index],figure=document.createElement('figure');figure.className='story-card';
  const button=document.createElement('button');button.type='button';button.className='story-cover';button.setAttribute('aria-label','播放'+names[number]);
  const image=new Image();image.src=w.poster;image.alt=names[number];image.loading='lazy';image.width=w.width;image.height=w.height;
  const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');
  const play=document.createElement('span');play.className='story-play';play.textContent='PLAY FILM';button.append(image,video,play);
  const stop=()=>{video.pause();button.classList.remove('is-previewing')};
  const start=()=>{
   if(matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(hover: hover)').matches)return;
   previews.forEach(other=>{if(other!==video)other.pause()});if(!video.getAttribute('src'))video.src=w.src;
   video.play().then(()=>{if(button.matches(':hover')||button.matches(':focus-visible'))button.classList.add('is-previewing');else video.pause()}).catch(()=>{});
  };
  button.addEventListener('pointerenter',start);button.addEventListener('focus',start);button.addEventListener('pointerleave',stop);button.addEventListener('blur',stop);
  button.addEventListener('click',()=>{document.querySelectorAll('.mv-cover video,.ads-cover video,.story-cover video').forEach(v=>v.pause());openWork(index,scope);document.querySelector('#viewer-title').textContent=names[number]});
  const caption=document.createElement('figcaption');
  const label=document.createElement('span');label.className='story-project';label.textContent='Project';
  const name=document.createElement('span');name.className='story-name';name.textContent=names[number];
  const meta=document.createElement('span');meta.className='story-meta';meta.textContent=String(number+1).padStart(2,'0')+' / NARRATIVE FILM';
  const description=document.createElement('p');description.className='story-description';description.textContent=storyDescriptions[w.title]||'';caption.append(label,name,meta,description);figure.append(button,caption);grid.append(figure);previews.push(video);
 });
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting){entry.target.pause();entry.target.parentElement.classList.remove('is-previewing')}}),{threshold:0.1});previews.forEach(video=>observer.observe(video));
 dialog.addEventListener('toggle',()=>{if(dialog.open)previews.forEach(video=>video.pause())});
 if(['#story-films','#story-title'].includes(location.hash))requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView({behavior:'instant',block:'start'}));
}


const storyDescriptions={"奖力": "一台新电脑，是父亲不善表达的爱；一句“遭得住”，是成年人舍不得倒下的坚持。\n短片《奖力》，献给每一个努力生活、也努力守护家人的普通人。", "少年戏班画布自救": "当主创准备关掉AI平台上的废稿时，画面里的6个川剧萌娃角色突然“觉醒”了！为了不被全盘删除，他们决定打破画框限制，自发用画布和道具搭建属于自己的舞台。即使构图不够完美、位置有些偏差，他们依然踩着锣鼓点，在视频框里完成了一场默契十足、灵气满满的戏曲亮相。“不完美也可以很好看！”这是一场关于AI角色打破规则、创意野性生长的超感奇幻故事。", "生活就是如此": "AI演员每天被塞进不同角色，AI导演被甲方需求推着疯狂调度，而现实中的AI生成师也在无休止的修改中反复开机。雨要下、衣服不能湿；画面要高级、还得自然。三层世界看似不同，却都在同一句“再改一下”里循环加班。 当每个人都以为自己终于做完时，新的需求又来了。 因为生活就是如此。"};

function renderSeo(){
 const ids=['work-00','work-02','work-03','work-04'];
 const labels=['MiniMax 模型展示','创作控制与风格表达','社媒内容与分享','电影感视觉'];
 const scope=ids.map(id=>works.findIndex(w=>w.id===id)).filter(index=>index>=0);
 document.querySelectorAll('[data-seo]').forEach(slot=>{
  const index=works.findIndex(w=>w.id===slot.dataset.seo);if(index<0)return;
  const number=ids.indexOf(slot.dataset.seo),w=works[index];
  const figure=document.createElement('figure');figure.className='seo-visual';
  const button=document.createElement('button');button.type='button';button.className='seo-image';button.setAttribute('aria-label','查看配图 '+labels[number]);
  const image=new Image();image.src=w.src;image.alt=labels[number];image.loading='lazy';image.width=w.width;image.height=w.height;
  const hint=document.createElement('span');hint.className='seo-view';hint.textContent='查看大图';button.append(image,hint);button.addEventListener('click',()=>openWork(index,scope));
  const caption=document.createElement('figcaption');const name=document.createElement('span');name.textContent=labels[number];const count=document.createElement('span');count.textContent=String(number+1).padStart(2,'0')+' / SEO VISUAL';caption.append(name,count);figure.append(button,caption);slot.replaceChildren(figure);
 });
 if(['#minimax-seo','#seo-title'].includes(location.hash))requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView({behavior:'instant',block:'start'}));
}
