[![Build Status](https://travis-ci.org/DmitryBogomolov/cli-list-select.svg?branch=master)](https://travis-ci.org/DmitryBogomolov/cli-list-select)

# cli-list-select

Simple command line interactive list

# Usage

Install

```bash
npm i cli-list-select
```

Call

```javascript
const list = require('cli-list-select');

const { index, checks, note } = await list(['A', 'B', 'C'], {
    index: 1,
    checks: [0, 1], // or 1 in 'singleCheck' mode
    singleCheck: false,
    printItem: (item, i, isFocused, isChecked) => {
        return item;
    },
    handlers: {
        'home': ({ index, setIndex, toggleCheck, end }) => {
            setIndex(index + 1)
            toggleCheck(index);
            end('note');
        },
    },
});
```

Examples

- [simple](./examples/simple.js)
- [print](./examples/print.js)
- [single-mode](./examples/single-mode.js)
- [handlers](./examples/handlers.js)
