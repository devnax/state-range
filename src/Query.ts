import { is_callable, is_number, is_object, is_string } from "./utils";
import jpath from 'jsonpath'

export default class Query{

    private expression(ex: any){
        let _q
        if(is_number(ex)){
            _q = `$[${ex}]` // with index
        }else if(is_string(ex)){
            if(ex.charAt(0) == '@'){
                _q = `$[?(${ex})]`
            }else{
                _q = `$[?(@._id=='${ex}')]`
            }
        }else if(is_object(ex)){
            let _and = ""
            let fex = ''// formate
            for(let k in ex){
                let v = ex[k]
                if(is_string(ex[k])){
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
        const state = (this as any).getData()
        try{
            let result: any = false
            if(is_callable(cb)){
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
        const state = (this as any).getAllMata()
        try{
            let result: any = false
            if(is_callable(cb)){
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
        const state = (this as any).getData()
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