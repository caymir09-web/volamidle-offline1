/* ======================= BANG GM (ban offline) =======================
   Cong tool cho ban sao chay offline: them cap / tai nguyen / mo khoa ba do /
   nang vo cong / cap do trang bi / cheats (bat tu, mot don).
   Mo bang: nut [GM] tren thanh tren hoac phim F9. */
'use strict';

const GM = { open: false, god: false, oneHit: false, noDmg: false, lv: 0, goldFamily: 'Kim Ô', weaponFamily: 'Môn phái', weaponKind: 'gold', weaponFaction: '', weaponTier10: '0:0', goldDropPct: 100 };
const GM_BIG = 1e12;                                   // tran "MAX" cho tien/te
const gmOk = () => (typeof S !== 'undefined' && S && S.fac) || (toast('Chưa có nhân vật — hãy tạo nhân vật trước'), false);
const gmCap = () => (typeof levelCap === 'function' ? levelCap() : 200);

/* Moi thay doi deu qua day: tinh lai chi so -> ve lai UI -> luu game -> ve lai bang GM */
function gmAfter(msg) {
  if (typeof recalc === 'function' && typeof R !== 'undefined' && R) {
    R.dirty = true; recalc();
    if (R.P) { R.life = R.P.life; R.mana = R.P.mana; }
  }
  if (typeof autoEquipAll === 'function') { try { autoEquipAll(); } catch (e) { /* loi trang bi: bo qua */ } }
  if (typeof refresh === 'function') refresh();
  if (typeof renderPad === 'function') renderPad();
  if (typeof save === 'function') save();
  if (msg) log('<b class="up">[GM]</b> ' + msg);
  if (GM.open) gmPanel();
}

/* ---------- cap do ---------- */
function gmSetLv(v) {
  if (!gmOk()) return;
  const cap = gmCap(), old = S.lvl | 0;
  v = clamp(Math.floor(+v) || 1, 1, cap);
  GM.lv = v;
  if (v === old) return gmAfter('Đã ở cấp ' + old);
  const d = v - old;
  if (d > 0) { S.attrPts += d * PTS_PER_LEVEL; S.skPts += d * SKILL_PTS_PER_LEVEL; }
  S.lvl = v; S.xp = 0;
  gmAfter(d > 0
    ? `Lên cấp <b>${v}</b> · +${d * PTS_PER_LEVEL} tiềm năng · +${d * SKILL_PTS_PER_LEVEL} kỹ năng`
    : `Hạ xuống cấp <b>${v}</b> (giữ nguyên điểm đã có)`);
  if (d > 0 && typeof autoMapCheck === 'function') { try { autoMapCheck(); } catch (e) { /* loi doi ba do: bo qua */ } }
}
function gmMaxLv() { gmSetLv(gmCap()); }
function gmLvStep(d) { if (gmOk()) gmSetLv((S.lvl | 0) + d); }

/* ---------- tai nguyen ---------- */
function gmGold(n) { if (!gmOk()) return; S.gold = Math.min(GM_BIG, (S.gold || 0) + n); gmAfter(`+${fmt(n)} ngân lượng`); }
function gmGoldMax() { if (!gmOk()) return; S.gold = GM_BIG; gmAfter('Ngân lượng = MAX'); }
function gmKnb(n) { if (!gmOk()) return; S.knb = Math.min(GM_BIG, (S.knb || 0) + n); gmAfter(`+${fmt(n)} Kim Nguyên Bảo`); }
function gmKnbMax() { if (!gmOk()) return; S.knb = 1e6; gmAfter('Kim Nguyên Bảo = 1.000.000'); }
function gmAttr(n) { if (!gmOk()) return; S.attrPts += n; gmAfter(`+${fmt(n)} điểm tiềm năng`); }
function gmSk(n) { if (!gmOk()) return; S.skPts += n; gmAfter(`+${fmt(n)} điểm kỹ năng`); }
function gmPtsMax() { if (!gmOk()) return; S.attrPts = 999999; S.skPts = 999999; gmAfter('MAX điểm tiềm năng + kỹ năng'); }
function gmHpFull() { if (!gmOk() || !R || !R.P) return; R.life = R.P.life; R.mana = R.P.mana; gmAfter('Hồi đầy máu / nội lực'); }

