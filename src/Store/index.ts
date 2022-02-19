import Stock from './Stock'
import {uid, is_object, is_number, is_callable, is_string} from '../utils'
import Meta from './Meta'
import { DISPATCH } from '../dispatch'




const STATE:any = {}

export default class Store extends Meta{
   private dispatchable:any   = []
   private _observe            = 0
   
   constructor(){
      super()
      if(!STATE.hasOwnProperty(this.constructor.name)){
         STATE[this.constructor.name] = []
      }
   }
   
   protected addDispatch(){
      if(Stock.currentToken && !this.dispatchable.includes(Stock.currentToken)){
         this.dispatchable.push(Stock.currentToken)
      }
   }
   
   protected dispatch(){
      if(!DISPATCH.noDispatch){
         for(let item of this.dispatchable){
            Stock.dispatch(item)
         }
      }
   }
   
   
   protected makeRow(row: any){
      const _id      = row._id || uid()
      const now      = Date.now()
      this._observe   = now
      
      return {
         ...row,
         _id,
         observe: now
      }
   }

   observe(){
      return this._observe
   }

   observeRow(id: string){
      const data = this.findById(id)
      if(data){
         return data.observe
      }
      return 0
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
      row = this.makeRow(row)
      STATE[this.constructor.name].push(row)
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insert')
      }
      this.dispatch()
      return row
   }
   
   insertMany(rows: any[]){
      const rows_ids = []

      for(let row of rows){
         row = this.makeRow(row)
         rows_ids.push(row._id)
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
      row = this.makeRow(row)
      STATE[this.constructor.name].splice(parseInt(index), 0, row)
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('insertAfter')
      }
      this.dispatch()
      return row
   }
   
   update(row: object, where?: any, callback?: Function | any){

      if(is_string(where)){
         where = {_id: where}
      }

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

   updateAll(row: object, callback?: Function | any){

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
   
   delete(where?: any){
      if(is_string(where)){
         where = {_id: where}
      }
      this._observe   = Date.now()
      this.query(where, () => null)
      STATE[this.constructor.name] = this.query('@')
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('delete')
      }

      this.dispatch()
   }

   deleteAll(){
      this._observe   = Date.now()
      STATE[this.constructor.name] = []
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('delete')
      }
      this.dispatch()
   }

   deleteColumns(cols: string[], where?: any, callback?: Function | any){
      if(is_string(where)){
         where = {_id: where}
      }
      this.query(where, (prevRow: object) => {
         if(is_callable(callback)){
            prevRow = callback(prevRow)
         }
         const row = this.makeRow(prevRow)
         for(let col of cols){
            if(row[col]){
               delete row[col]
            }
         }
         return {...row}
      })

      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('deleteColumns')
      }
      this.dispatch()
   }
   
   count(where?: any){
      this.addDispatch()
      if(where){
         return this.find(where).length
      }
      return this.getData()?.length || []
   }
   
   find(where?: any){
      this.addDispatch()
      return this.query(where) || []
   }

   findAll(){
      this.addDispatch()
      return this.getData()
   }
   
   findById(id: string){
      this.addDispatch()
      const ex = this.find({_id: id})
      if(ex){
         return ex[0]
      }
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
      if(!id) return;
      this.addDispatch()
      const data:any = this.queryNodes(id)
      if(data && data.length){
         return data[0].path[1]
      }
   }
}