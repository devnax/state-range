

export type RowType<More> = More & {
   _id: string;
   observe: number
}
export type PartOfRowType<More = any> = Partial<RowType<More>>


export interface StateObjectTyps<RowProps, MetaProps> {
   data: RowType<RowProps>[],
   meta: MetaProps
}



export interface DispatchableInfoTypes {
   type: "data" | "meta",
   name: string
}


export interface QueryCallbackTypeProps<Row = {}> {
   value: RowType<Row>;
   index: number;
}
export type QueryCallbackType<Row> = (options: QueryCallbackTypeProps<Row>) => void


export type WhereType<Row> = string | Partial<RowType<Row>>
