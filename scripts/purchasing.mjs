#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {table} from './lib/format.mjs';
import {parseCsv,pick} from './lib/csv.mjs';

export const reads={
 suppliers:'select id,name,contact,evidence_ref,review_due from suppliers order by name',
 budgets:'select * from budget_position order by name',
 orders:'select reference,title,supplier,currency,status,ordered_value,received_value,invoiced_value,due_on from order_position order by reference',
 lines:'select * from line_position order by reference,line_ref',
 'approvals-due':"select reference,title,requester,currency,ordered_value,due_on from order_position where status='draft' order by due_on nulls last,reference",
 'deliveries-due':"select reference,supplier,description,quantity,received,outstanding,due_on from line_position where status='approved' and outstanding>0 and due_on<=current_date+7 order by due_on,reference,line_ref",
 'match-invoices':"select reference,line_ref,description,currency,quantity,received,invoiced,unit_price,invoice_value,price_variance,invoice_ahead_of_receipt,over_invoiced from line_position where invoiced>0 order by reference,line_ref",
 'budget-review':'select name,currency,limit_amount,committed,requested,remaining from budget_position order by name',
 'supplier-review':"select s.name,s.review_due,p.currency,count(p.id) as orders,coalesce(sum(p.ordered_value),0) as committed,count(p.id) filter(where p.due_on<current_date and p.outstanding_quantity>0 and p.status='approved') as late_orders from suppliers s left join order_position p on p.supplier=s.name and p.status in ('approved','closed') group by s.name,s.review_due,p.currency order by s.name,p.currency",
 attention:"select reference,supplier,status,currency,ordered_value,due_on,mismatch,case when status='draft' then 'Approval waiting' when mismatch then 'Invoice mismatch' when due_on<current_date and outstanding_quantity>0 then 'Delivery overdue' else 'No recent activity' end as reason from order_position where status in ('draft','approved') and (status='draft' or mismatch or (due_on<current_date and outstanding_quantity>0) or last_activity<now()-interval '14 days') order by reference",
 compliance:'select * from compliance_findings order by rule,record,finding',
 activity:'select o.reference,a.action,a.actor,a.note,a.created_at from activity a left join orders o on o.id=a.order_id order by a.created_at,a.id',
 invoices:'select o.reference as purchase_order,l.line_ref,i.reference,i.quantity,i.unit_price,o.currency,i.issued_on,i.due_on,i.evidence_ref,i.retain_until from invoices i join order_lines l on l.id=i.line_id join orders o on o.id=l.order_id order by i.reference,l.line_ref',
 receipts:'select o.reference as purchase_order,l.line_ref,r.reference,r.quantity,r.received_on,r.evidence_ref from receipts r join order_lines l on l.id=r.line_id join orders o on o.id=l.order_id order by r.reference,l.line_ref'
};
export const writes=['add-supplier','set-supplier','assign-budget','evidence','add-budget','add-order','add-line','update-line','approve','close','cancel','receive','invoice','log'];
export const commands=[...Object.keys(reads),'order','weekly-review',...writes,'draft-chase','import','export','help'];
const nonempty=(v,label)=>{if(!String(v??'').trim())throw Error(`${label} is required`);return String(v).trim();};
export function decimal(v,label,places=2,zero=false){const s=String(v??'');if(!new RegExp(`^\\d+(?:\\.\\d{1,${places}})?$`).test(s)||!Number.isFinite(Number(s))||(zero?Number(s)<0:Number(s)<=0)||Number(s)>999999999)throw Error(`${label} must be ${zero?'nonnegative':'positive'} with at most ${places} decimal places`);return s;}
export function date(v,label){const s=String(v??'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||Number.isNaN(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`${label} must be a real YYYY-MM-DD date`);return s;}
const currency=v=>{const s=String(v??'').toUpperCase();if(!/^[A-Z]{3}$/.test(s))throw Error('currency requires three letters');return s;};
export function args(argv){const opts={},pos=[];for(let i=0;i<argv.length;i++){const a=argv[i];if(!a.startsWith('--'))pos.push(a);else{const eq=a.indexOf('=');const k=a.slice(2,eq<0?undefined:eq);if(eq>=0)opts[k]=a.slice(eq+1);else if(['json','dry-run','help'].includes(k))opts[k]=true;else{if(!argv[i+1]||argv[i+1].startsWith('--'))throw Error(`--${k} requires a value`);opts[k]=argv[++i];}}}return {pos,opts};}
const allowed={
 'add-supplier':['name','contact','evidence','review-due'], 'set-supplier':['supplier','contact','evidence','review-due'], 'assign-budget':['order','budget','actor'], evidence:['order','line','reference','kind','evidence','actor'], 'add-budget':['name','currency','start','end','limit'],
 'add-order':['reference','supplier','budget','title','requester','currency','ordered-on','due'],
 'add-line':['order','line','description','quantity','unit-price'],'update-line':['order','line','quantity','unit-price'],
 approve:['order','actor'],close:['order','actor'],cancel:['order','actor'],receive:['order','line','reference','quantity','date','evidence','actor'],
 invoice:['order','line','reference','quantity','unit-price','issued','due','year-end','retain-until','evidence','actor'],
 log:['order','actor','note'],'draft-chase':['order'],import:['file','map','dry-run'],export:['out'],order:['order']
};
export async function resolve(db,kind,value,lock=false){
 const names={suppliers:'name',budgets:'name',orders:'reference'};const col=names[kind];if(!col)throw Error('Invalid record type');const v=nonempty(value,kind);
 let found=await db.query(`select * from ${kind} where lower(${col})=lower($1) or id::text=$1 ${lock?'for update':''}`,[v]);
 if(!found.length)found=await db.query(`select * from ${kind} where starts_with(id::text,lower($1)) or strpos(lower(${col}),lower($1))>0 order by ${col} ${lock?'for update':''}`,[v]);
 if(found.length!==1)throw Error(`${kind}: ${found.length?'ambiguous':'no match'} ${v}\n${found.map(x=>`${x.id} ${x[col]}`).join('\n')}`);return found[0];
}
async function line(db,o,ref){const rows=await db.query('select * from order_lines where order_id=$1 and line_ref=$2',[o.id,nonempty(ref,'line')]);if(rows.length!==1)throw Error('Unknown line reference');return rows[0];}
const audit=(db,order,action,actor,note)=>db.query('insert into activity(order_id,action,actor,note) values($1,$2,$3,$4) returning id',[order,action,actor,note]);
const today=()=>new Date().toISOString().slice(0,10);

async function mutate(db,c,o){
 if(c==='add-supplier')return db.query('insert into suppliers(name,contact,evidence_ref,review_due) values($1,$2,$3,$4) returning id,name',[nonempty(o.name,'name'),o.contact||'',o.evidence||'',o['review-due']?date(o['review-due'],'review-due'):null]);
 if(c==='set-supplier'){const s=await resolve(db,'suppliers',o.supplier,true);return db.query('update suppliers set contact=$2,evidence_ref=$3,review_due=$4 where id=$1 returning id,name',[s.id,o.contact??s.contact,o.evidence??s.evidence_ref,o['review-due']?date(o['review-due'],'review-due'):s.review_due]);}
 if(c==='add-budget')return db.query('insert into budgets(name,currency,starts_on,ends_on,limit_amount) values($1,$2,$3,$4,$5) returning id,name',[nonempty(o.name,'name'),currency(o.currency),date(o.start,'start'),date(o.end,'end'),decimal(o.limit,'limit')]);
 if(c==='add-order'){
  const s=await resolve(db,'suppliers',o.supplier);const b=await resolve(db,'budgets',o.budget);const cur=currency(o.currency),d=date(o['ordered-on']||today(),'ordered-on');
  if(b.currency!==cur||d<b.starts_on||d>b.ends_on)throw Error('Budget currency or period does not match order');
  const result=await db.query('insert into orders(reference,supplier_id,budget_id,title,requester,currency,ordered_on,due_on) values($1,$2,$3,$4,$5,$6,$7,$8) returning id,reference',[nonempty(o.reference,'reference'),s.id,b.id,nonempty(o.title,'title'),nonempty(o.requester,'requester'),cur,d,date(o.due,'due')]);
  await audit(db,result[0].id,c,o.requester,'Draft order created');return result;
 }
 const order=await resolve(db,'orders',o.order,true);const actor=nonempty(o.actor||(['add-line','update-line'].includes(c)?order.requester:''),'actor');
 if(['add-line','update-line'].includes(c)){
  if(order.status!=='draft')throw Error('Only draft order lines can change');
  const quantity=decimal(o.quantity,'quantity',3),unit=decimal(o['unit-price'],'unit-price',2,true);
  let result;
  if(c==='add-line')result=await db.query('insert into order_lines(order_id,line_ref,description,quantity,unit_price) values($1,$2,$3,$4,$5) returning id,line_ref',[order.id,nonempty(o.line,'line'),nonempty(o.description,'description'),quantity,unit]);
  else{const l=await line(db,order,o.line);result=await db.query('update order_lines set quantity=$2,unit_price=$3 where id=$1 returning id,line_ref',[l.id,quantity,unit]);}
  await audit(db,order.id,c,actor,`Line ${o.line}: quantity ${quantity}, unit price ${unit}`);return result;
 }
 if(c==='assign-budget'){
  if(order.status!=='draft')throw Error('Only draft orders can change budget');const b=await resolve(db,'budgets',o.budget);if(b.currency!==order.currency||order.ordered_on<b.starts_on||order.ordered_on>b.ends_on)throw Error('Budget currency or period does not match order');await db.query('update orders set budget_id=$2 where id=$1',[order.id,b.id]);
 }else if(c==='evidence'){
  if(!['invoice','receipt'].includes(o.kind))throw Error('kind must be invoice or receipt');const l=await line(db,order,o.line);const rows=await db.query(`update ${o.kind==='invoice'?'invoices':'receipts'} set evidence_ref=$3 where line_id=$1 and reference=$2 returning id`,[l.id,nonempty(o.reference,'reference'),nonempty(o.evidence,'evidence')]);if(!rows.length)throw Error('No matching evidence record');
 }else if(c==='approve'){
  if(order.status!=='draft')throw Error('Only draft orders can be approved');
  if(actor.toLowerCase()===order.requester.toLowerCase())throw Error('Requester cannot approve own order');
  if(!order.budget_id)throw Error('Imported order needs a mapped budget before approval; use assign-budget');
  await db.query('select id from budgets where id=$1 for update',[order.budget_id]);
  const [b]=await db.query('select * from budget_position where id=$1',[order.budget_id]);
  if(b.currency!==order.currency||order.ordered_on<b.starts_on||order.ordered_on>b.ends_on)throw Error('Budget currency or period does not match order');
  const [p]=await db.query('select * from order_position where id=$1',[order.id]);
  if(Number(p.ordered_value)<=0)throw Error('Order needs a positive line total');
  const [fits]=await db.query('select $1::numeric <= $2::numeric as ok',[p.ordered_value,b.remaining]);if(!fits.ok)throw Error('Order exceeds remaining budget');
  await db.query("update orders set status='approved',approver=$2,approved_at=now() where id=$1",[order.id,actor]);
 }else if(c==='cancel'){
  if(!['draft','approved'].includes(order.status))throw Error('Only open orders can be cancelled');
  const [p]=await db.query('select exists(select 1 from receipts r join order_lines l on l.id=r.line_id where l.order_id=$1) or exists(select 1 from invoices i join order_lines l on l.id=i.line_id where l.order_id=$1) as used',[order.id]);
  if(p.used)throw Error('Cannot cancel an order with receipts or invoices');await db.query("update orders set status='cancelled' where id=$1",[order.id]);
 }else if(c==='close'){
  if(order.status!=='approved')throw Error('Only approved orders can close');
  const pending=await db.query('select id from line_position where order_id=$1 and (outstanding<>0 or invoiced<>quantity or price_variance)',[order.id]);
  if(pending.length)throw Error('Order has unreceived quantities or unmatched invoices');await db.query("update orders set status='closed' where id=$1",[order.id]);
 }else if(c==='receive'||c==='invoice'){
  if(order.status!=='approved')throw Error('Only approved orders accept receipts or invoices');const l=await line(db,order,o.line);const q=decimal(o.quantity,'quantity',3);const ref=nonempty(o.reference,'reference');
  if(c==='receive'){
   const [fits]=await db.query('select $2::numeric <= quantity-coalesce((select sum(quantity) from receipts where line_id=$1),0) as ok from order_lines where id=$1',[l.id,q]);
   if(!fits.ok)throw Error('Receipt exceeds outstanding quantity');
   await db.query('insert into receipts(line_id,reference,quantity,received_on,evidence_ref) values($1,$2,$3,$4,$5)',[l.id,ref,q,date(o.date||today(),'date'),o.evidence||'']);
  }else{
   const issued=date(o.issued,'issued'),end=date(o['year-end'],'year-end');
   if(end<issued||Number(end.slice(0,4))-Number(issued.slice(0,4))>1)throw Error('year-end must be the end of the invoice tax year');
   const [ret]=await db.query("select ($1::date+interval '7 years')::date as day",[end]);
   await db.query('insert into invoices(line_id,reference,quantity,unit_price,issued_on,due_on,tax_year_end,retain_until,evidence_ref) values($1,$2,$3,$4,$5,$6,$7,$8,$9)',[l.id,ref,q,decimal(o['unit-price'],'unit-price',2,true),issued,date(o.due,'due'),end,o['retain-until']?date(o['retain-until'],'retain-until'):ret.day,o.evidence||'']);
  }
 }else if(c!=='log')throw Error(`Unknown mutation ${c}`);
 await audit(db,order.id,c,actor,c==='log'?nonempty(o.note,'note'):`${c} ${o.reference||order.reference}`);
 return db.query('select reference,status,ordered_value,received_value,invoiced_value,mismatch from order_position where id=$1',[order.id]);
}

const importFields={reference:['PO #','Purchase Order #','Document #'],supplier:['Supplier Name','Supplier'],title:['PO Description','Description'],requester:['Creator Name','Creator'],currency:['Currency','Document Currency'],ordered_on:['Creation Date','Date of Creation'],due_on:['Delivery Date','Due Date'],line:['Item Row #','Line #'],description:['Item Name','Item Description'],quantity:['Quantity','Item Quantity'],unit_price:['Price','Item Price'],status:['Status'],budget:['Budget','Budget Name']};
async function sourceRows(file){
 if(/\.csv$/i.test(file))return parseCsv(fs.readFileSync(file,'utf8'));
 if(!/\.xlsx$/i.test(file))throw Error('Import accepts .csv or .xlsx');
 const {default:ExcelJS}=await import('exceljs');const workbook=new ExcelJS.Workbook();await workbook.xlsx.readFile(file);const sheet=workbook.worksheets[0];if(!sheet)throw Error('Workbook has no sheets');
 const cellValue=c=>{const v=c.value;if(v==null)return '';if(v instanceof Date)return v.toISOString().slice(0,10);if(typeof v==='object')throw Error('Workbook must contain plain values, without formulas or rich text');return String(v);};
 const headers=[];sheet.getRow(1).eachCell({includeEmpty:true},c=>headers.push(cellValue(c).trim()));
 if(headers.some(h=>!h)||new Set(headers.map(h=>h.toLowerCase())).size!==headers.length)throw Error('Spreadsheet requires unique nonempty headers on row 1');
 const rows=[];sheet.eachRow((row,index)=>{if(index===1)return;if(row.cellCount>headers.length)throw Error('Spreadsheet row wider than header');rows.push(Object.fromEntries(headers.map((h,i)=>[h,cellValue(row.getCell(i+1))])));});return rows;
}
async function importPrecoro(db,o){
 const rows=await sourceRows(nonempty(o.file,'file'));if(!rows.length)throw Error('Export contains no rows');
 const map=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};for(const k of Object.keys(map))if(!(k in importFields))throw Error(`Unknown map field ${k}`);
 const normalized=rows.map((raw,index)=>{const n={raw};for(const [key,aliases] of Object.entries(importFields))n[key]=pick(raw,...(map[key]?[map[key]]:aliases)).trim();
  for(const k of ['reference','supplier','requester','line','description'])nonempty(n[k],`row ${index+2} ${k}`);
  n.currency=currency(n.currency);n.ordered_on=date(n.ordered_on,`row ${index+2} creation date`);n.due_on=n.due_on?date(n.due_on,'delivery date'):null;
  n.quantity=decimal(n.quantity,'quantity',3);n.unit_price=decimal(n.unit_price,'unit price',2,true);n.title=n.title||n.reference;return n;});
 const seen=new Set(),groups=new Map();for(const n of normalized){const key=JSON.stringify([n.reference,n.line]);if(seen.has(key))throw Error('Duplicate order/line in export');seen.add(key);if(!groups.has(n.reference))groups.set(n.reference,[]);groups.get(n.reference).push(n);}
 await db.exec('BEGIN');try{
 for(const [ref,items] of groups){
  const n=items[0];for(const x of items)for(const k of ['supplier','requester','currency','ordered_on','due_on','budget','status','title'])if(x[k]!==n[k])throw Error(`Conflicting ${k} for ${ref}`);
  await db.query('insert into suppliers(name) values($1) on conflict(name) do nothing',[n.supplier]);const supplier=await resolve(db,'suppliers',n.supplier);
  const budget=n.budget?await resolve(db,'budgets',n.budget):null;
  if(budget&&(budget.currency!==n.currency||n.ordered_on<budget.starts_on||n.ordered_on>budget.ends_on))throw Error(`Budget currency or period differs for ${ref}`);
  let [order]=await db.query('select * from orders where reference=$1 for update',[ref]);
  if(order&&order.source_id!==ref)throw Error(`Local order collision ${ref}`);
  if(order){
   const old=await db.query('select line_ref,source_row from order_lines where order_id=$1 order by line_ref',[order.id]);
   const canon=x=>JSON.stringify(Object.fromEntries(Object.entries(x||{}).sort(([a],[b])=>a.localeCompare(b))));
   if(old.length!==items.length||old.some(l=>!items.some(x=>x.line===l.line_ref&&canon(x.raw)===canon(l.source_row))))throw Error(`Changed source for ${ref}; review changes before updating imported records`);
   continue;
  }
  [order]=await db.query('insert into orders(reference,supplier_id,budget_id,title,requester,currency,ordered_on,due_on,source_id,source_row,source_status) values($1,$2,$3,$4,$5,$6,$7,$8,$1,$9,$10) returning id',[ref,supplier.id,budget?.id||null,n.title,n.requester,n.currency,n.ordered_on,n.due_on,JSON.stringify(n.raw),n.status||'unknown']);
  for(const x of items)await db.query('insert into order_lines(order_id,line_ref,description,quantity,unit_price,source_row) values($1,$2,$3,$4,$5,$6)',[order.id,x.line,x.description,x.quantity,x.unit_price,JSON.stringify(x.raw)]);
  await audit(db,order.id,'import','operator','Precoro report imported as draft; approval, receipts and invoices require separate evidence');
 }
 await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');
 }catch(e){await db.exec('ROLLBACK');throw e;}
 return [{orders:groups.size,lines:normalized.length,dry_run:Boolean(o['dry-run']),status:'Validated; imported orders remain draft'}];
}

export async function run(db,argv){
 const {pos,opts:o}=args(argv);let c=pos[0]||'help';if(o.help)c='help';if(!commands.includes(c))throw Error(`Unknown command ${c}; use help`);
 if(pos.length>(c==='import'?2:1))throw Error('Use named arguments shown in docs/cli.md');
 for(const k of Object.keys(o))if(!['json','help',...(allowed[c]||[])].includes(k))throw Error(`Unknown option --${k} for ${c}`);
 if(c==='help')return commands.map(command=>({command,options:(allowed[command]||[]).map(k=>`--${k}`).join(' ')}));
 if(reads[c])return db.query(reads[c]);
 if(c==='order'){const order=await resolve(db,'orders',o.order);return {order:(await db.query('select * from order_position where id=$1',[order.id]))[0],lines:await db.query('select * from line_position where order_id=$1 order by line_ref',[order.id]),activity:await db.query('select action,actor,note,created_at from activity where order_id=$1 order by created_at',[order.id])};}
 if(c==='weekly-review')return {attention:await db.query(reads.attention),budgets:await db.query(reads['budget-review']),matching:await db.query(reads['match-invoices'])};
 if(writes.includes(c)){await db.exec('BEGIN');try{const result=await mutate(db,c,o);if(['add-supplier','set-supplier','add-budget'].includes(c))await audit(db,null,c,'operator',JSON.stringify(result));await db.exec('COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}}
 if(c==='import'){if(pos[1]!=='precoro')throw Error('Use import precoro --file=<report.xlsx>');return importPrecoro(db,o);}
 if(c==='draft-chase'){
  const order=await resolve(db,'orders',o.order);const rows=await db.query('select description,outstanding,due_on from line_position where order_id=$1 and outstanding>0 order by line_ref',[order.id]);
  if(order.status!=='approved'||!rows.length)throw Error('No approved outstanding delivery to chase');
  const activity=await db.query('select actor,note,created_at from activity where order_id=$1 order by created_at',[order.id]);
  const dir=path.join(REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`delivery-${order.id}-${Date.now()}.md`);
  fs.writeFileSync(file,`# DRAFT: delivery update for ${order.reference}\n\nPlease confirm when the following outstanding items will arrive.\n\n${rows.map(x=>`- ${x.description}: ${x.outstanding} outstanding, expected ${x.due_on||'date not recorded'}`).join('\n')}\n\n## Internal context, remove before sending\n${activity.map(x=>`- ${x.actor}: ${x.note}`).join('\n')}\n\nNothing has been sent.\n`,{flag:'wx'});return [{file,items:rows.length}];
 }
 if(c==='export'){
  const out=path.resolve(REPO_ROOT,o.out||`exports/purchasing-${Date.now()}.json`);const payload={format:'purchasing-backup-v1',exported_at:new Date().toISOString(),records:{}};
  await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{for(const t of ['suppliers','budgets','orders','order_lines','receipts','invoices','activity'])payload.records[t]=await db.query(`select * from ${t} order by id`);await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;}
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(payload,null,2)+'\n',{flag:'wx'});return [{file:out,records:Object.values(payload.records).reduce((n,r)=>n+r.length,0)}];
 }
}
export function human(result){
 if(Array.isArray(result)){if(!result.length)return '  (none)';return table(result,Object.keys(result[0]).map(key=>({key,label:key.replaceAll('_',' '),format:v=>v&&typeof v==='object'?JSON.stringify(v):v})));}
 return Object.entries(result).map(([k,v])=>`${k.toUpperCase()}\n${human(Array.isArray(v)?v:[v])}`).join('\n\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const result=await run(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):human(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{await db?.close();}}
