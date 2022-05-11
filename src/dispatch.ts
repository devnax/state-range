import { is_callable } from "./utils"

export const DISPATCH = {
   noDispatch: false
}


export const noDispatch = (callback: Function) => {
   if(is_callable(callback)){
      DISPATCH.noDispatch = true
      callback()
      DISPATCH.noDispatch = false
   }
}