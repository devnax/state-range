import {STATE_TYPES, DispatchOptions } from "../types";

export const DATA: DispatchOptions = {
   state: {},
   noDispatch: false,
   onDispatch: false,
   onDispatchModules: {}
}

export const getState = () => DATA.state

export const replaceState = (data: STATE_TYPES) => {
   DATA.state = data
}

export const mergeState = (state: STATE_TYPES) => {
   for(let key in state){
      const item = state[key]
      if(DATA.state[key]){
         DATA.state[key] = {
            data: [...DATA.state[key].data, ...item.data],
            meta: [...DATA.state[key].meta, ...item.meta],
         }
      }else{
         DATA.state[key] = item
      }
   }
}


export const noDispatch = (callback: Function) => {
   DATA.noDispatch = true
   callback()
   DATA.noDispatch = false
}


export const dispatch = (cb: Function) => {
   DATA.onDispatch = true
   cb()
   DATA.onDispatch = false
   
   for(let key in DATA.onDispatchModules){
      const dispatch = DATA.onDispatchModules[key]
      dispatch()
   }
   DATA.onDispatchModules = {}
}