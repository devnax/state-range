import {useMemo, useState, useEffect, createElement} from 'react'
import {uid} from './utils'
import Stock from './Stock'

export default (Comp: any, resolve?: Function) => {
   const token = uid()
   
   return (props?:object) => {
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
         deps      = deps ? {...(props || {}), ...deps} : props
         return useMemo(() => createElement(Comp, deps), Object.values(deps))
      }
      return createElement(Comp, props)
   }
}