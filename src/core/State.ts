import {STATE_TYPES } from "../types";

export let STATE: STATE_TYPES = {}

export const replaceState = (data: STATE_TYPES) => {
   STATE = data
}

export const mergeState = (state: STATE_TYPES) => {
   for(let key in state){
      const item = state[key]
      if(STATE[key]){
         STATE[key] = {
            data: [...STATE[key].data, ...item.data],
            meta: [...STATE[key].meta, ...item.meta],
         }
      }else{
         STATE[key] = item
      }
   }
}

export const getState = () => STATE