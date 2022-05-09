/* eslint-disable no-console */

const list = require('..');

const items = ['A', 'B', 'C', 'D', 'E'];

console.log('* Items *');
list(items).then(
    ({ checks }) => {
        console.log(checks.map((i) => items[i]).join(', '));
    },
    (err) => {
        console.error(err);
        process.exit(1);
    },
);
