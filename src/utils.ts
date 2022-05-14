export const uid = () => Math.random().toString(36).substring(2)
export const is_object = (val: any, or = false) => typeof val === 'object' && val !== null && !Array.isArray(val) ? val : or

export const makeQuery = (ex: any) => {
   let _q
   if (typeof ex === 'number') {
      _q = `$[${ex}]` // with index
   } else if (typeof ex === 'string') {
      // ID
      if (ex.charAt(0) === '_') {
         _q = `$[?(@._id=='${ex}')]`
      } else if (ex.charAt(0) === '@') {
         _q = `$[?(${ex})]`
      } else {
         _q = `$${ex}` // jsonpat expression
      }
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
   } else {
      _q = `$[?(@)]`
   }
   return _q
}