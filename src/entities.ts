import * as e from "littlejsengine";
import { Player } from "./player";
import { clover } from "./sounds";
import { vec2 } from "littlejsengine";

export class BaseClover extends e.EngineObject {
  constructor(...args) {
    super(...args);
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
    Player.SINGLETON.maxRopeLength += 1;
    clover.play();
    this.destroy();
  }
}

export class Clover4 extends BaseClover {
  private won = false;
  onHit() {
    this.won = true;
    e.setPaused(true);
  }

  render() {
    super.render();
    if (this.won) {
      e.drawText("YOU WIN MOTHERFUCKER", Player.SINGLETON.pos);
    }
  }
}