/* ---------- ban do ---------- */
function gmUnlockMaps() { if (!gmOk()) return; S.maxStage = STAGES; gmAfter(`Mở khoá toàn bộ <b>${STAGES}</b> bãi luyện công`); }
function gmGotoLast() {
  if (!gmOk()) return;
  S.maxStage = STAGES; S.stage = STAGES;
  gmAfter(`Chuyển thẳng tới bãi cuối: <b>${esc(zoneOf(STAGES).n)}</b>`);
  if (typeof onZoneChange === 'function') onZoneChange(zoneOf(STAGES));
}

/* ---------- vo cong ---------- */
function gmMaxSkills(all) {
  if (!gmOk()) return;
  let n = 0;
  for (const id in SK) {
    const s = SK[id]; if (!s) continue;
    const cap = typeof skCap === 'function' ? skCap(s) : 0;
    if (cap <= 0) continue;                                   // chua du cap nhan vat de hoc
    if (!all && !(S.sk[id] > 0)) continue;                   // chi nang nhung chiêu da hoc
    if (s.book && typeof bookOk === 'function') (S.bkOk || (S.bkOk = {}))[id] = 1;   // coi nhu da co Mat Tich
    if (s.tier === 90 && !(typeof isBr90 === 'function' && isBr90(s.id))) {
      const trained = S.skL && S.skL[id];
      S.sk[id] = trained ? clamp(trained.lv, 1, s.max) : Math.max(1, S.sk[id] || 0);
      n++;
      continue;
    }
    S.sk[id] = cap; n++;
  }
  if (typeof fillSlots === 'function') fillSlots();
  gmAfter(`Nâng <b>${n}</b> võ công lên cấp tối đa (${all ? 'cả chiêu đã học lẫn toàn bộ chiêu' : 'chỉ chiêu đã học'})`);
}
function gmGetFactionSkill() {
  if (!gmOk()) return;
  const faction = FAC[S.fac];
  if (!faction || faction.novice) { toast('Cần gia nhập môn phái trước'); return; }
  const skill = faction.skills.map(id => SK[id])
    .filter(s => s && s.id !== faction.starter && s.req === 9 && s.enemy && isAttack(s))
    .sort((a, b) => a.id - b.id)[0];
  if (!skill) { toast('Không tìm thấy kỹ năng cấp 9 của môn phái này'); return; }
  if (S.sk[skill.id] > 0) { toast(`Đã có kỹ năng ${skill.n}`); return; }
  S.sk[skill.id] = 1;
  if (skill.book) (S.bkOk || (S.bkOk = {}))[skill.id] = 1;
  if (typeof fillSlots === 'function') fillSlots();
  R.dirty = true;
  recalc();
  if (R.P) { R.life = Math.min(R.life, R.P.life); R.mana = Math.min(R.mana, R.P.mana); }
  refresh();
  renderPad();
  save();
  log(`<b class="up">[GM]</b> Nhận kỹ năng cấp 9 môn phái: <b>${esc(skill.n)}</b> cấp 1`);
  if (GM.open) gmPanel();
}

