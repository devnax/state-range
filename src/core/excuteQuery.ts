import { JSONPath } from "jsonpath-plus";
import parser, {FormatedQuery} from "./parser";
import {is_object} from './utils'
import {QueryCallbackType} from '../types'


const excuteWithQuery: {[key: string]: any} = {
   where: ({query, valueType}: any, data: any[], callback?: QueryCallbackType<object>): any[] => {
      if(query){
         return JSONPath({ path: query, json: data, resultType: valueType, callback })
      }
      return data
   },
   limit: ({query, valueType}: any, data: any[], callback?: QueryCallbackType<object>): any[] => {
      if(query){
         return JSONPath({ path: query, json: data, resultType: valueType, callback })
      }
      return data
   }
}

const excuteWithRaw: {[key: string]: any} = {
   select:({value}: any, data: any[]): any[] => {
      if(value.length && !value.includes('*')){
         const formate = [];
         for(let item of data){
            const cols: any = {}

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
   orderby:({value}: any, data: any[]): any[] => {
      const _data = [...data]
      if(value){
         const col = value[0]
         const by = value[1]
         return _data.sort((a, b) => {
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


export default <P>(query: string, json: any[], callback?: QueryCallbackType<P>): any[] => {
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

   for(let excKey in excuteWithQuery){
      if((parse as any)[excKey]){
         const isEnd = queryKeys[queryKeys.length-1] === excKey
         const _callback = isEnd ? callback : undefined

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
         const _callback = isEnd ? callback : undefined
         const queryOpt = (parse as any)[excKey]
         result = excuteWithRaw[excKey](queryOpt, result || json, _callback)
         if(isEnd){
            break;
         }
      }
   }
   
   return result || []
}