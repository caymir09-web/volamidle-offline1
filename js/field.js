/* ======================= BAI LUYEN CONG KIEU JX1 =======================
   Bai quai "di dong" theo nhan vat: luon co FLD_ALIVE con (thuong / tinh anh) quanh nhan vat trong vong FLD_RING,
   moi con chet thi sau FLD_RESPAWN giay la moc lai ngay ven nhan vat (khong con phai di tim cai nao). Nhan vat chay
   xa thi diem goc cua con do duoc keo ve quanh nhan vat (FLD_FOLLOW) nen bai quai luon dinh nhan vat.
   Quai dung / di loanh quanh diem goc; nguoi choi vao tam nhin hoac danh trung thi duoi; bi keo xa diem goc qua
   FLD_LEASH thi quay ve va hoi day mau. Trum ban do co diem co dinh (khong di theo nhan vat), hoi sinh sau FLD_BOSS_RESPAWN.
   Pho ban / thap / thuyen / boss tuan: giu che do theo phong (dgSpawn, towerSpawn). */
'use strict';
const FLD_RESPAWN = 2, FLD_BOSS_RESPAWN = 180, FLD_BOSS_FIRST = 60;   // giay
const FLD_ALIVE = 20, FLD_RING = [120, 260], FLD_GAP = 80, FLD_WANDER = 50, FLD_FOLLOW = 700;
const FLD_AGGRO = 260, FLD_LEASH = 650, FLD_ROUND_KILLS = 24;      // 24 con = 1 vong (nhiem vu "vong luyen cong", doi cap quai)
/* Bai 20 con moc lien tuc thay cho cum 2-4 con / hoi sinh 20s nen phai bu do kho cho bang: moi con danh nhe
   (FLD_DMG) va thuong / roi do giam (FLD_REW, nhan voi DENS_REW) de do kho + nhip len cap giu nguyen.
   ~20 con trong tam (truoc ~4) nen FLD_DMG 0.25 cho sat thuong vao nguoi bang khi xa: 20 x 0.25 x 0.75 ~ 4 x 1.0 */
const FLD_DMG = 0.25, FLD_REW = 0.15;
const fieldMode = () => !R.dg && !R.tower && !R.town && !window.NO_FIELD;   // NO_FIELD: chi de so sanh trong test
const fieldKey = () => `${OBS.key}|${zoneOf(Math.min(S.stage, STAGES)).id}|${S.diff}|${rebornN()}`;

/* vung den cua anh nen (ngoai ban do, vd goc Diem Thuong son): khong dat quai (lay mau anh nen thu nho 1/16) */
const VOIDC = { key: null, d: null };
function voidAt(x, y) {
  const im = R.bgImg; if (!im || !im.complete || !im.naturalWidth) return false;
  if (VOIDC.key !== im.src) { try { const w = Math.ceil(im.naturalWidth / 16), h = Math.ceil(im.naturalHeight / 16), c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h); VOIDC.d = g.getImageData(0, 0, w, h); VOIDC.key = im.src; VOIDC.k = w / WORLD.w; } catch (e) { VOIDC.key = im.src; VOIDC.d = null; } }
  const D = VOIDC.d; if (!D) return false;
  const px = Math.floor(x * VOIDC.k), py = Math.floor(y * VOIDC.k); if (px < 0 || py < 0 || px >= D.width || py >= D.height) return true;
  const i = (py * D.width + px) * 4; return D.data[i] + D.data[i + 1] + D.data[i + 2] < 75;
}
/* diem ngau nhien di duoc (thanh phan lien thong chinh), cach nhau >= gap */
function fieldPoints(n, gap, avoid) {
  const out = [], g = OBS.g;
  for (let tries = 0; tries < n * 60 && out.length < n; tries++) {
    let x, y;
    if (g) { const k = irnd(0, g.gw * g.gh - 1); if (!g.ok[k]) continue; x = (k % g.gw + 0.5) * g.cw; y = (Math.floor(k / g.gw) + 0.5) * g.ch; if (!obsWalk(x, y)) continue; }
    else { x = rnd(150, WORLD.w - 150); y = rnd(150, WORLD.h - 150); }
    if (out.some(p => Math.hypot(p[0] - x, p[1] - y) < gap) || voidAt(x, y)) continue;
    if (avoid && Math.hypot(avoid[0] - x, avoid[1] - y) < 220) continue;
    out.push([x, y]);
  }
  return out;
}
/* cho 1 con moi / doi cho: diem trong vong FLD_RING quanh nhan vat, o di duoc, khong trung cho khac.
   Vong hep bi vuc chan hoac canh ban do -> thu rong dan (gap giam dan); het luot thi bo yeu cau cach nhau
   (gia van dung FLD_ALIVE con, con nao nam sat nhau thi fieldIdle / va cham se day ra). */
