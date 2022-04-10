/* eslint-disable no-console */

const list = require('..');

const items = [
    { text: 'A', note: 'item 1' },
    { text: 'B', note: 'item 2' },
    { text: 'C', note: 'item 3' },
];
const options = {
    printItem(item, i, isFocuced, isChecked) {
        return [
            isFocuced ? '> ' : '',
            isChecked ? '[' : '',
            item.text,
            isChecked ? ']' : '',
            `\n ${item.note}`,
        ].join('');
    },
};

console.log('* Items *');
list(items, options).then(
    ({ checks }) => {
        console.log(checks.map(i => items[i].text).join(', '));
    },
    (err) => {
        console.error(err);
        process.exit(1);
    },
);
