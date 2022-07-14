import {ComponentType, createElement, useId, useMemo, useState} from 'react'
import RootEle from './RootEle'

type Resolver<T> = (props: T) => any[]

const withStore = <T, R extends Resolver<T>>(Comp: ComponentType<T>, resolve?: R) => {
   
   const Render = <P extends T>(props: P) => {
      const id           = useId().replace(/:/gi, '')
      const [, dispatch] = useState(0)
      const _up          = () => dispatch(Math.random())
      if(resolve){
         // eslint-disable-next-line
         return useMemo(() => createElement(RootEle, {id, dispatch: _up}, createElement(Comp, {...props})), resolve(props))
      }
      return createElement(RootEle, {id, dispatch: _up}, createElement(Comp, {...props}))
   }

   return Render
}



export default withStore