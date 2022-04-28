import React, {useId, useMemo, useState, createElement, ComponentType} from 'react'
import Stack from './core/Stack'

interface Props{
   children?: JSX.Element;
   id: string;
   dispatch: Function;
}

class C extends React.Component<Props>{

   constructor(props: Props){
      super(props)
      Stack.create({dispatch: props.dispatch, id: props.id})
   }

   componentWillUnmount(){
      Stack.delete(this.props.id)
   }

   render(){
      return this.props.children
   }
}


type Resolver = (props: object) => any[]

const withStore = (Comp: ComponentType, resolve?: Resolver) => {
   
   const Render = (props?: any) => {
      const id = useId()
      const [,dispatch] = useState(0)
      
      const _up = () => dispatch(Math.random())
      
      if(typeof resolve === 'function'){
      
         let compare  = resolve(props)
         // eslint-disable-next-line
         return useMemo(() => createElement(C, {dispatch: _up, id}, createElement(Comp, props)), compare)
      }
      
      return createElement(C, {dispatch: _up, id}, createElement(Comp, props))
   }

   return Render
}



export default withStore