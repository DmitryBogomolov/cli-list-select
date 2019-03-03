const rl = require('readline');

const cin = process.stdin;
const cout = process.stdout;

const ESC = '\u001b';
const CTRLC = '\u0003';

rl.emitKeypressEvents(cin);

function renderList(items, printItem, focus, tags) {
    let lineCount = 0;
    items.forEach((item, i) => {
        const lines = String(printItem(item, i, tags.has(i))).split('\n');
        lineCount += lines.length;
        const focusCh = i === focus ? '-' : ' ';
        const tagCh = tags.has(i) ? '*' : ' ';
        const prefix = `${focusCh}[${tagCh}] `;
        const dumb = ' '.repeat(prefix.length);
        cout.write(`${prefix}${lines[0]}\n`);
        lines.slice(1).forEach((line) => {
            cout.write(`${dumb}${line}\n`);
        });
    });
    return lineCount;
}

function clearList(lineCount) {
    for (let i = 0; i < lineCount; ++i) {
        rl.moveCursor(cout, 0, -1);
        rl.clearLine(cout, 0);
    }
}

const defaultHandlers = {
    'up': ({ index, setIndex }) => {
        setIndex(index - 1);
    },
    'down': ({ index, setIndex }) => {
        setIndex(index + 1);
    },
    'space': ({ index, toggleCheck }) => {
        toggleCheck(index);
    },
    'return': ({ end }) => {
        end();
    },
};

function mutlipleChecks(checks) {
    const items = new Set(checks);
    return {
        set(value) {
            if (items.has(value)) {
                items.delete(value);
            } else {
                items.add(value);
            }
        },
        has(value) {
            return items.has(value);
        },
        data() {
            return Array.from(items).sort();
        },
    };
}

function singleCheck(check) {
    let item = check >= 0 ? Number(check) : NaN;
    return {
        set(value) {
            if (item === value) {
                item = NaN;
            } else {
                item = value;
            }
        },
        has(value) {
            return item === value;
        },
        data() {
            return item;
        },
    };
}

function verifyIndex(value, count) {
    return 0 <= value && value < count;
}

function printList(items, options = {}) {
    const printItem = options.printItem || String;
    const itemCount = items.length;
    let lineCount = 0;
    let index = verifyIndex(options.index, itemCount) ? Number(options.index) : 0;
    const checks = (options.singleCheck ? singleCheck : mutlipleChecks)(options.checks);
    function refresh () {
        clearList(lineCount);
        lineCount = renderList(items, printItem, index, checks);
    }
    function setIndex (arg)  {
        const newIndex = Number(arg);
        if (newIndex !== index && verifyIndex(newIndex, itemCount)) {
            index = newIndex;
            refresh();
        }
    }
    function toggleCheck  (arg)  {
        const newIndex = Number(arg);
        if (verifyIndex(newIndex, itemCount)) {
            checks.set(newIndex);
            refresh();
        }
    }
    return new Promise((resolve, reject) => {
        function dispose  ()  {
            cin.off('keypress', handle);
            cin.setRawMode(false);
            clearList(lineCount);
        }
        function end  (note)  {
            dispose();
            resolve({ note, index, checks: checks.data() });
        }
        const handlers = Object.assign({}, defaultHandlers, options.handlers);
        function handle  (key, data)  {
            if (data.sequence === ESC || data.sequence === CTRLC) {
                dispose();
                reject(new Error('Canceled'));
                return;
            }
            const handler = handlers[data.name];
            if (handler) {
                handler({ index, setIndex, toggleCheck, end });
            }
        }
        cin.setRawMode(true);
        cin.on('keypress', handle);
        lineCount = renderList(items, printItem, index, checks);
    });
}

module.exports = printList;
