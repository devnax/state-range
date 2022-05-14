import Meta from './Meta'
import {STATE} from './Factory'

export default class Store extends Meta{
   
   getState(){
      this.addDispatch()
      return STATE[this.storeId()].data
   }
   
   insert(row: object): object{
      if((row as any)?._id){
         delete (row as any)._id
      }
      row = this.makeRow(row)
      STATE[this.storeId()].data.push(row)
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insert')
      }
      this.dispatch()
      return row
   }
   
   insertMany(rows: object[]): string[]{
      const rows_ids: string[] = []
      for(let row of rows){
         if((row as any)?._id){
            delete (row as any)._id
         }
         const format = this.makeRow(row)
         rows_ids.push(format._id || '')
         STATE[this.storeId()].data.push(row)
      }
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insertMany')
      }
      this.dispatch()
      return rows_ids
   }
   
   insertAfter(row: object, index: number): object{
      if((row as any)?._id){
         delete (row as any)._id
      }
      row = this.makeRow(row)
      STATE[this.storeId()].data.splice(index, 0, row)
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insertAfter')
      }
      this.dispatch()
      return row
   }
   
   update(row: object, where?: string | object | number, callback?: (r: object) => object): void{
      if(typeof where === 'string'){
         where = {_id: where}
      }
      const exists = this.query(where) || []
      if(exists.length){
         this.query(where, (prevRow: object) => {
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

   updateFirst(row: object, where?: string | object | number, callback?: (r: object) => object){
      const exists = this.query(where) || []
      if(exists.length){
         this.update(row, exists[0]._id, callback)
      }
   }

   updateAll(row: object, callback?: (r: object) => object): void{
      this.query(null, (prevRow: object) => {
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
   
   delete(where?: string | object | number): void{
      if(typeof where === 'string'){
         where = {_id: where}
      }
      const exists = this.query(where) || []
      if(!exists.length){
         return
      }
      
      this._observe   = Date.now()
      this.query(where, () => null)
      STATE[this.storeId()].data = this.query('@')
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('delete')
      }
      this.dispatch()
   }

   deleteAll(): void{
      this._observe   = Date.now()
      STATE[this.storeId()].data = []
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('delete')
      }
      this.dispatch()
   }

   deleteColumns(cols: string[], where?: string | object | number, callback?: (r: object) => object): void{
      if(typeof where === 'string'){
         where = {_id: where}
      }
      const exists = this.query(where) || []
      if(!exists.length){
         return
      }
      
      this.query(where, (prevRow: any) => {
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
   
   count(where?: string | object | number): number{
      return where ? this.find(where).length : this.getState().length
   }
   
   find(where?: string | object | number): object[]{
      this.addDispatch()
      return this.query(where) || []
   }

   findFirst(where?: string | object | number): object | null {
      this.addDispatch()
      const ex = this.find(where)
      return ex.length ? ex[0] : null
   }

   findById(_id: string): object | null{
      this.addDispatch()
      const ex = this.find({_id})
      return ex.length ? ex[0] : null
   }

   findAll(): object[]{
      return this.getState()
   }

   getLastRow(): object | null{
      const rows = this.findAll()
      return rows.length ? rows[rows.length -1] : null
   }

   getFirstRow(): object | null{
      const rows = this.findAll()
      return rows.length ? rows[0] : null
   }
   
   move(oldIdx: number, newIdx: number){
      
      const row = STATE[this.storeId()].data[oldIdx]
      if(row){
         STATE[this.storeId()].data.splice(oldIdx, 1)
         STATE[this.storeId()].data.splice(newIdx, 0, this.makeRow(row))
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