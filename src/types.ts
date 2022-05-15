
export interface StackProps {
   id: string;
   dispatch: Function;
   stores?: any[]
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
   onDispatchModules: {[key: string]: Function}
}