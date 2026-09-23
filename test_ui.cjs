// Controller regression tests using a minimal DOM double, not a browser QA claim.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function setup(){
 const nodes=new Map();
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this._value='';this.textContent='';}
  set id(v){this._id=v;nodes.set(v,this);} get id(){return this._id;}
  set value(v){this._value=String(v);} get value(){return this._value;}
  append(...items){for(const item of items){item.parent=this;this.children.push(item);}}
  replaceChildren(){for(const c of [...this.children])c.remove();}
  remove(){for(const c of [...this.children])c.remove();if(this.id)nodes.delete(this.id);if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
  get lastElementChild(){return this.children.at(-1);}
  click(){if(this.onclick)this.onclick();}
 }
 for(const id of ['controls','actions','error','metrics','results','notes','saved']){const e=new Element('div');e.id=id;}
 const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'demo/data.js'),'utf8'),{window});
 const downloads=[];
 const ctx={document:{getElementById:id=>nodes.get(id),createElement:t=>new Element(t),body:new Element('body')},DEMO_DATA:window.DEMO_DATA,Product:require('./demo/engine.js'),Blob,URL:{createObjectURL:b=>{downloads.push(b);return 'blob:test';},revokeObjectURL:()=>{}}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'demo/app.js'),'utf8'),ctx);
 const click=label=>{const b=nodes.get('actions').children.find(e=>e.textContent===label);assert.ok(b,label);b.click();};
 return {nodes,click,downloads,read:code=>vm.runInContext(code,ctx)};
}
test('baseline and guided presets return expected outcomes',()=>{const s=setup();assert.equal(s.read('lastResult.recommendation'),'hybrid');s.click('Try doubled review cost');assert.ok(Math.abs(s.read('lastResult.rows[2].monthly_variable_cost')-430)<1e-8);s.click('Try 99% quality gate');assert.equal(s.read('lastResult.recommendation'),null);s.click('Load baseline');assert.equal(s.read('lastResult.recommendation'),'hybrid');});
test('changed inputs block CSV and JSON exports until recalculated',()=>{const s=setup();s.nodes.get('review').value='.4';s.nodes.get('review').oninput();s.click('Export result CSV');s.click('Download evidence JSON');assert.equal(s.downloads.length,0);s.click('Compare scenarios');s.click('Export result CSV');s.click('Download evidence JSON');assert.equal(s.downloads.length,2);});
test('invalid comparison clears prior result and blocks saving',()=>{const s=setup();s.nodes.get('quality').value='2';s.click('Compare scenarios');assert.equal(s.read('lastResult'),null);s.click('Save comparison snapshot');assert.equal(s.read('copies.length'),0);assert.match(s.nodes.get('error').textContent,/Run/);});
test('history persists across reruns, caps at five and clears',()=>{const s=setup();for(let i=0;i<7;i++)s.click('Save comparison snapshot');assert.equal(s.read('copies.length'),5);assert.equal(s.read('copies[4].label'),'Scenario 7');s.click('Try doubled review cost');assert.ok(s.nodes.has('comparison-history'));s.click('Clear saved comparisons');assert.equal(s.read('copies.length'),0);assert.equal(s.nodes.has('comparison-history'),false);});
test('CSV includes assumptions and rows; JSON contains captured decisions',async()=>{const s=setup();s.click('Save comparison snapshot');s.click('Export result CSV');s.click('Download evidence JSON');const csv=await s.downloads[0].text();assert.match(csv,/minimum_success_rate/);assert.equal(csv.split('\r\n').length,4);const evidence=JSON.parse(await s.downloads[1].text());assert.equal(evidence.current.recommendation,'hybrid');assert.equal(evidence.comparisons.length,1);});
