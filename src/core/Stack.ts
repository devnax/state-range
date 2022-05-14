import Factory from './Factory'

interface DataProps {
   id: string;
   dispatch: Function;
   active?: boolean;
   stores?: any[]
}

interface fatchableInterface {
   dispatch: Function;
   id: string
}

class Stack extends Factory {

   STATE: object[] = []
   fatchable: fatchableInterface | null = null
   

   protected dataState(){
      return this.STATE
   }
   
   dispatch(storeId: string) {
      const items = this.query({ storeId })
      
      for (let item of items) {
         if(typeof item.dispatch !== undefined){
            item.dispatch()
         }
      }
   }

   create(storeId: string) {
      const exists = this.query({ storeId, id: this.fatchable?.id }) || []
      if (this.fatchable && !exists.length) {
         this.STATE.push({ ...this.fatchable, storeId })
      }
   }

   update(data: Partial<DataProps>, where: object) {
      this.query(where, (prevRow: DataProps) => {
         return { ...prevRow, ...data, id: prevRow.id }
      })
   }

   delete(where: string | object) {
      if (typeof where === 'string') {
         where = { id: where }
      }
      this.query(where, () => null)
      this.STATE = this.query('@')
   }

   findById(id: string) {
      const ex = this.query({ id }) || []
      return ex.length ? ex[0] : null
   }
}


export default new Stack()