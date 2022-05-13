export const DISPATCH = {
   noDispatch: false
}

export const noDispatch = (callback: Function) => {
   DISPATCH.noDispatch = true
   callback()
   DISPATCH.noDispatch = false
}