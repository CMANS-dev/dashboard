
/* v8: human-only Vendor selection. No automated ranking or selection. */
let selectedCompareVendorV8=null;
const oldCompareV8=compare;
compare=function(){
  let html=oldCompareV8();
  const picker=`<div class="card" style="border-left:4px solid #B42332;background:#fffafa;margin-bottom:14px">
  <h3 style="margin-top:0">เลือกผู้ขายสำหรับเสนออนุมัติ (Manual Selection)</h3>
  <p class="muted">เลือกเองได้เพียง 1 บริษัท ไม่มีระบบจัดอันดับหรือเลือกอัตโนมัติ บริษัทที่เลือกจะแสดงแถบสีแดงใน PDF</p>
  <div id="vendorSelectV8" style="display:flex;gap:10px;flex-wrap:wrap">
  ${vendorsV2.map((v,i)=>`<label style="display:flex;align-items:center;gap:8px;padding:10px 13px;border:1px solid ${selectedCompareVendorV8===i?'#B42332':'#dce4ef'};border-radius:9px;background:${selectedCompareVendorV8===i?'#fff0f1':'#fff'};cursor:pointer">
  <input style="width:auto;accent-color:#B42332" type="radio" name="chosenVendorV8" value="${i}" ${selectedCompareVendorV8===i?'checked':''} onchange="chooseCompareVendorV8(${i})">
  ${E(v.name)} ${selectedCompareVendorV8===i?'<b style="color:#B42332">✓ เลือกแล้ว</b>':''}</label>`).join('')}
  </div></div>`;
  return html.replace('<div class="card"><div class="form-head">',picker+'<div class="card"><div class="form-head">');
};
function chooseCompareVendorV8(index){
  selectedCompareVendorV8=index;
  const list=document.getElementById('vendorSelectV8');
  if(list){
    list.querySelectorAll('label').forEach((el,i)=>{
      const on=i===index;
      el.style.borderColor=on?'#B42332':'#dce4ef';
      el.style.background=on?'#fff0f1':'#fff';
      let marker=el.querySelector('.chosen-marker-v8');
      if(marker)marker.remove();
      if(on)el.insertAdjacentHTML('beforeend','<b class="chosen-marker-v8" style="color:#B42332">✓ เลือกแล้ว</b>');
    });
  }
  const field=document.getElementById('vendor');
  if(field)field.value=vendorsV2[index]?.name||'';
}
const oldAddVendorV8=addVendor;
addVendor=function(){oldAddVendorV8();};
const oldRemoveVendorV8=removeVendor;
removeVendor=function(i){
  if(selectedCompareVendorV8===i)selectedCompareVendorV8=null;
  else if(selectedCompareVendorV8!==null&&selectedCompareVendorV8>i)selectedCompareVendorV8--;
  oldRemoveVendorV8(i);
};
const oldPrintFormV8=printForm;
printForm=function(type){
  if(type!=='COMPARE')return oldPrintFormV8(type);
  syncCompare();
  const ref=get('ref'), project=get('project'), date=get('date'), pack=get('package');
  const chosen=selectedCompareVendorV8;
  const cols=vendorsV2.length;
  const tableStyle=`<style>
  @page{size:A3 landscape;margin:12mm}
  body{font-family:Arial,'Noto Sans Thai',sans-serif;color:#243247;font-size:11px}
  header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #223b5a;padding-bottom:12px}
  header img{width:155px;max-height:65px;object-fit:contain}
  h1{font-size:19px;margin:0}small{color:#66788c}
  table{border-collapse:collapse;width:100%;table-layout:fixed;margin-top:16px}
  th,td{border:1px solid #b9c6d4;padding:8px;vertical-align:top;overflow-wrap:anywhere}
  th{background:#edf2f8;text-align:left}
  .selected-vendor-v8{background:#fff0f0!important;border-left:5px solid #c8192e!important;border-right:3px solid #c8192e!important}
  th.selected-vendor-v8{background:#c8192e!important;color:#fff!important}
  .selected-label-v8{color:#c8192e;font-weight:700}
  .selected-vendor-v8 .selected-label-v8{color:inherit}
  .sig{display:flex;gap:18px;margin-top:55px}.sig>div{flex:1;border-top:1px solid #65748b;padding-top:10px;text-align:center}
  .actions{margin-top:14px}@media print{.actions{display:none}}
  </style>`;
  const col=(i,tag='td',value='')=>`<${tag} class="${chosen===i?'selected-vendor-v8':''}">${value}</${tag}>`;
  const money=n=>Number(n).toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
  let rows=compareItems.map((it,i)=>`<tr><td>${i+1}</td><td>${E(it.desc)}</td><td>${it.qty}</td><td>${E(it.unit)}</td>${vendorsV2.map((v,j)=>col(j,'td',v.prices[i]===null?'—':money(v.prices[i])+' / '+money(v.prices[i]*it.qty))).join('')}</tr>`).join('');
  const detail=[
    ['รวมราคาสินค้า',v=>v.prices.every(p=>p!==null)?money(v.prices.reduce((s,p,i)=>s+p*compareItems[i].qty,0)):'เสนอราคาไม่ครบ'],
    ['ค่าขนส่ง',v=>money(v.shipping)],
    ['VAT 7%',v=>v.prices.every(p=>p!==null)?money((v.prices.reduce((s,p,i)=>s+p*compareItems[i].qty,0)+v.shipping)*.07):'—'],
    ['รวมสุทธิ',v=>v.prices.every(p=>p!==null)?money((v.prices.reduce((s,p,i)=>s+p*compareItems[i].qty,0)+v.shipping)*1.07):'เสนอราคาไม่ครบ'],
    ['กำหนดส่ง',v=>E(v.delivery)],
    ['เงื่อนไขชำระเงิน',v=>E(v.payment)],
    ['มาตรฐาน / Remark',v=>E(v.quality)],
    ['หมายเหตุ',v=>E(v.remark)]
  ];
  rows+=detail.map(([label,fn])=>`<tr><th colspan="4">${label}</th>${vendorsV2.map((v,j)=>col(j,'td',fn(v))).join('')}</tr>`).join('');
  rows+=compareConditions.map(c=>`<tr><th colspan="4">${E(c.name)}</th>${vendorsV2.map((v,j)=>col(j,'td',E(c.values[j]||''))).join('')}</tr>`).join('');
  const heading=vendorsV2.map((v,j)=>col(j,'th',E(v.name)+(chosen===j?'<div>✓ SELECTED VENDOR</div>':''))).join('');
  const html=`<!doctype html><html lang="th"><head><meta charset="utf-8">${tableStyle}</head><body>
  <header><img src="${logoV5}" alt="CMANS"><div style="text-align:right"><h1>VENDOR PRICE COMPARISON</h1><small>ใบเปรียบเทียบราคา / CMANS OFFICE HUB</small></div></header>
  <p><b>โครงการ:</b> ${E(project)} &nbsp;&nbsp; <b>เลขที่:</b> ${E(ref)} &nbsp;&nbsp; <b>วันที่:</b> ${E(date)} &nbsp;&nbsp; <b>Package:</b> ${E(pack)}</p>
  <table><thead><tr><th style="width:35px">No.</th><th style="width:170px">Item</th><th style="width:55px">Qty</th><th style="width:55px">Unit</th>${heading}</tr></thead><tbody>${rows}</tbody></table>
  <p><b>ผู้ขายที่ฝ่ายประเมินเลือก:</b> <span class="selected-label-v8">${chosen===null?'ยังไม่ได้เลือก':E(vendorsV2[chosen]?.name||'')}</span></p>
  <p><b>เหตุผลประกอบการพิจารณา:</b> ${E(get('notes'))}</p>
  <div class="sig"><div>Prepared by / ผู้จัดทำ</div><div>Evaluated by / ผู้ประเมิน</div><div>Approved by / ผู้อนุมัติ</div></div>
  </body></html>`;
  showPrintPreviewV5(html,'ใบเปรียบเทียบราคา / เลือกผู้ขายด้วยตนเอง');
};
