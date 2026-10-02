/* Original NOAA CSV is serialized locally, so this also works via file://. */
'use strict';
const data=window.WHALE_DATA;
const svg=document.querySelector('#chart');
const year=document.querySelector('#year');
const period=document.querySelector('#period');
const interval=document.querySelector('#interval');
const average=document.querySelector('#average');
const NS='http://www.w3.org/2000/svg';
const plot={left:50.5,right:664.5,top:28,bottom:454.5};
const fullMean=data.reduce((sum,d)=>sum+d.Value,0)/data.length;
let domain=[1977.75,2028.3],active=false;
let comparing=false, tracing=false, timer=null, dragging=null;
const compareA=document.querySelector('#compare-a');
const compareB=document.querySelector('#compare-b');
const compareToggle=document.querySelector('#compare-toggle');
const playButton=document.querySelector('#play-chart');
function el(tag,attrs={},text){const node=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));if(text!==undefined)node.textContent=text;return node;}
const x=v=>plot.left+(v-domain[0])/(domain[1]-domain[0])*(plot.right-plot.left);
const y=v=>plot.bottom-(v-273)/(497.7-273)*(plot.bottom-plot.top);
function line(parent,x1,y1,x2,y2,attrs={}){parent.append(el('line',{x1,y1,x2,y2,...attrs}));}
function text(parent,xx,yy,str,attrs={}){parent.append(el('text',{x:xx,y:yy,'font-size':12,fill:'#4d4d4d',...attrs},str));}
function visibleData(){return data.filter(d=>d.Time>= (period.value==='all'?1990:Number(period.value)));}
function updateReadout(){const d=data.find(d=>d.Time===Number(year.value));const prev=data.find(v=>v.Time===d.Time-1);document.querySelector('#year-label').textContent=d.Time;document.querySelector('#readout').innerHTML=`<strong>${d.Value} <span>individuals</span></strong><p>95% credible interval: ${d.Lower95}–${d.Upper95}</p><p>${prev?`${d.Value-prev.Value>0?'+':''}${d.Value-prev.Value} from ${prev.Time}`:'First year with a population estimate'}</p>`;}
function highlight(){svg.querySelector('#selection')?.remove();if(!active||comparing)return;const d=data.find(d=>d.Time===Number(year.value));const g=el('g',{id:'selection','pointer-events':'none'});line(g,x(d.Time),plot.top,x(d.Time),plot.bottom,{stroke:'#176779','stroke-width':1,'stroke-dasharray':'3 3'});g.append(el('circle',{cx:x(d.Time),cy:y(d.Value),r:5,fill:'white',stroke:'#176779','stroke-width':2}));svg.append(g);}
function render(){svg.querySelectorAll('g,defs').forEach(n=>n.remove());const allRows=visibleData();let rows=allRows;domain=period.value==='all'?[1977.75,2028.3]:[rows[0].Time-.8,2024.8];year.min=rows[0].Time;if(Number(year.value)<rows[0].Time)year.value=rows[0].Time;if(tracing)rows=allRows.filter(d=>d.Time<=Number(year.value));const defs=el('defs');const clip=el('clipPath',{id:'plot-clip'});clip.append(el('rect',{x:plot.left,y:plot.top,width:plot.right-plot.left,height:plot.bottom-plot.top}));defs.append(clip);svg.append(defs);const g=el('g',{'clip-path':'url(#plot-clip)'});svg.append(g);g.append(el('rect',{x:x(2017),y:plot.top,width:x(2026)-x(2017),height:plot.bottom-plot.top,fill:'#f2f2f2'}));if(average.checked)line(g,plot.left,y(fullMean),plot.right,y(fullMean),{stroke:'#a3a3a3','stroke-width':2.5,'stroke-dasharray':'10 10'});if(interval.checked){const points=rows.map(d=>`${x(d.Time)},${y(d.Upper95)}`).concat([...rows].reverse().map(d=>`${x(d.Time)},${y(d.Lower95)}`));g.append(el('polygon',{points:points.join(' '),fill:'#bdbdbd','fill-opacity':.9}));}g.append(el('polyline',{points:rows.map(d=>`${x(d.Time)},${y(d.Value)}`).join(' '),fill:'none',stroke:'#1a1a1a','stroke-width':.85}));rows.forEach(d=>g.append(el('circle',{class:'chart-point',cx:x(d.Time),cy:y(d.Value),r:2.5})));const axes=el('g');svg.append(axes);axes.append(el('rect',{x:plot.left,y:plot.top,width:plot.right-plot.left,height:plot.bottom-plot.top,fill:'none',stroke:'#000','stroke-width':1}));[300,350,400,450].forEach(v=>{line(axes,plot.left-4,y(v),plot.left,y(v),{stroke:'#000','stroke-width':.7});text(axes,plot.left-7,y(v)+4,v,{'text-anchor':'end'});});const ticks=period.value==='all'?[1980,1990,2000,2010,2020]:period.value==='1990'?[1990,2000,2010,2020,2024]:period.value==='2000'?[2000,2005,2010,2015,2020,2024]:period.value==='2010'?[2010,2015,2020,2024]:[2017,2019,2021,2024];ticks.forEach(v=>{line(axes,x(v),plot.bottom,x(v),plot.bottom+4,{stroke:'#000','stroke-width':.7});text(axes,x(v),plot.bottom+16,v,{'text-anchor':'middle'});});text(axes,18,241,'Number of individuals',{'text-anchor':'middle',transform:'rotate(-90 18 241)','font-size':13,fill:'#000'});updateReadout();highlight();drawComparison();updateChartDescription(rows);}

