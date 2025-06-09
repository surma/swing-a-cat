import { Ctx } from "./game";

export function draw({ ctx, player, input }: Ctx) {
  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, 20, 20);
  ctx.restore();
}
