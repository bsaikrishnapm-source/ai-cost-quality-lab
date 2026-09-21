(function(){
"use strict";
function finite(value, name, min=0, max=Number.MAX_SAFE_INTEGER) {
  if(typeof value!=="number" || !Number.isFinite(value) || value<min || value>max) throw new Error(`${name} must be a finite number from ${min} to ${max}`);
  return value;
}
function clone(value){return JSON.parse(JSON.stringify(value));}
function unique(rows,key){if(new Set(rows.map(r=>r[key])).size!==rows.length)throw new Error(`Duplicate ${key}`);}
function ratio(a,b){return b ? a/b : null;}

function evaluate(data,multiplier=1){
 for(const k of ["monthly_tasks","review_cost","revenue_per_task","maximum_p95_seconds"])finite(data[k],k);
 if(!Number.isInteger(data.monthly_tasks))throw new Error("Volume must be a whole number");
 finite(data.minimum_success_rate,"Success floor",0,1);finite(multiplier,"Review multiplier",0,100);
 if(!Array.isArray(data.variants)||!data.variants.length)throw new Error("Variants required");unique(data.variants,"name");
 const rows=data.variants.map(v=>{
 finite(v.success_rate,"Success rate",0,1);finite(v.review_rate,"Review rate",0,1);finite(v.model_cost_per_task,"Model cost");finite(v.p95_seconds,"Latency");
 const cost=v.model_cost_per_task+v.review_rate*data.review_cost*multiplier;
 const reasons=[];if(v.success_rate<data.minimum_success_rate)reasons.push("Quality below floor");if(v.p95_seconds>data.maximum_p95_seconds)reasons.push("Latency above ceiling");
 const monthly=cost*data.monthly_tasks;if(!Number.isFinite(monthly))throw new Error("Scenario exceeds numeric range");
 return {...v,cost_per_task:cost,monthly_variable_cost:monthly,contribution_margin:data.revenue_per_task?(data.revenue_per_task-cost)/data.revenue_per_task:null,eligible:!reasons.length,reason:reasons.join("; ")||"Meets both gates"};
 });
 const eligible=rows.filter(r=>r.eligible).sort((a,b)=>a.cost_per_task-b.cost_per_task||a.name.localeCompare(b.name));
 return {rows,recommendation:eligible[0]?.name||null,assumptions:{...data,review_multiplier:multiplier}};
}
const API={evaluate};

if(typeof module!=="undefined"&&module.exports)module.exports=API;else window.Product=API;
})();
