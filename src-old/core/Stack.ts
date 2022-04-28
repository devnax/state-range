import Query from './Query'
import {uid} from '../utils'


interface DataProps{
   id?: string;
   dispatch: Function;
   active?: boolean;
}

class Stack extends Query{

   STATE: object[]      = []
   protected STATE_DATA = () => this.STATE

   protected format(data: DataProps){
      const id      = data.id || uid()
      return {...data, id}
   }

   deactiveAll(){
      this.update({active:false}, {active: true})
   }
   
   getActive(){
      const ex = this.query({active: true}) || []
      return ex.length ? ex[0].id : null
   }

   create(data: DataProps): string{
      const formated = this.format(data)
      this.deactiveAll()
      this.STATE.push({...formated, active: true})
      return formated.id
   }

   update(data: Partial<DataProps>, where: object){
      this.query(where, (prevRow: DataProps) => {
         const formate = this.format(prevRow)
         return {...formate, ...data, id: formate.id}
      })
   }

   delete(id: string){
      this.query({id}, () => null)
      this.STATE = this.query('@')
   }

   findById(id: string){
      const ex = this.query({id}) || []
      return ex.length ? ex[0] : null
   }
}

export default new Stack()