function stopPlayback(){clearInterval(timer);timer=null;playButton.textContent='▶ Trace through time';playButton.setAttribute('aria-pressed','false');}
function updateChartDescription(rows){document.querySelector('#svg-desc').textContent=`${tracing?'Timeline revealed through '+year.value+'. ':''}North Atlantic right whale median population estimates, ${rows[0].Time}–${rows[rows.length-1].Time}. ${interval.checked?'Gray ribbon shows 95% credible intervals. ':''}${comparing?'Two draggable markers compare '+compareA.value+' and '+compareB.value+'.':''}`;}
function drawComparison(){
 document.querySelector('#comparison-panel').hidden=!comparing;
 svg.classList.toggle('is-comparing',comparing);
 if(!comparing)return;
 const a=data.find(d=>d.Time===Number(compareA.value)),b=data.find(d=>d.Time===Number(compareB.value));
 const difference=b.Value-a.Value,percent=difference/a.Value*100;
 document.querySelector('#compare-a-label').textContent=a.Time;
 document.querySelector('#compare-b-label').textContent=b.Time;
 document.querySelector('#compare-change').textContent=`${difference>0?'+':''}${difference} individuals (${percent>0?'+':''}${percent.toFixed(1)}%)`;
 document.querySelector('#compare-description').textContent=`${a.Time}: ${a.Value} → ${b.Time}: ${b.Value}`;
 const g=el('g',{id:'comparison-overlay'});
 g.append(el('rect',{x:x(a.Time),y:plot.top,width:x(b.Time)-x(a.Time),height:plot.bottom-plot.top,fill:'#176779','fill-opacity':.065,'pointer-events':'none'}));
 const segment=data.filter(d=>d.Time>=a.Time&&d.Time<=b.Time);
 g.append(el('polyline',{points:segment.map(d=>`${x(d.Time)},${y(d.Value)}`).join(' '),fill:'none',stroke:'#176779','stroke-width':2,'pointer-events':'none'}));
 [a,b].forEach((d,i)=>{
  const name=i===0?'a':'b';
  const labelOffset=i===1&&x(b.Time)-x(a.Time)<48?28:3;
  line(g,x(d.Time),plot.top+25,x(d.Time),plot.bottom,{stroke:'#176779','stroke-width':1,'stroke-dasharray':'3 3','pointer-events':'none'});
  g.append(el('circle',{cx:x(d.Time),cy:y(d.Value),r:5,fill:'white',stroke:'#176779','stroke-width':2,'pointer-events':'none'}));
  const marker=el('g',{'data-handle':name,class:'year-handle'});
  marker.append(el('rect',{x:x(d.Time)-13,y:plot.top,width:26,height:plot.bottom-plot.top,fill:'transparent'}));
  marker.append(el('rect',{x:x(d.Time)-22,y:plot.top+labelOffset,width:44,height:21,rx:3,fill:'#176779'}));
  text(marker,x(d.Time),plot.top+labelOffset+14,d.Time,{'text-anchor':'middle',fill:'white','font-size':11});
  g.append(marker);
 });
 svg.append(g);
}
function setComparison(enabled){stopPlayback();tracing=false;comparing=enabled;active=false;compareToggle.setAttribute('aria-pressed',String(enabled));if(enabled)period.value='all';document.querySelector('#chart-help').textContent=enabled?'Drag the blue labels, or click the chart to move the nearer year.':'Hover to inspect an estimate, or try a chart interaction.';render();}
compareToggle.addEventListener('click',()=>setComparison(!comparing));
function constrainComparison(which,value){if(which==='a')compareA.value=Math.min(Math.max(1990,value),Number(compareB.value)-1);else compareB.value=Math.max(Math.min(2024,value),Number(compareA.value)+1);render();}
compareA.addEventListener('input',()=>constrainComparison('a',Number(compareA.value)));
compareB.addEventListener('input',()=>constrainComparison('b',Number(compareB.value)));
document.querySelectorAll('[data-compare]').forEach(button=>button.addEventListener('click',()=>{const [a,b]=button.dataset.compare.split(',');compareA.value=a;compareB.value=b;setComparison(true);}));
function localPoint(event){const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
function nearestYear(local){return Math.round(domain[0]+(local.x-plot.left)/(plot.right-plot.left)*(domain[1]-domain[0]));}
function inspect(event){
 if(comparing||tracing)return;
 const local=localPoint(event);
 if(local.x<plot.left||local.x>plot.right||local.y<plot.top||local.y>plot.bottom)return;
 year.value=Math.max(Number(year.min),Math.min(2024,nearestYear(local)));active=true;updateReadout();highlight();
}
svg.addEventListener('pointerdown',event=>{
 const handle=event.target.closest('[data-handle]');
 if(comparing){
  const local=localPoint(event);
  if(local.x<plot.left||local.x>plot.right||local.y<plot.top||local.y>plot.bottom)return;
  const target=nearestYear(local);
  dragging=handle?handle.dataset.handle:(Math.abs(target-Number(compareA.value))<=Math.abs(target-Number(compareB.value))?'a':'b');
  svg.setPointerCapture(event.pointerId);event.preventDefault();constrainComparison(dragging,target);
 } else inspect(event);
});
svg.addEventListener('pointermove',event=>{if(dragging)constrainComparison(dragging,nearestYear(localPoint(event)));else inspect(event);});
function finishDrag(event){dragging=null;if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);}
svg.addEventListener('pointerup',finishDrag);svg.addEventListener('pointercancel',finishDrag);
svg.addEventListener('pointerleave',()=>{if(!dragging){active=false;highlight();}});
year.addEventListener('input',()=>{stopPlayback();active=true;if(comparing)setComparison(false);render();});
period.addEventListener('change',()=>{stopPlayback();if(comparing){comparing=false;compareToggle.setAttribute('aria-pressed','false');}render();});
interval.addEventListener('change',render);average.addEventListener('change',render);
playButton.addEventListener('click',()=>{
 if(timer!==null){stopPlayback();return;}
 if(comparing)setComparison(false);
 const start=visibleData()[0].Time;
 if(!tracing||Number(year.value)===2024)year.value=start;
 tracing=true;active=true;document.querySelector('#chart-help').textContent='The line unfolds year by year. Pause, then scrub with the year slider.';
 playButton.textContent='Ⅱ Pause tracing';playButton.setAttribute('aria-pressed','true');render();
 timer=setInterval(()=>{year.value=Number(year.value)+1;render();if(Number(year.value)>=2024)stopPlayback();},650);
});
document.querySelector('#reset').addEventListener('click',()=>{stopPlayback();tracing=false;comparing=false;dragging=null;compareToggle.setAttribute('aria-pressed','false');period.value='all';interval.checked=true;average.checked=true;year.value=2024;active=false;document.querySelector('#chart-help').textContent='Hover to inspect an estimate, or try a chart interaction.';render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
render();
