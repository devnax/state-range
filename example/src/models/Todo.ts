import {Store, getState} from '../../../.'

interface Row{
   title: string;
   color?: string;
}

class Todo extends Store<Row> {

   onUpdate(){
      //localStorage.setItem('state', JSON.stringify(getState()))
   }

   create(title: string){
      this.insert({title})
   }
}

export default new Todo