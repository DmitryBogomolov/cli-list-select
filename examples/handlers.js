/* eslint-disable no-console */

const list = require('..');

const items = ['A', 'B', 'C', 'D', 'E'];
const options = {
    handlers: {
        'home': ({ setIndex }) => {
            setIndex(0);
        },
        'end': ({ setIndex }) => {
            setIndex(items.length - 1);
        },
        'j': ({ index, setIndex }) => {
            setIndex(index - 1);
        },
        'k': ({ index, setIndex }) => {
            setIndex(index + 1);
        },
        'l': ({ index, toggleCheck }) => {
            toggleCheck(index);
        },
        'p': ({ end }) => {
            end();
        },
    },
};

console.log('* Items *');
list(items, options).then(
    ({ checks }) => {
        console.log(checks.map((i) => items[i]).join(', '));
    },
    (err) => {
        console.error(err);
        process.exit(1);
    },
);
