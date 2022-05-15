import {DispatchOptions} from '../types'

export const DISPATCH: DispatchOptions = {
   noDispatch: false,
   onDispatch: false,
   onDispatchModules: {}
}

export const noDispatch = (callback: Function) => {
   DISPATCH.noDispatch = true
   callback()
   DISPATCH.noDispatch = false
}


export const dispatch = (cb: Function) => {
   DISPATCH.onDispatch = true
   cb()
   DISPATCH.onDispatch = false
   
   for(let key in DISPATCH.onDispatchModules){
      const dispatch = DISPATCH.onDispatchModules[key]
      dispatch()
   }
   DISPATCH.onDispatchModules = {}
}