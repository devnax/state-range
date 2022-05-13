import Query from './Query'

export default class Meta extends Query{
   
   protected META_STATE: object[] = []

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
         this.META_STATE.push(row)
      }
      
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('addMeta')
      }
      (this as any).dispatch()
   }

   getMeta(meta_key: string, def?: any){
      (this as any).addDispatch()
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

   getMataState(){
      (this as any).addDispatch()
      return this.META_STATE
   }

   deleteMeta(meta_key: string){
      (this as any)._observe   = Date.now()
      this.metaQuery({meta_key}, () => null)
      this.META_STATE = this.metaQuery('@')
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('deleteMeta')
      }
      (this as any).dispatch()
   }

   deleteAllMeta(){
      (this as any)._observe   = Date.now()
      this.META_STATE = []
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('deleteAllMeta')
      }
      (this as any).dispatch()
   }

   getMetaInfo(meta_key: string, def?: object){
      (this as any).addDispatch()
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