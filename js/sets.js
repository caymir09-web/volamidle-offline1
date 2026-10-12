/* ======================= DO HOANG KIM / BACH KIM (KItemGenerator::Gen_GoldEquipment, KItemList) ======================= */
'use strict';
const GOLD_EXT = 2; // MAX_ITEM_MAGICATTRIB (8) - MAX_ITEM_NORMAL_MAGICATTRIB (6): 2 dong mo rong theo bo
/* gia tri = min + (max - min) * cap_sinh / MAX_ITEM_LUCK (10) */
function geValue(idx, g) {
  const m = J.ge[idx]; if (!m) return null;
  return { a: m.a, p: m.p.map(([lo, hi]) => (lo === -1 && hi === -1 ? -1 : Math.round(lo + (hi - lo) * g / 10))), pre: 1 };
}
const PLAT_TAG = '[Bạch Kim] ';
const bareName = n => String(n || '').replace(/^\[[^\]]*\]\s*/, '');
/* Do Bach Kim luon co tien to trong ten: [Thien Tu] ... hoac [Bach Kim] ... (ban goc nhieu mon Bach Kim trung ten Hoang Kim) */
const platName = n => (/^\[/.test(n) ? n : PLAT_TAG + n);
function makeSetItem(kind, row, luck) {
  const g = () => clamp(irnd(Math.min(10, luck), 10), 0, 10);
  const it = { uid: S.uid++, d: row.d, k: row.k, n: kind === 'platina' ? platName(row.n) : row.n, ic: row.ic || '', lvl: row.lvl, s: row.s, price: row.price,
    base: row.base.map(x => x.slice()), req: kind === 'gold' ? goldReqLevelOne(row.req) : row.req.map(x => x.slice()), r: kind === 'gold' ? 4 : 5,
    set: { kind, grp: row.grp, n1: row.n1 || 99, n2: row.n2 || 99, sid: row.sid } };
  it.mag = row.mag.map(i => geValue(i, g())).filter(Boolean);
  it.ext = row.ext.map(i => geValue(i, g())).filter(Boolean);
  return it;
}
function goldReqLevelOne(req) {
  const out = (req || []).map(x => x.slice()), level = out.find(x => x[0] === 36);
  if (level) level[1] = 1;
  else out.push([36, 1]);
  return out;
}
function setGoldReqLevelOne(it) {
  if (it && it.set && it.set.kind === 'gold') it.req = goldReqLevelOne(it.req);
}
/* ---------- PHIEN BAN CHOI (the Khac, rieng tung nhan vat: S.ver) ----------
   1 So khai: Hoang Kim chung (An Bang, Dinh Quoc, Hiep Cot, Nhu Tinh...) + Hoang Kim mon phai; khong do Tim, khong Bach Kim.
   2 Do Tim: them khaam Huyen Tinh (khoang thach, Huyen Tinh roi ra, hop / khaam / tach).
   3 Lo trinh Hoang Kim (mac dinh, nhu ban hien tai): do bo roi theo lo trinh cap JX1 - Thanh Cau 50 -> Van Loc 80 -> Thuong Lang 100
     -> Tu Mang / Kim O / Bach Ho / Xich Lan / Minh Phuong / Huyen Vien / Tinh Suong / Tong Kim 120 -> Dang Long 180; them Bach Kim.
   Do da co van giu va mac duoc khi doi phien ban; chi thay doi nguon roi / che tao. */
const VER_INFO = {
  1: { n: 'Phiên bản 1 · Sơ khai', d: 'Hoàng Kim chung (An Bang, Định Quốc, Hiệp Cốt, Nhu Tình, Kim Phong, Thiên Hoàng, Động Sát…) và Hoàng Kim môn phái. Không có đồ Tím, không có Bạch Kim.' },
  2: { n: 'Phiên bản 2 · Đồ Tím', d: 'Như phiên bản 1, thêm hệ thống đồ Tím: Huyền Tinh, khoáng thạch rơi ra; hợp, khảm, tách đồ Tím.' },
  3: { n: 'Phiên bản 3 · Lộ trình Hoàng Kim', d: 'Như phiên bản 2, đồ Hoàng Kim rơi theo lộ trình cấp của JX1: Thanh Câu (50) → Vân Lộc (80) → Thương Lang (100) → Tử Mãng, Kim Ô, Bạch Hổ, Xích Lân, Minh Phượng, Huyền Viên, Tinh Sương, Tống Kim (120) → Đằng Long (180); thêm Bạch Kim.' },
};
const gameVer = () => 3;   // chi con phien ban 3 (Lo trinh Hoang Kim + do Tim + Bach Kim); S.ver cu bo qua
const verVio = () => gameVer() >= 2, verPlat = () => gameVer() >= 3;
/* He so Hoang Kim theo lo trinh hien tai */
const GOLD_RARE3 = { drop: 0.05, shard: 0.15, grant: 0.1 };
const goldMul = k => gameVer() >= 3 ? GOLD_RARE3[k] : 1;
const SET_ROUTE = { 'Thanh Câu': [50, 80], 'Vân Lộc': [80, 100], 'Thương Lang': [100, 120], 'Tử Mãng': [120, 180], 'Kim Ô': [120, 180], 'Bạch Hổ': [120, 180], 'Xích Lân': [120, 180],
  'Minh Phượng': [120, 180], 'Huyền Viên': [120, 180], 'Tinh Sương': [120, 180], 'Tống Kim': [120, 999], 'Đằng Long': [180, 999] };
const rowFam = r => r.fam || (r.fam = setFamily({ set: 1, n: r.n, req: r.req }));
/* Bo nay co roi o phien ban hien tai voi quai / nhan vat cap L khong */
function setVerOk(r, L) {
  const f = rowFam(r);
  if (gameVer() < 3) return f === 'Bộ chung' || f === 'Môn phái';
  const rt = SET_ROUTE[f]; return !rt || (L >= rt[0] && L < rt[1]);
}
/* Bo cua mon phai khong co trong game (Hoa Son): khong roi / khong chon */
const setRowOk = r => { const f = (r.req.find(q => q[0] === 39) || [0, -1])[1]; return r.d <= 10 && r.mag.length > 0 && !r.fixed && (f < 0 || FACTIONS.some(x => x.id === f)); };   // bo Phi phong (khong co o trang bi) va bo khong co du lieu JX1 (setfix.js: r.fixed)
/* Roi do bo: giu cong thuc goc; GM.goldDropPct = 100 la he so mac dinh */
function rollSetDrop(e) {
  const chance = setDropChance(e);
  if (Math.random() >= chance) return null;
  const kind = verPlat() && e.L >= 90 && Math.random() < (e.cls === 'boss' ? (e.L >= 120 ? 0.2 : 0.1) : 0.06) ? 'platina' : 'gold';
  const fid = FAC[S.fac] ? FAC[S.fac].id : -1;
  const reqOf = (r, id) => (r.req.find(q => q[0] === id) || [0, -1])[1];
  let pool = J.sets[kind].filter(r => sexReqOk(r.req) && setRowOk(r));
  const mine = pool.filter(r => reqOf(r, 39) === fid);
  if (mine.length && Math.random() < SET_MINE_P) pool = mine;          // v125: uu tien bo phai minh 70% -> 20% (de giao dich doi do)
  if (!pool.length) return null;
  return makeSetItem(kind, pick(pool), R.P ? Math.min(10, Math.floor(R.P.lucky / 10)) : 0);
}
const SET_DROP_K = 0.6, SET_MINE_P = 0.2;
function setDropChance(e) {
  const baseChance = e.cls === 'boss' ? 0.02 + zoneIdx(Math.min(S.stage, STAGES)) * 0.0015 : e.cls === 'elite' ? 0.003 : 0.00015 * densK(e);
  const gmRate = typeof GM !== 'undefined' && Number.isFinite(+GM.goldDropPct) ? clamp(+GM.goldDropPct, 0, 1000) / 100 : 1;
  return baseChance * dropMul() * goldMul('drop') * SET_DROP_K * gmRate;
}
/* IsEnoughToActive: co mot bo dang mac du NeedToActive2 mon -> mo het dong an cua MOI trang bi */
function setCounts(eq) {
  const c = {};
  for (const k in eq) {
    const it = eq[k]; if (!it || !it.set || k === 'horse') continue;
    if (k === 'ring1' && eq.ring2 && eq.ring2.set && eq.ring2.set.grp === it.set.grp && eq.ring2.set.sid === it.set.sid) continue; // 2 nhan giong nhau tinh 1
    c[it.set.grp] = (c[it.set.grp] || 0) + 1;
  }
  return c;
}
function enoughToActive(eq) {
  const c = setCounts(eq);
  for (const k in eq) { const it = eq[k]; if (it && it.set && c[it.set.grp] >= it.set.n2) return true; }
  return false;
}
/* GetGoldEquipEnhance: so dong mo rong = so mon cung bo / NeedToActive1 (du bo hoac ngua: ca 2) */
function goldEnhance(it, eq) {
  const slot = slotOfEquipped(it, eq); if (!slot) return 0;
  if (slot === 'horse' || enoughToActive(eq)) return GOLD_EXT;
  return Math.min(GOLD_EXT, Math.floor((setCounts(eq)[it.set.grp] || 0) / Math.max(1, it.set.n1)));
}
function setMembers(it) { return J.sets[it.set.kind].filter(r => r.grp === it.set.grp); }
