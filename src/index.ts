import Store from './core'
import withMemo from './withMemo'
import withStore from './withStore'
import useMeta from './useMeta'
import { noDispatch, dispatch } from './dispatch'
import {STATE} from './core/index'
import {META_STATE} from './core/Meta'


const storeState = () => {
   return {
      STATE,
      META_STATE
   }
}


export {
   Store,
   withMemo,
   withStore,
   useMeta,
   noDispatch,
   dispatch,
   storeState
}
