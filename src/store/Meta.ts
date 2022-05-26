import Factory from './Factory'
import {DATA} from '../core/Root'
import { MetaRowType } from "../types";

export default class Meta<RowProps> extends Factory<RowProps>{
   
   setMeta(meta_key: string, meta_value: any){
      const exists = this.metaQuery({meta_key})

      if(exists.length){
         this.metaQuery({meta_key}, ({value}) => {
            const row = this.makeRow(value)
            return {...row, meta_value, _id: row._id}
         })
      }else{
         const row = this.makeRow({
            meta_key,
            meta_value
         })

         DATA.state[this.storeId()].meta.push(row)
      }
      
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('meta', 'addMeta')
      }
      this.dispatch({type: 'meta', name: 'setMeta'})
   }

   getMeta(meta_key: string, def?: any): any{
      this.addDispatch({type: "meta", name: 'getMeta'})
      const exists = this.metaQuery({meta_key})
      
      if(exists.length){
         return exists[0].meta_value
      }else{
         return def !== undefined ? def : null
      }
   }

   useMeta(meta_key: string, def?: any): [any, (_data: any) => any]{
      const data = this.getMeta(meta_key, def)
      return [data, (_data: any) => this.setMeta(meta_key, _data)]
   }

   deleteMeta(meta_key: string){
      (this as any)._observe   = Date.now()
      const deletable: any = []
      this.metaQuery({meta_key}, ({index}) => {
         deletable.push(index)
      })
      if(!deletable.length){
         return
      }
      for(let index of deletable){
         DATA.state[this.storeId()].meta.splice(index, 1)
      }
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('meta', 'deleteMeta')
      }
      this.dispatch({type: 'meta', name: 'deleteMeta'})
   }

   deleteAllMeta(){
      (this as any)._observe   = Date.now()
     DATA.state[this.storeId()].meta = []
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('meta', 'deleteAllMeta')
      }
      this.dispatch({type: 'meta', name: 'deleteAllMeta'})
   }

   getMetaInfo(meta_key: string, def?: any): MetaRowType | null{
      this.addDispatch({type: "meta", name: 'getMetaInfo'})
      const exists = this.metaQuery({meta_key})
      if(exists.length){
         return exists[0]
      }else{
         return def ? {meta_key, meta_value: def, observe: 0, _id: Math.random().toString()} : null
      }
   }

   observeMeta(meta_key: string): number{
      const meta = this.getMetaInfo(meta_key)
      if(meta){
         return meta.observe
      }
      return 0
   }
}