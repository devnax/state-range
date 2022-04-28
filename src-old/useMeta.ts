import Store from './core'
class GlobalMeta extends Store{}
const gmeta = new GlobalMeta()
const useMeta = (key:string, def?: any) => gmeta.useMeta(key, def)
export default useMeta