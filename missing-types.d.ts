declare module "*.ldtk" {
  declare const x: import("./ldtk/ldtk.ts").LdtkFile;
  export default x;
}
