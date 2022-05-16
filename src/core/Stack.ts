import {makeQuery} from './utils'
import jpath from 'jsonpath'
import {StackProps} from '../types'


class Stack {

   STATE: StackProps[] = []
   fatchable: Pick<StackProps, 'id' | 'dispatch'> | null = null

   find(jpQuery: any, cb?: any): StackProps[] {
      let res = []
      try {
         if (typeof cb === 'function') {
            res = jpath.apply(
               this.STATE,
               makeQuery(jpQuery),
               cb)
         } else {
            res = jpath.query(
               this.STATE,
               makeQuery(jpQuery)
            )
         }
      } catch (err) {
         console.error(err)
      }

      return res
   }

   dispatch({storeId, type}: Partial<Pick<StackProps, 'storeId' | 'type'>>) {
      let find: any = {storeId}
      if(type){
         find.type = type
      }
      const items = this.find(find)
      const done: any[] = []

      for (let item of items) {
         if (typeof item.dispatch !== undefined && !done.includes(item.id)) {
            done.push(item.id)
            item.dispatch()
         }
      }
   }

   create({storeId, type}: Pick<StackProps, 'storeId' | 'type'>) {
      if(!this.fatchable){
         return;
      }
      const exists = this.find({ storeId, id: this.fatchable?.id, type })
      if(!exists.length){
         this.STATE.push({ 
            ...this.fatchable, 
            storeId,
            type
         })
      }
   }

   update(data: Partial<StackProps>, where: Partial<StackProps>) {
      this.find(where, (prevRow: StackProps) => {
         return { ...prevRow, ...data, id: prevRow.id }
      })
   }

   delete(where: string | Partial<StackProps>) {
      if (typeof where === 'string') {
         where = { id: where }
      }
      this.find(where, () => null)
      this.STATE = this.find('@')
   }
}


export default new Stack()