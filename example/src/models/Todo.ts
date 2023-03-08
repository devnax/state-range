import { Store } from '../../../.'

interface Row {
   title: string;
   color?: string;
}
interface Meta {
   title: string;
   edit?: string;
}

class Todo extends Store<Row, Meta> {

   create(title: string) {
      this.insert({ title })
   }
}

export default new Todo