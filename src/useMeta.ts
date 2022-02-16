import Store from './Store'
class GlobalMeta extends Store{}
const gmeta = new GlobalMeta
export default (key:string | number, data: object) => gmeta.useMeta(key, data)