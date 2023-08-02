import { useMemo, createElement, ComponentType } from 'react'
type Resolver<P> = (props: P) => any[]

export const withMemo = <T, R extends Resolver<T>>(C: ComponentType<T>, resolve?: R) => {
   const R = <P extends T>(props: P) => {
      const ele = createElement(C as any, props || {})
      // eslint-disable-next-line
      return resolve ? useMemo(() => ele, resolve(props)) : ele
   }
   return R
}