import { is_object } from "../utils";
import jpath from 'jsonpath'

export default class Query{

    private expression(ex: any){
        let _q
        if(typeof ex === 'number'){
            _q = `$[${ex}]` // with index
        }else if(typeof ex === 'string'){
            // ID
            if(ex.charAt(0) === '_'){
                _q = `$[?(@._id=='${ex}')]`
            }else if(ex.charAt(0) === '@'){
                _q = `$[?(${ex})]`
            }else{
                _q = `$${ex}` // jsonpat expression
            }
        }else if(is_object(ex)){
            let _and = ""
            let fex = ''// formate
            for(let k in ex){
                let v = ex[k]
                if(typeof ex[k] === 'string'){
                    v = `'${ex[k]}'`
                }
                fex += `${_and}@.${k}==${v}`
                _and = '&&'
            }
            if(fex){
                _q = `$[?(${fex})]`
            }else{
                _q = `$[?(@)]`
            }
        }else{
            _q = `$[?(@)]`
        }
        return _q
    }

    query(jpQuery: any, cb?: any){
        const state = (this as any).dataState()
        try{
            let result: any = false
            if(typeof cb === 'function'){
                result = jpath.apply(
                    state, 
                    this.expression(jpQuery),
                    cb)
            }else{
                result = jpath.query(
                    state,
                    this.expression(jpQuery)
                )
            }
            return result
        }catch(err){
            console.error(err)
        }
    }

    metaQuery(jpQuery: any, cb?: any){
        const state = (this as any).metaState()
        
        try{
            let result: any = false
            if(typeof cb === 'function'){
                result = jpath.apply(
                    state, 
                    this.expression(jpQuery),
                    cb)
            }else{
                result = jpath.query(
                    state,
                    this.expression(jpQuery)
                )
            }
            return result
        }catch(err){
            console.error(err)
        }
    }

    queryNodes(jpQuery: any){
        const state = (this as any).dataState()
        try{
            const result:any = jpath.nodes(
                state, 
                this.expression(jpQuery)
            )
            return result
        }catch(err){
            console.error(err)
        }
    }
}