import { describe, it, expect } from 'vitest';
import DTO from './dto';

describe('@Unit - DTO', () => {
    const startingObject = {
        a: 'A',
        b: { a: 'BA', b: 'BB' },
    };

    it('Excludes the key from the resulting object', () => {
        const dto = new DTO(startingObject).exclude('b').build();

        expect(dto).toStrictEqual({ a: 'A' });
    });

    it('Maps the object to the resulting type', () => {
        const dto = new DTO(startingObject).map((obj) => ({ ...obj, c: 'C' })).build();

        expect(dto).toStrictEqual({
            a: 'A',
            b: { a: 'BA', b: 'BB' },
            c: 'C',
        });
    });

    it("Doesn't modify the starting object when mapping it", () => {
        const dto = new DTO(startingObject)
            .map((obj) => {
                delete (obj as any).a;
                return obj;
            })
            .build();

        expect(dto).toStrictEqual({
            b: { a: 'BA', b: 'BB' },
        });
        expect(startingObject).toStrictEqual({
            a: 'A',
            b: { a: 'BA', b: 'BB' },
        });
    });

    it('Selects the key and allows it to be modified', () => {
        const dto = new DTO(startingObject).select('b', (b) => b.exclude('a').map((b) => ({ ...b, c: 'BC' }))).build();

        expect(dto).toStrictEqual({
            a: 'A',
            b: { b: 'BB', c: 'BC' },
        });
    });

    it('Applies the modification to each element in an array when using selectEach', () => {
        const startingObject = {
            a: 'A',
            b: ['BA', 'BB'],
        };

        const dto = new DTO(startingObject).selectEach('b', (b) => b.map((element) => element + 'C')).build();

        expect(dto).toStrictEqual({
            a: 'A',
            b: ['BAC', 'BBC'],
        });
    });

    it('Throws an error if you try and use selectEach on a non-array key value', () => {
        expect(() => new DTO(startingObject).selectEach('a', (a) => a).build()).toThrowError();
    });
});
