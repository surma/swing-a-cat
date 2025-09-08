import * as e from "littlejsengine";

export function error(msg: string) {
  if (e.debug) throw Error(msg);
}
