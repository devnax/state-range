import { Component, ComponentType, createElement, useId, useMemo, useState } from 'react'
import { activityFactory, dispatchFactory } from './core'

type Resolver<T> = (props: T) => any[]


class WithStore extends Component<any>{
   constructor(props: any) {
      super(props)
      dispatchFactory.set(props.id, { id: props.id, dispatch: props.dispatch })
      activityFactory.set("CURRENT_ID", props.id)
   }

   componentWillUnmount() {
      dispatchFactory.delete(this.props.id)
   }

   render() {
      return this.props.children
   }
}


const withStore = <T, R extends Resolver<T>>(Comp: ComponentType<T>, resolve?: R) => {

   const Render = <P extends T>(props: P) => {
      const id = useId()
      const [, dispatch] = useState(0)
      const _up = () => dispatch(Math.random())
      if (resolve) {
         // eslint-disable-next-line
         return useMemo(() => createElement(WithStore, { id, dispatch: _up }, createElement(Comp as any, { ...(props || {}) })), resolve(props))
      }
      return createElement(WithStore, { id, dispatch: _up }, createElement(Comp as any, { ...(props || {}) }))
   }

   return Render
}

export default withStore