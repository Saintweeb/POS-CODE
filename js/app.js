<script>
// ═══ CONSTANTS
const TAX = 0.16;
const LOW = 5;

// ═══ STORAGE
const LS = {
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
};

let products  = LS.get('sf_products', []);
let movements = LS.get('sf_movements', []);
let sales     = LS.get('sf_sales', []);
let nPid = LS.get('sf_npid', 1);
let nMid = LS.get('sf_nmid', 1);
let nSid = LS.get('sf_nsid', 1);

function save(){
  LS.set('sf_products',products); LS.set('sf_movements',movements);
  LS.set('sf_sales',sales); LS.set('sf_npid',nPid);
  LS.set('sf_nmid',nMid); LS.set('sf_nsid',nSid);
}
function gprod(id){return products.find(p=>p.id===id)}

// ═══ SEED
if(!products.length){
  [
    {n:'A4 Notebook (80 pages)',c:'Stationery',  p:120, s:50},
    {n:'Blue Biro Pen (Box/10)',c:'Stationery',  p:250, s:20},
    {n:'Pencil (Box/12)',       c:'Stationery',  p:180, s:15},
    {n:'Highlighter Set x4',   c:'Stationery',  p:195, s:3},
    {n:'Correction Tape',      c:'Stationery',  p:90,  s:12},
    {n:'Ruler 30cm',           c:'Stationery',  p:60,  s:25},
    {n:'Stapler',              c:'Office Supplies',p:350,s:8},
    {n:'Staples Box',          c:'Office Supplies',p:80, s:30},
    {n:'Manila Envelope Pack', c:'Office Supplies',p:60, s:40},
    {n:'Leather Key Holder',   c:'Key Holders', p:450, s:15},
    {n:'Key Holder w/ Carabiner',c:'Key Holders',p:320,s:4},
    {n:'Metal Key Ring x5',    c:'Key Holders', p:150, s:22},
  ].forEach(x=>products.push({id:nPid++,name:x.n,cat:x.c,price:x.p,stock:x.s}));
  save();
}

