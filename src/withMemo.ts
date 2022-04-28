import {useMemo, createElement, ComponentType} from 'react'

type Resolver = (props: object) => any[]

const withMemo = (Comp: ComponentType, resolve?: Resolver) => {
   const Render = (props?: any) => {
      if(resolve){
         let compare  = resolve(props)
         // eslint-disable-next-line 
         return useMemo(() => createElement(Comp, props), compare)
      }
      return createElement(Comp, props)
   }
   return Render
}

export default withMemo