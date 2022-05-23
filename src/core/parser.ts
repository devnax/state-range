const formaters: any = {
   from: (q: string) => q.replace(/ /g, ""),
   insert: (q: string) => q.replace(/ /g, "").split(","),
   values: (q: string) => q.replace(/ /g, "").split(","),
   update: (q: string) => {
      q = q.replace(/ /g, "");
      const splitWithComa = q.split(",");
      const val: any = {};
      for (let item of splitWithComa) {
         const s = item.split("=");
         val[s[0]] = s[1];
      }
      return val;
   },
   delete: () => { },
   select: (q: string) => q.replace(/ /g, "").split(","),
   where: (q: string) => {
      return q.replace(/ /g, "");
   },
   orderby: (q: string) => q.trim().split(" "),
   limit: (q: string) =>
      q.replace(/ /g, "").split(",").map((item) => parseInt(item))
};

const parseSql = ( sql: string, callback?: (key: string, val: any) => any) => {
   const keys = Object.keys(formaters).join("|");

   const regex = new RegExp(`(${keys})`, "gi");
   sql = sql.replace(/\n/gim, "").trim();
   let find = sql.replace(regex, "|$1#");
   let founds = find.split("|");
   founds.shift();

   let query: any = {};
   let parsedKey: any[] = [];

   for (let f of founds) {
      const s = f.split("#");
      const key = s[0].toLowerCase();
      if (parsedKey.includes(key)) {
         throw new Error(`${key} uses multiple times`);
      }
      parsedKey.push(key);
      const value = s[1];
      if (formaters[key]) {
         let val = formaters[key](value)
         if (typeof callback === 'function') {
            val = callback(key, val)
         }

         query[s[0].toLowerCase()] = val;
      }
   }
   return query;
};


export default parseSql
