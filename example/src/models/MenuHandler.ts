import {ReactElement, ComponentType} from 'react'
import {Store} from '../../../.'

export interface MenuProps{
   _id?: string,
   observe?: string,
   sectionTitle?: string;
   title: string;
   path: string;
   icon?: ReactElement;
   parentPath?: string;
   onClick?: Function;
   hide?: boolean;
   menuWrapper?: ComponentType;
   divider?: boolean;
   active?: boolean;
}

class RDAdminLayoutMenuHandler extends Store {

   formatPath(path: string) {
      return path?.replace(/^\/+|\/+$/g, '') || '/'
   }

   create(options: MenuProps) {

      if (options?.parentPath) {
         options.parentPath = this.formatPath(options?.parentPath)
      }
      options.path = this.formatPath(options?.path)
      const isParent = options?.parentPath ? false : true
      const exists = this.findFirst({ path: options.path, isParent })

      if (!exists) {
         this.insert({
            isParent,
            hide: options.hide || false,
            active: false,
            ...options
         })
      } else {
         //throw new Error("Path Already Exists!");
      }
   }



}

const handler = new RDAdminLayoutMenuHandler()
export default handler
