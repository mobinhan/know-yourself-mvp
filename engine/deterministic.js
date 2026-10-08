/** Know Yourself — isolated deterministic downstream chart engine. */
function unique(xs){return [...new Set(xs)];}
function normaliseChannel(c){return String(c).split('-').map(Number).sort((a,b)=>a-b).join('-');}
function connectedComponents(nodes,edges){
 const adj=new Map(nodes.map(n=>[n,new Set()]));
 for(const [a,b] of edges){if(!adj.has(a))adj.set(a,new Set());if(!adj.has(b))adj.set(b,new Set());adj.get(a).add(b);adj.get(b).add(a);}
 const seen=new Set(),out=[];
 for(const n of adj.keys()){if(seen.has(n))continue;const stack=[n],component=[];seen.add(n);while(stack.length){const x=stack.pop();component.push(x);for(const y of adj.get(x)||[]){if(!seen.has(y)){seen.add(y);stack.push(y);}}}out.push(component.sort());}
 return out.sort((a,b)=>a[0].localeCompare(b[0]));
}
export function deriveStructuralChart(input){
 const activations=input?.activations||{};const catalog=input?.channel_catalog||[];
 const all=[...(activations.personality||[]),...(activations.design||[])];
 const gateSet=unique(all.map(a=>Number(a.gate)).filter(Number.isFinite)).sort((a,b)=>a-b);
 const personalitySun=(activations.personality||[]).find(a=>a.body==='sun');
 const designSun=(activations.design||[]).find(a=>a.body==='sun');
 const channels=catalog.map(x=>({...x,channel:normaliseChannel(x.channel),gates:x.gates.map(Number)})).filter(x=>x.gates.length===2&&x.gates.every(g=>gateSet.includes(g)));
 const centres=unique(channels.flatMap(x=>x.centres)).sort();
 const definition=connectedComponents(centres,channels.map(x=>x.centres));
 const hasSacral=centres.includes('sacral'),hasSolarPlexus=centres.includes('solar_plexus'),hasThroat=centres.includes('throat');
 const motorCentres=['sacral','solar_plexus','root','heart'];
 let authority=null;if(hasSolarPlexus)authority='emotional';else if(hasSacral)authority='sacral';else if(centres.includes('spleen'))authority='splenic';else if(centres.includes('heart'))authority='ego';else if(hasThroat)authority='self_projected';else authority='lunar_or_none';
 const throatComponent=definition.find(c=>c.includes('throat'))||[];const motorToThroat=throatComponent.some(c=>motorCentres.includes(c));
 const type=hasSacral?(motorToThroat?'manifesting_generator':'generator'):'non_generator';
 const profile=personalitySun&&designSun?String(personalitySun.line)+'/'+String(designSun.line):null;
 const byBody=arr=>Object.fromEntries(arr.map(a=>[a.body,{gate:Number(a.gate),line:Number(a.line)}]));
 const pb=byBody(activations.personality||[]),db=byBody(activations.design||[]);
 const incarnation_cross={personality_sun:pb.sun||null,personality_earth:pb.earth||null,design_sun:db.sun||null,design_earth:db.earth||null};
 const evidence=[
  {id:'E-GATES',kind:'mechanical_fact',inputs:['activations.*.gate'],result:gateSet},
  {id:'E-CHANNELS',kind:'mechanical_derivation',inputs:['gateSet','channel_catalog'],result:channels.map(x=>x.channel)},
  {id:'E-CENTRES',kind:'mechanical_derivation',inputs:['completed_channels'],result:centres},
  {id:'E-DEFINITION',kind:'mechanical_derivation',inputs:['centres','completed_channels'],result:definition},
  {id:'E-AUTHORITY',kind:'mechanical_derivation',inputs:['centres'],result:authority},
  {id:'E-TYPE',kind:'mechanical_derivation',inputs:['sacral','throat_component'],result:type},
  {id:'E-PROFILE',kind:'mechanical_fact',inputs:['personality_sun.line','design_sun.line'],result:profile},
  {id:'E-CROSS',kind:'mechanical_fact',inputs:['personality_sun','personality_earth','design_sun','design_earth'],result:incarnation_cross}
 ];
 return {gateSet,channels,centres,definition,type,authority,profile,incarnation_cross,evidence};
}
export function compareExpected(actual,expected){
 const fields=['channels','centres','definition','type','authority','profile','incarnation_cross'],mismatches=[];
 for(const field of fields){const got=field==='channels'?actual.channels.map(x=>x.channel):actual[field];const want=field==='channels'?(expected.channels||[]).map(x=>normaliseChannel(x.channel)):expected[field];if(JSON.stringify(got)!==JSON.stringify(want))mismatches.push({field,got,want});}
 return {ok:mismatches.length===0,mismatches};
}