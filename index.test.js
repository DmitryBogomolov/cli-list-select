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

    it('toggle "keypress* subscription on and off', () => {
        const promise = list([]);

        expect(mockSetRawMode).toBeCalledWith(true);
        expect(mockOn.mock.calls).toEqual([
            ['keypress', expect.any(Function)],
        ]);
        emitKeypress({ name: 'return' });

        return promise.then(() => {
            expect(mockSetRawMode).toBeCalledWith(false);
            expect(mockOff.mock.calls).toEqual([
                ['keypress', mockOn.mock.calls[0][1]],
            ]);
        });
    });

    it('print and clear items', () => {
        const promise = list(['a', 'b', 'c']);

        expect(mockWrite.mock.calls).toEqual([
            ['-[ ] a\n'],
            [' [ ] b\n'],
            [' [ ] c\n'],
        ]);
        emitKeypress({ name: 'return' });

        return promise.then(() => {
            expect(mockMoveCursor.mock.calls).toEqual([
                [process.stdout, 0, -1],
                [process.stdout, 0, -1],
                [process.stdout, 0, -1],
            ]);
            expect(mockClearLine.mock.calls).toEqual([
                [process.stdout, 0],
                [process.stdout, 0],
                [process.stdout, 0],
            ]);
        });
    });
});
