import {Store} from '../../../.'


class Todo extends Store {

   create(title: string){
      this.insert({title})
   }
}

export default new Todo