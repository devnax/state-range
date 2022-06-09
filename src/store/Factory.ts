import { uid } from "../core/utils";
import Stack from '../core/Stack'
import { Row, MetaRowType, WhereType, QueryCallbackType, STATE_FORMAT, StoreDispatchCallbackInfo } from "../types";
import { DATA } from '../core/Root'
import excuteQuery from "../core/excuteQuery";


export default class Factory<RowProps>{
    protected _observe_data = 0
    protected _observe_meta = 0
    protected index: number = 0

    constructor() {
        while (DATA.state[this.storeId()]) {
            this.index += 1
        }
        DATA.state[this.storeId()] = { data: [], meta: [] }
    }


    storeId = () => this.index ? this.constructor.name + this.index : this.constructor.name

    getState(): STATE_FORMAT<RowProps> {
        this.addDispatch({ type: "data", name: 'getState' })
        return DATA.state[this.storeId()]
    }

    protected addDispatch({ type }: StoreDispatchCallbackInfo) {
        Stack.create({ storeId: this.storeId(), type })
    }

    dispatch(info?: StoreDispatchCallbackInfo) {
        const isData = info?.type === 'data'
        if (info?.type) {
            if (isData) {
                this._observe_data = Date.now()
            } else {
                this._observe_meta = Date.now()
            }
        } else {
            this._observe_data = Date.now()
            this._observe_meta = Date.now()
        }


        if (!DATA.noDispatch) {
            if (DATA.onDispatch) {
                const storeId = this.storeId()
                let find: any = { storeId }
                if (info?.type) {
                    find.type = info.type
                }
                const getStack = Stack.find(find)
                DATA.onDispatchModules = [...DATA.onDispatchModules, ...getStack]
            } else {
                if (info?.type) {
                    Stack.dispatch({ storeId: this.storeId(), type: info.type })
                } else {
                    Stack.dispatch({ storeId: this.storeId() })
                }
            }
        }
    }

    observeStoreData(): number {
        return this._observe_data
    }

    observeStoreMeta(): number {
        return this._observe_meta
    }

    protected makeRow<P = RowProps>(row: P & Row): Row<P> {
        const _id = row?._id || '_' + uid()
        const now = Date.now()
        return { ...row, _id, observe: now }
    }


    protected jpQuery<P = RowProps>(query: WhereType<P>, _callback?: QueryCallbackType<P>, customState?: Row<P>[]): Row<P>[] {
        let results: Row<P>[] = []
        try {
            const state = customState || DATA.state[this.storeId()].data
            results = excuteQuery<P>(query, state, _callback)
        } catch (err) {
            console.error(err)
        }
        return results
    }


    protected metaQuery(query: any, _callback?: QueryCallbackType<MetaRowType>): MetaRowType[] {
        return this.jpQuery<MetaRowType>(query, _callback, DATA.state[this.storeId()].meta as any)
    }

}