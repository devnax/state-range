import Query from './Query'


interface DataProps{
   id: string;
   dispatch: Function;
   active?: boolean;
}

class Stack extends Query{

   STATE: object[]      = []

   deactiveAll(){
      this.update({active:false}, {active: true})
   }
   
   getActive(){
      const ex = this.query({active: true}) || []
      return ex.length ? ex[0].id : null
   }

   create(data: DataProps){
      const exists = this.query({id: data.id})
      exists.length && this.delete(data.id)
      this.deactiveAll()
      this.STATE.push({...data, active: true})
   }

   update(data: Partial<DataProps>, where: object){
      this.query(where, (prevRow: DataProps) => {
         return {...prevRow, ...data, id: prevRow.id}
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