/* ---------- trang bi ---------- */
function gmEnhanceEquipped() {
  if (!gmOk()) return;
  const equipped = [...new Set(Object.values(S.eq).filter(Boolean))];
  if (!equipped.length) { toast('Chưa có trang bị đang mặc'); return; }
  let skipped = 0, completed = 0, attempts = 0, spent = 0;
  for (const it of equipped) {
    if ((it.enh || 0) >= ENH_MAX) { skipped++; continue; }
    const result = enhanceTo(it, ENH_MAX, S.gold);
    attempts += result.tries;
    spent += result.spent;
    if ((it.enh || 0) >= ENH_MAX) completed++;
  }
  const changed = attempts > 0;
  if (changed) {
    R.dirty = true;
    recalc();
    if (R.P) { R.life = Math.min(R.life, R.P.life); R.mana = Math.min(R.mana, R.P.mana); }
    refresh();
    renderPad();
    save();
  }
  const unfinished = equipped.length - skipped - completed;
  const msg = `Cường hóa trang bị đang mặc lên +${ENH_MAX}: ${completed} đạt mục tiêu · ${skipped} bỏ qua · ${unfinished} chưa đạt mục tiêu · ${attempts} lần thử, −${fmt(spent)} lượng`;
  log('<b class="up">[GM]</b> ' + msg);
  toast(`Cường hóa GM: ${completed} đạt +${ENH_MAX} · ${skipped} bỏ qua · ${unfinished} chưa đạt`);
  if (GM.open) gmPanel();
}
function gmGoldSet() {
  if (!gmOk()) return;
  const family = GM.goldFamily, fid = FAC[S.fac] ? FAC[S.fac].id : -1;
  const groups = new Map();
  for (const row of J.sets.gold) {
    if (setFamily({ set: 1, n: row.n, req: row.req }) !== family || !setRowOk(row) || !sexReqOk(row.req)) continue;
    const faction = (row.req.find(q => q[0] === 39) || [0, -1])[1];
    if (faction >= 0 && faction !== fid) continue;
    if (!groups.has(row.grp)) groups.set(row.grp, []);
    groups.get(row.grp).push(row);
  }
  const complete = [];
  for (const rows of groups.values()) {
    const byPiece = new Map();
    for (const row of rows) {
      const key = `${row.sid}:${row.d}`;
      const piece = byPiece.get(key) || [];
      piece.push(row);
      byPiece.set(key, piece);
    }
    const items = [...byPiece.values()].map(piece => piece.find(row => ((row.req.find(q => q[0] === 39) || [0, -1])[1]) === fid) ||
      piece.find(row => ((row.req.find(q => q[0] === 39) || [0, -1])[1]) < 0)).filter(Boolean);
    const need = Math.max(1, ...items.map(row => row.n2 || 1));
    if (items.length >= need) complete.push(items);
  }
  if (!complete.length) { toast(`Không có bộ ${esc(family)} đầy đủ phù hợp nhân vật này`); return; }
  const rows = pick(complete), b0 = S.inv.length, e0 = typeof epBox === 'function' ? epBox().length : 0;
  let got = 0;
  for (const row of rows) if (addItem(makeSetItem('gold', row, 10), true, true, true)) got++;
  const dInv = S.inv.length - b0, dEp = (typeof epBox === 'function' ? epBox().length : 0) - e0;
  gmAfter(`Cấp bộ Hoàng Kim <b>${esc(family)}</b> · ${got}/${rows.length} món · hành trang +${dInv} · Rương ép +${dEp}`);
}
function gmGetWeapon() {
  if (!gmOk()) return;
  const faction = FACTIONS.find(f => f.key === (GM.weaponFaction || S.fac));
  if (!faction || !facAllowed(faction, S.sex)) { toast('Phái đã chọn không phù hợp nhân vật'); return; }
  const kind = GM.weaponKind === 'platina' ? 'platina' : 'gold';
  const family = GM.weaponFamily;
  const rows = J.sets[kind].filter(row => {
    const reqFaction = (row.req.find(q => q[0] === 39) || [0, -1])[1];
    return row.d <= 1 && setRowOk(row) && sexReqOk(row.req) &&
      setFamily({ set: 1, n: row.n, req: row.req }) === family &&
      (reqFaction < 0 || reqFaction === faction.id) &&
      weaponCode({ weapon: { d: row.d, k: row.k } }) === faction.wcode;
  });
  if (!rows.length) { toast(`Không có vũ khí ${kind === 'gold' ? 'Hoàng Kim' : 'Bạch Kim'} bộ ${esc(family)} cho ${esc(faction.n)}`); return; }
  const row = pick(rows), item = makeSetItem(kind, row, 10);
  if (!addItem(item, true, true, true, true)) { toast('Không thể thêm vũ khí vào hành trang'); return; }
  R.dirty = true;
  recalc();
  if (R.P) { R.life = Math.min(R.life, R.P.life); R.mana = Math.min(R.mana, R.P.mana); }
  refresh();
  renderPad();
  save();
  log(`<b class="up">[GM]</b> Nhận vũ khí ${kind === 'gold' ? 'Hoàng Kim' : 'Bạch Kim'} · bộ <b>${esc(family)}</b> · ${esc(faction.n)}: <span style="color:${RAR_COL[item.r]}">${esc(item.n)}</span>`);
  if (GM.open) gmPanel();
}
function gmGetWeaponTier10() {
  if (!gmOk()) return;
  const [detail, particular] = GM.weaponTier10.split(':').map(Number);
  const row = J.items[detail] && J.items[detail].list.find(item => item.k === particular && item.lvl === 10);
  if (!row) { toast('Không tìm thấy loại vũ khí cấp 10 đã chọn'); return; }
  const item = makeItem(detail, particular, 10, 0);
  if (!item) { toast('Không thể tạo vũ khí cấp 10 đã chọn'); return; }
  if (!addItem(item, true, true, true, true)) { toast('Không thể thêm vũ khí vào hành trang'); return; }
  R.dirty = true;
  recalc();
  if (R.P) { R.life = Math.min(R.life, R.P.life); R.mana = Math.min(R.mana, R.P.mana); }
  refresh();
  renderPad();
  save();
  log(`<b class="up">[GM]</b> Nhận vũ khí cấp 10: <span style="color:${RAR_COL[item.r]}">${esc(item.n)}</span>`);
  if (GM.open) gmPanel();
}
function gmSetGoldDropPct(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate)) { toast('Nhập hệ số rơi từ 0 đến 1000%'); return; }
  GM.goldDropPct = clamp(rate, 0, 1000);
  gmSaveCheat();
  if (typeof save === 'function') save();
  log(`<b class="up">[GM]</b> Tỷ lệ rơi Hoàng Kim: <b>${GM.goldDropPct}% so với gốc</b>`);
  if (GM.open) gmPanel();
}
function gmEquipBest() { if (!gmOk()) return; gmAfter('Tự trang bị đồ tốt nhất trong túi'); }
function gmHuyenTinh() {
  if (!gmOk()) return;
  const lv = typeof HT_MAX !== 'undefined' ? HT_MAX : 30;
  matAdd('ht', lv, 1); gmAfter(`+1 Huyền Tinh Khoáng Thạch cấp ${lv}`);
}

