import Query from './Query'

const META:any = {}


export default class Meta extends Query{
   constructor(){
      super()
      if(!META.hasOwnProperty(this.constructor.name)){
         META[this.constructor.name] = []
      }
   }

   setMeta(meta_key: string | number, meta_value: any){
      const exists = this.getMetaInfo(meta_key)

      if(exists){
         this.metaQuery({meta_key}, (prevRow: object) => {
            const row = (this as any).makeRow(prevRow)
            return {...row, meta_value, _id: row._id}
         })
      }else{
         const row = (this as any).makeRow({
            meta_key,
            meta_value
         })
         META[this.constructor.name].push(row)
      }
      
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('addMeta')
      }
      (this as any).dispatch()
   }

   getMeta(meta_key: string | number, def?: any){
      (this as any).addDispatch()
      const exists = this.metaQuery({meta_key})
      if(exists.length){
         return exists[0].meta_value
      }else{
         return def != undefined ? def : null
      }
   }

   useMeta(meta_key: string | number, def?: object){
      const data = this.getMeta(meta_key, def)
      return [data, (newdata: object) => this.setMeta(meta_key, {...data, ...newdata})]
   }

   getAllMata(){
      (this as any).addDispatch()
      return META[this.constructor.name]
   }

   deleteMeta(meta_key: string | number){
      (this as any)._observe   = Date.now()
      this.metaQuery({meta_key}, () => null)
      META[this.constructor.name] = this.metaQuery('@')
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('deleteMeta')
      }
      (this as any).dispatch()
   }

   deleteAllMeta(){
      (this as any)._observe   = Date.now()
      META[this.constructor.name] = []
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('deleteAllMeta')
      }
      (this as any).dispatch()
   }

   getMetaInfo(meta_key: string | number, def?: object){
      (this as any).addDispatch()
      const exists = this.metaQuery({meta_key})
      if(exists.length){
         return exists[0]
      }else{
         return def ? def : null
      }
   }

   observeMeta(meta_key: string | number){
      const meta = this.getMetaInfo(meta_key)
      if(meta){
         return meta.observe
      }
      return 0
   }
}