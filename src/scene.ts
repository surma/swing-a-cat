import { Entity } from "./game";

export function removeFromChildren(entity: Entity, container: Entity) {
  if (!Array.isArray(container.c)) return;
  const idx = container.c.indexOf(entity);
  if (idx === -1) return;
  container.c.splice(idx, 1);
}

export function* allEntities(entity: Entity): Generator<Entity> {
  yield entity;
  for (const c of entity.c ?? []) {
    yield* allEntities(c);
  }
}
