import { draw } from "./draw";
import { Ctx } from "./game";
import { keyboardTracker } from "./input";

const WIDTH = 320;
const HEIGHT = 180;
const { cvs } = document.all as unknown as { cvs: HTMLCanvasElement };
cvs.style = `aspect-ratio: ${WIDTH / HEIGHT}`;
cvs.width = WIDTH;
cvs.height = HEIGHT;
const cctx = cvs.getContext("2d")!;

const ctx: Ctx = {
  ctx: cctx,
  input: keyboardTracker(),
  player: { x: 0, y: 0 },
};

requestAnimationFrame(function f() {
  ctx.input.update();

  if (ctx.input.isDown("W")) {
    ctx.player.y -= 1;
  }
  if (ctx.input.isDown("S")) {
    ctx.player.y += 1;
  }
  if (ctx.input.isDown("A")) {
    ctx.player.x -= 1;
  }
  if (ctx.input.isDown("D")) {
    ctx.player.x += 1;
  }

  draw(ctx);
  requestAnimationFrame(f);
});
