export type QueryType<D extends object> = Partial<D> & {
    $limit?: number;
    $skip?: number;
}

const fns = {
    equal: (dval: any, qval: any) => dval === qval,
    notEqual: (dval: any, qval: any) => dval !== qval,
    startWith: (dval: any, qval: any) => dval.startsWith(qval),
    endWith: (dval: any, qval: any) => dval.endsWith(qval),
    hasValue: (dval: any, _qval: any) => dval !== undefined,
    search: (dval: any, qval: any) => typeof dval === 'string' && dval.search(qval) !== -1
}

const isInQuery = <D extends object = {}>(item: D, query: QueryType<D>, cb?: (key: string, value: any) => void) => {

    if (!Object.keys(item).length) return false;

    for (let key in query) {
        let QVal = (query as any)[key]
        let DVal = (item as any)[key]

        if (typeof QVal === "object" && !Array.isArray(QVal)) {
            if (!isInQuery(DVal, QVal, cb)) {
                return false
            }
        } else {
            let fn = fns.equal
            if (typeof QVal === 'string') {
                QVal = QVal.replace('\\', "\\\\")
                let m = QVal.match(/\$(.*)\(/gi)
                if (m) {
                    let fname = m[0].replace(/\$|\(/gi, "")
                    if (Object.keys(fns).includes(fname)) {
                        QVal = QVal.replace(`$${fname}(`, '').slice(0, -1)
                        fn = (fns as any)[fname]
                    }
                }
            } else if (typeof QVal === 'boolean' && typeof DVal !== 'boolean') {
                fn = fns.hasValue
            }

            if (!fn(DVal, QVal)) {
                return false;
            } else {
                cb && cb(key, DVal)
            }
        }
    }
    return true
}

export const find = <D extends object = {}>(items: D[], query?: QueryType<D>, cb?: (item: D, i: number) => void | D): D[] => {
    const found: D[] = []
    query = query || {}
    let limit: any = query.$limit;
    let skip: any = query.$skip;
    let count = 0;
    delete query.$limit
    delete query.$skip

    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        const is = isInQuery(items[i], query)
        if (is) {
            cb && (item = cb({ ...item }, i) || item)
            if (skip && i <= skip) continue;
            if (limit && count >= limit) break;
            found.push({ ...item, _index: i })
            count++;
        }
    }
    return found
}