/* ---------- cheats ---------- */
const GM_KEY = 'jxidle_gm';
const gmSaveCheat = () => { try { localStorage.setItem(GM_KEY, JSON.stringify({ god: GM.god, oneHit: GM.oneHit, noDmg: GM.noDmg, goldDropPct: GM.goldDropPct })); } catch (e) { /* che do rieng tu */ } };
const gmLoadCheat = () => { try { const o = JSON.parse(localStorage.getItem(GM_KEY) || '{}'); GM.god = !!o.god; GM.oneHit = !!o.oneHit; GM.noDmg = !!o.noDmg; GM.goldDropPct = Number.isFinite(+o.goldDropPct) ? clamp(+o.goldDropPct, 0, 1000) : 100; } catch (e) { /* bo qua */ } };
function gmToggle(k, name) {
  GM[k] = !GM[k];
  gmSaveCheat();
  log(`<b class="up">[GM]</b> ${name}: <b>${GM[k] ? 'BẬT' : 'TẮT'}</b>`);
  if (GM.open) gmPanel();
}
function gmTick() {
  if (!GM.god && !GM.oneHit && !GM.noDmg) return;
  if (typeof S === 'undefined' || !S || !S.fac || typeof R === 'undefined' || !R) return;
  if (GM.god && R.P) { R.life = R.P.life; R.mana = R.P.mana; }
  if (R.enemies) for (const e of R.enemies) {
    if (e.dead) continue;
    if (GM.oneHit && e.hp > 1) e.hp = 1;
    if (GM.noDmg && e.dmg) e.dmg = 0;
  }
}
setInterval(gmTick, 100);

/* ---------- he thong ---------- */
function gmSkipTut() { if (!gmOk()) return; S.tut = 99; gmAfter('Đã bỏ qua hướng dẫn'); }
function gmCharMenu() { closeModal(true); GM.open = false; switchCharacter(); }

