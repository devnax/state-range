import { createElement, useEffect, useMemo, useId, useState, ComponentType } from 'react'
import { DISPATCHES, STOREINFO } from './Store'
export type Resolver<T> = (props: T) => any[]

export const withStore = <T, R extends Resolver<T>>(C: ComponentType<T>, resolve?: R) => {
    const R = <P extends T>(props: P) => {
        const id = useId()
        const [, dispatch] = useState(0)

        useMemo(() => {
            DISPATCHES.set(id, () => dispatch(Math.random()))
            STOREINFO.set("CURRENT_ID", id)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])

        useEffect(() => {
            return () => {
                DISPATCHES.delete(id)
                if (STOREINFO.get("CURRENT_ID") === id) STOREINFO.delete("CURRENT_ID")
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
        const ele = createElement(C as any, { ...(props || {}) }, (props as any).children)

        // eslint-disable-next-line
        return resolve ? useMemo(() => ele, resolve(props)) : ele
    }
    return R
}

