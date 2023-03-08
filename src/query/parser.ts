
export interface FormatedQuery {
   where: {
      query: string;
      value: string;
   };
   limit: {
      query: string;
      value: number[];
   };
   select: {
      query: string | null;
      value: string[];
   };
   orderby: {
      query: string | null;
      value: [string, string];
   };
   unique: {
      query: string | null;
      value: string[];
   };
}

const formaters: any = {

   where: (q: string) => {
      const isLikeQuery = q.match(/(\w+)\s+like/gi) ? true : false;
      // SINGLE EQUAL TO DOUBLE
      q = q.replace(/=+/g, "==");

      // SPLIT FROM && and ||
      q = q.replace(/\s?(&&|\|\|)\s?/g, "$1").trim();

      const split = q.split(/(&&|\|\|)/gi);
      let query = "";
      for (let i = 0; i < split.length; i++) {
         let item = split[i];
         if (item === "&&" || item === "||") {
            if (!query || !split[i + 1]) {
               console.error(`unexpected operator ${item}`)
            } else {
               query += item;
            }
         } else {
            item = item.replace(/(\w+==)/gi, "@.$1");
            // @property.match(val)
            // item = item.replace(
            //    /@\w+\s+like\s+['|"]?([a-zA-Z0-9%]+)['|"]?/gi,
            //    "@property.match(/$2/i)"
            // );

            // name like ^any$ - /^.*any.*$/i.test(@.name)
            item = item.replace(
               /(\w+)\s+like\s+(\^)?([a-zA-Z0-9]+)(\$)?/gi,
               `/.*$2$3$4.*/i.test(@.$1)`
            );

            // add @ in single property
            if (split[i] === item) {
               item = `@.${item}`
            }

            query += item;
         }
      }

      q = query
      q = q.replace(/%(\w+)/gi, "^$1"); // replace start % to ^
      q = q.replace(/(\w+)%/gi, "$1$"); // replace end % to $

      // QUERY FORMATE
      q = `$[?(${q})]`;

      // SINGLE EQUAL TO DOUBLE
      q = q.replace(/=+/g, "==");

      // REMOVE MULTIPLE SPACE TO SINGLE
      q = q.replace(/ +/g, " ");

      return {
         query: q,
         value: null,
         valueType: isLikeQuery ? "parent" : "value"
      }
   },
   limit: (q: string) => {
      const value = q
         .replace(/ /g, "")
         .split(",")
         .map((item) => parseInt(item))

      return {
         query: value.length === 2 && value[1] ? `$[${value[0]}:${value[1]}]` : `$[0:${value[0]}]`,
         value,
      }
   },
   select: (q: string): FormatedQuery['select'] => {
      return {
         query: null,
         value: q.replace(/ /g, "").split(","),
      }
   },
   unique: (q: string): FormatedQuery['unique'] => {
      return {
         query: null,
         value: q.replace(/ /g, "").split(","),
      }
   },
   orderby: (q: string) => {
      const sp = q.trim().split(" ")
      return {
         query: null,
         value: [sp[0], sp[1] || 'desc'],
      }
   }
};

const parser = (sql: string): FormatedQuery | void => {
   if (!sql) return;

   // query string will be like: @select name @where id=1
   const keys = '@' + Object.keys(formaters).join("|@");
   const regex = new RegExp(`(${keys})`, "gim");
   sql = sql.replace(/\n/gim, " ").trim();
   sql = sql.replace(/ +/g, " ")
   let find = sql.replace(regex, "_$#_{$1}");
   let founds = find.split("_$#_");
   founds.shift();

   const parse: any = {};
   const parsedKey: any[] = [];

   for (let f of founds) {
      const s = f.split(/\{@(\w+)\}/gi);
      s.shift();
      const key = s[0].toLowerCase();
      const value = s[1];
      if (parsedKey.includes(key)) {
         throw new Error(`${key} uses multiple times`);
      }
      parsedKey.push(key);
      if (formaters[key]) {
         let val = formaters[key](value);
         parse[s[0].toLowerCase()] = val;
      }
   }

   if (founds.length && !parse.where?.query && !parse.limit?.query) {
      parse['where'] = formaters.where('_id')
   }

   return parse;
};

export default parser



