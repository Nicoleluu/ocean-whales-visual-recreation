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
function el(tag,attrs={},text){const node=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));if(text!==undefined)node.textContent=text;return node;}
const x=v=>plot.left+(v-domain[0])/(domain[1]-domain[0])*(plot.right-plot.left);
const y=v=>plot.bottom-(v-273)/(497.7-273)*(plot.bottom-plot.top);
function line(parent,x1,y1,x2,y2,attrs={}){parent.append(el('line',{x1,y1,x2,y2,...attrs}));}
function text(parent,xx,yy,str,attrs={}){parent.append(el('text',{x:xx,y:yy,'font-size':12,fill:'#4d4d4d',...attrs},str));}
function visibleData(){return data.filter(d=>d.Time>= (period.value==='all'?1990:Number(period.value)));}
function updateReadout(){const d=data.find(d=>d.Time===Number(year.value));const prev=data.find(v=>v.Time===d.Time-1);document.querySelector('#year-label').textContent=d.Time;document.querySelector('#readout').innerHTML=`<strong>${d.Value} <span>individuals</span></strong><p>95% credible interval: ${d.Lower95}–${d.Upper95}</p><p>${prev?`${d.Value-prev.Value>0?'+':''}${d.Value-prev.Value} from ${prev.Time}`:'First year with a population estimate'}</p>`;if(window.oceanReady)updateOcean(d);}
function highlight(){svg.querySelector('#selection')?.remove();if(!active)return;const d=data.find(d=>d.Time===Number(year.value));const g=el('g',{id:'selection','pointer-events':'none'});line(g,x(d.Time),plot.top,x(d.Time),plot.bottom,{stroke:'#176779','stroke-width':1,'stroke-dasharray':'3 3'});g.append(el('circle',{cx:x(d.Time),cy:y(d.Value),r:5,fill:'white',stroke:'#176779','stroke-width':2}));svg.append(g);}
function render(){svg.querySelectorAll('g,defs').forEach(n=>n.remove());const rows=visibleData();domain=period.value==='all'?[1977.75,2028.3]:[rows[0].Time-.8,2024.8];year.min=rows[0].Time;if(Number(year.value)<rows[0].Time)year.value=rows[0].Time;const defs=el('defs');const clip=el('clipPath',{id:'plot-clip'});clip.append(el('rect',{x:plot.left,y:plot.top,width:plot.right-plot.left,height:plot.bottom-plot.top}));defs.append(clip);svg.append(defs);const g=el('g',{'clip-path':'url(#plot-clip)'});svg.append(g);g.append(el('rect',{x:x(2017),y:plot.top,width:x(2026)-x(2017),height:plot.bottom-plot.top,fill:'#f2f2f2'}));if(average.checked)line(g,plot.left,y(fullMean),plot.right,y(fullMean),{stroke:'#a3a3a3','stroke-width':2.5,'stroke-dasharray':'10 10'});if(interval.checked){const points=rows.map(d=>`${x(d.Time)},${y(d.Upper95)}`).concat([...rows].reverse().map(d=>`${x(d.Time)},${y(d.Lower95)}`));g.append(el('polygon',{points:points.join(' '),fill:'#bdbdbd','fill-opacity':.9}));}g.append(el('polyline',{points:rows.map(d=>`${x(d.Time)},${y(d.Value)}`).join(' '),fill:'none',stroke:'#1a1a1a','stroke-width':.85}));rows.forEach(d=>g.append(el('circle',{class:'chart-point',cx:x(d.Time),cy:y(d.Value),r:2.5})));const axes=el('g');svg.append(axes);axes.append(el('rect',{x:plot.left,y:plot.top,width:plot.right-plot.left,height:plot.bottom-plot.top,fill:'none',stroke:'#000','stroke-width':1}));[300,350,400,450].forEach(v=>{line(axes,plot.left-4,y(v),plot.left,y(v),{stroke:'#000','stroke-width':.7});text(axes,plot.left-7,y(v)+4,v,{'text-anchor':'end'});});const ticks=period.value==='all'?[1980,1990,2000,2010,2020]:period.value==='1990'?[1990,2000,2010,2020,2024]:period.value==='2000'?[2000,2005,2010,2015,2020,2024]:period.value==='2010'?[2010,2015,2020,2024]:[2017,2019,2021,2024];ticks.forEach(v=>{line(axes,x(v),plot.bottom,x(v),plot.bottom+4,{stroke:'#000','stroke-width':.7});text(axes,x(v),plot.bottom+16,v,{'text-anchor':'middle'});});text(axes,18,241,'Number of individuals',{'text-anchor':'middle',transform:'rotate(-90 18 241)','font-size':13,fill:'#000'});updateReadout();highlight();}
year.addEventListener('input',()=>{active=true;updateReadout();highlight();});period.addEventListener('change',render);interval.addEventListener('change',render);average.addEventListener('change',render);
function inspect(event){const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const local=p.matrixTransform(svg.getScreenCTM().inverse());if(local.x<plot.left||local.x>plot.right||local.y<plot.top||local.y>plot.bottom)return;const target=domain[0]+(local.x-plot.left)/(plot.right-plot.left)*(domain[1]-domain[0]);const rows=visibleData();year.value=rows.reduce((a,b)=>Math.abs(b.Time-target)<Math.abs(a.Time-target)?b:a).Time;active=true;updateReadout();highlight();}
svg.addEventListener('pointermove',inspect);svg.addEventListener('pointerdown',inspect);svg.addEventListener('pointerleave',()=>{active=false;highlight();});document.querySelector('#reset').addEventListener('click',()=>{period.value='all';interval.checked=true;average.checked=true;year.value=2024;active=false;render();});render();

