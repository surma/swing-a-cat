import { Component } from "../scene";

export interface RectComponent extends Component {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
}
