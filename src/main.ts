import { RectComponent } from "./components/rect";
import { positionComponent, PositionComponent } from "./components/position";
import { draw } from "./draw";
import { Ctx } from "./game";
import { keyboardTracker } from "./input";
import {
  addChildren,
  allEntities,
  Entity,
  getComponent,
  nullEntity,
  remove,
} from "./scene";

const WIDTH = 320;
const HEIGHT = 180;
const { cvs } = document.all as unknown as { cvs: HTMLCanvasElement };
cvs.style = `aspect-ratio: ${WIDTH / HEIGHT}`;
cvs.width = WIDTH;
cvs.height = HEIGHT;
const cctx = cvs.getContext("2d")!;

const player: Entity = {
  children: [],
  components: [
    {
      type: "rect",
      x: -10,
      y: -10,
      w: 20,
      h: 20,
    },
    {
      type: "sprite",
      draw(entity, ctx) {
        const rect = entity.components.find(
          (t) => t.type == "rect",
        ) as RectComponent | null;
        if (!rect) return;
        ctx.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      },
    },
    positionComponent(0, 0),
    {
      type: "keyboard",
      tick(entity, ctx) {
        const pos = getComponent<PositionComponent>(entity, "position");
        if (!pos) return;
        if (ctx.input.isDown("W")) {
          pos.y -= 1;
        }
        if (ctx.input.isDown("S")) {
          pos.y += 1;
        }
        if (ctx.input.isDown("A")) {
          pos.x -= 1;
        }
        if (ctx.input.isDown("D")) {
          pos.x += 1;
        }
      },
    },
  ],
};

const ctx: Ctx = {
  ctx: cctx,
  frameCount: 0,
  input: keyboardTracker(),
  player,
  scene: {
    children: [player],
    components: [positionComponent(120, 120)],
  },
};

requestAnimationFrame(function f() {
  ctx.frameCount++;
  ctx.input.update();

  for (const e of allEntities(ctx.scene)) {
    for (const c of e.components) {
      c.tick?.(e, ctx);
    }
  }

  // if (ctx.input.isDown("Space")) {
  //   ctx.scene.c!.push({
  //     ...ctx.player,
  //     type: "rope",
  //     spawnFrame: ctx.frameCount,
  //     draw: drawRope,
  //     tick(entity, ctx) {
  //       const r = entity as Rope;
  //       const alive = ctx.frameCount - r.spawnFrame;
  //       if (alive > 120) {
  //         remove(entity);
  //       }
  //     },
  //   });
  // }

  draw(ctx);
  requestAnimationFrame(f);
});
