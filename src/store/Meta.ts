import Factory from './Factory'
import { DATA } from '../core/Root'
import { MetaRowType } from "../types";

export default class Meta<RowProps, MetaProps> extends Factory<RowProps>{

   setMeta<T extends keyof MetaProps>(meta_key: T, meta_value: MetaProps[T]) {
      const exists = this.metaQuery({ meta_key })
      if (exists.length) {
         this.metaQuery({ meta_key }, ({ value, index }): any => {
            const row = this.makeRow(value)
            DATA.state[this.storeId()].meta[index] = { ...row, meta_key, meta_value, _id: row._id }
         })
      } else {
         const row = this.makeRow({ meta_key, meta_value })
         DATA.state[this.storeId()].meta.push(row)
      }

      if (typeof (this as any).onUpdate == 'function') {
         (this as any).onUpdate('meta', 'addMeta')
      }
      this.dispatch({ type: 'meta', name: 'setMeta' })
   }

   getMeta<T extends keyof MetaProps>(meta_key: T, def?: MetaProps[T]): MetaProps[T] | null {
      this.addDispatch({ type: "meta", name: 'getMeta' })
      const exists = this.metaQuery({ meta_key })
      let value: any;
      if (exists.length) {
         value = exists[0].meta_value
      } else {
         value = def !== undefined ? def : null
      }
      return value
   }

   useMeta<T extends keyof MetaProps>(meta_key: T, def?: MetaProps[T]): [MetaProps[T] | null, (_data: MetaProps[T]) => MetaProps[T] | void] {
      const data = this.getMeta(meta_key, def)
      return [data, (_data) => this.setMeta(meta_key, _data)]
   }

   deleteMeta(meta_key: keyof MetaProps) {
      const deletable: any = []
      this.metaQuery({ meta_key }, ({ index }) => {
         deletable.push(index)
      })
      if (!deletable.length) {
         return
      }
      for (let index of deletable) {
         DATA.state[this.storeId()].meta.splice(index, 1)
      }
      if (typeof (this as any).onUpdate == 'function') {
         (this as any).onUpdate('meta', 'deleteMeta')
      }
      this.dispatch({ type: 'meta', name: 'deleteMeta' })
   }

   deleteAllMeta() {
      DATA.state[this.storeId()].meta = []
      if (typeof (this as any).onUpdate == 'function') {
         (this as any).onUpdate('meta', 'deleteAllMeta')
      }
      this.dispatch({ type: 'meta', name: 'deleteAllMeta' })
   }

   getMetaInfo<T extends keyof MetaProps>(meta_key: T, def?: MetaProps[T]): MetaRowType | null {
      this.addDispatch({ type: "meta", name: 'getMetaInfo' })
      const exists = this.metaQuery({ meta_key })
      let value: any;
      if (exists.length) {
         value = exists[0]
      } else {
         value = def ? { meta_key, meta_value: def, observe: 0, _id: Math.random() } as any : null
      }
      return value;
   }

   observeMeta(meta_key: keyof MetaProps): number {
      const meta = this.getMetaInfo(meta_key)
      if (meta) {
         return meta.observe
      }
      return 0
   }
}