/* eslint-disable no-console */

const list = require('..');

console.log('Go');
list(['A', 'B', 'C', 'D', 'E']).then(
    ({ tags }) => {
        console.log('Result', tags);
    },
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
