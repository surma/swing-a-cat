import { draw, drawPlayer, drawRope } from "./draw";
import { Ctx, Entity, Rope } from "./game";
import { keyboardTracker } from "./input";
import { allEntities as allChildren, removeFromChildren } from "./scene";

const WIDTH = 320;
const HEIGHT = 180;
const { cvs } = document.all as unknown as { cvs: HTMLCanvasElement };
cvs.style = `aspect-ratio: ${WIDTH / HEIGHT}`;
cvs.width = WIDTH;
cvs.height = HEIGHT;
const cctx = cvs.getContext("2d")!;

const player: Entity = {
  x: 0,
  y: 0,
  w: 20,
  h: 20,
  draw: drawPlayer,
  tick(entity, ctx) {
    if (ctx.input.isDown("W")) {
      entity.y -= 1;
    }
    if (ctx.input.isDown("S")) {
      entity.y += 1;
    }
    if (ctx.input.isDown("A")) {
      entity.x -= 1;
    }
    if (ctx.input.isDown("D")) {
      entity.x += 1;
    }
  },
};

const ctx: Ctx = {
  ctx: cctx,
  frameCount: 0,
  input: keyboardTracker(),
  player,
  scene: {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    c: [player, { x: 80, y: 80, w: 10, h: 10 }],
  },
};

requestAnimationFrame(function f() {
  ctx.frameCount++;
  ctx.input.update();

  for (const e of allChildren(ctx.scene)) {
    e.tick?.(e, ctx);
  }

  if (ctx.input.isDown("Space")) {
    ctx.scene.c!.push({
      ...ctx.player,
      type: "rope",
      spawnFrame: ctx.frameCount,
      draw: drawRope,
      tick(entity, ctx) {
        const r = entity as Rope;
        const alive = ctx.frameCount - r.spawnFrame;
        if (alive > 120) {
          removeFromChildren(entity, ctx.scene);
        }
      },
    });
  }

  draw(ctx);
  requestAnimationFrame(f);
});
