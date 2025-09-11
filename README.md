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
```typescript
await fsHelper.mkdir('/path/to/new/dir');
```

### List Files Recursively

```typescript
const files = await fsHelper.files('/path/to/dir');
console.log(files);
```

### Read and Write a File

```typescript
await fsHelper.write('/path/to/file.txt', 'Hello, world!');
const content = await fsHelper.read('/path/to/file.txt');
console.log(content); // "Hello, world!"
```

### Remove a Directory Recursively

```
await fsHelper.rm('/path/to/dir', { recursive: true });
```

And without throwing any exception :

```
await fsHelper.rm('/path/to/dir', { recursive: true, force: true });
```

### Error Handling

All methods throw errors for invalid operations (e.g., missing files, permission issues). Use try/catch or .catch() to handle errors.

License
`MIT`