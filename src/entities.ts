import * as e from "littlejsengine";
import { Player } from "./player";
import { clover } from "./sounds";
import { vec2 } from "littlejsengine";
import { FieldInstance } from "../ldtk/ldtk";

export class BaseClover extends e.EngineObject {
  constructor(
    pos: e.Vector2,
    size: e.Vector2,
    private fields: Array<FieldInstance>,
  ) {
    super(pos, size);
    this.mass = 0;
    this.setCollision(true, true, false, false);
  }

  onHit() {}

  update() {
    super.update();
    if (
      Player.SINGLETON &&
      e.isOverlapping(
        this.pos,
        this.size,
        Player.SINGLETON.pos,
        Player.SINGLETON.size,
      )
    ) {
      this.onHit();
    }
  }
}

export class Clover3 extends BaseClover {
  onHit() {
    /* Player.SINGLETON.maxRopeLength += 1; */
    Player.SINGLETON.spawn = this.pos.copy();
    clover.play();
    this.destroy();
  }
}

export class Clover4 extends BaseClover {
  onHit() {
    Player.SINGLETON.maxRopeLength += 1;
    Player.SINGLETON.spawn = this.pos.copy();
    clover.play();
    this.destroy();
  }
}

export class Win extends BaseClover {
  private won = false;
  onHit() {
    this.won = true;
    e.setPaused(true);
  }

  render() {
    super.render();
    if (this.won) {
      e.drawText("YOU SURE SWUNG THAT CAT", Player.SINGLETON.pos);
    }
  }
}

export class Spawn extends e.EngineObject {
  update() {}
  render() {}
}

function fromHex(hex: string): [number, number, number] {
  return hex
    .slice(1)
    .split(/(..)/)
    .filter(Boolean)
    .map((v) => parseInt(v, 16));
}

export class TextTrigger extends e.EngineObject {
  private triggered = false;
  private text: string;
  private color: e.Color;
  private verticalOffset: number;
  private fontSize: number;
  constructor(
    pos: e.Vector2,
    size: e.Vector2,
    private fields: Array<FieldInstance>,
  ) {
    super(pos, size);
    this.mass = 0;
    this.text = fields.find((f) => f.__identifier == "text")?.__value;
    const hexColor = fields.find((f) => f.__identifier == "textColor")?.__value;
    this.color = new e.Color(...fromHex(hexColor));
    this.fontSize = fields.find((f) => f.__identifier == "fontSize")?.__value;
    this.verticalOffset = fields.find(
      (f) => f.__identifier == "verticalOffset",
    )?.__value;
  }

  onHit() {
    this.triggered = true;
  }

  update() {
    if (
      Player.SINGLETON &&
      e.isOverlapping(
        this.pos,
        this.size,
        Player.SINGLETON.pos,
        Player.SINGLETON.size,
      )
    ) {
      this.onHit();
    }
  }

  render() {
    if (this.triggered) {
      e.drawText(
        this.text,
        this.pos.add(vec2(0, this.verticalOffset)),
        this.fontSize,
        this.color,
      );
    }
  }
}
