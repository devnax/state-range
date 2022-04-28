import {useMemo, useState, useEffect, createElement} from 'react'
import {is_array} from './utils'
import Stack from './core/Stack'

const withStore = (Comp: any, resolve?: Function) => {
  
   return (props?: any) => {
      const [,dispatch] = useState()
      const id = useMemo(() => Stack.create({dispatch}), [])
 
      useEffect(() => {
         Stack.deactiveAll()
         return () => Stack.delete(id)
         // eslint-disable-next-line
      }, [])

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

export default withStore