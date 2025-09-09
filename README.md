# o876-fs-ts

This package is used as a façade of **fs**.

## methods

### stat

Returns a structure describing a file.

```typescript
stat(sPath: string): Promise<FsStatResult>;
```

#### Parameters

| Parameter     | Type    | Description         |
|---------------|---------|---------------------|
| sPath         | string  | Path to file        |

#### Returned value

A promise of FsStatResult.

```typescript
export interface FsStatResult {
    isDirectory(): boolean; // returns true if the file is a directory
    size: number; // size of the file (if it is a regular file)
    birthtimeMs: number; // Timestamp of file creation
    mtimeMs: number; // last timestamp the file has been modified
    atimeMs: number; // last timestamp the file has been accessed to
}
```

### mkdir

Creates a new folder, or a new path if recursive mode is set.

```typescript
mkdir(sPath: string, options?: RecursiveOptions): Promise<void>;
```

#### Parameters

| Parameter     | Type               | Description                                                                                                                 |
|---------------|--------------------|-----------------------------------------------------------------------------------------------------------------------------|
| sPath         | string             | Path to file                                                                                                                |
| options       | RecursiveOptions   | The only option is "recursive", a boolean. If true then a full path can be created event if intermediate folder don't exist |

```typescript
export type RecursiveOptions = {
    recursive?: boolean;
};
```

#### Returned value

A promise of void

### readdir





    readdir(
        sPath: string,
        options?: RecursiveOptions & { withFileTypes: true }
    ): Promise<FsReadDirResult[]>;
    rename(sOldPath: string, sNewPath: string): Promise<void>;
    writeFile(sPath: string, data: string | Buffer, options?: EncodingOptions): Promise<void>;
    readFile(sPath: string, options?: EncodingOptions): Promise<Buffer | string>;
    rm(sPath: string, options?: RecursiveOptions & ForceOptions): Promise<void>;

```typescript
import { FsHelper } from 'FsHelper';

const m = new FsHelper();
```

or

```typescript
import { FsHelper } from 'FsHelper';
import { MemFs } from 'MemFs';

const m = new FsHelper(new MemFs());
```

