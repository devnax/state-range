import {ComponentType, Component, createElement, useId, useMemo, useState} from 'react'
import Stack from '../core/Stack'

interface Props{
   children?: JSX.Element;
   id: string;
   dispatch: Function;
}

class Block extends Component<Props>{

   constructor(props: Props){
      super(props)
      Stack.fatchable = {id: props.id, dispatch: props.dispatch}
   }

   componentWillUnmount(){
      Stack.delete(this.props.id)
   }

   render(){
      return this.props.children
   }
}


type Resolver<T> = (props: T) => any[]

const withStore = <T, R extends Resolver<T>>(Comp: ComponentType<T>, resolve?: R) => {
   
   const Render = <P extends T>(props: P) => {
      const id           = useId().replace(/:/gi, '')
      const [, dispatch] = useState(0)
      const _up          = () => dispatch(Math.random())
      if(resolve){
         // eslint-disable-next-line
         return useMemo(() => createElement(Block, {id, dispatch: _up}, createElement(Comp, {...props})), resolve(props))
      }
      return createElement(Block, {id, dispatch: _up}, createElement(Comp, {...props}))
   }

   return Render
}



export default withStore