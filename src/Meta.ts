import Query from './Query'


const META:any = {
   Media: []
}


export default class Meta extends Query{
   constructor(){
      super()
      if(!META.hasOwnProperty(this.constructor.name)){
         META[this.constructor.name] = []
      }
   }

   setMeta(meta_key: string | number, meta_value: any){
      const exists = this.getInfo(meta_key)

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

   getMatas(){
      (this as any).addDispatch()
      return META[this.constructor.name]
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

   getInfo(meta_key: string | number, def?: object){
      (this as any).addDispatch()
      const exists = this.metaQuery({meta_key})
      if(exists.length){
         return exists[0]
      }else{
         return def ? def : null
      }
   }

   deleteMeta(meta_key: string | number){
      this.metaQuery({meta_key}, () => null)
      META[this.constructor.name] = this.metaQuery('@')
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('deleteMeta')
      }
      (this as any).dispatch()
   }

   deleteAllMeta(){
      META[this.constructor.name] = []
      if(typeof (this as any).onUpdate == 'function'){
         (this as any).onUpdate('deleteAllMeta')
      }
      (this as any).dispatch()
   }
}