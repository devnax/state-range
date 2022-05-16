import Factory from './Factory'
import {DATA} from '../core/Root'

export default class Meta<RowProps> extends Factory<RowProps>{
   
   setMeta(meta_key: string, meta_value: any){
      const exists = this.metaQuery({meta_key})

      if(exists.length){
         this.metaQuery({meta_key}, (prevRow: object) => {
            const row = (this as any).makeRow(prevRow)
            return {...row, meta_value, _id: row._id}
         })
      }else{
         const row = (this as any).makeRow({
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

   getMeta(meta_key: string, def?: any){
      this.addDispatch({type: "meta", name: 'getMeta'})
      const exists = this.metaQuery({meta_key})
      if(exists.length){
         return exists[0].meta_value
      }else{
         return def !== undefined ? def : null
      }
   }

   useMeta(meta_key: string, def?: any): [any, (newdata: any) => any]{
      const data = this.getMeta(meta_key, def)
      return [data, (newdata: any) => this.setMeta(meta_key, newdata)]
   }

   deleteMeta(meta_key: string){
      (this as any)._observe   = Date.now()
      this.metaQuery({meta_key}, () => null)
      DATA.state[this.storeId()].meta = this.metaQuery('@')
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

   getMetaInfo(meta_key: string, def?: object){
      this.addDispatch({type: "meta", name: 'getMetaInfo'})
      const exists = this.metaQuery({meta_key})
      if(exists.length){
         return exists[0]
      }else{
         return def ? def : null
      }
   }

   observeMeta(meta_key: string): number{
      const meta = this.getMetaInfo(meta_key)
      return meta ? meta.observe : 0
   }
}