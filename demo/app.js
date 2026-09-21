"use strict";
const $=id=>document.getElementById(id);
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function num(id){const v=$(id).value;if(v.trim()==="")throw new Error("Enter a value for "+id);return Number(v);}
function field(id,label,value,options){
 const wrap=el("label");wrap.append(el("span",label));let input;
 if(options){input=el("select");for(const item of options){const o=el("option",typeof item==="string"?item:item[1]);o.value=typeof item==="string"?item:item[0];input.append(o);}}
 else{input=el("input");input.type=typeof value==="number"?"number":"text";if(input.type==="number"){input.step="any";input.min="0";}}
 input.id=id;input.value=value;wrap.append(input);$("controls").append(wrap);return input;
}
function button(label,fn,secondary=false){const b=el("button",label,secondary?"secondary":"");b.type="button";b.onclick=()=>{try{$("error").textContent="";fn();}catch(e){$("error").textContent=e.message;}};$("actions").append(b);return b;}
function metric(label,value){const c=el("div",undefined,"metric");c.append(el("span",label),el("strong",String(value)));$("metrics").append(c);}
function clear(){for(const id of ["metrics","results","notes"])$(id).replaceChildren();}
function message(text){$("notes").append(el("p",text));}
function table(title,rows,columns){
 const section=el("section",undefined,"result-section");section.append(el("h2",title));if(!rows.length){section.append(el("p","No records for this scenario."));$("results").append(section);return;}
 const wrap=el("div",undefined,"table-scroll"),t=el("table"),head=el("thead"),hr=el("tr");
 for(const [key,label]of columns)hr.append(el("th",label));head.append(hr);t.append(head);
 const body=el("tbody");for(const row of rows){const tr=el("tr");for(const [key]of columns){const v=row[key];tr.append(el("td",v===null||v===undefined?"—":Array.isArray(v)?v.join(", "):String(v)));}body.append(tr);}t.append(body);wrap.append(t);section.append(wrap);$("results").append(section);
}
function download(name,data,type="application/json"){
 const body=typeof data==="string"?data:JSON.stringify(data,null,2);
 const url=URL.createObjectURL(new Blob([body],{type}));const a=el("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function csv(rows){if(!rows.length)return "";const keys=Object.keys(rows[0]);const cell=v=>{let s=typeof v==="object"?JSON.stringify(v):String(v??"");if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};return [keys.map(cell).join(","),...rows.map(r=>keys.map(k=>cell(r[k])).join(","))].join("\r\n");}
function pct(n){return n===null?"N/A":(n*100).toFixed(1)+"%";}
function money(n){return "$"+n.toFixed(2);}
const copies=[];
function saveComparison(label,result){copies.push({label,at:new Date().toISOString(),result:JSON.parse(JSON.stringify(result))});if(copies.length>5)copies.shift();$("saved").textContent=copies.length+" comparison snapshots saved in this tab";}
let lastResult=null;


field("volume","Monthly tasks",10000);field("review","Cost per human review (USD)",.2);field("revenue","Revenue per task (USD)",.1);
field("quality","Minimum success rate",.9);field("latency","Maximum p95 latency (seconds)",3);field("multiplier","Review-cost multiplier",1);
function run(){clear();const data=JSON.parse(JSON.stringify(DEMO_DATA));Object.assign(data,{monthly_tasks:num("volume"),review_cost:num("review"),revenue_per_task:num("revenue"),minimum_success_rate:num("quality"),maximum_p95_seconds:num("latency")});
 const result=Product.evaluate(data,num("multiplier"));lastResult=result;const best=result.rows.find(r=>r.name===result.recommendation);
 metric("Recommended variant",result.recommendation||"None");metric("Monthly variable cost",best?money(best.monthly_variable_cost):"—");metric("Contribution margin",best?pct(best.contribution_margin):"—");metric("Eligible variants",result.rows.filter(r=>r.eligible).length);
 table("Quality-gated comparison",result.rows.map(r=>({...r,cost_per_task:"$"+r.cost_per_task.toFixed(3),monthly_variable_cost:money(r.monthly_variable_cost),contribution_margin:pct(r.contribution_margin),success_rate:pct(r.success_rate),eligible:r.eligible?"Eligible":"Blocked"})),[["name","Variant"],["success_rate","Success"],["p95_seconds","p95 seconds"],["cost_per_task","Cost / task"],["monthly_variable_cost","Monthly cost"],["contribution_margin","Margin"],["eligible","Gate"],["reason","Rationale"]]);
 message("All vendor labels, prices, success and latency figures are fictional. The recommendation minimizes variable cost among options passing both gates. Margin excludes fixed costs, so it is not a profit forecast.");
 if(!best)message("No option passes both gates. Change the scope or evaluate another option; lowering cost alone does not resolve a failed quality gate.");
}
button("Compare scenarios",run);button("Export result CSV",()=>{if(!lastResult)throw new Error("Run a comparison first");download("cost-quality-results.csv",csv(lastResult.rows.map(r=>({...r,monthly_tasks:lastResult.assumptions.monthly_tasks,review_cost:lastResult.assumptions.review_cost,review_multiplier:lastResult.assumptions.review_multiplier,revenue_per_task:lastResult.assumptions.revenue_per_task,minimum_success_rate:lastResult.assumptions.minimum_success_rate,maximum_p95_seconds:lastResult.assumptions.maximum_p95_seconds}))),"text/csv");},true);run();

button("Save comparison snapshot",()=>{if(!lastResult)throw new Error("Run the scenario first");saveComparison("Scenario "+(copies.length+1),lastResult);table("Saved comparisons",copies.map(c=>({label:c.label,time:c.at})),[["label","Snapshot"],["time","Captured (UTC)"]]);},true);
button("Download evidence JSON",()=>download("product-evidence.json",{current:lastResult,comparisons:copies,scope:"Independent prototype; synthetic data only"}),true);
