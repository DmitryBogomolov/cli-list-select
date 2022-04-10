const mockOn = jest.fn();
const mockOff = jest.fn();
const mockSetRawMode = jest.fn();
const mockWrite = jest.fn();
const mockMoveCursor = jest.fn();
const mockClearLine = jest.fn();

Object.assign(process.stdin, {
    on: mockOn,
    off: mockOff,
    setRawMode: mockSetRawMode,
});
Object.assign(process.stdout, {
    write: mockWrite,
});

jest.mock('readline', () => ({
    emitKeypressEvents: () => {},
    moveCursor: mockMoveCursor,
    clearLine: mockClearLine,
}));

const list = require('./index');

describe('list', () => {
    afterEach(jest.resetAllMocks);

    function emitKeypress(data) {
        mockOn.mock.calls[0][1](null, data);
    }

    function emitReturn() {
        emitKeypress({ name: 'return' });
    }

    function expectPrintedLines(...lines) {
        expect(mockWrite.mock.calls).toEqual(lines.map(line => [`${line}\n`]));
    }

    function expectClearedLines(count) {
        expect(mockMoveCursor.mock.calls)
            .toEqual(Array.from({ length: count }).map(() => [process.stdout, 0, -1]));
        expect(mockClearLine.mock.calls)
            .toEqual(Array.from({ length: count }).map(() => [process.stdout, 0]));
    }

    describe('basics', () => {
        it('toggle "keypress* subscription on and off', () => {
            const promise = list([]);

            expect(mockSetRawMode).toBeCalledWith(true);
            expect(mockOn.mock.calls).toEqual([
                ['keypress', expect.any(Function)],
            ]);

            emitReturn();

            return promise.then(() => {
                expect(mockSetRawMode).toBeCalledWith(false);
                expect(mockOff.mock.calls).toEqual([
                    ['keypress', mockOn.mock.calls[0][1]],
                ]);
            });
        });

        it('print and clear items', () => {
            const promise = list(['a', 'b', 'c']);

            expectPrintedLines(
                '-[ ] a',
                ' [ ] b',
                ' [ ] c',
            );

            emitReturn();

            return promise.then(() => {
                expectClearedLines(3);
            });
        });

        it('print multiline items', () => {
            const promise = list(['Item 1\n a\n b', 'Item 2', 'Item 3\nnote']);

            expectPrintedLines(
                '-[ ] Item 1',
                '      a',
                '      b',
                ' [ ] Item 2',
                ' [ ] Item 3',
                '     note',
            );

            emitReturn();

            return promise.then(() => {
                expectClearedLines(6);
            });
        });

        it('reject on ESC', () => {
            const promise = list([]);

            emitKeypress({ sequence: '\u001b' });

            return promise.then(
                () => {
                    throw new Error('should fail');
                },
                (err) => {
                    expect(err.message).toEqual('Canceled');
                },
            );
        });

        it('reject on CTRL+C', () => {
            const promise = list([]);

            emitKeypress({ sequence: '\u0003' });

            return promise.then(
                () => {
                    throw new Error('should fail');
                },
                (err) => {
                    expect(err.message).toEqual('Canceled');
                },
            );
        });
    });

    describe('options', () => {
        it('set initial index', () => {
            const promise = list(['a', 'b', 'c'], {
                index: 1,
            });

            expectPrintedLines(
                ' [ ] a',
                '-[ ] b',
                ' [ ] c',
            );

            emitReturn();

            return promise.then(({ index }) => {
                expect(index).toEqual(1);
            });
        });

        it('set initial checks (multiple)', () => {
            const promise = list(['a', 'b', 'c', 'd'], {
                checks: [0, 2, 3],
            });

            expectPrintedLines(
                '-[*] a',
                ' [ ] b',
                ' [*] c',
                ' [*] d',
            );

            emitReturn();

            return promise.then(({ checks }) => {
                expect(checks).toEqual([0, 2, 3]);
            });
        });

        it('set initial checks (single)', () => {
            const promise = list(['a', 'b', 'c', 'd'], {
                singleCheck: true,
                checks: 2,
            });

            expectPrintedLines(
                '-[ ] a',
                ' [ ] b',
                ' [*] c',
                ' [ ] d',
            );

            emitReturn();

            return promise.then(({ checks }) => {
                expect(checks).toEqual(2);
            });
        });

        it('print custom items', () => {
            const printItem = jest.fn();
            printItem.mockReturnValueOnce('<a1>\n<a2>');
            printItem.mockReturnValueOnce();
            printItem.mockReturnValueOnce('');
            printItem.mockReturnValueOnce(0);

            const promise = list(['a', 'b', 'c', 'd'], {
                printItem,
                checks: [1, 3],
            });

            expectPrintedLines(
                '-[ ] <a1>',
                '     <a2>',
                ' [*] undefined',
                ' [ ] ',
                ' [*] 0',
            );
            expect(printItem.mock.calls).toEqual([
                ['a', 0, true, false],
                ['b', 1, false, true],
                ['c', 2, false, false],
                ['d', 3, false, true],
            ]);

            emitReturn();

            return promise.then(() => {
                expectClearedLines(5);
            });
        });
    });

    describe('keys handling', () => {
        it('change index on "up"', () => {
            const promise = list(['a', 'b', 'c'], {
                index: 1,
            });

            mockWrite.mockClear();
            emitKeypress({ name: 'up' });

            expectClearedLines(3);
            expectPrintedLines(
                '-[ ] a',
                ' [ ] b',
                ' [ ] c',
            );

            mockMoveCursor.mockClear();
            mockClearLine.mockClear();
            emitReturn();

            return promise.then(() => {
                expectClearedLines(3);
            });
        });

        it('change index on "down"', () => {
            const promise = list(['a', 'b', 'c'], {
                index: 1,
            });

            mockWrite.mockClear();
            emitKeypress({ name: 'down' });

            expectClearedLines(3);
            expectPrintedLines(
                ' [ ] a',
                ' [ ] b',
                '-[ ] c',
            );

            mockMoveCursor.mockClear();
            mockClearLine.mockClear();
            emitReturn();

            return promise.then(() => {
                expectClearedLines(3);
            });
        });

        it('toggle check on "space" (on)', () => {
            const promise = list(['a', 'b', 'c'], {
                checks: [1],
            });

            mockWrite.mockClear();
            emitKeypress({ name: 'space' });

            expectClearedLines(3);
            expectPrintedLines(
                '-[*] a',
                ' [*] b',
                ' [ ] c',
            );

            mockMoveCursor.mockClear();
            mockClearLine.mockClear();
            emitReturn();

            return promise.then(({ checks }) => {
                expectClearedLines(3);
                expect(checks).toEqual([0, 1]);
            });
        });

        it('toggle check on "space" (off)', () => {
            const promise = list(['a', 'b', 'c'], {
                checks: [0, 1],
            });

            mockWrite.mockClear();
            emitKeypress({ name: 'space' });

            expectClearedLines(3);
            expectPrintedLines(
                '-[ ] a',
                ' [*] b',
                ' [ ] c',
            );

            mockMoveCursor.mockClear();
            mockClearLine.mockClear();
            emitReturn();

            return promise.then(({ checks }) => {
                expectClearedLines(3);
                expect(checks).toEqual([1]);
            });
        });

        it('toggle check on "space" (on, single)', () => {
            const promise = list(['a', 'b', 'c'], {
                checks: 1,
                singleCheck: true,
            });

            mockWrite.mockClear();
            emitKeypress({ name: 'space' });

            expectClearedLines(3);
            expectPrintedLines(
                '-[*] a',
                ' [ ] b',
                ' [ ] c',
            );

            mockMoveCursor.mockClear();
            mockClearLine.mockClear();
            emitReturn();

            return promise.then(({ checks }) => {
                expectClearedLines(3);
                expect(checks).toEqual(0);
            });
        });

        it('toggle check on "space" (off, single)', () => {
            const promise = list(['a', 'b', 'c'], {
                index: 1,
                checks: 1,
                singleCheck: true,
            });

            mockWrite.mockClear();
            emitKeypress({ name: 'space' });

            expectClearedLines(3);
            expectPrintedLines(
                ' [ ] a',
                '-[ ] b',
                ' [ ] c',
            );

            mockMoveCursor.mockClear();
            mockClearLine.mockClear();
            emitReturn();

            return promise.then(({ checks }) => {
                expectClearedLines(3);
                expect(checks).toEqual(NaN);
            });
        });
    });

    describe('custom handlers', () => {
        it('allow to change index', () => {
            const mock = jest.fn(({ setIndex }) => {
                setIndex(2);
            });
            const promise = list(['a', 'b', 'c'], {
                handlers: {
                    'h': mock,
                },
            });

            mockWrite.mockClear();
            emitKeypress({ name: 'h' });

            expectClearedLines(3);
            expectPrintedLines(
                ' [ ] a',
                ' [ ] b',
                '-[ ] c',
            );
            expect(mock).toBeCalledWith({
                index: 0, setIndex: expect.any(Function),
                toggleCheck: expect.any(Function), end: expect.any(Function),
            });

            mockMoveCursor.mockClear();
            mockClearLine.mockClear();
            emitReturn();

            return promise.then(() => {
                expectClearedLines(3);
            });
        });

        it('allow to toggle check', () => {
            const mock = jest.fn(({ toggleCheck }) => {
                toggleCheck(2);
            });
            const promise = list(['a', 'b', 'c'], {
                handlers: {
                    'j': mock,
                },
            });

            mockWrite.mockClear();
            emitKeypress({ name: 'j' });

            expectClearedLines(3);
            expectPrintedLines(
                '-[ ] a',
                ' [ ] b',
                ' [*] c',
            );
            expect(mock).toBeCalledWith({
                index: 0, setIndex: expect.any(Function),
                toggleCheck: expect.any(Function), end: expect.any(Function),
            });

            mockMoveCursor.mockClear();
            mockClearLine.mockClear();
            emitReturn();

            return promise.then(() => {
                expectClearedLines(3);
            });
        });

        it('allow to close', () => {
            const mock = jest.fn(({ end }) => {
                end('test');
            });
            const promise = list(['a', 'b', 'c'], {
                handlers: {
                    'k': mock,
                },
            });

            mockWrite.mockClear();
            emitKeypress({ name: 'k' });
            expect(mock).toBeCalledWith({
                index: 0, setIndex: expect.any(Function),
                toggleCheck: expect.any(Function), end: expect.any(Function),
            });

            expectClearedLines(3);

            return promise.then(({ note }) => {
                expect(note).toEqual('test');
            });
        });
    });
});
