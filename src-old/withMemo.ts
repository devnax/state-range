import {useMemo, createElement} from 'react'
import {is_array} from './utils'

const withMemo = (Comp: any, resolve?: Function) => {
   return (props?: any) => {
      if(typeof resolve === 'function'){
         let deps  = resolve(props)
         let compare:any = []
         if(is_array(deps)){
            compare   = deps
         }else{
            deps      = deps ? deps : props
            compare   = Object.values(deps)
         }
         // eslint-disable-next-line 
         return useMemo(() => createElement(Comp, props), compare)
      }
      return createElement(Comp, props)
   }
}

export default withMemo