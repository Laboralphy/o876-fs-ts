import path from 'node:path';
import fs from 'fs/promises';

export type StatResult = {
    name: string; // filename
    dir: boolean; // true if this is a directory
    size: number; // size of this file
    ctime: number; // timestamp in milliseconds of file creation
    mtime: number; // timestamp in milliseconds of file last modification
    atime: number; // timestamp in milliseconds of file last opening
};

export type RecursiveOptions = {
    recursive?: boolean;
};

export type ForceOptions = {
    force?: boolean;
};

export type BinaryOptions = {
    binary?: boolean;
};

export type EncodingOptions = {
    encoding?: string;
};

export interface FsStatResult {
    isDirectory(): boolean;
    size: number;
    birthtimeMs: number;
    mtimeMs: number;
    atimeMs: number;
}

export interface FsReadDirResult {
    isDirectory(): boolean;
    name: string;
    parentPath: string;
}

export type ReadDirOptions = {
    withFileTypes: true;
    recursive?: boolean | undefined;
};

export interface IFileSystemModule {
    stat(sPath: string): Promise<FsStatResult>;
    mkdir(sPath: string, options: RecursiveOptions): Promise<string | undefined>;
    readdir(sLocation: string, options: ReadDirOptions): Promise<FsReadDirResult[]>;
    rename(sOldPath: string, sNewPath: string): Promise<void>;
    unlink(sPath: string): Promise<void>;
    writeFile(
        sPath: string,
        data: string | Buffer,
        options: EncodingOptions | undefined
    ): Promise<void>;
    readFile(sPath: string, options?: EncodingOptions): Promise<Buffer>;
    access(sPath: string, nMode?: number): Promise<void>;
    rm(sPath: string, options?: RecursiveOptions & ForceOptions): Promise<void>;
}
/**
 * Common FS operations simplified
 */
export class FSHelper {
    private readonly fs: IFileSystemModule;

    constructor(customFileSystem?: IFileSystemModule | undefined) {
        if (customFileSystem) {
            this.fs = customFileSystem;
        } else {
            this.fs = fs as IFileSystemModule;
        }
    }

    /**
     * Returns a structure describing the specified file
     * @param sPath a filename
     */
    async stat(sPath: string): Promise<StatResult> {
        const st: FsStatResult = await this.fs.stat(sPath);
        const pp = path.parse(sPath);
        return {
            name: pp.base,
            dir: st.isDirectory(),
            size: st.size,
            ctime: st.birthtimeMs,
            mtime: st.mtimeMs,
            atime: st.atimeMs,
        };
    }

    /**
     * Creates a new directory.
     * Recursively creates all parent directory that don't exist
     * @param sPath
     */
    async mkdir(sPath: string): Promise<void> {
        await this.fs.mkdir(sPath, { recursive: true });
    }

    /**
     * Returns true if the specified file exists and is reachable
     * @param sPath
     */
    async exists(sPath: string): Promise<boolean> {
        try {
            await this.stat(sPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * List all files in specified directory
     * @param sPath location to be listed
     * @param options listing options
     */
    async ls(sPath: string, options: RecursiveOptions = { recursive: false }): Promise<string[]> {
        const { recursive = false } = options;
        const aDirEnts: FsReadDirResult[] = await this.fs.readdir(sPath, {
            withFileTypes: true,
            recursive,
        });
        const aFiles = [];
        for (const d of aDirEnts) {
            const sEntryPath = path.join(d.parentPath, d.name);
            aFiles.push(sEntryPath);
        }
        return aFiles;
    }

    /**
     * Remove the specified file,
     * If directory is specified, remove all files and folders recursively inside the specified directory
     * @param sPath location or file name to be removed
     * @param options
     */
    async rm(
        sPath: string,
        options: RecursiveOptions & ForceOptions = { force: false, recursive: false }
    ): Promise<void> {
        return this.fs.rm(sPath, { recursive: options.recursive });
    }

    /**
     * Renames a file or directory
     * @param sOld {string} old file name
     * @param sNew {string} new file name
     */
    async mv(sOld: string, sNew: string): Promise<void> {
        return this.fs.rename(sOld, sNew);
    }

    /**
     * writes a file
     * @param sPath {string}
     * @param data {string}
     * @returns {Promise<unknown>}
     */
    async write(sPath: string, data: string | Buffer): Promise<void> {
        return this.fs.writeFile(
            sPath,
            data,
            typeof data === 'string'
                ? {
                      encoding: 'utf8',
                  }
                : undefined
        );
    }

    /**
     * read file content as utf8
     */
    async read(
        sPath: string,
        options: BinaryOptions = { binary: false }
    ): Promise<string | Buffer> {
        const opts: EncodingOptions | undefined = options.binary ? undefined : { encoding: 'utf8' };
        const data = await this.fs.readFile(sPath, opts);
        return options.binary ? data : data.toString();
    }

    /**
     * Attempt to access specified file or directory
     * Throws an Error if unreachable
     * @param sPath
     * @param rights
     */
    async access(sPath: string, rights: string = ''): Promise<void> {
        const nMode: number =
            rights == ''
                ? fs.constants.F_OK
                : rights
                      .toLowerCase()
                      .split('')
                      .map((r: string) => {
                          switch (r) {
                              case 'r': {
                                  return fs.constants.R_OK;
                              }

                              case 'w': {
                                  return fs.constants.W_OK;
                              }

                              case 'x': {
                                  return fs.constants.X_OK;
                              }

                              default: {
                                  throw new Error(
                                      `expected parameters : a string of 'r', 'w', and 'x'`
                                  );
                              }
                          }
                      })
                      .reduce((prev, curr) => prev | curr, 0);
        await this.fs.access(sPath, nMode);
    }
}
