import {useMemo, useState, useEffect, createElement} from 'react'
import {is_array, uid} from './utils'
import Stock from './Store/Stock'

export default (Comp: any, resolve?: Function) => {
   const token = uid()
   
   return (props?: any) => {
      Stock.currentToken = token 
      const [, dispatch] = useState('')
      const _compId = useMemo(() => {
         const compId = uid()
         Stock.add(token, compId, {
            compId,
            dispatch: () => dispatch(uid())
         })
         return compId
      }, [])

      useEffect(() => {
         return () => {
            Stock.remove(token, _compId)
         }
      },[])

      if(typeof resolve === 'function'){
         let deps  = resolve(props)
         let compare:any = []
         if(is_array(deps)){
            deps      = props
            compare   = deps
         }else{
            deps      = deps ? deps : props
            compare   = Object.values(deps)
         }
         return useMemo(() => createElement(Comp, deps), compare)
      }
      return createElement(Comp, props)
   }
}