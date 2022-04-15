import Store from './core'
class GlobalMeta extends Store{}
const gmeta = new GlobalMeta()
const useMeta = (key:string | number, def?: object) => gmeta.useMeta(key, def)
export default useMeta