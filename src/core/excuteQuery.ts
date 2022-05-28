import { JSONPath } from "jsonpath-plus";
import parser, {FormatedQuery} from "./parser";
import {is_object} from './utils'
import {JPCallbackType, RowType} from '../types'


const makeQuery = (query: any): FormatedQuery | void => {
   let _q = query
   if (typeof query === 'string' && query.charAt(0) === '_') {
      _q = `where _id='${query}'`
   } else if (is_object(query)) {
      let fquery: any = ''
      let and = ''
      for (let k in query) {
         let v = query[k]
         if (typeof v === 'string') {
            v = `'${v}'`
         }
         fquery += `${and}${k}==${v}`
         and = '&&'
      }
      
      if (fquery) {
         _q = `where ${fquery}`
      }
   }else if(Array.isArray(query)){
      _q = `select ${query.join(',')}`
   }

   return parser(_q)
}


const excuteWithQuery: {[key: string]: any} = {
   where: ({query, valueType}: any, data: any[], callback?: JPCallbackType): any[] => {
      if(query){
         return JSONPath({ path: query, json: data, resultType: valueType, callback })
      }
      return data
   },
   limit: ({query, valueType}: any, data: any[], callback?: JPCallbackType): any[] => {
      if(query){
         return JSONPath({ path: query, json: data, resultType: valueType, callback })
      }
      return data
   }
}

const excuteWithRaw: {[key: string]: any} = {
   select:({value}: any, data: any[], callback?: (row: object) => object | any): any[] => {
      if(value.length && !value.includes('*')){
         const formate = [];
         for(let item of data){
            const cols: any = {}
            if(typeof callback === 'function'){
               const res = callback(item)
               if(res){
                  item = res
               }
            }
            for(let colKey of value){
               if(item[colKey]){
                  cols[colKey] = item[colKey]
               }
            }

            formate.push({
               _id: item._id || '',
               observe: item.observe || '',
               ...cols
            })
         }

         return formate
      }
      return data
   },
   orderby:({value}: any, data: any[], callback?: (row: object) => object | any): any[] => {
      let _data = [...data]
      if(value){
         const col = value[0]
         const by  = value[1]
         
         _data.sort((a, b) => {
            if(typeof callback === 'function'){
               const res = callback(a)
               if(res){
                  a = res
               }
            }

            if(by === 'desc'){
               return a[col] < b[col] ? 1 : -1
            }else{
               return a[col] > b[col] ? 1 : -1
            }
         })
      }
      return _data
   }
}



export default <P = object>(query: string, json: any[], callback?: JPCallbackType<P>): any[] => {
   const parse = makeQuery(query)
   
   if(!parse){
      return []
   }
   
   let result: object[] | null = null
   const queryKeys = [];
   const rawKeys = [];

   for(let key in parse){
      if(excuteWithQuery[key]){
         queryKeys.push(key)
      }else if(excuteWithRaw[key]){
         rawKeys.push(key)
      }
   }


   const rowInfo: {[key: string]: object} = {}

   for(let excKey in excuteWithQuery){
      if((parse as any)[excKey]){
         const isEnd = queryKeys[queryKeys.length-1] === excKey
         let _callback: any = isEnd ? callback : undefined
         if(isEnd && rawKeys.length){
            _callback = (value: RowType, type: string, payload: object) => {
               rowInfo[value._id] = {value, type, payload}
            }
         }

         const queryOpt = (parse as any)[excKey]
         result = excuteWithQuery[excKey](queryOpt, result || json, _callback)
         if(isEnd){
            break;
         }
      }
   }
   
   for(let excKey in excuteWithRaw){
      if((parse as any)[excKey]){
         const isEnd = rawKeys[rawKeys.length-1] === excKey
         let _callback;

         if(isEnd && callback){
            _callback = (row: any) => {
               if(typeof callback === 'function'){
                  const {value, type, payload}: any = rowInfo[row._id]
                  return callback(value, type, payload)
               }
            }
         }

         const queryOpt = (parse as any)[excKey]
         result = excuteWithRaw[excKey](queryOpt, result || json, _callback)
         
         if(isEnd){
            break;
         }
      }
   }
   
   return result || []
}