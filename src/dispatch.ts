import { is_callable } from "./utils"

export const DISPATCH = {
   onDispatch: false,
   noDispatch: false,
   dispatchables: []
}

export const dispatch = (callback: Function) => {
   if(is_callable(callback)){
      DISPATCH.onDispatch = true
      callback()
      DISPATCH.onDispatch = false
   }
}


export const noDispatch = (callback: Function) => {
   if(is_callable(callback)){
      DISPATCH.noDispatch = true
      callback()
      DISPATCH.noDispatch = false
   }
}