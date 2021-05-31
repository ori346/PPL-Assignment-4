/* 2.1 */



export const MISSING_KEY = '___MISSING___'


type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}

export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    const map: Map<K, Promise<V>> = new Map()
    return {
        get(key: K) {
            const output = map.get(key)
            if (output === undefined)
                return new Promise<V>((resolved, reject) => reject(MISSING_KEY))
            else
                return output
        },
        set(key: K, value: V) {
            return new Promise<void>((resolved, reject) => {
                if (!map.has(key))
                    map.set(key, new Promise<V>((sec, reject) => sec(value)))
                resolved()
            })
        },
        delete(key: K) {
            if (!map.has(key))
                return new Promise<void>((resolved, rej) => rej(MISSING_KEY));
            return new Promise<void>((resolved) => {
                map.delete(key)
                resolved()
            })

        }

    }
}

export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<V[]> {
    const promises: Promise<V>[] = keys.map((key: K): Promise<V> => store.get(key))
    return Promise.all(promises).then(x => x)
}

/* 2.2 */

// ??? (you may want to add helper functions here)
//


export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    const store: PromisedStore<number, R> = makePromisedStore()
    return ((param: T): Promise<R> => {
        store.set(0, f(param))
        return store.get(0)
    })
}



/* 2.3 */


export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (pred: T) => boolean): () => Generator<T> {
    return function* (): Generator<T> {
        for (let x of genFn())
            if (filterFn(x))
                yield x;
    }
}

export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (curr: T) => R): () => Generator<R> { 
    return function * () {
        for (let x of genFn()) {
            yield mapFn(x)
        }
    }
}

/* 2.4 */
// you can use 'any' in this question

export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...((v: any) => Promise<any>)[]]): Promise<any> {
    return new Promise<any>((accept, reject) => {
        if (fns.length === 1)
            return fns[0]().then(x => accept(x))
        return fns[0]().then((y => accept(asyncWaterfallWithRetry([() => fns[1](y), ...fns.slice(2)]))))
            .catch((z => setTimeout(() => accept(asyncWaterfallWithRetry(fns)), 2000))).catch(() => reject())

    })
}