/* ---------- bang dieu khien ---------- */
const GM_ACT = {
  setlv: () => gmSetLv(($('#gmLv') || {}).value),
  lv1: () => gmLvStep(1), lv10: () => gmLvStep(10), maxlv: gmMaxLv,
  gold1: () => gmGold(1e6), gold2: () => gmGold(1e8), goldmax: gmGoldMax,
  knb1: () => gmKnb(100), knbmax: gmKnbMax,
  attr1: () => gmAttr(1000), sk1: () => gmSk(1000), ptsmax: gmPtsMax, hp: gmHpFull,
  maps: gmUnlockMaps, last: gmGotoLast,
  skmax: () => gmMaxSkills(false), skall: () => gmMaxSkills(true), skfac: gmGetFactionSkill,
  it10: gmEnhanceEquipped, goldset: gmGoldSet, weapon: gmGetWeapon, weapon10: gmGetWeaponTier10, equip: gmEquipBest, ht: gmHuyenTinh,
  golddrop: () => gmSetGoldDropPct(($('#gmGoldDropPct') || {}).value),
  god: () => gmToggle('god', 'Bất tử'), onehit: () => gmToggle('oneHit', 'Một đòn hạ'), nodmg: () => gmToggle('noDmg', 'Quái không gây sát thương'),
  tut: gmSkipTut, chrmenu: gmCharMenu, close: () => { closeModal(true); GM.open = false; }
};

