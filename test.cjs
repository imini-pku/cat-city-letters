const assert=require('node:assert/strict');
const E=require('./engine.js'),D=require('./data.js');
let seed=20261014;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let endpoints=new Set();
let demo=E.initial('demo');
while(!demo.ended){const a=E.available(demo);if(!a.length){demo=E.advance(demo);continue;}const e=a[0],o=e.options.find(o=>!E.reason(demo,o));assert(o,`演示路线 ${e.id} 应有可执行选项`);demo=E.choose(demo,e.id,o.id);}
assert.equal(demo.mode,'demo');assert.equal(demo.done.length,8);assert(E.validate(demo));
for(let run=0;run<1000;run++){
 let s=E.initial();let count=0;
 while(!s.ended){
  assert(++count<=23,'不应出现无限推进');
  const options=E.available(s).flatMap(e=>e.options.filter(o=>!E.reason(s,o)).map(o=>[e.id,o.id]));
  s=options.length&&random()>.12?E.choose(s,...options[Math.floor(random()*options.length)]):E.advance(s);
  assert(E.validate(s),'每个中间存档都应可回放');
  for(const v of Object.values(s.resources))assert(v>=0);
 }
 endpoints.add(E.endings(s).title);assert.equal(Object.keys(E.endings(s).outcomes).length,6);
}
assert(endpoints.size>=2,'应可到达不同结局');
let s=E.initial();assert.throws(()=>E.choose(s,'E07','gentle'));
s=E.choose(s,'E01','feed');assert.throws(()=>E.choose(s,'E01','feed'));
const altered=JSON.parse(JSON.stringify(s));altered.resources.money+=1;assert.equal(E.validate(altered),false);
assert.equal(E.validate(null),false);
const baseEvents=D.events.filter(e=>e.requiresWeek===1&&!e.hidden);const route=['feed','search','wait','community','treat','together','gentle','quiet','rota','reunite','local','routine','recover','promise','plan'];
s=E.initial();for(let i=0;i<baseEvents.length;i++){while(s.day<baseEvents[i].day)s=E.advance(s);s=E.choose(s,baseEvents[i].id,route[i]);}s=E.advance(s);
assert.equal(s.done.length,15);assert.equal(E.endings(s).outcomes.hei[2],'warm');
assert.notEqual(E.endings(s).outcomes.juan[0],E.endings(s).outcomes.yu[0]);
console.log('PASS: 1000 条确定种子随机路线、存档回放、负资源防护、重复选择防护、小黑完整线、不同结局与成对独立结语。');

let week1=E.initial();while(!week1.ended){const a=E.available(week1);if(!a.length){week1=E.advance(week1);continue}const e=a[0],o=e.options.find(o=>!E.reason(week1,o));week1=E.choose(week1,e.id,o.id);}let week2=E.continueWeek(week1);assert.equal(week2.week,2);assert(week2.cats.li);assert(E.available(week2).some(e=>e.id==='E16'));console.log('PASS: 周目继续、材料积累、新猫咪解锁。');



let pku=E.initial('normal','steady','pku');assert.equal(E.catList(pku)[0].name,'学术猫');pku.week=2;pku.day=2;pku.flags.push('atlasRecord');assert(E.available(pku).some(e=>e.id==='E33'));pku.week=3;pku.day=4;pku.flags.push('atlasGraduate');assert(E.available(pku).some(e=>e.id==='E34'));pku.flags.push('archiveLegacy');pku.day=7;pku.ended=true;assert(E.achievements(pku).find(a=>a.id==='pku-route').unlocked);assert.equal(E.endings(pku).title,'档案背面的燕园');console.log('PASS: 燕园猫协版隐藏路线、成就奖励与专属结局。');
