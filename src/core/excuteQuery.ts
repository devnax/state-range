import JSONPath from "jsonpath";
import parser, { FormatedQuery } from "./parser";
import { is_object } from './utils'
import { QueryCallbackType, RowType } from '../types'

interface NodeType<RowProps> {
   path: any[];
   value: RowType<RowProps>
}


export const makeQuery = <Props>(query: string | Partial<Props>): FormatedQuery | void => {
   let _q = ''

   if (typeof query === 'string') {
      if (query.charAt(0) === '_') {
         _q = `@where _id='${query}'`
      } else {
         _q = query
      }
   } else if (typeof query === 'object' && is_object(query)) {
      let fquery: any = ''
      let and = ''
      for (let k in query) {
         let v: any = query[k]
         if (typeof v === 'string') {
            v = `'${v}'`
         }
         fquery += `${and}${k}==${v}`
         and = '&&'
      }

      if (fquery) {
         _q = `@where ${fquery}`
      }
   }

   return parser(_q)
}

const excuteWithQuery: { [key: string]: any } = {
   where: <Props>({ query }: any, data: any[], isEndQuery: boolean): RowType<Props>[] | NodeType<Props>[] => {
      if (query) {
         if (isEndQuery) {
            return JSONPath.nodes(data, query)
         } else {
            return JSONPath.query(data, query)
         }
      }
      return data
   },
   limit: <Props>({ query }: any, data: RowType<Props>[], isEndQuery: boolean): RowType<Props>[] | NodeType<Props>[] => {
      if (query) {
         if (isEndQuery) {
            return JSONPath.nodes(data, query)
         } else {
            return JSONPath.query(data, query)
         }
      }
      return data
   }
}

const excuteWithRaw: { [key: string]: any } = {
   select: <Props>(row: RowType<Props>, columns: string[]): RowType<Props> => {
      const cols: any = {}

      for (let colKey in row) {
         if (columns.includes(colKey)) {
            cols[colKey] = (row as any)[colKey]
         }
      }
      return {
         _id: row._id || '',
         observe: row.observe || '',
         ...cols
      }
   },
   unique: <Props>(data: NodeType<Props>[], fields: string[]): NodeType<Props>[] => {
      var flags: { [key: string]: any[] } = {}, output = [];

      for (let item of data) {
         const row: any = item.value

         let exists = false
         for (let f of fields) {
            let val: any = row[f]
            if (typeof val === 'function') {
               val = val.toString().replace(/\n| +/gi, '')
            } else if (typeof val === 'object') {
               val = JSON.stringify(val).replace(/\n| +/gi, '')
            }

            if (!flags[f]) {
               flags[f] = []
            }
            if (flags[f]?.includes(row[f])) {
               exists = true;
               break;
            }
            flags[f]?.push(row[f]);
         }
         if (!exists) {
            output.push(item);
         }
      }

      return output
   },
   orderby: <Props>(data: NodeType<Props>[], value: string[]): NodeType<Props>[] => {
      let _data = [...data]
      if (value) {
         const col = value[0]
         const by = value[1]
         _data.sort((a: any, b: any) => {
            if (by === 'desc') {
               return a.value[col] < b.value[col] ? 1 : -1
            } else {
               return a.value[col] > b.value[col] ? 1 : -1
            }
         })
      }
      return _data
   }
}



const excuteQuery = <Props>(query: string | object, json: RowType<Props>[], callback?: QueryCallbackType<Props>): RowType<Props>[] => {
   const parse = makeQuery(query)
   if (!parse) {
      return []
   }


   const queryKeys = [];
   const rawKeys: any = [];

   for (let key in parse) {
      if (excuteWithQuery[key]) {
         queryKeys.push(key)
      } else if (excuteWithRaw[key]) {
         rawKeys.push(key)
      }
   }

   let queryResults: NodeType<Props>[] | null = null
   let results: RowType<Props>[] | null = null

   for (let excKey in excuteWithQuery) {
      if ((parse as any)[excKey]) {
         const isEnd = queryKeys[queryKeys.length - 1] === excKey

         const queryOpt = (parse as any)[excKey]
         queryResults = excuteWithQuery[excKey](queryOpt, queryResults || json, isEnd)
         if (isEnd) {
            if (rawKeys.includes('unique')) {
               queryResults = excuteWithRaw.unique(queryResults, parse.unique.value)
            }
            if (rawKeys.includes('orderby')) {
               queryResults = excuteWithRaw.orderby(queryResults, parse.orderby.value)
            }

            if (queryResults) {
               results = queryResults?.map(function ({ value, path }: any) {
                  if (rawKeys.includes('select')) {
                     value = excuteWithRaw.select(value, parse.select.value)
                  }
                  if (typeof callback === 'function') {
                     callback({ index: path[1], value })
                  }
                  return value
               })
            }
            break;
         }
      }
   }

   return results || []
}

export default excuteQuery