function fieldSlot(pts) {
  const g = OBS.g;
  for (let t = 0; t < 160; t++) {
    const a = rnd(0, Math.PI * 2), r = rnd(FLD_RING[0], FLD_RING[1]);
    const x = H.x + Math.cos(a) * r, y = H.y + Math.sin(a) * r;
    if (x < 70 || y < 70 || x > WORLD.w - 70 || y > WORLD.h - 70) continue;            // canh ban do: thu huong khac
    const [wx, wy] = inWorld(x, y);
    if (g && !obsWalk(wx, wy)) continue;
    if (voidAt(wx, wy)) continue;
    const gap = FLD_GAP * (t < 100 ? 1 : t < 135 ? 0.7 : 0.45);                        // het cho -> nen toi da du FLD_ALIVE con
    if (pts.some(p => Math.hypot(p.x - wx, p.y - wy) < gap)) continue;
    return { x: wx, y: wy };
  }
  for (let t = 0; t < 60; t++) {                                                        // gan nhat, chi can o di duoc: luon ra du so con
    const a = rnd(0, Math.PI * 2), r = rnd(40, FLD_RING[0]);
    const x = H.x + Math.cos(a) * r, y = H.y + Math.sin(a) * r;
    if (x < 70 || y < 70 || x > WORLD.w - 70 || y > WORLD.h - 70) continue;
    const [wx, wy] = inWorld(x, y);
    if (g && !obsWalk(wx, wy)) continue;
    if (voidAt(wx, wy)) continue;
    return { x: wx, y: wy };
  }
  return null;
}
function fieldBuild() {
  const z = zoneOf(Math.min(S.stage, STAGES));
  const pts = [];
  // trum ban do: diem co dinh tren ban do, khong di theo nhan vat (dung cho nhiem vu Da Tau / boss vong)
  const bp = fieldPoints(1, 0, [H.x + 700, H.y])[0];
  pts.push({ x: bp ? bp[0] : inWorld(H.x + 700, H.y)[0], y: bp ? bp[1] : inWorld(H.x + 700, H.y)[1], cls: 'boss', tid: z.boss, t: FLD_BOSS_FIRST });
  // FLD_ALIVE con thuong / tinh anh quanh nhan vat, it nhat 4 tinh anh (nhiem vu Da Tau)
  for (let i = 0; i < FLD_ALIVE; i++) { const s = fieldSlot(pts); if (s) pts.push({ x: s.x, y: s.y, cls: 'normal', tid: pick(z.m), t: 0 }); }
  const mi = pts.map((p, i) => i).filter(i => pts[i].cls !== 'boss');                    // it nhat 4 tinh anh
  const eliteC = new Set(); while (eliteC.size < Math.min(4, mi.length)) eliteC.add(mi[irnd(0, mi.length - 1)]);
  for (const i of eliteC) pts[i].cls = 'elite';
  R.field = { key: fieldKey(), pts, kills: 0 };
  R.enemies = R.enemies.filter(e => (e.goldBoss || e.sat || e.satG) && !e.dead);   // giu Trum Hoang Kim, Sat Thu + ho ve khi dung lai bai
  for (const p of R.field.pts) if (p.t <= 0) fieldSpawn(p);
  const zz = z; if (zz.id !== R.zoneShown) { R.zoneShown = zz.id; R.banner = { t: 2.4, text: zz.n, sub: `Cấp ${zz.lo}–${zz.hi}` }; if (typeof onZoneChange === 'function') onZoneChange(zz); }
}
function fieldSpawn(p) {
  const L = stageLevel(S.stage) + (p.cls === 'boss' ? 1 : 0), e = makeEnemy(p.tid, L, p.cls, p.x, p.y);
  if (p.cls !== 'boss') { e.dmg *= FLD_DMG; e.rewK = FLD_REW; }   // 20 con dong: moi con danh nhe + thuong giam de do kho bang
  if (p.cls === 'normal') { e.dens = true; e.dmg *= DENS_DMG; }
  e.home = p; e.aggro = false; e.wT = rnd(0, 3); p.e = e; p.t = 0;
  R.enemies.push(e);
  if (p.cls === 'boss') { e.n = bossName(p.tid, zoneOf(Math.min(S.stage, STAGES)).n); log(`<b class="boss">${esc(e.n)}</b> xuất hiện!`); }
}
/* moi khung: dung lai bai khi doi ban do / cap / bi xoa quai; dem nguoc hoi sinh; keo bai theo nhan vat */
function fieldTick(dt) {
  const f = R.field;
  if (!f || f.key !== fieldKey() || (!R.enemies.length && f.pts.some(p => p.e && !p.e.dead))) { fieldBuild(); return; }
  for (const p of f.pts) {
    if (p.e && p.e.dead) { p.e = null; p.t = p.cls === 'boss' ? FLD_BOSS_RESPAWN : FLD_RESPAWN; }
    if (!p.e && p.cls === 'boss' && p.t > 20) { const T = S.dt && S.dt.task; if (T && T.t === 'boss' && T.tid === p.tid && T.have < T.need) p.t = 20; }   // Da Tau can trum nay: xuat hien sau toi da 20 giay
    if (!p.e && (p.t -= dt) <= 0) {
      if (p.cls !== 'boss') {                                     // con chet: moc lai ngay ven nhan vat, cho moi
        const s = fieldSlot(f.pts); if (!s) { p.t = 1; continue; }
        p.x = s.x; p.y = s.y;
      }
      fieldSpawn(p);
    }
    /* bai "di dong": diem goc bi nhan vat bo lai xa -> chuyen sang cho moi ven nhan vat (keo ca con dang dung cho do) */
    if (p.cls !== 'boss' && Math.hypot(H.x - p.x, H.y - p.y) > FLD_FOLLOW) {
      const s = fieldSlot(f.pts); if (s) { p.x = s.x; p.y = s.y; if (p.e && !p.e.dead) { p.e.x = s.x; p.e.y = s.y; p.e.aggro = false; p.e.backT = 0; p.e.hp = p.e.max; } }
    }
  }
  if (R.enemies.length > 80 || R.enemies.some(e => e.dead)) R.enemies = R.enemies.filter(e => !e.dead);
  if (goldBossDue()) spawnGoldBoss();
}
/* hanh vi quai chua giao chien: dung / di loanh quanh diem goc; thay nguoi thi duoi */
function fieldIdle(e, dt) {
  const p = e.home, d = Math.hypot(H.x - e.x, H.y - e.y);
  if ((e.agT = (e.agT || 0) - dt) <= 0) { e.agT = 0.4; if (d < FLD_AGGRO && R.life > 0 && obsSee(e.x, e.y, H.x, H.y)) e.aggro = true; }
  if (e.aggro) return false;
  if (e.backT > 0) {                                      // dang quay ve diem goc
    e.backT -= dt; e.moving = true; obsSteer(e, p.x, p.y, e.spd * 1.6 * dt);
    if (Math.hypot(p.x - e.x, p.y - e.y) < 12) e.backT = 0;
    return true;
  }
  if ((e.wT -= dt) <= 0) { e.wT = rnd(2, 5); e.wx = p.x + rnd(-FLD_WANDER, FLD_WANDER); e.wy = p.y + rnd(-FLD_WANDER, FLD_WANDER) * 0.6; }
  const wd = e.wx != null ? Math.hypot(e.wx - e.x, e.wy - e.y) : 0;
  e.moving = wd > 4; if (e.moving) { obsMove(e, e.x + (e.wx - e.x) / wd * Math.min(wd, e.spd * 0.4 * dt), e.y + (e.wy - e.y) / wd * Math.min(wd, e.spd * 0.4 * dt)); e.face = e.wx >= e.x ? 1 : -1; e.dir = dirOf(e.wx - e.x, e.wy - e.y); }
  return true;
}
/* bi keo xa diem goc: bo duoi, quay ve, hoi day mau (nhu JX1) */
function fieldLeash(e) {
  const p = e.home; if (!p || !e.aggro || e.cls === 'boss') return;
  if (Math.hypot(p.x - e.x, p.y - e.y) > FLD_LEASH && Math.hypot(H.x - e.x, H.y - e.y) > 160) { e.aggro = false; e.backT = 6; e.hp = e.max; e.poison = 0; e.slowT = 0; }
}
function fieldOnKill() {
  const f = R.field; if (!f || !fieldMode()) return;
  if (++f.kills % FLD_ROUND_KILLS) return;
  R.round = (R.round || 0) + 1; questTick('stages');
  if (typeof onStageChange === 'function') onStageChange();
}
