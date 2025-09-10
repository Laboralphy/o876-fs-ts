# FsHelper – Helper for Common Filesystem Operations

A lightweight utility class to simplify common filesystem operations in Node.js, with support for custom filesystem modules.

## Features

- **Simplified API**: Wraps `fs/promises` with a cleaner, more intuitive interface.
- **Type Safety**: Fully typed with TypeScript.
- **Customizable**: Accepts a custom filesystem module for testing or special use cases.
- **Recursive Operations**: Supports recursive directory creation, listing, and deletion.

---

## Examples
Create a Directory
await fsHelper.mkdir('/path/to/new/dir');
List Files Recursively
const files = await fsHelper.ls('/path/to/dir', { recursive: true });
console.log(files);
Read and Write a File
await fsHelper.write('/path/to/file.txt', 'Hello, world!');
const content = await fsHelper.read('/path/to/file.txt');
console.log(content); // "Hello, world!"
Remove a Directory Recursively
await fsHelper.rm('/path/to/dir', { recursive: true });

Error Handling
All methods throw errors for invalid operations (e.g., missing files, permission issues). Use try/catch or .catch() to handle errors.

License
MIT