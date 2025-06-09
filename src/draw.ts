import { Ctx, Entity } from "./game";

export function draw(ctx: Ctx) {
  ctx.ctx.save();
  ctx.ctx.clearRect(0, 0, ctx.ctx.canvas.width, ctx.ctx.canvas.height);
  drawEntity(ctx.scene, ctx);
  ctx.ctx.restore();
}

function drawEntity(entity: Entity, ctx: Ctx) {
  ctx.ctx.save();
  entity.draw?.(entity, ctx);
  ctx.ctx.translate(entity.x, entity.y);
  for (const c of entity.c ?? []) {
    drawEntity(c, ctx);
  }
  ctx.ctx.restore();
}

export function drawPlayer(entity: Entity, ctx: Ctx) {
  ctx.ctx.fillStyle = "red";
  ctx.ctx.fillRect(entity.x, entity.y, entity.w, entity.h);
}

export function drawRope(entity: Entity, ctx: Ctx) {
  ctx.ctx.strokeStyle = "black";
  ctx.ctx.beginPath();
  ctx.ctx.moveTo(ctx.player.x, ctx.player.y);
  ctx.ctx.lineTo(entity.x, entity.y);
  ctx.ctx.stroke();
}
