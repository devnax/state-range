import {makeQuery} from './utils'
import jpath from 'jsonpath'
import {StackProps} from '../types'


class Stack {

   STATE: StackProps[] = []
   fatchable: Pick<StackProps, 'id' | 'dispatch'> | null = null

   query(jpQuery: any, cb?: any): StackProps[] {
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

   dispatch({storeId}: Partial<Pick<StackProps, 'storeId'>>) {
      let find: any = {storeId}
      const items = this.query(find)
      for (let item of items) {
         if (typeof item.dispatch !== undefined) {
            if(item.isData|| item.isMeta || (!item.isData && !item.isMeta)){
               item.dispatch()
            }
         }
      }
   }

   create({storeId, isData, isMeta}: Pick<StackProps, 'storeId' | 'isData' | 'isMeta'>) {
      if(!this.fatchable){
         return;
      }
      const exists = this.query({ storeId, id: this.fatchable?.id })
      if(!exists.length){
         this.STATE.push({ ...this.fatchable, storeId, isData, isMeta })
      }else{
         const item: any = exists[0]
         if(isData !== undefined && isData && !item.isData){
            this.update({ isData }, {id: item.id})
         }
         if(isMeta !== undefined && isMeta && !item.isMeta){
            this.update({isMeta}, {id: item.id})
         }
      }
   }

   update(data: Partial<StackProps>, where: Partial<StackProps>) {
      this.query(where, (prevRow: StackProps) => {
         return { ...prevRow, ...data, id: prevRow.id }
      })
   }

   delete(where: string | Partial<StackProps>) {
      if (typeof where === 'string') {
         where = { id: where }
      }
      this.query(where, () => null)
      this.STATE = this.query('@')
   }
}


export default new Stack()