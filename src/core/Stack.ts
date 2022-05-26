import { StackProps } from '../types'
import excuteQuery from "./excuteQuery";


class Stack {

   STATE: StackProps[] = []
   fatchable: Pick<StackProps, 'id' | 'dispatch'> | null = null

   find(jpQuery: any, callback?: any): StackProps[] {

      let result = []
      try {
         result = excuteQuery(jpQuery, this.STATE, callback)
      } catch (err) {
         console.error(err)
      }

      return result

   }

   dispatch({ storeId, type }: Partial<Pick<StackProps, 'storeId' | 'type'>>) {
      let find: any = { storeId }
      if (type) {
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

   create({ storeId, type }: Pick<StackProps, 'storeId' | 'type'>) {
      if (!this.fatchable) {
         return;
      }
      const exists = this.find({ storeId, id: this.fatchable?.id, type })
      if (!exists.length) {
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
      const deletable: number[] = []
      this.find(where, ({index}: any) => {
         deletable.push(index)
      })
      for(let index of deletable){
         this.STATE.splice(index, 1)
      }
   }
}


export default new Stack()