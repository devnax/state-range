export const uid = () => Math.random().toString(36).substring(2)
export const is_object = (val: any, or = false) => typeof val === 'object' && val !== null && !Array.isArray(val) ? val : or

export const makeQuery = (ex: any): string | null => {
   let _q = null
   if (typeof ex === 'string' && ex.charAt(0) === '_') {
      // ID
      _q = `$[?(@._id=='${ex}')]`

   } else if (is_object(ex)) {
      let _and = ""
      let fex = ''// formate
      for (let k in ex) {
         let v = ex[k]
         if (typeof ex[k] === 'string') {
            v = `'${ex[k]}'`
         }
         fex += `${_and}@.${k}==${v}`
         _and = '&&'
      }
      if (fex) {
         _q = `$[?(${fex})]`
      } else {
         _q = `$[?(@)]`
      }
   }
   return _q
}