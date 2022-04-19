import Stack from './Stack'
import {uid, is_object, is_number, is_callable, is_string} from '../utils'
import Meta from './Meta'
import { DISPATCH } from '../dispatch'


const STATE:any = {}

export default class Store extends Meta{
   private dispatchable:any      = []
   private _observe              = 0
   
   constructor(){
      super()
      if(!STATE.hasOwnProperty(this.constructor.name)){
         STATE[this.constructor.name] = []
      }
   }

   protected STATE_DATA = () => STATE[this.constructor.name]
   
   protected addDispatch(){
      const active = Stack.getActive()
      if(active && !this.dispatchable.includes(active)){
         this.dispatchable.push(active)
      }
   }

   protected dispatch(){
      if(!DISPATCH.noDispatch){
         for(let i = 0; i < this.dispatchable.length; i++){
            const id = this.dispatchable[i]
            const item = Stack.findById(id)
            if(!item){
               this.dispatchable.splice(i, 1)      
            }
         }
         for(let id of this.dispatchable){
            const item = Stack.findById(id)
            item?.dispatch(Math.random())
         }
      }
   }
   
   protected makeRow(row: any){
      const _id      = row._id || '_'+uid()
      const now      = Date.now()
      this._observe   = now
      return {...row,_id,observe: now}
   }

   observe(): number{
      return this._observe
   }
   
   getState(){
      this.addDispatch()
      return STATE
   }
   
   getData(){
      this.addDispatch()
      return STATE[this.constructor.name]
   }
   
   insert(row: object){
      if((row as any)?._id){
         delete (row as any)._id
      }
      row = this.makeRow(row)
      STATE[this.constructor.name].push(row)
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
         STATE[this.constructor.name].push(row)
      }
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insertMany')
      }
      this.dispatch()
      return rows_ids
   }
   
   insertAfter(row: object, index: any){
      if(!is_object(row) || !is_number(index)){
         throw new Error("Row and index required!")
      }
      if((row as any)?._id){
         delete (row as any)._id
      }
      row = this.makeRow(row)
      STATE[this.constructor.name].splice(parseInt(index), 0, row)
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insertAfter')
      }
      this.dispatch()
      return row
   }
   
   update(row: object, where?: string | object | number, callback?: Function | any): void{
      if(is_string(where)){
         where = {_id: where}
      }
      const exists = this.query(where) || []
      if(exists.length){
         this.query(where, (prevRow: object) => {
            if(is_callable(callback)){
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

   updateAll(row: object, callback?: Function | any): void{

      this.query(null, (prevRow: object) => {
         if(is_callable(callback)){
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
      if(is_string(where)){
         where = {_id: where}
      }
      const exists = this.query(where) || []
      if(!exists.length){
         return
      }
      
      this._observe   = Date.now()
      this.query(where, () => null)
      STATE[this.constructor.name] = this.query('@')
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('delete')
      }
      this.dispatch()
   }

   deleteAll(): void{
      this._observe   = Date.now()
      STATE[this.constructor.name] = []
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('delete')
      }
      this.dispatch()
   }

   deleteColumns(cols: string[], where?: string | object | number, callback?: Function | any): void{
      if(is_string(where)){
         where = {_id: where}
      }
      const exists = this.query(where) || []
      if(!exists.length){
         return
      }
      
      this.query(where, (prevRow: any) => {
         if(is_callable(callback)){
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
      return where ? this.find(where).length : this.getData().length
   }
   
   find(where?: string | object | number): any[]{
      this.addDispatch()
      return this.query(where) || []
   }

   findFirst(where?: string | object | number) {
      this.addDispatch()
      const ex = this.find(where)
      return ex.length ? ex[0] : false
   }

   findById(_id: string){
      this.addDispatch()
      const ex = this.find({_id})
      return ex.length ? ex[0] : false
   }

   findAll(){
      this.addDispatch()
      return this.getData()
   }
   
   move(oldIdx: any, newIdx: number){
      if(!is_number(oldIdx) || !is_number(newIdx)){
         throw new Error("olb Index and New Index must be number");
      }
      
      const row = STATE[this.constructor.name][oldIdx]
      if(row){
         STATE[this.constructor.name].splice(oldIdx, 1)
         STATE[this.constructor.name].splice(newIdx, 0, this.makeRow(row))
         if(typeof (this as any).onUpdate == 'function'){
            (this as any).onUpdate('move')
         }
         this.dispatch()
      }
   }
   
   getIndex(id: string){
      if(id){
         this.addDispatch()
         const data:any = this.queryNodes(id)
         if(data?.length){
            return data[0].path[1]
         }
      }
   }
}