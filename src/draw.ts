import { Ctx } from "./game";
import { Entity } from "./scene";

export function draw(ctx: Ctx) {
  ctx.ctx.save();
  ctx.ctx.clearRect(0, 0, ctx.ctx.canvas.width, ctx.ctx.canvas.height);
  drawEntity(ctx.scene, new DOMMatrix(), ctx);
  ctx.ctx.restore();
}

function drawEntity(entity: Entity, currentTransform: DOMMatrix, ctx: Ctx) {
  ctx.ctx.save();
  const newTransform = currentTransform.multiply(entity.transform);
  ctx.ctx.setTransform(newTransform);
  for (const c of entity.components) {
    ctx.ctx.save();
    c.draw?.(entity, ctx);
    ctx.ctx.restore();
  }
  for (const c of entity.children) {
    drawEntity(c, newTransform, ctx);
  }
  ctx.ctx.restore();
}
