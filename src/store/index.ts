import Meta from './Meta'
import {DATA} from '../core/Root'
import {Row, PartOfRow, RowType, WhereType, QueryCallbackType} from '../types'
import { is_object } from '../core/utils'

export default class Store<RowProps = any> extends Meta<RowProps>{
   
   insert(row: RowProps): RowType<RowProps>{
      if((row as any)?._id){
         delete (row as any)._id
      }
      
      const formatRow = this.makeRow(row)
      DATA.state[this.storeId()].data.push(formatRow)
      
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('data', 'insert')
      }
      this.dispatch({type: 'data', name: 'insert'})
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
         (this as any).onUpdate('data', 'insertMany')
      }
      this.dispatch({type: 'data', name: 'insertMany'})
      return rows_ids
   }
   
   insertAfter(row: RowProps, index: number): RowType<RowProps>{
      if((row as any)?._id){
         delete (row as any)._id
      }
      const format = this.makeRow(row)
      DATA.state[this.storeId()].data.splice(index, 0, format)
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('data', 'insertAfter')
      }
      this.dispatch({type: 'data', name: 'insertAfter'})
      return format
   }
   
   update(row: PartOfRow<RowProps>, where?: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): void{
      let whr: any = where
      if(typeof where === 'string'){
         whr = {_id: where}
      }
      const exists = this.jpQuery(whr) || []
      if(exists.length){
         this.jpQuery(whr, ({value, ...rest}) => {
            if(typeof callback === 'function'){
               callback({value, ...rest})
            }
            const formate = this.makeRow(value)
            return {...formate, ...row, _id: formate._id}
         })
   
         if(typeof (this as any).onUpdate == 'function'){
            (this as any).onUpdate('data', 'update')
         }
         this.dispatch({type: 'data', name: 'update'})
      }
   }

   updateFirst(row: PartOfRow<RowProps>, where?: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>){
      const exists = this.jpQuery(where) || []
      if(exists.length){
         this.update(row, exists[0]._id, callback)
      }
   }

   updateAll(row: PartOfRow<RowProps>, callback?: QueryCallbackType<RowProps>): void{
      // find all where have _id
      this.jpQuery("where _id", ({value, ...rest}) => {
         if(typeof callback === 'function'){
            callback({value, ...rest})
         }
         const formate = this.makeRow(value)
         return {...formate, ...row, _id: formate._id}
      })

      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('data', 'updateAll')
      }
      this.dispatch({type: 'data', name: 'updateAll'})
   }
   
   delete(where?: WhereType<RowProps>): void{
      let whr: any = where
      if(typeof where === 'string'){
         whr = {_id: where}
      }

      const deletable: any = []
      
      this.jpQuery(whr, ({index}) => {
         deletable.push(index)
      })
      
      if(!deletable.length){
         return
      }

      for(let index of deletable){
         DATA.state[this.storeId()].data.splice(index, 1)
      }
      
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('data', 'delete')
      }
      this.dispatch({type: 'data', name: "delete"})
   }

   deleteAll(): void{
      DATA.state[this.storeId()].data = []
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('data', 'delete')
      }
      this.dispatch({type: 'data', name: "deleteAll"})
   }

   query(where: string, callback?: QueryCallbackType<RowProps>): Row<RowProps>[]{
      this.addDispatch({type: "data", name: 'find'})
      return this.jpQuery(where, callback)
   }
   
   count(where?: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): number{
      return where ? this.find(where, callback).length : this.getState().data.length
   }
   
   find(where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): Row<RowProps>[]{
      this.addDispatch({type: "data", name: 'find'})
      return this.jpQuery(where, callback)
   }

   findFirst(where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): Row<RowProps> | null {
      this.addDispatch({type: "data", name: 'findFirst'})
      const ex = this.find(where, callback)
      return ex.length ? ex[0] : null
   }

   findById(_id: string): RowType<RowProps> | null{
      this.addDispatch({type: "data", name: 'findById'})
      const ex = this.find(_id)
      return ex.length ? ex[0] : null
   }

   findAll(): RowType<RowProps>[]{
      return this.getState().data
   }

   // {name: '', email: ''}
   // name="123" || email="88"
   //  to where "name like '' && email like ''"
   search(where: string | {[key: string]: string | number}, callback?: QueryCallbackType<RowProps>): Row<RowProps>[]{
      let whr = 'where '
      let opr = ''
      if(typeof where === 'object' && is_object(where)){
         
         for(let key in where){
            const value = where[key] as any
            if(typeof value === 'string'){
               whr += `${opr} ${key} like '${value}'`
            }else{
               whr += `${opr} ${key} like ${value}`
            }
            opr = '&&'
         }
      }else if(typeof where === 'string'){
         whr += where.replace(/=/gi, ' like ')
      }
      this.addDispatch({type: "data", name: 'search'})
      return this.jpQuery(whr, callback)
   }

   move(oldIdx: number, newIdx: number){
      const row: any = DATA.state[this.storeId()].data[oldIdx]
      if(row){
         DATA.state[this.storeId()].data.splice(oldIdx, 1)
         DATA.state[this.storeId()].data.splice(newIdx, 0, this.makeRow(row))
         if(typeof (this as any).onUpdate == 'function'){
            (this as any).onUpdate('data', 'move')
         }
         this.dispatch({type: 'data', name: 'move'})
      }
   }
   
   findIndex(where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): number[]{
      this.addDispatch({type: "data", name: 'getIndex'})
      const indexes: number[] = []
      this.jpQuery(where, ({index, ...rest}: any) => {
         indexes.push(index)
         if(typeof callback === 'function'){
            callback({index, ...rest})
         }
      })
      return indexes
   }
   
   getIndex(_id: string, callback?: QueryCallbackType<RowProps>): number | void{
      const indexes = this.findIndex({_id}, callback)
      if(indexes.length){
         return indexes[0]
      }
   }
}