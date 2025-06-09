export interface KeyboardTracker {
  isDown(key: string): boolean;
  isJustDown(key: string): boolean;
  update(): void;
}

const enum KeyEvent {
  UP,
  DOWN,
}

export function keyboardTracker(): KeyboardTracker {
  let currentKeys = new Set();
  let previousKeys = new Set();
  let pendingKeys: [string, KeyEvent][] = [];

  addEventListener("keydown", (ev) => {
    pendingKeys.push([ev.key.toUpperCase(), KeyEvent.DOWN]);
  });
  addEventListener("keyup", (ev) => {
    pendingKeys.push([ev.key.toUpperCase(), KeyEvent.UP]);
  });

  function isDown(key) {
    return currentKeys.has(key);
  }

  function isJustDown(key) {
    return currentKeys.has(key) && !previousKeys.has(key);
  }

  function update() {
    previousKeys = new Set(currentKeys);
    for (const [key, dir] of pendingKeys) {
      if (dir == KeyEvent.DOWN) {
        currentKeys.add(key);
      } else if (dir == KeyEvent.UP) {
        currentKeys.delete(key);
      }
    }
    pendingKeys = [];
  }

  return {
    isDown,
    isJustDown,
    update,
  };
}
