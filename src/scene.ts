import { Ctx } from "./game";

export interface Entity {
  components: Component[];
  transform?: DOMMatrix;
  children: Entity[];
  parent?: Entity;
}

export interface Component {
  type: string;
  draw?(entity: Entity, ctx: Ctx): void;
  tick?(entity: Entity, ctx: Ctx): void;
  [x: string]: any;
}

export function remove(entity: Entity) {
  if (!entity.parent) return;
  if (!Array.isArray(entity.parent.children)) return;
  const c = entity.parent.children;
  const idx = c.indexOf(entity);
  if (idx === -1) return;
  c.splice(idx, 1);
}

export function* allEntities(entity: Entity): Generator<Entity> {
  yield entity;
  for (const c of entity.children ?? []) {
    yield* allEntities(c);
  }
}

export function addChildren(parent: Entity, ...entities: Entity[]) {
  if (!Array.isArray(parent.children)) parent.children = [];
  for (const e of entities) {
    parent.children.push(e);
    e.parent = parent;
  }
  return parent;
}

export function nullEntity(): Entity {
  return {
    children: [],
    components: [],
  };
}

export function getComponent<T = unknown>(
  entity: Entity,
  name: string,
): T | null {
  return entity.components.find((t) => t.type == name) as T | null;
}
