import {useMemo, createElement, ComponentType} from 'react'

type Resolver<P> = (props: P) => any[]

const withMemo = <T, R extends Resolver<T>>(Comp: ComponentType<T>, resolve?: R) => {
   const Render = <P extends T>(props: P) => {
      if(resolve){
         // eslint-disable-next-line
         return useMemo(() => createElement(Comp, props), resolve(props))
      }
      return createElement(Comp, props)
   }
   return Render
}

export default withMemo