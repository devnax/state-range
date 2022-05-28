
export interface WithStoreClassProps{
   children?: JSX.Element;
   id: string;
   dispatch: Function;
}



export interface StackProps {
   id: string;
   storeId: string;
   dispatch: Function;
   type: "data" | "meta"
}


export interface RowDefault{
   _id: string;
   observe: number
}

export type Row<More = any> = RowDefault & More
export type RowType<More = any> = RowDefault & More
export type PartOfRow<More = any> = Partial<RowDefault | More>
export type MetaRowType = Row<{meta_key: string, meta_value: any}>

export interface STATE_FORMAT<RowType = object>{
   data: Row<RowType>[];
   meta: PartOfRow<MetaRowType>[];
}

export type STATE_TYPES = {
   [key: string]: STATE_FORMAT<Row<any>>
}


export interface DispatchOptions {
   state: STATE_TYPES;
   noDispatch: boolean;
   onDispatch: boolean;
   onDispatchModules: StackProps[]
}


export interface StoreDispatchCallbackInfo{
   type: "data" | "meta",
   name: string
}

export type WhereType<Props> = string | PartOfRow<Props>



export interface QueryCallbackTypeProps<P>{
   value: Row<P>; 
   type: any; 
   payload: any;
   index: number;
}
export type QueryCallbackType<Props> = (options: QueryCallbackTypeProps<Props>) => PartOfRow<Props> | null | void

export type JPCallbackType<Props = object> = (value: Row<Props>, type: string, payload: object ) => PartOfRow<Props> | null | void