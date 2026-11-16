/* Buildless interactive report. All data and computations stay in the browser. */
'use strict';
const data=window.RESULTS;
const $=id=>document.getElementById(id);
const fmt=n=>n.toLocaleString('en-US');
const pct=n=>(n*100).toFixed(2)+'%';
const bar=(label,value,end,rare=false)=>`<div class="bar-row ${rare?'rare':''}"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,Math.min(100,value*100))}%"></div></div><span>${end}</span></div>`;
let selectedCell=[5,0];
function distribution(){const log=$('logScale').checked;const max=Math.max(...data.counts);$('distribution').innerHTML=data.classes.map((c,i)=>bar(c,log?Math.log10(data.counts[i])/Math.log10(max):data.counts[i]/max,fmt(data.counts[i]),i>5)).join('');}
$('majorityAccuracy').textContent=pct(data.models[0].accuracy);
$('modelSelect').innerHTML=data.models.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');$('modelSelect').value='xgb';
function diagnose(model,r,c){
 const value=model.matrix[r][c],total=model.matrix[r].reduce((a,b)=>a+b,0);
 let note=r===c?'These flows received the correct class label.':r===5&&c===0?'Similar flow summaries may contribute to this overlap; the matrix alone cannot establish its cause.':c===5&&r===0?'This is a false Infiltration alert on benign traffic. Consider the operational cost alongside attack recall.':'Inspect timing, packet-size and rate distributions to test whether these classes overlap; this is a hypothesis, not a causal explanation.';
 if(model.id==='majority')note='This baseline ignores all features and assigns every flow to Benign. It demonstrates how class imbalance inflates accuracy.';
 $('diagnostic').innerHTML=`<strong>${fmt(value)} ${data.classes[r]} flows ${r===c?'correctly classified as':'misclassified as'} ${data.classes[c]}.</strong> ${pct(value/total)} of this true class. ${note}`;
 document.querySelectorAll('.matrix-cell').forEach(el=>el.classList.toggle('selected',+el.dataset.row===r&&+el.dataset.col===c));
}
function renderModel(){
 const m=data.models.find(m=>m.id===$('modelSelect').value),metric=+$('metricSelect').value;
 $('modelMetrics').innerHTML=[['Accuracy',pct(m.accuracy)],['Macro-F1',m.macroF1.toFixed(4)],['Validation flows',fmt(data.support.reduce((a,b)=>a+b,0))]].map(([k,v])=>`<div class="metric-card"><span>${k}</span><strong>${v}</strong></div>`).join('');
 $('performance').innerHTML=data.classes.map((c,i)=>bar(c,m.perClass[i][metric],m.perClass[i][metric].toFixed(2),i===5)).join('');
 $('matrixSource').textContent=m.matrixSource;
 $('normalize').disabled=!m.matrix;
 if(!m.matrix){$('matrix').innerHTML='<div class="empty-matrix"><h3>Exact matrix not yet exported</h3><p>The per-class scores at left are real notebook results. To inspect individual errors for this model, export its validation confusion matrix into data/results.json.</p><button class="button" id="showXgb">Inspect the available XGBoost matrix →</button></div>';$('diagnostic').textContent='No counts are inferred from rounded precision and recall.';$('showXgb').onclick=()=>{$('modelSelect').value='xgb';renderModel();};return;}
 const norm=$('normalize').checked;let html='<div class="matrix-grid"><div></div>'+data.classes.map(c=>`<div class="matrix-label top">${c}</div>`).join('');
 const max=Math.max(...m.matrix.flat());
 m.matrix.forEach((row,r)=>{html+=`<div class="matrix-label">${data.classes[r]}</div>`;row.forEach((v,c)=>{const fraction=v/data.support[r];const intensity=norm?fraction:Math.log1p(v)/Math.log1p(max);const light=97-intensity*53;const label=`${data.classes[r]} predicted ${data.classes[c]}: ${fmt(v)} flows, ${pct(fraction)}`;html+=`<button class="matrix-cell" data-row="${r}" data-col="${c}" style="background:hsl(220 80% ${light}%);color:${intensity>.55?'white':'#304464'}" aria-label="${label}" title="${label}">${norm?(fraction*100).toFixed(1):fmt(v)}</button>`;});});
 $('matrix').innerHTML=html+'</div>';
 document.querySelectorAll('.matrix-cell').forEach(el=>{const run=()=>{selectedCell=[+el.dataset.row,+el.dataset.col];diagnose(m,...selectedCell);};el.addEventListener('click',run);el.addEventListener('mouseenter',run);el.addEventListener('focus',run);});diagnose(m,...selectedCell);
}
['modelSelect','metricSelect','normalize'].forEach(id=>$(id).addEventListener('change',renderModel));$('logScale').addEventListener('change',distribution);
// Toy sensitivity model: five normalized inputs, transparent linear score terms,
// then softmax. These coefficients are illustrative, never fitted to the dataset.
const features=[{id:'duration',name:'Flow duration',unit:'ms',max:10000,step:10},{id:'packets',name:'Forward packets / second',unit:'pkt/s',max:10000,step:10},{id:'length',name:'Mean packet length',unit:'bytes',max:1500,step:1},{id:'syn',name:'SYN flag count',unit:'',max:100,step:1},{id:'bytes',name:'Flow bytes / second',unit:'KB/s',max:10000,step:10}];
const presets={web:[1200,80,720,1,60],flood:[100,9000,80,75,8000],scan:[40,1200,45,90,40]};
const weights=[[.8,-2,2,-2,-.5],[.7,.5,.1,.5,.2],[.2,.8,-.7,1.1,-.3],[-1,4,-.7,1.4,2.2],[1.8,2,-.5,.5,1.4],[.8,-.5,1,-.2,.1],[-1,.4,-1,4,-2],[.8,-.8,1.2,.2,.1]];
const biases=[1,-1.3,-1.2,-1,-1,-.8,-.6,-1.2];
$('sliders').innerHTML=features.map(f=>`<div class="slider-row"><label class="slider-label" for="${f.id}">${f.name}<output id="${f.id}Value" for="${f.id}"></output></label><input type="range" id="${f.id}" min="0" max="${f.max}" step="${f.step}"><div class="slider-range"><span>0 ${f.unit}</span><span>${fmt(f.max)} ${f.unit}</span></div></div>`).join('');
function simulate(){
 const values=features.map(f=>{const v=+$(f.id).value;$(f.id+'Value').textContent=fmt(v)+' '+f.unit;return v/f.max;});
 const terms=weights.map(row=>row.map((w,i)=>w*values[i]));const logits=terms.map((t,i)=>biases[i]+t.reduce((a,b)=>a+b,0));const max=Math.max(...logits);const exp=logits.map(x=>Math.exp(x-max));const sum=exp.reduce((a,b)=>a+b,0);const probabilities=exp.map(x=>x/sum);const best=probabilities.indexOf(Math.max(...probabilities));const threshold=+$('threshold').value/100;
 $('thresholdValue').textContent=pct(threshold);$('prediction').textContent=(probabilities[best]<threshold?'Review requested':'Above review threshold')+' · leading class: '+data.classes[best]+' ('+pct(probabilities[best])+')';
 $('probabilities').innerHTML=data.classes.map((c,i)=>bar(c,probabilities[i],pct(probabilities[i]),i===5)).join('');
 const signed=v=>(v>=0?'+':'')+v.toFixed(2);
 $('contributions').innerHTML=`<div class="contribution"><span>${data.classes[best]} · intercept</span><strong>${signed(biases[best])}</strong></div>`+features.map((f,i)=>`<div class="contribution"><span>${f.name}</span><strong>${signed(terms[best][i])}</strong></div>`).join('');
}
function preset(name){features.forEach((f,i)=>$(f.id).value=presets[name][i]);document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('selected',b.dataset.preset===name));simulate();}
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>preset(b.dataset.preset));features.forEach(f=>$(f.id).addEventListener('input',()=>{document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('selected'));simulate();}));$('threshold').addEventListener('input',simulate);$('reset').onclick=()=>{$('threshold').value=60;preset('web');};
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}}),{rootMargin:'-15% 0px -65% 0px'});['overview','data','results','inspector','reproduce'].forEach(id=>observer.observe($(id)));
distribution();renderModel();preset('web');
