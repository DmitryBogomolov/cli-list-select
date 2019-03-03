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
    'space': ({ index, setTag }) => {
        setTag(index);
    },
    'return': ({ close }) => {
        close();
    },
};

function mutlipleTags(tags) {
    const items = new Set(tags);
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

function singleTag(tags) {
    let item = tags >= 0 ? Number(tags) : NaN;
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

function printList(items, options = {}) {
    const printItem = options.printItem || String;
    let lineCount = 0;
    let itemIndex = 0 <= options.index && options.index < items.length ? Number(options.index) : 0;
    const tags = (options.singleTag ? singleTag : mutlipleTags)(options.tags);
    const refresh = () => {
        clearList(lineCount);
        lineCount = renderList(items, printItem, itemIndex, tags);
    };
    const setIndex = (arg) => {
        const newIndex = Number(arg);
        if (newIndex !== itemIndex && 0 <= newIndex && newIndex < items.length) {
            itemIndex = newIndex;
            refresh();
        }
    };
    const setTag = (arg) => {
        const newIndex = Number(arg);
        if (0 <= newIndex && newIndex < items.length) {
            tags.set(newIndex);
            refresh();
        }
    };
    return new Promise((resolve, reject) => {
        const dispose = () => {
            cin.off('keypress', handle);
            cin.setRawMode(false);
            clearList(lineCount);
        };
        const close = (status) => {
            dispose();
            resolve({ status, index: itemIndex, tags: tags.data() });
        };
        const handlers = Object.assign({}, defaultHandlers, options.handlers);
        const handle = (key, data) => {
            if (data.sequence === ESC || data.sequence === CTRLC) {
                dispose();
                reject(new Error('Canceled'));
                return;
            }
            const handler = handlers[data.name];
            if (handler) {
                handler({ index: itemIndex, setIndex, setTag, close });
            }
        };
        cin.setRawMode(true);
        cin.on('keypress', handle);
        lineCount = renderList(items, printItem, itemIndex, tags);
    });
}

module.exports = printList;
