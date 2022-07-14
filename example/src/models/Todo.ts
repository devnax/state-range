import {Store, getState} from '../../../.'

interface Row{
   title: string;
   color?: string;
}
interface Meta{
   title: string;
   edit?: string;
}

class Todo extends Store<Row, Meta> {

   onUpdate(){
      //localStorage.setItem('state', JSON.stringify(getState()))
   }

   create(title: string){
      this.insert({title})
   }
}

export default new Todo