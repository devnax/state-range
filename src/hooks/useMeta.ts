import Store from '../store'
class _globalStoreMeta extends Store{}
const gmeta   = new _globalStoreMeta()
const useMeta = gmeta.useMeta
export default useMeta