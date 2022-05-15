import Meta from './Meta'
import {DATA} from '../core/Root'
import {Row, PartOfRow} from '../types'

export default class Store<RowProps = any> extends Meta<RowProps>{
   
   insert(row: RowProps): Row<RowProps>{
      if((row as any)?._id){
         delete (row as any)._id
      }
      const formatRow = this.makeRow(row)
      DATA.state[this.storeId()].data.push(formatRow)
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insert')
      }
      this.dispatch()
      return formatRow
   }
   
   insertMany(rows: RowProps[]): string[]{
      const rows_ids: string[] = []
      for(let row of rows){
         if((row as any)?._id){
            delete (row as any)._id
         }
         const format = this.makeRow(row)
         rows_ids.push(format._id || '')
         DATA.state[this.storeId()].data.push(format)
      }
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insertMany')
      }
      this.dispatch()
      return rows_ids
   }
   
   insertAfter(row: RowProps, index: number): Row<RowProps>{
      if((row as any)?._id){
         delete (row as any)._id
      }
      const format = this.makeRow(row)
      DATA.state[this.storeId()].data.splice(index, 0, format)
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insertAfter')
      }
      this.dispatch()
      return format
   }
   
   update(row: RowProps, where?: string | PartOfRow<RowProps> | number, callback?: (r: Row<RowProps>) => Row<RowProps>): void{
      let whr: any = where
      if(typeof where === 'string'){
         whr = {_id: where}
      }
      const exists = this.query(whr) || []
      if(exists.length){
         this.query(whr, (prevRow: Row<RowProps>) => {
            if(typeof callback === 'function'){
               prevRow = callback(prevRow)
            }
            const formate = this.makeRow(prevRow)
            return {...formate, ...row, _id: formate._id}
         })
   
         if(typeof (this as any).onUpdate == 'function'){
            (this as any).onUpdate('update')
         }
         this.dispatch()
      }
   }

   updateFirst(row: RowProps, where?: string | PartOfRow<RowProps> | number, callback?: (r: Row<RowProps>) => Row<RowProps>){
      const exists = this.query(where) || []
      if(exists.length){
         this.update(row, exists[0]._id, callback)
      }
   }

   updateAll(row: RowProps, callback?: (r: Row<RowProps>) => Row<RowProps>): void{
      this.query(null, (prevRow: Row<RowProps>) => {
         if(typeof callback === 'function'){
            prevRow = callback(prevRow)
         }
         const formate = this.makeRow(prevRow)
         return {...formate, ...row, _id: formate._id}
      })

      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('updateAll')
      }
      this.dispatch()
   }
   
   delete(where?: string | PartOfRow<RowProps> | number): void{
      let whr: any = where
      if(typeof where === 'string'){
         whr = {_id: where}
      }
      const exists = this.query(whr) || []
      if(!exists.length){
         return
      }
      
      this._observe   = Date.now()
      this.query(whr, () => null)
      DATA.state[this.storeId()].data = this.query('@')
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('delete')
      }
      this.dispatch()
   }

   deleteAll(): void{
      this._observe   = Date.now()
      DATA.state[this.storeId()].data = []
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('delete')
      }
      this.dispatch()
   }

   deleteColumns(cols: (keyof RowProps)[], where?: string | PartOfRow<RowProps> | number, callback?: (r: Row<RowProps>) => Row<RowProps>): void{
      let whr: any = where
      if(typeof where === 'string'){
         whr = {_id: where}
      }
      const exists = this.query(whr) || []
      if(!exists.length){
         return
      }
      
      this.query(whr, (prevRow: Row<RowProps>) => {
         if(typeof callback === 'function'){
            prevRow = callback(prevRow)
         }

         let change = false
         for(let col of cols){
            if(prevRow[col]){
               delete prevRow[col]
               change = true
            }
         }
         if(change){
            prevRow = this.makeRow(prevRow)
         }
         return {...prevRow}
      })

      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('deleteColumns')
      }
      this.dispatch()
   }
   
   count(where?: string | PartOfRow<RowProps> | number): number{
      return where ? this.find(where).length : this.getState().data.length
   }
   
   find(where?: string | PartOfRow<RowProps> | number): (Row<RowProps>)[]{
      this.addDispatch()
      return this.query(where) || []
   }

   findFirst(where?: string | PartOfRow<RowProps> | number): (Row<RowProps>) | null {
      this.addDispatch()
      const ex = this.find(where)
      return ex.length ? ex[0] : null
   }

   findById(_id: string): Row<RowProps> | null{
      this.addDispatch()
      const ex = this.find({_id})
      return ex.length ? ex[0] : null
   }

   findAll(): Row<RowProps>[]{
      return this.getState().data
   }

   move(oldIdx: number, newIdx: number){
      
      const row: any = DATA.state[this.storeId()].data[oldIdx]
      if(row){
         DATA.state[this.storeId()].data.splice(oldIdx, 1)
         DATA.state[this.storeId()].data.splice(newIdx, 0, this.makeRow(row))
         if(typeof (this as any).onUpdate == 'function'){
            (this as any).onUpdate('move')
         }
         this.dispatch()
      }
   }
   
   getIndex(id: string): number | void{
      if(id){
         this.addDispatch()
         const data:any = this.queryNodes(id)
         if(data?.length){
            return data[0].path[1]
         }
      }
   }
}