import { activityFactory, dispatchFactory, uid } from "../core"
import { excuteQuery } from "../query"
import { StateObjectTyps, DispatchableInfoTypes, WhereType, QueryCallbackType, RowType } from "../types"

export default abstract class Base<RowProps, MetaProps = object> {
    protected observe_store = 0;
    protected dispatchable = new Map<string, DispatchableInfoTypes>()
    onUpdate?(state: StateObjectTyps<RowProps, MetaProps>): void;

    protected state: StateObjectTyps<RowProps, MetaProps> = {
        data: [],
        meta: {} as any
    }

    protected query(query: WhereType<RowProps>, callback?: QueryCallbackType<RowProps>) {
        try {
            return excuteQuery(query, this.state.data, callback) as RowType<RowProps>[]
        } catch (err) {
            console.log(err);
        }
        return []
    }

    protected makeRow(row: RowProps): RowType<RowProps> {
        const _id = (row as any)?._id || '_' + uid()
        return { ...row, _id, observe: Date.now() }
    }

    protected setDispatch(info: DispatchableInfoTypes) {
        const CURRENT_ID = activityFactory.get("CURRENT_ID")
        if (CURRENT_ID) {
            this.dispatchable.set(CURRENT_ID, info)
        }
    }

    dispatch() {
        if (activityFactory.get("noDispatch")) return;
        this.observe_store = Date.now()

        this.dispatchable.forEach((_info, id) => {
            const _disp = dispatchFactory.get(id)
            if (_disp) {
                _disp.dispatch()
            }
        })

        if (this.onUpdate) {
            this.onUpdate(this.state)
        }
    }

    getState(): StateObjectTyps<RowProps, MetaProps> {
        this.setDispatch({ type: "data", name: 'getState' })
        return this.state
    }

    observe() {
        return this.observe_store
    }

    // Meta
    setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T]) {
        this.state.meta[key] = value
        this.dispatch()
    }

    getMeta<T extends keyof MetaProps>(key: T) {
        this.setDispatch({ type: "meta", name: "meta_get" })
        return this.state.meta[key]
    }

    deleteMeta<T extends keyof MetaProps>(key: T) {
        const has = this.state.meta[key]
        if (has) {
            delete this.state.meta[key]
            this.dispatch()
        }
    }

    clearMeta() {
        this.state.meta = {} as any
        this.dispatch()
    }

}
