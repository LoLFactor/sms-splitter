<p align="center">
  <img alt="GitHub" src="https://img.shields.io/github/license/LoLFactor/sms-splitter">
  <a href="https://travis-ci.com/LoLFactor/sms-splitter">
    <img src="https://travis-ci.com/LoLFactor/sms-splitter.svg?branch=master" alt="Build status">
  </a>
  <a href="https://codecov.io/gh/LoLFactor/sms-splitter">
    <img src="https://codecov.io/gh/LoLFactor/sms-splitter/branch/master/graph/badge.svg?token=F82NHAZF3B"/>
  </a>
</p>

# LOLTECH SMS Splitter

A Typescript library for splitting a message string into parts according to GM specifications.

## Installation

This package is meant for usage in Node.js. Should work in the browser when using something like `webpack` or
`rollup`.

```
yarn add @loltech/sms-splitter
```

OR

```
npm install @loltech/sms-splitter
```

## Usage

```typescript
import { isMultipart, split } from '@loltech/sms-splitter';
```

### Is a message multipart?

```typescript
function isMultipart(message: string): boolean;
```

Given a message string, determines whether that string needs to be split up according to GSM spec. Return the result as
a boolean.

### Split the message

```typescript
function split(message: string): ISplitResult | null;
```

Given a message string, will determine its required encoding and split it into parts according to GSM spec.

#### Return value

If `message` is anything other than a string, it returns `null`. Is `message` is a string, it returns an object of the
form:

```typescript
interface ISplitResult {
  encoding: ENCODING;
  extended?: boolean;
  parts: string[];
}
```

- `encoding` - Can be `GSM-7`, `UCS-2`, `UTF-16`. `UCS-2` and `UTF-16` are very similar, but `UTF-16` can also encode
  `UTF-32` characters. `UCS-2` basically means the string does not use characters outside the
  <abbr title="Basic Multilingual Plane">BMP</abbr>.
  
- `extended` - Only present when `encoding` is `GSM-7`. Signals the string contains `GSM-7` extended characters.
- `parts` - An array of strings making up the resultant SMS parts. 

## Note on behaviour

When splitting SMS messages for transmission, it's best practice not to split up characters. This happens both in
`GSM-7` (where extended characters are actually made up of two characters) and `UTF-16` (where surrogate pairs are
employed). This library DOES NOT split characters. While this is
[technically correct](https://duckduckgo.com/?q=technically+correct&iax=images&ia=images), it's not the whole story.
As can be seen in
[this particular patch comment](https://android.googlesource.com/platform/frameworks/opt/telephony/+/e472090%5E!/), some
carries cannot handle messages split within character boundaries. Unfortunately the only possible solution I found will
be to use `Intl.breakItreator`, but that feature hasn't been
[standardized or implemented yet](https://github.com/tc39/ecma402/issues/60).
