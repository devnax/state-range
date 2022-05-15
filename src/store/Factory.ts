import {uid, makeQuery } from "../core/utils";
import jpath from 'jsonpath'
import Stack from '../core/Stack'
import { DISPATCH } from '../core/dispatch'
import {Row, RowDef } from "../types";

import {STATE} from '../core/State'


export default class Factory<RowProps> {
    protected _observe = 0
    protected index: number = 0;
    storeId = () => this.index ? this.constructor.name + this.index : this.constructor.name

    constructor() {
        while (STATE[this.storeId()]) {
            this.index += 1
        }

        STATE[this.storeId()] = { data: [], meta: [] }
    }

    protected addDispatch(){
        Stack.create(this.storeId())
    }
  
     dispatch(){
        if(!DISPATCH.noDispatch){
           if(DISPATCH.onDispatch){
              const id = this.storeId()
              DISPATCH.onDispatchModules = {...DISPATCH.onDispatchModules, [id]: this.dispatch.bind(this)}
           }else{
              Stack.dispatch(this.storeId())
           }
        }
     }

     observe(): number{
        return this._observe
     }

    protected makeRow(row: RowProps & Partial<RowDef>): Row<RowProps>{
        const _id = row._id || '_' + uid()
        const now = Date.now()
        this._observe = now
        return { ...row, _id, observe: now }
    }

    query(jpQuery: any, cb?: (x: any) => any): Row<RowProps>[]  {
        const state = STATE[this.storeId()].data
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
        const state = STATE[this.storeId()].meta

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
        const state = STATE[this.storeId()].data
        try {
            const result: any = jpath.nodes(state, makeQuery(jpQuery) )
            return result
        } catch (err) {
            console.error(err)
        }
    }
}