import { find, QueryType as QType } from './dataFinder'
export const DISPATCHES = new Map<string, Function>()
export const STOREINFO = new Map<"CURRENT_ID" | "NO_DISPATCH", any>()

export type ResultType<D> = D & {
    _id: string;
    _index: number;
    _observe: number;
}

export type CallbackType<D> = (data: ResultType<D>, index: number) => void | D
export type QueryType<D> = QType<ResultType<D>>



export const noDispatch = (callback: Function) => {
    STOREINFO.set("NO_DISPATCH", true)
    callback()
    STOREINFO.delete("NO_DISPATCH")
}

export const uid = (row: object) => {
    let str = JSON.stringify(row)
    var hash = 0, len = str.length;
    for (var i = 0; i < len; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString(32).slice(-10).replace("-", "") + len;
}

export abstract class Store<Data extends object = {}, MetaProps extends object = {}> {
    private _dispatches: string[] = []
    private _data: ResultType<Data>[] = []
    private _meta = new Map<keyof MetaProps, any>()
    private _CACHE = new Map<string, ResultType<Data>[]>()
    public observe = 0

    private _row(row: Data): ResultType<Data> {
        const _id = (row as any)?._id || (uid(row) + this._data.length)
        let _observe = (row as any)._observe === undefined ? 0 : Date.now().toString()
        return { ...row, _id, _observe } as any
    }

    private _cacheKey(w: QueryType<Data>) {
        return JSON.stringify(w)
    }

    private _ditector() {
        const current_id = STOREINFO.get("CURRENT_ID")
        if (current_id && !this._dispatches.includes(current_id)) {
            this._dispatches.push(current_id)
        }
    }

    dispatch() {
        this._CACHE.clear()
        this.observe = Date.now();
        [...this._dispatches].forEach(id => {
            let dispatch = DISPATCHES.get(id)
            if (dispatch) {
                if (!STOREINFO.get("NO_DISPATCH")) {
                    dispatch()
                }
            } else {
                this._dispatches.splice(this._dispatches.indexOf(id), 1)
            }
        })
    }

    getAll(cb?: CallbackType<ResultType<Data>>) {
        return this.find({}, cb)
    }

    findById(_id: string) {
        return this.find({ _id } as any)
    }

    find(where: QueryType<Data>, cb?: CallbackType<ResultType<Data>>): ResultType<Data>[] {
        this._ditector()
        const cacheKey = this._cacheKey(where)
        const has = this._CACHE.get(cacheKey)
        if (has) return has
        const d = find<any>(this._data, where, cb)
        d.length && this._CACHE.set(cacheKey, d)
        return d
    }

    findFirst(where: Omit<QueryType<Data>, "$limit">, cb?: CallbackType<ResultType<Data>>): ResultType<Data> | void {
        return this.find({ ...where, $limit: 1 } as any, cb)[0]
    }

    insert(data: Data): ResultType<Data> {
        delete (data as any)._id
        let row = this._row(data)
        this._data.push(row)
        this.dispatch()
        return row
    }

    insertMany(items: Data[]) {
        items.forEach(d => {
            delete (d as any)._id
            this._data.push(this._row(d))
        })
        this.dispatch()
    }

    update(data: Partial<Data>, where?: QueryType<Data>, cb?: CallbackType<ResultType<Data>>) {
        find([...this._data], where, (item, index) => {
            cb && (item = cb(item, index) || item)
            this._data[index] = this._row({ ...item, ...data } as any) as any
        })
        this.dispatch()
    }

    updateAll(data: Partial<Data>, cb?: CallbackType<ResultType<Data>>) {
        this.update(data, {}, cb)
    }

    delete(where: QueryType<Data>, cb?: CallbackType<ResultType<Data>>) {
        find([...this._data], where, (item, index) => {
            cb && cb(item, index)
            this._data.splice(index, 1)
        })
        this.dispatch()
    }
    deleteAll(cb?: CallbackType<ResultType<Data>>) {
        this.delete({}, cb)
    }
    move(oldIdx: number, newIdx: number) {
        const row: any = this._data[oldIdx]
        if (row) {
            this._data.splice(oldIdx, 1)
            this._data.splice(newIdx, 0, this._row(row))
            this.dispatch()
        }
    }

    getIndex(where: QueryType<Data>): number | void {
        const d = this.findFirst(where)
        return d && d?._index
    }

    // Meta
    setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T]) {
        this._meta.set(key, value)
        this.dispatch()
    }
    getMeta<T extends keyof MetaProps>(key: T, def?: any): MetaProps[T] {
        this._ditector()
        return this._meta.get(key) || def
    }
    deleteMeta<T extends keyof MetaProps>(key: T) {
        this._meta.delete(key)
        this.dispatch()
    }
    clearMeta() {
        this._meta.clear()
        this.dispatch()
    }
}