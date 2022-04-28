import {useMemo, createElement, ComponentType} from 'react'

type Resolver<T> = (props: T) => any[]

const withMemo = <T, >(Comp: ComponentType<T>, resolve?: Resolver<T>) => {
   const Render = (props: any) => {
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