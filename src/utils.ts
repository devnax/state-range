export const uid = () => Math.random().toString(36).substring(2)
export const is_object = (val:any, or = false) => typeof val === 'object' && val !== null && !Array.isArray(val) ? val : or
// export const is_string = (val:any, or = false) => typeof val === 'string' ? true : or
// export const is_number = (val:any, or = false) => typeof val === 'number' ? true : or
// export const is_callable = (val:any, or = false) => typeof val === 'function' ? val : or