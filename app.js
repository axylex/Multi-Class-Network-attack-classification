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
const xgb = data.models.find(model => model.id === 'xgb');
const infiltration = data.classes.indexOf('Infiltration');
const benign = data.classes.indexOf('Benign');
$('infiltrationInsight').innerHTML = `XGBoost assigns <strong>${fmt(xgb.matrix[infiltration][benign])} of ${fmt(data.support[infiltration])}</strong> validation Infiltration flows to Benign. Its Infiltration recall is <strong>${pct(xgb.perClass[infiltration][1])}</strong>, with ${pct(xgb.accuracy)} overall accuracy.`;
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
 if(!m.matrix){$('matrix').innerHTML='<div class="empty-matrix"><h3>Exact matrix not yet exported</h3><p>Validation predictions are required to calculate the counts for this model.</p><button class="button" id="showXgb">Inspect the XGBoost matrix →</button></div>';$('diagnostic').textContent='';$('showXgb').onclick=()=>{$('modelSelect').value='xgb';renderModel();};return;}
 const norm=$('normalize').checked;let html=`<div class="matrix-grid${norm?'':' counts'}"><div></div>`+data.classes.map(c=>`<div class="matrix-label top">${c}</div>`).join('');
 const max=Math.max(...m.matrix.flat());
 m.matrix.forEach((row,r)=>{html+=`<div class="matrix-label">${data.classes[r]}</div>`;row.forEach((v,c)=>{const fraction=v/data.support[r];const intensity=norm?fraction:Math.log1p(v)/Math.log1p(max);const light=97-intensity*53;const label=`${data.classes[r]} predicted ${data.classes[c]}: ${fmt(v)} flows, ${pct(fraction)}`;html+=`<button class="matrix-cell" data-row="${r}" data-col="${c}" style="background:hsl(220 80% ${light}%);color:${intensity>.55?'white':'#304464'}" aria-label="${label}" title="${label}">${norm?(fraction*100).toFixed(1):fmt(v)}</button>`;});});
 $('matrix').innerHTML=html+'</div>';
 document.querySelectorAll('.matrix-cell').forEach(el=>{const run=()=>{selectedCell=[+el.dataset.row,+el.dataset.col];diagnose(m,...selectedCell);};el.addEventListener('click',run);el.addEventListener('mouseenter',run);el.addEventListener('focus',run);});diagnose(m,...selectedCell);
}
['modelSelect','metricSelect','normalize'].forEach(id=>$(id).addEventListener('change',renderModel));$('logScale').addEventListener('change',distribution);
const inspector = data.flowInspector;
const flowModels = data.models.filter(model => model.id in window.BROWSER_MODELS);
let selectedFlow = 0;

$('flowChoices').innerHTML = inspector.examples.map(({label}, index) =>
  `<button type="button" class="flow-option" data-flow-example="${index}" aria-pressed="${index === selectedFlow}">${data.classes[label]}</button>`
).join('');
$('flowModel').innerHTML = flowModels.map(model =>
  `<option value="${model.id}">${model.name}</option>`
).join('');
$('flowModel').value = 'xgb';

function confidencePercent(score) {
  if (score > 0 && score < 0.0001) return '&lt;0.01%';
  if (score < 1 && score > 0.9999) return '&gt;99.99%';
  return pct(score);
}

function showSelectedFlow() {
  const example = inspector.examples[selectedFlow];
  $('flowFeatures').innerHTML = inspector.fields.map((field, index) =>
    `<div><dt>${field}</dt><dd>${fmt(example.values[index])}</dd></div>`
  ).join('');
  $('flowPrediction').textContent = 'Click Predict to run the selected model.';
  $('flowScoreResults').hidden = true;
}

function predictSelectedFlow() {
  const example = inspector.examples[selectedFlow];
  const modelId = $('flowModel').value;
  const start = performance.now();
  const {label, scores} = window.predictBrowserModel(modelId, example.features);
  const elapsed = performance.now() - start;
  const duration = elapsed < 0.01 ? '&lt;0.01 ms' : `${elapsed.toFixed(2)} ms`;
  const correct = label === example.label;

  $('flowPrediction').innerHTML = `
    <div class="flow-result-values">
      <div><span>Predicted class</span><strong>${data.classes[label]}</strong></div>
      <div><span>Confidence</span><strong>${confidencePercent(scores[label])}</strong></div>
      <div><span>Inference time</span><strong>${duration}</strong></div>
    </div>
    <p>True class <strong>${data.classes[example.label]}</strong> · ${correct ? 'Correct prediction' : 'Misclassified'}</p>`;
  $('flowScores').innerHTML = data.classes.map((name, index) =>
    bar(name, scores[index], confidencePercent(scores[index]))
  ).join('');
  $('flowScoreResults').hidden = false;
}

const flowButtons = document.querySelectorAll('[data-flow-example]');
flowButtons.forEach(button => button.addEventListener('click', () => {
  selectedFlow = Number(button.dataset.flowExample);
  flowButtons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  showSelectedFlow();
}));
$('flowModel').addEventListener('change', showSelectedFlow);
$('flowRun').addEventListener('click', predictSelectedFlow);
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}}),{rootMargin:'-15% 0px -65% 0px'});['overview','data','results','inspector','reproduce'].forEach(id=>observer.observe($(id)));
distribution();renderModel();showSelectedFlow();
