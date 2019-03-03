/* eslint-disable no-console */

const list = require('..');

const items = ['A', 'B', 'C', 'D', 'E'];
const options = {
    index: 2,
    singleCheck: true,
    checks: 1,
};

console.log('Go');
list(items, options).then(
    ({ checks }) => {
        console.log(items[checks]);
    },
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
