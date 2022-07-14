import {Component} from 'react'
import Stack from '../core/Stack'

export default class Block extends Component<any>{
   constructor(props: any){
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

