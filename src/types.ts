
export interface StackProps {
   id: string;
   dispatch: Function;
   stores?: any[]
}


export interface STATE_FORMAT{
   data: object[];
   meta: object[];
}

export type STATE_TYPES = {
   [key: string]: STATE_FORMAT
}


export interface RowDefault{
   _id: string;
   observe: number
}

export type Row<More> = RowDefault & More
export type PartOfRow<More> = Partial<RowDefault | More>


export interface DispatchOptions {
   noDispatch: boolean;
   onDispatch: boolean;
   onDispatchModules: {[key: string]: Function};
}