// ═══ CLOCK & OFFLINE
function tick(){document.getElementById('clock').textContent=new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'})}
setInterval(tick,1000);tick();
function netStatus(){
  const on=navigator.onLine;
  document.getElementById('ob').classList.toggle('show',!on);
  document.getElementById('sdot').style.background=on?'#4ADE80':'#F87171';
  document.getElementById('stxt').textContent=on?'Online':'Offline';
}
window.addEventListener('online',netStatus);
window.addEventListener('offline',netStatus);
netStatus();

// ═══ UTILS
function kes(n){return'KES '+Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function fdt(iso){return new Date(iso).toLocaleString('en-KE',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function tdy(){return new Date().toISOString().slice(0,10)}
function isToday(iso){return iso&&iso.slice(0,10)===tdy()}

function toast(msg,type='ok'){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show '+type;
  setTimeout(()=>t.classList.remove('show'),2800);
}

// ═══ NAV
const animate = (typeof Motion !== 'undefined') ? Motion.animate : () => {};

function go(id,el){
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));
  const targetPage = document.getElementById('pg-'+id);
  targetPage.classList.add('on');
  if(el) el.classList.add('on');
  animate(targetPage, { opacity:[0,1], x:[10,0] }, { duration:0.2, easing:'ease-out' });
  render(id);
}
function render(id){
  if(id==='dash')    renderDash();
  if(id==='sell')    renderSell();
  if(id==='products')renderProducts();
  if(id==='stockin') renderStockIn();
  if(id==='sales')   renderSales();
  if(id==='moves')   renderMoves();
}

// ═══ DASHBOARD
function renderDash(){
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const ts=sales.filter(s=>isToday(s.date));
  const rev=ts.reduce((a,s)=>a+s.total,0);
  const vat=ts.reduce((a,s)=>a+s.tax,0);
  const totstock=products.reduce((a,p)=>a+p.stock,0);
  const lowcount=products.filter(p=>p.stock<=LOW).length;
  document.getElementById('dash-metrics').innerHTML=`
    <div class="mc"><div class="ml">Today Revenue</div><div class="mv" style="color:var(--accent)">${kes(rev)}</div><div class="ms">${ts.length} sale(s) today</div></div>
    <div class="mc"><div class="ml">VAT Collected</div><div class="mv">${kes(vat)}</div><div class="ms">16% rate</div></div>
    <div class="mc"><div class="ml">Total Stock</div><div class="mv">${totstock}</div><div class="ms">${products.length} products</div></div>
    <div class="mc"><div class="ml">Low Stock Items</div><div class="mv" style="color:var(--warn)">${lowcount}</div><div class="ms">need restocking</div></div>
  `;
  const ds=document.getElementById('dash-sales');
  ds.innerHTML=ts.length
    ?[...ts].reverse().slice(0,8).map(s=>`<tr><td>${s.pname}</td><td class="mono">${s.qty}</td><td class="mono">${kes(s.total)}</td></tr>`).join('')
    :'<tr><td colspan="3" class="empty"><div class="eico">🧾</div>No sales yet today</td></tr>';
  const dl=document.getElementById('dash-low');
  const low=products.filter(p=>p.stock<=LOW);
  dl.innerHTML=low.length
    ?low.map(p=>`<tr><td>${p.name}</td><td class="mono">${p.stock}</td><td><span class="badge ${p.stock===0?'b-out':'b-low'}">${p.stock===0?'Out of stock':'Low stock'}</span></td></tr>`).join('')
    :'<tr><td colspan="3" class="empty">✅ All products well-stocked</td></tr>';
}

// ═══ SELL PAGE
function renderSell(){
  const sel=document.getElementById('s-prod');
  sel.innerHTML='<option value="">— Select product —</option>'+
    products.map(p=>`<option value="${p.id}"${p.stock===0?' disabled':''}>${p.name} (${p.stock} left)</option>`).join('');
  document.getElementById('s-price').value='';
  document.getElementById('s-qty').value='1';
  calcSale();
  // quick cats
  const cats=['All',...new Set(products.map(p=>p.cat))];
  document.getElementById('qcats').innerHTML=cats.map((c,i)=>`<span class="qchip${i===0?' on':''}" onclick="qFilter(this,'${c}')">${c}</span>`).join('');
  qRender('All');
}

function qRender(cat){
  const list=cat==='All'?products:products.filter(p=>p.cat===cat);
  document.getElementById('qgrid').innerHTML=list.length
    ?list.map(p=>`
      <div class="qcard${p.stock===0?' disabled':''}" onclick="qPick(${p.id})">
        <div class="qname">${p.name}</div>
        <div class="qprice">${kes(p.price)}</div>
        <div class="qstock">${p.stock} in stock</div>
      </div>`).join('')
    :'<div style="color:var(--muted);font-size:13px;padding:4px">No products in this category.</div>';
}

function qFilter(el,cat){
  document.querySelectorAll('.qchip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on'); qRender(cat);
}

function qPick(id){
  const p=gprod(id); if(!p||p.stock===0)return;
  document.getElementById('s-prod').value=id;
  document.getElementById('s-price').value=p.price.toFixed(2);
  document.getElementById('s-qty').value='1';
  calcSale();
  window.scrollTo({top:0,behavior:'smooth'});
}

function onProdChange(){
  const pid=parseInt(document.getElementById('s-prod').value);
  const p=gprod(pid);
  document.getElementById('s-price').value=p?p.price.toFixed(2):'';
  document.getElementById('s-qty').value='1';
  calcSale();
}

function calcSale(){
  const pid=parseInt(document.getElementById('s-prod').value);
  const qty=parseInt(document.getElementById('s-qty').value)||0;
  const p=gprod(pid);
  const sub=p?Math.round(p.price*qty*100)/100:0;
  const tax=Math.round(sub*TAX*100)/100;
  document.getElementById('s-sub').textContent=kes(sub);
  document.getElementById('s-tax').textContent=kes(tax);
  document.getElementById('s-tot').textContent=kes(sub+tax);
}

function doSell(){
  const pid=parseInt(document.getElementById('s-prod').value);
  const qty=parseInt(document.getElementById('s-qty').value)||0;
  const p=gprod(pid);
  if(!p){toast('Please select a product.','err');return}
  if(qty<=0){toast('Enter a valid quantity.','err');return}
  if(p.stock<qty){toast(`Only ${p.stock} units in stock!`,'err');return}
  // Button pulse feedback
  const sellBtn = document.querySelector('#pg-sell .btn-primary');
  if(sellBtn) animate(sellBtn, { scale:[1,0.93,1] }, { duration:0.18 });
  const sub=Math.round(p.price*qty*100)/100;
  const tax=Math.round(sub*TAX*100)/100;
  const tot=Math.round((sub+tax)*100)/100;
  const sid=nSid++;
  const now=new Date().toISOString();
  p.stock-=qty;
  sales.push({id:sid,pid,pname:p.name,cat:p.cat,qty,price:p.price,sub,tax,total:tot,date:now});
  movements.unshift({id:nMid++,pid,pname:p.name,type:'OUT',qty,tax,date:now});
  save();
  showReceipt({p,qty,sub,tax,tot,date:now,id:sid});
  document.getElementById('s-prod').value='';
  document.getElementById('s-price').value='';
  document.getElementById('s-qty').value='1';
  calcSale();
  qRender('All');
}

// ═══ RECEIPT
function showReceipt({p,qty,sub,tax,tot,date,id}){
  document.getElementById('r-date').textContent=fdt(date)+'  ·  Receipt #'+String(id).padStart(4,'0');
  document.getElementById('r-body').innerHTML=`
    <div class="rrow"><span>${p.name}</span></div>
    <div class="rrow"><span>${qty} × ${kes(p.price)}</span><span>${kes(sub)}</span></div>
  `;
  document.getElementById('r-totals').innerHTML=`
    <div class="rrow"><span>Subtotal</span><span>${kes(sub)}</span></div>
    <div class="rrow"><span>VAT (16%)</span><span>${kes(tax)}</span></div>
    <div class="rrow rtot"><span>TOTAL</span><span>${kes(tot)}</span></div>
  `;
  document.getElementById('rmodal').classList.add('show');
  // Spring pop-in on the modal card
  animate(
    document.querySelector('.modal'),
    { scale:[0.82,1], opacity:[0,1], y:[18,0] },
    { duration:0.38, easing:[0.175,0.885,0.32,1.275] }
  );
}
function closeR(){document.getElementById('rmodal').classList.remove('show');toast('Sale recorded!')}

// ═══ PRODUCTS
function toggleAddCard(){
  const c=document.getElementById('add-card');
  c.style.display=c.style.display==='none'?'block':'none';
  if(c.style.display==='block') document.getElementById('p-name').focus();
}

function prevTax(){
  const v=parseFloat(document.getElementById('p-price').value)||0;
  document.getElementById('p-taxprev').value=kes(Math.round(v*TAX*100)/100);
}

function addProduct(){
  const name=document.getElementById('p-name').value.trim();
  const cat=document.getElementById('p-cat').value;
  const price=parseFloat(document.getElementById('p-price').value);
  const stock=parseInt(document.getElementById('p-stock').value)||0;
  if(!name){toast('Product name is required.','err');return}
  if(isNaN(price)||price<=0){toast('Enter a valid price.','err');return}
  if(products.find(p=>p.name.toLowerCase()===name.toLowerCase())){toast('Product already exists!','err');return}
  const id=nPid++;
  products.push({id,name,cat,price,stock});
  if(stock>0) movements.unshift({id:nMid++,pid:id,pname:name,type:'IN',qty:stock,stockBefore:0,stockAfter:stock,tax:0,date:new Date().toISOString()});
  save();
  ['p-name','p-price','p-stock','p-taxprev'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('add-card').style.display='none';
  renderProducts();
  toast(name+' added!');
}

function renderProducts(){
  const q=(document.getElementById('p-search')||{}).value||'';
  const list=q?products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.cat.toLowerCase().includes(q.toLowerCase())):products;
  const tb=document.getElementById('prod-table');
  if(!list.length){tb.innerHTML='<tr><td colspan="6" class="empty"><div class="eico">📦</div>No products found</td></tr>';return}
  const mx=Math.max(...products.map(p=>p.stock),1);
  tb.innerHTML=list.map(p=>{
    const pct=Math.round(p.stock/mx*100);
    const bc=p.stock===0?'b-out':p.stock<=LOW?'b-low':'b-ok';
    const bt=p.stock===0?'Out of stock':p.stock<=LOW?'Low stock':'In stock';
    return`<tr>
      <td><strong>${p.name}</strong></td>
      <td><span class="badge b-cat">${p.cat}</span></td>
      <td class="mono">${kes(p.price)}</td>
      <td>
        <span class="mono">${p.stock}</span>
        <div class="sbar"><div class="sfill" style="width:${pct}%;background:${p.stock===0?'var(--danger)':p.stock<=LOW?'var(--warn)':'var(--green)'}"></div></div>
      </td>
      <td><span class="badge ${bc}">${bt}</span></td>
      <td style="display:flex;gap:6px;align-items:center">
        <button class="btn btn-ghost btn-sm" onclick="inlineEdit(${p.id},${p.price})">Edit Price</button>
        <button class="btn btn-danger btn-sm" onclick="delProd(${p.id})">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

function inlineEdit(id,current){
  const newPrice=prompt(`Edit price for "${gprod(id).name}" (current: KES ${current}):`,current);
  if(newPrice===null)return;
  const v=parseFloat(newPrice);
  if(isNaN(v)||v<=0){toast('Invalid price.','err');return}
  gprod(id).price=v; save(); renderProducts(); toast('Price updated!');
}

function delProd(id){
  if(!confirm('Delete "'+gprod(id).name+'"? This cannot be undone.'))return;
  products=products.filter(p=>p.id!==id); save(); renderProducts(); toast('Product removed.');
}

// ═══ STOCK IN
function renderStockIn(){
  const sel=document.getElementById('si-prod');
  sel.innerHTML='<option value="">— Select product —</option>'+
    products.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  document.getElementById('si-current').value='';
  document.getElementById('si-qty').value='';
  document.getElementById('si-after').value='';
  document.getElementById('si-hint').textContent='';

  // live preview
  sel.onchange=()=>{
    const p=gprod(parseInt(sel.value));
    document.getElementById('si-current').value=p?p.stock:'';
    calcAfter();
  };
  document.getElementById('si-qty').oninput=calcAfter;

  renderSIHist();
}

function calcAfter(){
  const pid=parseInt(document.getElementById('si-prod').value);
  const qty=parseInt(document.getElementById('si-qty').value)||0;
  const p=gprod(pid);
  if(p&&qty>0){
    document.getElementById('si-after').value=p.stock+qty;
    document.getElementById('si-hint').textContent=`↑ Stock will go from ${p.stock} → ${p.stock+qty} units`;
  } else {
    document.getElementById('si-after').value='';
    document.getElementById('si-hint').textContent='';
  }
}

function doStockIn(){
  const pid=parseInt(document.getElementById('si-prod').value);
  const qty=parseInt(document.getElementById('si-qty').value)||0;
  const p=gprod(pid);
  if(!p){toast('Please select a product.','err');return}
  if(qty<=0){toast('Enter a valid quantity to add.','err');return}
  const before=p.stock;
  p.stock+=qty;
  movements.unshift({id:nMid++,pid,pname:p.name,type:'IN',qty,stockBefore:before,stockAfter:p.stock,tax:0,date:new Date().toISOString()});
  save();
  toast(`✓ +${qty} added to ${p.name}. New stock: ${p.stock}`);
  renderStockIn();
}

function renderSIHist(){
  const hist=movements.filter(m=>m.type==='IN');
  const tb=document.getElementById('si-hist');
  tb.innerHTML=hist.length
    ?hist.slice(0,20).map(m=>`<tr>
        <td>${m.pname}</td>
        <td class="mono" style="color:var(--green)">+${m.qty}</td>
        <td class="mono">${m.stockBefore!=null?m.stockBefore:'—'}</td>
        <td class="mono">${m.stockAfter!=null?m.stockAfter:'—'}</td>
        <td style="color:var(--muted);font-size:12px">${fdt(m.date)}</td>
      </tr>`).join('')
    :'<tr><td colspan="5" class="empty">No stock-in records yet</td></tr>';
}

// ═══ SALES HISTORY
function renderSales(){
  const tr=sales.reduce((a,s)=>a+s.total,0);
  const tv=sales.reduce((a,s)=>a+s.tax,0);
  const td=sales.filter(s=>isToday(s.date)).reduce((a,s)=>a+s.total,0);
  document.getElementById('sales-metrics').innerHTML=`
    <div class="mc"><div class="ml">All-time Revenue</div><div class="mv" style="color:var(--accent)">${kes(tr)}</div></div>
    <div class="mc"><div class="ml">Total VAT Collected</div><div class="mv">${kes(tv)}</div></div>
    <div class="mc"><div class="ml">Today's Revenue</div><div class="mv" style="color:var(--green)">${kes(td)}</div></div>
  `;
  const tb=document.getElementById('sales-table');
  tb.innerHTML=sales.length
    ?[...sales].reverse().map(s=>`<tr>
        <td class="mono" style="color:var(--muted)">#${String(s.id).padStart(4,'0')}</td>
        <td>${s.pname}</td>
        <td><span class="badge b-cat">${s.cat}</span></td>
        <td class="mono">${s.qty}</td>
        <td class="mono">${kes(s.price)}</td>
        <td class="mono">${kes(s.sub)}</td>
        <td class="mono">${kes(s.tax)}</td>
        <td class="mono"><strong>${kes(s.total)}</strong></td>
        <td style="color:var(--muted);font-size:11px">${fdt(s.date)}</td>
      </tr>`).join('')
    :'<tr><td colspan="9" class="empty"><div class="eico">📈</div>No sales recorded yet</td></tr>';
}

// ═══ MOVEMENTS
function renderMoves(){
  const tb=document.getElementById('moves-table');
  tb.innerHTML=movements.length
    ?movements.slice(0,60).map(m=>`<tr>
        <td>${m.pname}</td>
        <td><span class="badge ${m.type==='IN'?'b-in':'b-sale'}">${m.type==='IN'?'↑ IN':'↓ OUT'}</span></td>
        <td class="mono" style="color:${m.type==='IN'?'var(--green)':'var(--danger)'}">${m.type==='IN'?'+':'-'}${m.qty}</td>
        <td class="mono">${m.tax>0?kes(m.tax):'—'}</td>
        <td style="color:var(--muted);font-size:12px">${fdt(m.date)}</td>
      </tr>`).join('')
    :'<tr><td colspan="5" class="empty">No movements recorded yet</td></tr>';
}

// ═══ CSV EXPORT
function exportCSV(){
  if(!sales.length){toast('No sales to export.','err');return}
  const rows=[['Receipt#','Product','Category','Qty','Unit Price','Subtotal','VAT','Total','Date']];
  sales.forEach(s=>rows.push([s.id,s.pname,s.cat,s.qty,s.price.toFixed(2),s.sub.toFixed(2),s.tax.toFixed(2),s.total.toFixed(2),fdt(s.date)]));
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='schoolfix-sales-'+tdy()+'.csv';a.click();
  toast('CSV exported!');
}

// ═══ INIT
renderDash();
</script>
