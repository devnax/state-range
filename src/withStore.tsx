import React, {ComponentType, useId, useMemo, useState} from 'react'
import Stack from './core/Stack'

interface Props{
   children?: JSX.Element;
   id: string;
   dispatch: Function;
}

class Block extends React.Component<Props>{

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


type Resolver<T> = (props: T) => any[]

const withStore = <T, >(Comp: ComponentType<T>, resolve?: Resolver<T>) => {
   
   const Render = (props: any) => {
      const id = useId()
      const [,dispatch] = useState(0)
      
      const _up = () => dispatch(Math.random())
      
      if(typeof resolve === 'function'){
      
         let compare  = resolve(props)
         // eslint-disable-next-line
         return useMemo(() => <Block id={id} dispatch={_up}><Comp {...props}/></Block>, compare)
      }
      return <Block id={id} dispatch={_up}><Comp {...props}/></Block>
   }

   return Render
}



export default withStore