import { RowType, WhereType, QueryCallbackType, PartOfRowType } from '../types'
import { is_object } from '../core'
import Base from './Base'

export default abstract class Store<RowProps = object, MetaProps = object> extends Base<RowProps, MetaProps>{

    insert(row: RowProps): RowType<RowProps> {
        if ((row as any)?._id) {
            delete (row as any)._id
        }
        const formatRow = this.makeRow(row)
        this.state.data.push(formatRow)

        if (typeof (this as any).onUpdate == 'function') {
            (this as any).onUpdate('data', 'insert')
        }
        this.dispatch()
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
            this.state.data.push(format)
        }
        if (typeof (this as any).onUpdate == 'function') {
            (this as any).onUpdate('data', 'insertMany')
        }
        this.dispatch()
        return rows_ids
    }

    insertAfter(row: RowProps, index: number): RowType<RowProps> {
        if ((row as any)?._id) {
            delete (row as any)._id
        }
        const format = this.makeRow(row)
        this.state.data.splice(index, 0, format)
        if (typeof (this as any).onUpdate == 'function') {
            (this as any).onUpdate('data', 'insertAfter')
        }
        this.dispatch()
        return format
    }

    update(row: PartOfRowType<RowProps>, where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): void {

        const exists = this.query(where)
        if (exists.length) {
            this.query(where, ({ value, index }) => {
                if (typeof callback === 'function') {
                    callback({ value, index })
                }
                const formate = this.makeRow(value)
                this.state.data[index] = { ...formate, ...row, _id: formate._id }
            })

            if (typeof (this as any).onUpdate == 'function') {
                (this as any).onUpdate('data', 'update')
            }
            this.dispatch()
        }
    }

    updateAll(row: PartOfRowType<RowProps>, callback?: QueryCallbackType<RowProps>): void {
        // find all where have _id
        this.update(row, "@where _id", callback)
        if (typeof (this as any).onUpdate == 'function') {
            (this as any).onUpdate('data', 'updateAll')
        }
        this.dispatch()
    }

    delete(where: WhereType<RowProps>): void {
        this.query(where, ({ index }) => {
            (this.state.data as any)[index] = {}
        })
        this.state.data = this.query("@where _id")
        if (typeof (this as any).onUpdate == 'function') {
            (this as any).onUpdate('data', 'delete')
        }
        this.dispatch()
    }

    deleteAll(): void {
        this.state.data = []
        if (typeof (this as any).onUpdate == 'function') {
            (this as any).onUpdate('data', 'delete')
        }
        this.dispatch()
    }

    count(where?: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): number {
        return where ? this.find(where, callback).length : this.getState().data.length
    }

    find(where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): RowType<RowProps>[] {
        this.setDispatch({ type: "data", name: 'find' })
        const res = this.query(where, callback)
        return res;
    }

    findUnique(where: WhereType<RowProps>, fields: Partial<RowProps>[], callback?: QueryCallbackType<RowProps>): RowType<RowProps>[] {
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

    findFirst(where: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>): RowType<RowProps> | null {
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
    search(where: string | { [key: string]: string | number }, callback?: QueryCallbackType<RowProps>): RowType<RowProps>[] {
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
        this.setDispatch({ type: "data", name: 'search' })
        return this.query(whr, callback)
    }

    move(oldIdx: number, newIdx: number) {
        const row: any = this.state.data[oldIdx]
        if (row) {
            this.state.data.splice(oldIdx, 1)
            this.state.data.splice(newIdx, 0, this.makeRow(row))
            if (typeof (this as any).onUpdate == 'function') {
                (this as any).onUpdate('data', 'move')
            }
            this.dispatch()
        }
    }

    getIndex(_id: string, callback?: QueryCallbackType<RowProps>): number | void {
        let idx;
        this.findById(_id, ({ value, index }) => {
            if (typeof callback === 'function') {
                callback({ value, index })
            }
            idx = index
        })

        return idx
    }
}