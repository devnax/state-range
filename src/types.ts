
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
export type PartOfRow<More = any> = Partial<RowDefault | More>


export interface STATE_FORMAT<RowType = object>{
   data: Row<RowType>[];
   meta: object[];
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