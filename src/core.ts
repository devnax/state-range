
export interface dispatchFactoryProps {
    id: string;
    dispatch: () => void;
}

type CompUid = string
type ActivityKeys = "CURRENT_ID" | "noDispatch"

export const dispatchFactory = new Map<CompUid, dispatchFactoryProps>()
export const activityFactory = new Map<ActivityKeys, any>() // will store the current id

export const uid = (): string => Math.random().toString(36).substring(2)
export const is_object = (val: any, or = false): boolean => typeof val === 'object' && val !== null && !Array.isArray(val) ? val : or


export const noDispatch = (cb: () => void) => {
    activityFactory.set("noDispatch", true)
    cb()
    activityFactory.delete("noDispatch")
}