export const uid = () => Math.random().toString(36).substring(2)
export const is_object = (val:any, or = false) => typeof val === 'object' && val !== null && !Array.isArray(val) ? val : or
export const is_array = (val:any, or = false) => typeof val === 'object' && Array.isArray(val) ? val : or
export const in_array = (item:any, arr:any[], or = false) => is_array(arr) && arr.indexOf(item) != -1 ? true : or
export const is_string = (val:any, or = false) => typeof val === 'string' ? true : or
export const is_number = (val:any, or = false) => typeof val === 'number' ? true : or
export const is_callable = (val:any, or = false) => typeof val === 'function' ? val : or