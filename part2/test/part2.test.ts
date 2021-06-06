// noinspection DuplicatedCode

import chai, { expect } from 'chai';

import { asycMemo, asyncWaterfallWithRetry, getAll, lazyFilter, lazyMap, makePromisedStore, MISSING_KEY } from '../src/part2';

import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

describe('2.1 (PromisedStore)', () => {
    it('stores and retrieves value', async () => {
        const store = makePromisedStore()
        await store.set('a', 42)
        const a = await store.get('a')
        expect(a).to.equal(42)
    })

    it('delete', async () => {
        const store = makePromisedStore()
        await store.set('a', 42)
        const a = await store.delete('a')
        await expect(store.get('a')).to.be.rejectedWith(MISSING_KEY)
    })
    it('throws on missing key', async () => {
        const store = makePromisedStore()
        await expect(store.get('a')).to.be.rejectedWith(MISSING_KEY)
    })

    it('getAll retrieves an array', async () => {
        const store = makePromisedStore()
        await store.set('a', 42)
        await store.set('b', 24)
        expect(await getAll(store,['a', 'b'])).to.deep.equal([42, 24])
        expect(await getAll(store,['b', 'a'])).to.deep.equal([24, 42])
    })
})

describe('2.2 (asycMemo)', () => {
    it('memoizes calls', async () => {
        let ret = 'cached'
        const memo = asycMemo((x) => ret)

        expect(await memo('a')).to.equal('cached')
        ret = 'new'
        expect(await memo('a')).to.equal('cached')
     })
})

describe('2.3 (lazy generators)', () => {
    function * countTo4(): Generator<number> {
        for (let i = 1; i <= 4; i++) {
            yield i
        }
    }

    it('filters', async () => {
        const gen = lazyFilter(countTo4, (v) => v % 2 == 0)()
        expect([...gen]).to.deep.equal([2, 4])
    })
    
    it('maps', async () => {
        const gen = lazyMap(countTo4, (v) => v ** 2)()
        expect([...gen]).to.deep.equal([1, 4, 9, 16])
    })
})

// describe('2.4 (asyncWaterfallWithRetry)', () => {
//     it('executes sequence', async () => {
//         const v = await asyncWaterfallWithRetry([async () => 1, async v => v + 1, async v => v * 2])
//         expect(v).to.equal(4);
//     })
//     it('retries twice --> needs to be around 4,000', async () => {
//         let attempt = 1
//         const v = await asyncWaterfallWithRetry([async () => 1, async v => {
//             if (attempt == 3)
//                 return v + 1
//             attempt += 1
//             throw Error()
//         }, async v => v * 2])
//         expect(v).to.equal(4)
//     }).timeout(5000)


//     it('retries 4 times --> needs to be around 8,000', async () => {
//         let attempt = 1
//         let attempt2 = 1
//         const v = await asyncWaterfallWithRetry([async () => 1, async v => {
//             if (attempt == 3)
//                 return v + 1
//             attempt += 1
//             throw Error()
//         },async v => {
//             if (attempt2 == 3)
//                 return v + 1
//             attempt2 += 1
//             throw Error()
//         },
//             async v => v * 2])
//         expect(v).to.equal(6)
//     }).timeout(10000)


//     it('retries 6 times --> needs to be around 12,000', async () => {
//         let attempt1 = 1
//         let attempt = 1
//         let attempt2 = 1
//         const v = await asyncWaterfallWithRetry([async () => {
//             if (attempt1 == 3)
//                 return 1
//             attempt1 += 1
//             throw Error()
//         }, async v => {
//             if (attempt == 3)
//                 return v + 1
//             attempt += 1
//             throw Error()
//         },async v => {
//             if (attempt2 == 3)
//                 return v + 1
//             attempt2 += 1
//             throw Error()
//         },
//             async v => v * 2])
//         expect(v).to.equal(6)
//     }).timeout(15000)
// })
