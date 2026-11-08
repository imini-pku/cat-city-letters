(function(root){
'use strict';
const D=typeof module!=='undefined'?require('./data.js'):root.CatData;
const copy=x=>JSON.parse(JSON.stringify(x));
const boons={steady:{name:'慢救主义',tag:'先稳定关系，再处理伤口',desc:'猫粮 +6、社区信任 +8；资金 -60。适合耐心路线。',resources:{food:6,community:8,money:-60}},clinic:{name:'医疗优先',tag:'先把最危险的伤口接住',desc:'资金 +120、医疗名额 +1；猫粮 -4、社区信任 -6。适合高风险路线。',resources:{money:120,medical:1,food:-4,community:-6}},night:{name:'夜行小队',tag:'把安静的夜晚变成行动窗口',desc:'行动点 +1、志愿意愿 +12；小月初始压力 -12。适合夜间路线。',resources:{ap:1,volunteer:12},cats:{yue:{stress:-12}}}};
function initial(mode='normal',boon='steady',variant='default'){const b=boons[boon]||boons.steady;const resources=copy(D.initialResources);for(const [k,v] of Object.entries(b.resources||{}))resources[k]+=v;const pack=variant==='pku'&&D.pkuPack?D.pkuPack:D;const cats=Object.fromEntries(pack.cats.map(c=>[c.id,{health:c.health,trust:c.trust,stress:c.stress}]));for(const [id,r] of Object.entries(b.cats||{}))for(const [k,v] of Object.entries(r))cats[id][k]=Math.max(0,Math.min(100,cats[id][k]+v));return {version:1,mode,boon,variant,week:1,day:1,resources,cats,flags:[`boon:${boon}`],done:[],history:[],ended:false};}
const demoPath={1:['E01'],2:['E03'],3:['E05'],4:['E07'],5:['E09'],6:['E12'],7:['E14','E15']};
const catList=s=>{const base=s.variant==='pku'&&D.pkuPack?D.pkuPack.cats:D.cats;return s.week>=2?[...base,...(D.bonusCats||[])]:base;};
const achievementDefs=[
 {id:'first-letter',name:'第一封回信',desc:'完成第一次救助选择',icon:'✉'},
 {id:'hei-trust',name:'留出一点位置',desc:'让小黑的信任达到 50',icon:'🐾'},
 {id:'owner-found',name:'钥匙声',desc:'帮助奶糖完成寻主团聚',icon:'🔑'},
 {id:'pair-care',name:'两个名字',desc:'为花卷和雨点落实成对照护',icon:'♡'},
 {id:'quiet-moon',name:'月光不再躲',desc:'为小月建立固定低干扰照护',icon:'☾'},
 {id:'medical-handoff',name:'病历翻页',desc:'为阿虎完成治疗后的复查交接',icon:'✚'},
 {id:'week-two',name:'第八天以后',desc:'完成第一周并继续下一周',icon:'➜'},
 {id:'new-cat',name:'新名字',desc:'把栗子纳入正式交接本',icon:'★'},
 {id:'three-week',name:'第三周手记',desc:'完成第二周并继续追踪',icon:'▣'},
 {id:'six-names',name:'六个名字',desc:'在一周内处理六只猫的来信',icon:'✦'},
 {id:'steady-care',name:'照护成习惯',desc:'让任意一只猫的信任达到 75',icon:'❀'},
 {id:'midnight-letter',name:'车棚后的蓝丝带',desc:'连续选择低压力路线，解锁小黑隐藏故事',icon:'🎗'},
 {id:'moonlit-visitor',name:'月光来信',desc:'让小月在不被催促的情况下主动靠近',icon:'☽'},
 {id:'secret-ending',name:'没有写进交接本的结局',desc:'完成一条隐藏路线',icon:'✧'},
 {id:'atlas-stamp',name:'档案卡有了下一页',desc:'在燕园猫协版建立一张可复核的猫咪档案卡',icon:'▤'},
 {id:'atlas-graduate',name:'毕业照背面',desc:'完成一次匿名回访并为猫咪保留重新求助入口',icon:'🎓'},
 {id:'archive-legacy',name:'把关系交给下一班',desc:'将三周照护经验整理成可复制的猫卡',icon:'🗂'},
 {id:'pku-route',name:'燕园猫协隐藏线',desc:'完成“档案卡—毕业照—关系栏”连续路线',icon:'✦'}
];
function achievements(s){const f=id=>s.flags.includes(id),c=s.cats||{};const u={'first-letter':s.history.some(h=>h.event),'hei-trust':(c.hei?.trust||0)>=50,'owner-found':f('tangHome'),'pair-care':f('pairLocal')||f('pairHome'),'quiet-moon':f('yueRoutine'),'medical-handoff':f('huFollowup'),'week-two':s.week>=2,'new-cat':f('liRecorded'),'three-week':s.week>=3,'six-names':new Set(s.history.filter(h=>h.event).flatMap(h=>{const e=D.events.find(e=>e.id===h.event);return e?e.catIds:[]})).size>=6,'steady-care':Object.values(c).some(v=>v.trust>=75),'midnight-letter':f('heiSecret'),'moonlit-visitor':f('yueSecret'),'secret-ending':f('heiSecret')||f('yueSecret'),'atlas-stamp':s.variant==='pku'&&f('atlasRecord'),'atlas-graduate':s.variant==='pku'&&f('atlasGraduate'),'archive-legacy':s.variant==='pku'&&f('archiveLegacy'),'pku-route':s.variant==='pku'&&f('atlasRecord')&&f('atlasGraduate')&&f('archiveLegacy')};return achievementDefs.map(a=>({...a,unlocked:!!u[a.id]}));}
function available(s){if(s.ended)return [];const allowed=s.mode==='demo'?demoPath[s.day]:null;return D.events.filter(e=>e.day===s.day&&!s.done.includes(e.id)&&(!e.requiresWeek||s.week===e.requiresWeek)&&(!e.requiresVariant||e.requiresVariant===s.variant)&&(!allowed||allowed.includes(e.id))&&(!e.requiresFlags||e.requiresFlags.every(f=>s.flags.includes(f)))&&e.catIds.every(id=>s.cats[id]));}
function reason(s,o){
 for(const [k,v] of Object.entries(o.resources))if(v<0&&s.resources[k]+v<0)return `${D.resourceLabels[k]}不足`;
 const r=o.requires;if(r?.flag&&!s.flags.includes(r.flag))return '需要前期寻主或治疗记录';
 if(r?.resource&&s.resources[r.resource]<r.min)return `${D.resourceLabels[r.resource]}需 ≥ ${r.min}`;
 if(r?.cat&&(s.cats[r.cat].trust<r.trust||s.cats[r.cat].stress>r.maxStress))return `需要信任 ≥ ${r.trust}、压力 ≤ ${r.maxStress}`;
 return '';
}
const clamp=v=>Math.max(0,Math.min(100,v));
function choose(s,eventId,optionId){
 if(s.ended)throw Error('本周已结束');
 const e=available(s).find(e=>e.id===eventId),o=e?.options.find(o=>o.id===optionId);
 if(!o)throw Error('事件不可用');const why=reason(s,o);if(why)throw Error(why);
 const n=copy(s);for(const [k,v] of Object.entries(o.resources)){n.resources[k]+=v;if(['community','volunteer'].includes(k))n.resources[k]=clamp(n.resources[k]);}
 for(const [id,delta] of Object.entries(o.changes))for(const [k,v] of Object.entries(delta))n.cats[id][k]=clamp(n.cats[id][k]+v);
 n.flags=[...new Set([...n.flags,...o.flags])];n.done.push(e.id);const copyText=s.variant==='pku'&&D.pkuPack?.eventCopy?.[e.id]||e;n.history.push({day:s.day,event:e.id,option:o.id,title:copyText.title,label:o.label,feedback:o.feedback,resources:copy(o.resources),changes:copy(o.changes),flags:copy(o.flags)});return n;
}
function advance(s){
 if(s.ended)throw Error('本周已结束');const n=copy(s);
 const skipped=available(s).map(e=>e.id);n.history.push({day:s.day,type:'night',skipped});
 if(n.day===7){n.ended=true;return n;}n.day++;
 n.resources.ap=n.resources.volunteer>=65?4:3;return n;
}
function continueWeek(s){if(!s.ended)throw Error('这一周还没有结束');const n=copy(s);n.week++;n.day=1;n.ended=false;n.done=[];n.resources.materials+=Math.max(2,Math.floor(s.history.filter(h=>h.event).length/3));n.resources.money=Math.min(1000,n.resources.money+60);n.resources.food=Math.min(30,n.resources.food+4);for(const c of (D.bonusCats||[]))if(!n.cats[c.id])n.cats[c.id]={health:c.health,trust:c.trust,stress:c.stress};n.history.push({type:'week',from:s.week,to:n.week,materials:n.resources.materials});return n;}
function endings(s){
 const f=id=>s.flags.includes(id),c=s.cats;
 const hei=f('heiTreated')&&c.hei.health>=65&&c.hei.trust>=55&&c.hei.stress<=45?['它给你留了一个位置','小黑接受了治疗，也开始允许你在附近坐下。信任没有让疼痛消失，却让下一次照护变得可能。','warm']:f('heiTreated')?['伤口在愈合，信任还在路上','小黑完成了本周治疗，但仍对接近保持警惕。下一班需要继续降低压力，而不是催促它亲近。','open']:['未兑现的检查','小黑的治疗尚未完成。你留下了观察记录，但它仍需要明确的医疗安排。','pending'];
 const tang=f('tangHome')?['认得的钥匙声','核验后的团聚让奶糖回到熟悉的生活；后续仍需确认适应情况。','warm']:f('tangAdopt')?['试着把这里叫作家','奶糖进入了试养，正式领养仍需回访。','warm']:['暂住的灯还亮着','奶糖尚未确认长期去处，寻主与照护工作仍需继续。','open'];
 const pair=f('pairLocal')?['长椅旁的两个名字','花卷和雨点获得成对的原地照护与复查计划，社区轮班将承担后续责任。','warm']:f('pairHome')?['同一个猫窝','花卷和雨点一起进入室内试住；老猫仍需要时间适应环境。','warm']:['还在寻找一起留下的办法','本周未落实长期成对照护，需要继续追踪健康、压力与安置。','pending'];
 const hu=f('huFollowup')?['病历翻到了下一页','阿虎完成治疗并获得复查交接。康复仍需持续，不能据此宣布痊愈。','warm']:f('huTransferred')?['一张落实的交接单','后续机构确认接收阿虎，治疗结果尚待追踪。','open']:f('huTreated')?['治疗后的待办','治疗已经开始，但康复与复查仍缺少完整交接。','open']:['不能被划掉的名字','阿虎尚未获得落实的后续医疗安排，求助记录必须继续跟进。','pending'];
 const yue=f('yueRoutine')&&c.yue.stress<=40?['不再立刻消失的月光','小月有了固定的低干扰照护。它还没有走向你，但已经不必每晚独自试探。','warm']:['把距离也留在记录里','小月仍需要更安静、连续的照护；它的退缩也是值得尊重的反馈。','open'];
 const juan=[...pair],yu=[...pair];
 if(f('pairLocal')){juan[0]='第三块木板，明天仍有人来';juan[1]='花卷留在熟悉的庭院，照护轮班与复查计划已经落实。雨点仍在身边，明天的水与食物也有了负责人。';yu[0]='不用再独自寻找花卷';yu[1]='雨点与花卷一起进入原地照护计划。陪伴稳定下来，身体虚弱仍需在复查中持续跟进。';}
 else if(f('pairHome')){juan[0]='窗台上的新阳光';juan[1]='花卷和雨点一起进入室内试住。新的温暖不能抹去环境变化的压力，后续需要耐心观察适应。';yu[0]='醒来时，它就在旁边';yu[1]='雨点获得了成对的室内试住安排，熟悉的陪伴与保暖可以同时保留，健康还需持续照护。';}
 else {juan[0]='长椅旁尚未排满的轮班';yu[0]='还在等两个名字的安置表';}
 const outcomes={hei,tang,juan,hu,yu,yue};
 const stable=Object.values(outcomes).filter(x=>x[2]==='warm').length;
 const hiddenHei=f('heiSecret'),hiddenYue=f('yueSecret');
 const pkuArchive=f('archiveLegacy');
 const title=s.variant==='pku'&&pkuArchive?'档案背面的燕园':hiddenHei?'车棚后的蓝丝带':hiddenYue?'月光下的第一步':stable>=4&&s.resources.community>=50?'有些人愿意留下':stable>=2?'未完的信，也有人接住':'请不要把它们写成句号';
 const summary=s.variant==='pku'&&pkuArchive?'你把三周的照护整理成一张会被继续使用的猫卡：名字、关系、退路和下一次回访。燕园猫协隐藏路线已完成。':hiddenHei?'你没有替小黑解释过去，只为它保留了一个不会移动的位置。隐藏路线已完成，下一周的交接本会从这条蓝丝带继续。':hiddenYue?'小月第一次主动走出树影。你没有把靠近写成驯服，而是把它写成一封只在夜里打开的信。': '七天结束了，救助没有结束。这里记录的是阶段性去向，不是对生命的评分。';
 return {title,outcomes,stable,summary,hidden: hiddenHei?'hei':hiddenYue?'yue':null};
}
function validate(s){
 if(!s||s.version!==1||!['normal','demo'].includes(s.mode)||!boons[s.boon]||!Number.isInteger(s.day)||s.day<1||s.day>7||typeof s.ended!=='boolean'||(s.ended&&s.day!==7))return false;
 if(!s.resources||!s.cats||!Array.isArray(s.flags)||!Array.isArray(s.done)||!Array.isArray(s.history)||s.history.length>80||s.flags.some(f=>typeof f!=='string'))return false;
 for(const k of Object.keys(D.initialResources)){const v=s.resources[k];if(!Number.isInteger(v)||v<0||v>10000)return false;}
 for(const k of ['community','volunteer'])if(s.resources[k]>100)return false;
 if(s.resources.ap>5||s.resources.medical>3)return false;
 for(const c of catList(s))for(const k of ['health','trust','stress'])if(!Number.isInteger(s.cats[c.id]?.[k])||s.cats[c.id][k]<0||s.cats[c.id][k]>100)return false;
 if(s.done.some(id=>!D.events.some(e=>e.id===id&&e.day<=s.day)))return false;
 // Replaying the log rejects malformed, impossible, or partially corrupted saves.
 try{let replay=initial(s.mode,s.boon,s.variant);for(const h of s.history){if(h.type==='night')replay=advance(replay);else if(h.type==='week')replay=continueWeek(replay);else replay=choose(replay,h.event,h.option);}return JSON.stringify(replay)===JSON.stringify(s);}catch{return false;}
}
const api={initial,available,reason,choose,advance,continueWeek,endings,validate,demoPath,boons,catList,achievements,achievementDefs};root.CatEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
