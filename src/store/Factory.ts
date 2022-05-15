import {uid, makeQuery } from "../core/utils";
import jpath from 'jsonpath'
import Stack from '../core/Stack'
import {Row, RowDefault, STATE_FORMAT } from "../types";
import {DATA} from '../core/Root'


export default class Factory<RowProps> {
    protected _observe = 0
    protected index: number = 0;
    storeId = () => this.index ? this.constructor.name + this.index : this.constructor.name

    constructor() {
        while (this.getState()) {
            this.index += 1
        }
        DATA.state[this.storeId()] = { data: [], meta: [] }
    }

    getState(): STATE_FORMAT<RowProps>{
        this.addDispatch()
        return  DATA.state[this.storeId()]
    }

    protected addDispatch(){
        Stack.create(this.storeId())
    }
  
     dispatch(){
        if(!DATA.noDispatch){
           if(DATA.onDispatch){
              const id = this.storeId()
              DATA.onDispatchModules = {...DATA.onDispatchModules, [id]: this.dispatch.bind(this)}
           }else{
              Stack.dispatch(this.storeId())
           }
        }
     }

     observe(): number{
        return this._observe
     }

    protected makeRow(row: RowProps & Partial<RowDefault>): Row<RowProps>{
        const _id = row._id || '_' + uid()
        const now = Date.now()
        this._observe = now
        return { ...row, _id, observe: now }
    }

    query(jpQuery: any, cb?: (x: any) => any): Row<RowProps>[]  {
        const state = this.getState().data
        let res = []

        try {
            let result: any = false
            if (typeof cb === 'function') {
                result = jpath.apply( state, makeQuery(jpQuery), cb)
            } else {
                result = jpath.query( state, makeQuery(jpQuery) )
            }
            res = result
        } catch (err) {
            console.error(err)
        }

        return res
    }

    metaQuery(jpQuery: any, cb?: (x: any) => any) {
        const state = this.getState().meta

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
        const state = this.getState().data
        try {
            const result: any = jpath.nodes(state, makeQuery(jpQuery) )
            return result
        } catch (err) {
            console.error(err)
        }
    }
}