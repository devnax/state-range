import Meta from './Meta'
import { DATA } from '../core/Root'
import { Row, PartOfRow, RowType, WhereType, QueryCallbackType } from '../types'
import { is_object } from '../core/utils'

export default class Store<RowProps = object, MetaProps = { [key: string]: any }> extends Meta<RowProps, MetaProps>{

   insert(row: RowProps): RowType<RowProps> {

      if ((row as any)?._id) {
         delete (row as any)._id
      }

      const formatRow = this.makeRow(row)
      DATA.state[this.storeId()].data.push(formatRow)

      if (typeof (this as any).onUpdate == 'function') {
         (this as any).onUpdate('data', 'insert')
      }
      this.dispatch({ type: 'data', name: 'insert' })
      return formatRow
   }

   insertMany(rows: RowProps[], callback?: (row: RowProps) => RowProps): string[] {

      const rows_ids: string[] = []
      for (let row of rows) {
         if ((row as any)?._id) {
            delete (row as any)._id
         }
         if (typeof callback === 'function') {
            row = callback(row)
         }
         const format = this.makeRow(row)
         rows_ids.push(format._id || '')
         DATA.state[this.storeId()].data.push(format)
      }
      if (typeof (this as any).onUpdate == 'function') {
         (this as any).onUpdate('data', 'insertMany')
      }
      this.dispatch({ type: 'data', name: 'insertMany' })
      return rows_ids
   }

   insertAfter(row: RowProps, index: number): RowType<RowProps> {

      if ((row as any)?._id) {
         delete (row as any)._id
      }
      const format = this.makeRow(row)
      DATA.state[this.storeId()].data.splice(index, 0, format)
      if (typeof (this as any).onUpdate == 'function') {
         (this as any).onUpdate('data', 'insertAfter')
      }
      this.dispatch({ type: 'data', name: 'insertAfter' })
      return format
   }

   update(row: PartOfRow<RowProps>, where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): void {

      const exists = this.jpQuery(where)
      if (exists.length) {
         this.jpQuery(where, ({ value, index }) => {
            if (typeof callback === 'function') {
               callback({ value, index })
            }
            const formate = this.makeRow(value)
            DATA.state[this.storeId()].data[index] = { ...formate, ...row, _id: formate._id }
         })

         if (typeof (this as any).onUpdate == 'function') {
            (this as any).onUpdate('data', 'update')
         }
         this.dispatch({ type: 'data', name: 'update' })
      }
   }

   updateFirst(row: PartOfRow<RowProps>, where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>) {
      const exists = this.jpQuery(where)
      if (exists.length) {
         this.update(row, exists[0]._id, callback)
      }
   }

   updateAll(row: PartOfRow<RowProps>, callback?: QueryCallbackType<RowProps>): void {
      // find all where have _id
      this.update(row, "@where _id", callback)
      if (typeof (this as any).onUpdate == 'function') {
         (this as any).onUpdate('data', 'updateAll')
      }
      this.dispatch({ type: 'data', name: 'updateAll' })
   }

   delete(where: WhereType<RowProps>): void {
      this.jpQuery(where, ({ index }) => {
         DATA.state[this.storeId()].data[index] = {}
      })
      DATA.state[this.storeId()].data = this.jpQuery("@where _id")
      if (typeof (this as any).onUpdate == 'function') {
         (this as any).onUpdate('data', 'delete')
      }
      this.dispatch({ type: 'data', name: "delete" })
   }

   deleteAll(): void {
      DATA.state[this.storeId()].data = []
      if (typeof (this as any).onUpdate == 'function') {
         (this as any).onUpdate('data', 'delete')
      }
      this.dispatch({ type: 'data', name: "deleteAll" })
   }

   count(where?: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): number {
      return where ? this.find(where, callback).length : this.getState().data.length
   }

   find(where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): Row<RowProps>[] {
      this.addDispatch({ type: "data", name: 'find' })

      const res = this.jpQuery(where, callback)
      return res;
   }

   findUnique(where: WhereType<RowProps>, fields: Partial<RowProps>[], callback?: QueryCallbackType<RowProps>): Row<RowProps>[] {
      let _q = where

      if (typeof where === 'object' && is_object(where)) {
         let fwhere: any = ''
         let and = ''
         for (let k in where) {
            let v: any = (where as any)[k]
            if (typeof v === 'string') {
               v = `'${v}'`
            }
            fwhere += `${and}${k}==${v}`
            and = '&&'
         }

         if (fwhere) {
            _q = `@where ${fwhere}`
         }
      }

      _q += ` @unique ${fields.join(',')}`
      const res = this.find(_q, callback)
      return res;
   }

   findFirst(where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): Row<RowProps> | null {
      const ex = this.find(where, callback)
      return ex.length ? ex[0] : null
   }

   findById(_id: string, callback?: QueryCallbackType<RowProps>): RowType<RowProps> | null {
      const ex = this.find(_id, callback)
      return ex.length ? ex[0] : null
   }

   findAll(): RowType<RowProps>[] {
      return this.find('@where _id')
   }

   // {name: '', email: ''}
   // name="123" || email="88"
   //  to where "name like '' && email like ''"
   search(where: string | { [key: string]: string | number }, callback?: QueryCallbackType<RowProps>): Row<RowProps>[] {
      let whr = '@where '
      let opr = ''
      if (typeof where === 'object' && is_object(where)) {

         for (let key in where) {
            const value = where[key] as any
            if (typeof value === 'string') {
               whr += `${opr} ${key} like '${value}'`
            } else {
               whr += `${opr} ${key} like ${value}`
            }
            opr = '&&'
         }
      } else if (typeof where === 'string') {
         whr += where.replace(/=/gi, ' like ')
      }
      this.addDispatch({ type: "data", name: 'search' })
      return this.jpQuery(whr, callback)
   }

   move(oldIdx: number, newIdx: number) {

      const row: any = DATA.state[this.storeId()].data[oldIdx]
      if (row) {
         DATA.state[this.storeId()].data.splice(oldIdx, 1)
         DATA.state[this.storeId()].data.splice(newIdx, 0, this.makeRow(row))
         if (typeof (this as any).onUpdate == 'function') {
            (this as any).onUpdate('data', 'move')
         }
         this.dispatch({ type: 'data', name: 'move' })
      }
   }

   getIndex(_id: string, callback?: QueryCallbackType<RowProps>): number | void {
      let idx;
      this.findById(_id, ({value, index}) => {
         if(typeof callback === 'function'){
            callback({value, index})
         }
         idx = index
      })

      return idx
   }
}