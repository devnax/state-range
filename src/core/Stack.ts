import Query from './Query'

interface DataProps {
   id: string;
   dispatch: Function;
   active?: boolean;
   stores?: any[]
}

interface CurrentItem {
   dispatch: Function;
   id: string
}

class Stack extends Query {

   STATE: object[] = []
   currentItem: CurrentItem | null = null

   dispatch(storeId: string) {
      const items = this.query({ storeId })
      for (let item of items) {
         item?.dispatch()
      }
   }

   create(storeId: string) {
      const exists = this.query({ storeId, id: this.currentItem?.id })
      if (!exists.length) {
         this.STATE.push({ ...this.currentItem, storeId })
      }
   }

   update(data: Partial<DataProps>, where: object) {
      this.query(where, (prevRow: DataProps) => {
         return { ...prevRow, ...data, id: prevRow.id }
      })
   }

   delete(where: string | object) {
      if (typeof where === 'string') {
         where = { id: where }
      }
      this.query(where, () => null)
      this.STATE = this.query('@')
   }

   findById(id: string) {
      const ex = this.query({ id }) || []
      return ex.length ? ex[0] : null
   }
}


export default new Stack()