// One whale-shaped mark per estimated individual; stable slots preserve count comparison.
const field=document.querySelector('#whale-field');
const oceanYear=document.querySelector('#ocean-year');
const playButton=document.querySelector('#play-ocean');
let estimateKey='Value',playTimer=null;
const fieldDefs=el('defs');
const whaleSymbol=el('symbol',{id:'whale-symbol',viewBox:'0 0 40 22'});
// Original vector silhouette: a broad head, tapered body, pectoral fin, and forked flukes.
whaleSymbol.append(el('path',{d:'M3 10 C3 4 12 2 20 5 C26 7 29 12 32 12 C32 8 34 5 38 5 L36 11 L39 16 C35 18 32 17 30 15 C23 18 14 18 10 15 L9 20 L6 15 C3 14 2 12 3 10 Z'}));
fieldDefs.append(whaleSymbol);field.append(fieldDefs);
const whaleMarks=[];
for(let i=0;i<500;i++){
 const col=i%25,row=Math.floor(i/25);
 const unit=el('g',{class:'whale-unit',transform:`translate(${col*40},${row*26})`,'aria-hidden':'true'});
 unit.append(el('use',{href:'#whale-symbol',width:34,height:20}));field.append(unit);whaleMarks.push(unit);
}
function updateOcean(d){
 const count=d[estimateKey];
 oceanYear.value=d.Time;
 document.querySelector('#ocean-year-label').textContent=d.Time;
 document.querySelector('#ocean-date').textContent=d.Time;
 document.querySelector('#ocean-count').textContent=count;
 document.querySelector('#ocean-measure').textContent=estimateKey==='Value'?'estimated individuals (median)':estimateKey==='Lower95'?'individuals at the lower 95% bound':'individuals at the upper 95% bound';
 const diff=count-483;
 document.querySelector('#ocean-change').textContent=diff===0?'Equal to the 2011 median peak':`${Math.abs(diff)} ${diff>0?'above':'below'} the 2011 median peak`;
 whaleMarks.forEach((mark,i)=>mark.setAttribute('class',`whale-unit${i<count?'':i<483?' ghost':' absent'}`));
 document.querySelector('#field-description').textContent=`${d.Time}: ${count} filled symbols. ${Math.max(0,483-count)} outlined symbols show the gap from the 2011 median of 483. 95% credible interval: ${d.Lower95} to ${d.Upper95}.`;
 document.querySelectorAll('[data-year]').forEach(button=>button.setAttribute('aria-current',String(Number(button.dataset.year)===d.Time)));
 const prior=data.find(r=>r.Time===d.Time-1);
 let story=d.Time===1990?'The series begins with an estimated 289 whales.':d.Time===2011?'The population reaches its highest median estimate in this series: 483 whales.':d.Time===2020?'The median falls to 359, the lowest estimate since 2002.':d.Time===2024?'A recent increase, but still 99 fewer than the 2011 median peak.':prior?`The median ${d.Value>prior.Value?'increases by':d.Value<prior.Value?'decreases by':'changes by'} ${Math.abs(d.Value-prior.Value)} from the previous year, to ${d.Value} whales.`:'';
 if(estimateKey!=='Value')story=`For ${d.Time}, the 95% credible interval spans ${d.Lower95}–${d.Upper95} individuals. You’re viewing its ${estimateKey==='Lower95'?'lower':'upper'} bound; the median is ${d.Value}.`;
 document.querySelector('#ocean-narrative').textContent=story;
}
function stopPlayback(){if(playTimer!==null)clearInterval(playTimer);playTimer=null;playButton.textContent='▶ Play timeline';playButton.setAttribute('aria-pressed','false');}
function selectOceanYear(value){period.value='all';year.min=1990;year.value=value;active=true;render();}
oceanYear.addEventListener('input',()=>{stopPlayback();selectOceanYear(Number(oceanYear.value));});
document.querySelectorAll('[data-year]').forEach(button=>button.addEventListener('click',()=>{stopPlayback();selectOceanYear(Number(button.dataset.year));}));
document.querySelectorAll('[data-estimate]').forEach(button=>button.addEventListener('click',()=>{estimateKey=button.dataset.estimate;document.querySelectorAll('[data-estimate]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));updateOcean(data.find(d=>d.Time===Number(year.value)));}));
playButton.addEventListener('click',()=>{if(playTimer!==null){stopPlayback();return;}if(Number(year.value)===2024)selectOceanYear(1990);playButton.textContent='Ⅱ Pause timeline';playButton.setAttribute('aria-pressed','true');playTimer=setInterval(()=>{const next=Number(year.value)+1;if(next>2024){stopPlayback();return;}selectOceanYear(next);if(next===2024)stopPlayback();},850);});
[year,period].forEach(control=>control.addEventListener('input',stopPlayback));
svg.addEventListener('pointerdown',stopPlayback);
svg.addEventListener('pointermove',stopPlayback);
document.querySelector('#reset').addEventListener('click',()=>{stopPlayback();estimateKey='Value';document.querySelectorAll('[data-estimate]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.estimate==='Value')));updateOcean(data[data.length-1]);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
window.oceanReady=true;updateOcean(data[data.length-1]);
