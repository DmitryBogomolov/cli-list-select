[![CI](https://github.com/DmitryBogomolov/cli-list-select/actions/workflows/ci.yml/badge.svg)](https://github.com/DmitryBogomolov/cli-list-select/actions/workflows/ci.yml)

# cli-list-select

Simple command line interactive list

## Install

```bash
npm i cli-list-select
```

## Description

Package exports single function

```js
const list = require('cli-list-select');
```

Function is async and has 2 arguments.


Function arguments

Name | Type | Description
-|-|-
items | any[] | items to be displayed
options? | [Option](#Options) | options

Returns [Result](#Result)

### Options

Field | Type | Default | Description
-|-|-|-
printItem | (item: any, index: number, isFocused: bool, isChecked: bool) => string | String | function that provides string representation for an item
index | number | 0 | initial focus position
singleCheck | bool | false | tells if only one item can be checked
checks | number[] &#124; number | [] &#124; NaN | initially checked items
handlers | [Handlers](#Handlers) | {} | custom key handlers

### Handlers

It is a map.

Field | Type | Description
-|-|-
key | string | key name
value | (arg: [HandlerArg](#HandlerArg)) => void | key handler

Default handlers are

Key | Handler
-|-
up | move focus to previous item
down | move focus to next item
space | toggle check of the focused item
return | close the list

### HandlerArg

Field | Type | Description
-|-|-
index | number | current focus
setIndex | (index: number) => void | function that sets current focus
toggleCheck | (index: number) => void | function that toggles check state of an item
end | (note: any) => void | function that closes the list

### Result

Field | Type | Description
-|-|-
index | number | focus
checks | number[] &#124; number | checked items
note | any | note returned in the `end` function

## Call

### Just print a list

```js
await list(['A', 'B', 'C']);
```
```bash
-[ ] A
 [ ] B
 [ ] C
```

### Set initial focus

```js
await list(['A', 'B', 'C'], { index: 1 });
```
```bash
 [ ] A
-[ ] B
 [ ] C
```

### Check an item

```bash
 [*] A
-[*] B
 [ ] C
```

### Single check mode

```js
await list(['A', 'B', 'C'], { singleCheck: true });
```
```bash
 [ ] A
-[*] B
 [ ] C
```

### Initial checks

```js
await list(['A', 'B', 'C'], { checks: [0, 2] });
```
```bash
-[*] A
 [ ] B
 [*] C
```

### Custom print

```js
await list([{ data: 'A' }, { data: 'B' }, { data: 'C' }], {
    printItem: item => `<${item.data}>`
});
```
```bash
-[ ] <A>
 [ ] <B>
 [ ] <C>
```

### Custom handlers

```js
await list(['A', 'B', 'C'], {
    handlers: {
        'q': ({ end }) => end('Q'),
    },
});
```

## Examples

- [simple](./examples/simple.js)
- [print](./examples/print.js)
- [single-mode](./examples/single-mode.js)
- [handlers](./examples/handlers.js)
