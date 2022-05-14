export const uid = () => Math.random().toString(36).substring(2)
export const is_object = (val:any, or = false) => typeof val === 'object' && val !== null && !Array.isArray(val) ? val : or