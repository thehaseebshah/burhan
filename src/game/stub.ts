// Placeholder scenes for chapters 2-7. The structure exists (chapter select, save slots,
// scenes named from their scripts) and each scene can be read through line by line, but
// none of its play is built yet. No figure other than Burhan is shown here, so no pending
// question (how guides, women or animals appear) is decided by a placeholder.
import * as THREE from 'three';
import { mat } from '../core/engine';
import { audio } from '../core/audio';
import { BURHAN, type Ctx, type SceneFn } from './director';
import { terrain } from '../world/props';

const LOOK = {
  islamabad: { top: 0x6f8f9a, bottom: 0xbcc9b8, ground: 0x4f7a48, sun: 0xfff1d6 },
  gilding: { top: 0x8a6a1e, bottom: 0xe6c66a, ground: 0x8a6b3f, sun: 0xffe2a0 },
  vision: { top: 0x1c2738, bottom: 0x6a5a4a, ground: 0x7a6248, sun: 0xffc98a },
};

export const stubScene: SceneFn = async (ctx: Ctx) => {
  const s = ctx.scene, look = LOOK[s.kind];
  ctx.engine.setSky(look.top, look.bottom, 18, 90);
  ctx.engine.setLight(look.bottom, 0x30281c, 1.1, look.sun, 1.4);
  ctx.add(terrain(120, 24, () => 0, () => look.ground, s.kind === 'gilding'));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3 + (i % 3), 0.5), mat(0x8c867a, s.kind === 'gilding'));
    ctx.add(post, Math.sin(a) * 12, post.geometry.parameters.height / 2, Math.cos(a) * 12);
  }
  ctx.world.bounds = { x0: -11, x1: 11, z0: -11, z1: 11 };
  ctx.setPlayer(BURHAN, 0, 2, Math.PI);
  ctx.player.camPitch = 0.2;
  audio.setAmbient(s.kind === 'gilding' ? { hum: 0.5 } : { noise: { freq: 500, gain: 0.05, wobble: 0.5 } });

  ctx.hud.objective(`Placeholder scene, not built yet: ${s.title}`);
  await ctx.fade('#000', 0, 1);
  ctx.hud.title('', `${ctx.chapter.number}.${s.key}  ${s.title}`, s.where, true); ctx.hud.showTitle();
  await ctx.hold(5);
  ctx.hud.clearTitle();

  for (const it of s.items) {
    if (it.type === 'line') await ctx.sayLine(it);
    else if (it.type === 'card') await ctx.card(it.id);
    else if (it.type === 'recitation') {
      // Shown exactly as written. Never altered, never voiced by a machine.
      ctx.hud.caption('Recitation: placeholder until a licensed recording is added');
      ctx.hud.card(it.ur, it.en + (it.ref ? `  (${it.ref})` : ''), 'verse'); ctx.hud.showCard();
      await ctx.hold(9);
      ctx.hud.clearCard(); ctx.hud.caption(null);
    } else if (it.type === 'title') {
      ctx.hud.title('', it.text, it.note, true); ctx.hud.showTitle();
      await ctx.hold(6);
      ctx.hud.clearTitle();
    } else {
      ctx.hud.caption(it.text.length > 150 ? it.text.slice(0, 147) + '…' : it.text);
      await ctx.hold(Math.max(3, it.text.length * 0.045));
      ctx.hud.caption(null);
    }
  }
  await ctx.fade('#000', 1, 1);
};
