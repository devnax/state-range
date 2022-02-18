
class Stock{

   private _stocks: any = {}

   currentToken: string = ''

   add(token: string, compId: string | number, value: object){
      if(!this._stocks.hasOwnProperty(token)){
         this._stocks[token] = {}
      }

      if (!this._stocks[token].hasOwnProperty(compId)) {
         this._stocks[token][compId] = value
      }else{
         this._stocks[token][compId] = {...this._stocks[token][compId], ...value}
      }
   }

   remove(token: string, compId?: string | number){
      if(this._stocks.hasOwnProperty(token)){
         const stk = this._stocks[token]
         if(compId){
            if(stk.hasOwnProperty(compId)){
               delete this._stocks[token][compId]
            }
         }else{
            delete this._stocks[token]
         }
      }
   }

   get(token: string, compId?: string | number){
      if(this._stocks.hasOwnProperty(token)){
         const stk = this._stocks[token]
         if(compId){
            if(stk.hasOwnProperty(compId)){
              return this._stocks[token][compId]
            }
         }else{
            return this._stocks[token]
         }
      }
   }

   getCurrent(){
      return this.get(this.currentToken)
   }

   dispatch(token: string){
      const get = this.get(token)
      if(get){
         for(let key in get){
            const item = get[key]
            item.dispatch()
         }
      }
   }
}

export default new Stock