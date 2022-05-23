import { uid, makeQuery } from "../core/utils";
import jpath from 'jsonpath'
import Stack from '../core/Stack'
import { Row, RowDefault, STATE_FORMAT, StoreDispatchCallbackInfo } from "../types";
import { DATA } from '../core/Root'
import parseSql from "../core/parser";


export default class Factory<RowProps> {
    // protected _observe = 0
    protected _observe_data = 0
    protected _observe_meta = 0
    protected index: number = 0
    storeId = () => this.index ? this.constructor.name + this.index : this.constructor.name

    constructor() {
        while (DATA.state[this.storeId()]) {
            this.index += 1
        }
        DATA.state[this.storeId()] = { data: [], meta: [] }
    }

    getState(): STATE_FORMAT<RowProps> {
        this.addDispatch({type: "data", name: 'getState'})
        return DATA.state[this.storeId()]
    }

    protected addDispatch({type}: StoreDispatchCallbackInfo) {
        Stack.create({storeId: this.storeId(), type})
    }

    dispatch(info?: StoreDispatchCallbackInfo) {
        
        if (!DATA.noDispatch) {
            if (DATA.onDispatch) {
                const storeId = this.storeId()
                let find: any = {storeId}
                if(info?.type){
                    find.type = info.type
                }
                const getStack = Stack.find(find)
                DATA.onDispatchModules = [...DATA.onDispatchModules, ...getStack]
            } else {
                
                if(info?.type){
                    const isData = info.type === 'data'
                    if(isData){
                        this._observe_data = Date.now()
                    }else{
                        this._observe_meta = Date.now()
                    }
                    Stack.dispatch({ storeId: this.storeId(),  type: info.type })
                }else{
                    this._observe_data = Date.now()
                    this._observe_meta = Date.now()
                    Stack.dispatch({storeId: this.storeId()})
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

    protected makeRow(row: RowProps & Partial<RowDefault>): Row<RowProps> {
        const _id = row._id || '_' + uid()
        const now = Date.now()
        return { ...row, _id, observe: now }
    }

    query(jpQuery: any, cb?: (x: any) => any): Row<RowProps>[] {
        const state = DATA.state[this.storeId()].data
        let result: Row<RowProps>[] = []
        let q: any = makeQuery(jpQuery)
        let parse;

        if(typeof jpQuery === 'string' && !q){
            parse = parseSql(jpQuery)
            if(parse.where){
                q = parse.where
            }else{
                q = ''
            }
        }

        try {
            let result: any = false
            if (typeof cb === 'function' && q) {
                result = jpath.apply(state, q, cb)
            } else if(q) {
                result = jpath.query(state, q)
            }
        } catch (err) {
            console.error(err)
        }


        if(parse && result.length){
            
        }

        return result
    }

    metaQuery(jpQuery: any, cb?: (x: any) => any) {
        const state = DATA.state[this.storeId()].meta

        try {
            let result: any = false
            if (typeof cb === 'function') {
                result = jpath.apply(
                    state,
                    makeQuery(jpQuery),
                    cb)
            } else {
                result = jpath.query(
                    state,
                    makeQuery(jpQuery)
                )
            }
            return result
        } catch (err) {
            console.error(err)
        }
    }

    queryNodes(jpQuery: any) {
        const state = DATA.state[this.storeId()].data
        try {
            const result: any = jpath.nodes(state, makeQuery(jpQuery))
            return result
        } catch (err) {
            console.error(err)
        }
    }
}