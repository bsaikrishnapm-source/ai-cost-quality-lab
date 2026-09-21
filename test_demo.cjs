"use strict";
const assert=require("node:assert/strict");const {test}=require("node:test");const fs=require("node:fs");const vm=require("node:vm");const path=require("node:path");const P=require("./demo/engine.js");const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,"demo/data.js"),"utf8"),context);const data=JSON.parse(JSON.stringify(context.window.DEMO_DATA));const person={tenant:"alpha",role:"support",revoked:false};

test("browser model reproduces Python baseline",()=>{const r=P.evaluate(data);assert.equal(r.recommendation,"hybrid");assert.ok(Math.abs(r.rows[2].monthly_variable_cost-270)<1e-8);assert.ok(Math.abs(r.rows[2].contribution_margin-.73)<1e-8);});
test("doubled review cost matches baseline sensitivity",()=>{const r=P.evaluate(data,2);assert.ok(Math.abs(r.rows[2].monthly_variable_cost-430)<1e-8);});
test("no feasible option does not choose cheapest",()=>{assert.equal(P.evaluate({...data,minimum_success_rate:.99}).recommendation,null);});
test("zero revenue yields null margin",()=>{assert.equal(P.evaluate({...data,revenue_per_task:0}).rows[0].contribution_margin,null);});
test("fractional volume and invalid rates rejected",()=>{assert.throws(()=>P.evaluate({...data,monthly_tasks:1.5}));assert.throws(()=>P.evaluate({...data,minimum_success_rate:2}));});
test("negative and non-finite costs rejected",()=>{for(const review_cost of [-1,NaN,Infinity])assert.throws(()=>P.evaluate({...data,review_cost}));});
test("relaxed gate permits cheaper option under different review cost",()=>{const r=P.evaluate({...data,minimum_success_rate:.8,maximum_p95_seconds:4,review_cost:0});assert.equal(r.recommendation,"lean");});
