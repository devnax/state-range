import Store from './Store'
class GlobalMeta extends Store{}
const gmeta = new GlobalMeta
export default (key:string | number, def?: object) => gmeta.useMeta(key, def)