function gmPanel() {
  GM.open = true;
  const cap = gmCap(), has = (typeof S !== 'undefined' && S && S.fac);
  const weaponFactions = has ? FACTIONS.filter(f => facAllowed(f, S.sex)) : FACTIONS;
  const weaponFaction = weaponFactions.some(f => f.key === GM.weaponFaction) ? GM.weaponFaction :
    weaponFactions.some(f => f.key === (S && S.fac)) ? S.fac : weaponFactions[0]?.key;
  const weaponTypeLabels = { '0:0': 'Kiếm', '0:1': 'Đao', '0:2': 'Bổng (Côn)', '0:3': 'Kích (Thương)', '0:4': 'Chùy', '0:5': 'Song đao', '0:6': 'Triền thủ' };
  const weaponTier10 = [0, 1].flatMap(d => (J.items[d] ? J.items[d].list : [])
    .filter(item => item.lvl === 10)
    .map(item => ({ value: `${d}:${item.k}`, label: `${weaponTypeLabels[`${d}:${item.k}`] || 'Ám khí'} · ${item.n}` })));
  const weaponTier10Value = weaponTier10.some(item => item.value === GM.weaponTier10) ? GM.weaponTier10 : weaponTier10[0]?.value || '';
  const tag = (k, n) => `<span class="gm-tag ${GM[k] ? 'on' : 'off'}">${esc(n)}: ${GM[k] ? 'BẬT' : 'TẮT'}</span>`;
  const info = has ? `<div class="card stats gm-info">
      <span>Nhân vật</span><b>${esc(S.name || '—')}</b><span>Cấp</span><b>${S.lvl} / ${cap}</b>
      <span>Ngân lượng</span><b>${fmt(S.gold)}</b><span>Kim N.Bảo</span><b>${fmt(S.knb || 0)}</b>
      <span>Bãi</span><b>${S.stage} / ${STAGES}</b><span>Điểm t/n · k/n</span><b>${fmt(S.attrPts)} · ${fmt(S.skPts)}</b>
      <span>Túi</span><b>${(S.inv || []).length} món</b><span>Võ công</span><b>${Object.keys(S.sk || {}).length} chiêu</b>
    </div>` : `<div class="card dim">Chưa có nhân vật — hãy tạo nhân vật trước khi dùng các nút GM.</div>`;
  const row = (label, btns) => `<div class="gm-sec"><label>${label}</label><div class="gm-row">${btns}</div></div>`;
  const html = `<h3>Bảng GM <small class="dim">bản offline · F9</small></h3>${info}
    ${row('Cấp độ', `<input class="gm-in" id="gmLv" type="number" min="1" max="${cap}" value="${GM.lv || (has ? S.lvl : 1)}">
      <button class="btn sm" data-gm="setlv">Đặt cấp</button>
      <button class="btn sm" data-gm="lv1">+1</button>
      <button class="btn sm" data-gm="lv10">+10</button>
      <button class="btn sm gold" data-gm="maxlv">★ MAX CẤP ${cap}</button>`)}
    ${row('Tài nguyên', `<button class="btn sm" data-gm="gold1">+1 triệu lượng</button>
      <button class="btn sm" data-gm="gold2">+100 triệu</button>
      <button class="btn sm" data-gm="goldmax">MAX lượng</button>
      <button class="btn sm" data-gm="knb1">+100 KNB</button>
      <button class="btn sm" data-gm="knbmax">MAX KNB</button>`)}
    ${row('Điểm tiềm năng · kỹ năng', `<button class="btn sm" data-gm="attr1">+1000 t/n</button>
      <button class="btn sm" data-gm="sk1">+1000 k/n</button>
      <button class="btn sm gold" data-gm="ptsmax">MAX điểm</button>
      <button class="btn sm" data-gm="hp">Hồi đầy máu</button>`)}
    ${row('Bản đồ', `<button class="btn sm" data-gm="maps">Mở khoá tất cả bãi</button>
      <button class="btn sm" data-gm="last">Nhảy tới bãi cuối</button>`)}
    ${row('Võ công', `<button class="btn sm" data-gm="skmax">MAX chiêu đã học</button>
      <button class="btn sm gold" data-gm="skfac">Nhận kỹ năng môn phái cấp 9 · cấp 1</button>
      <button class="btn sm gold" data-gm="skall">MAX tất cả võ công</button>`)}
    ${row('Trang bị', `<button class="btn sm" data-gm="it10">Cường hóa đồ đang mặc lên +10</button>
      <select class="gm-in" id="gmGoldFamily" aria-label="Chọn bộ Hoàng Kim">${SET_FAMILIES.map(([name]) => `<option value="${esc(name)}" ${GM.goldFamily === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>
      <button class="btn sm gold" data-gm="goldset">Cấp trọn bộ Hoàng Kim</button>
      <select class="gm-in gm-select" id="gmWeaponFaction" aria-label="Chọn phái">${weaponFactions.map(f => `<option value="${esc(f.key)}" ${weaponFaction === f.key ? 'selected' : ''}>${esc(f.n)}</option>`).join('')}</select>
      <select class="gm-in gm-select" id="gmWeaponFamily" aria-label="Chọn bộ vũ khí">${SET_FAMILIES.map(([name]) => `<option value="${esc(name)}" ${GM.weaponFamily === name ? 'selected' : ''}>${name === 'Môn phái' || name === 'Bộ chung' ? name : 'Bộ ' + name}</option>`).join('')}</select>
      <select class="gm-in gm-select" id="gmWeaponKind" aria-label="Chọn phẩm chất vũ khí"><option value="gold" ${GM.weaponKind === 'gold' ? 'selected' : ''}>Hoàng Kim</option><option value="platina" ${GM.weaponKind === 'platina' ? 'selected' : ''}>Bạch Kim</option></select>
      <button class="btn sm gold" data-gm="weapon">Lấy vũ khí theo phái</button>
      <select class="gm-in gm-select" id="gmWeaponTier10" aria-label="Chọn loại vũ khí cấp 10">${weaponTier10.map(item => `<option value="${esc(item.value)}" ${weaponTier10Value === item.value ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select>
      <button class="btn sm gold" data-gm="weapon10">Lấy vũ khí cấp 10</button>
      <button class="btn sm" data-gm="equip">Mặc đồ tốt nhất</button>
      <button class="btn sm" data-gm="ht">+1 Huyền Tinh</button>`)}
    ${row('Tỷ lệ rơi Hoàng Kim (% so với gốc)', `<input class="gm-in" id="gmGoldDropPct" type="number" min="0" max="1000" step="10" value="${GM.goldDropPct}">
      <button class="btn sm gold" data-gm="golddrop">Áp dụng</button>
      <span class="dim">100% = tỷ lệ gốc · 0–1000%</span>`)}
    ${row('Cheat', `<button class="btn sm" data-gm="god">Bất tử</button>
      <button class="btn sm" data-gm="onehit">Một đòn hạ</button>
      <button class="btn sm" data-gm="nodmg">Quái không đánh</button>
      <span style="display:flex;gap:4px;flex-wrap:wrap">${tag('god', 'Bất tử')}${tag('oneHit', '1 đòn')}${tag('noDmg', 'Không ST')}</span>`)}
    ${row('Hệ thống', `<button class="btn sm" data-gm="tut">Bỏ qua hướng dẫn</button>
      <button class="btn sm" data-gm="chrmenu">Đổi / tạo nhân vật</button>
      <button class="btn sm" data-gm="close">Đóng</button>`)}
    <div class="gm-hint">Mọi thay đổi được lưu thẳng vào file lưu của nhân vật hiện tại. Bấm <b>F9</b> để mở lại bảng này.</div>`;
  modal(html, () => {
    document.querySelectorAll('#mBody [data-gm]').forEach(b => b.onclick = () => { const f = GM_ACT[b.dataset.gm]; if (f) f(); });
    const inp = $('#gmLv'); if (inp) inp.oninput = () => { GM.lv = +inp.value || 0; };
    const family = $('#gmGoldFamily'); if (family) family.onchange = () => { GM.goldFamily = family.value; };
    const weaponFaction = $('#gmWeaponFaction'); if (weaponFaction) weaponFaction.onchange = () => { GM.weaponFaction = weaponFaction.value; };
    const weaponFamily = $('#gmWeaponFamily'); if (weaponFamily) weaponFamily.onchange = () => { GM.weaponFamily = weaponFamily.value; };
    const weaponKind = $('#gmWeaponKind'); if (weaponKind) weaponKind.onchange = () => { GM.weaponKind = weaponKind.value; };
    const weaponTier10 = $('#gmWeaponTier10'); if (weaponTier10) weaponTier10.onchange = () => { GM.weaponTier10 = weaponTier10.value; };
    const goldDropPct = $('#gmGoldDropPct'); if (goldDropPct) goldDropPct.onkeydown = event => { if (event.key === 'Enter') gmSetGoldDropPct(goldDropPct.value); };
  });
}

/* Nut GM — dat o 2 noi de luon thay:
   1) #top      : khi man hinh doc (dien thoai) — thanh tren cung duoc hien
   2) #u20menu  : khi man hinh ngang (co dien 2.0) — thanh tren bi an bang CSS */
function gmMount() {
  const top = document.getElementById('top'), cb = document.getElementById('compactBtn');
  if (top && cb && !document.getElementById('gmBtn')) {
    const b = document.createElement('button');
    b.id = 'gmBtn'; b.type = 'button'; b.title = 'Bảng GM (F9)';
    b.innerHTML = '<i>🛠</i><b>GM</b>';
    b.onclick = () => gmPanel();
    cb.parentNode.insertBefore(b, cb);
  }
  const menu = document.getElementById('u20menu');
  if (menu && !document.getElementById('gmBtnI')) {
    const b = document.createElement('button');
    b.id = 'gmBtnI'; b.type = 'button'; b.className = 'gm-mi'; b.title = 'Bảng GM (F9)'; b.textContent = '🛠';
    b.onclick = () => gmPanel();
    menu.appendChild(b);
  }
  return !!(document.getElementById('gmBtn') && document.getElementById('gmBtnI'));
}
/* u20Init() tao #u20menu sau ~300ms nen phai cho mot khoang cho no xuat hien */
function gmMountLoop(n) { if (gmMount() || n <= 0) return; setTimeout(() => gmMountLoop(n - 1), 400); }
document.addEventListener('keydown', e => {
  if (e.key === 'F9' && !e.ctrlKey && !e.altKey) { e.preventDefault(); gmPanel(); }
}, true);
gmLoadCheat();
gmMountLoop(40);
window.addEventListener('load', () => gmMountLoop(10));
