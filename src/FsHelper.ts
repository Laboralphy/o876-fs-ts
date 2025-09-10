import path from 'node:path';
import fs from 'fs/promises';
import {
    BinaryOptions,
    EncodingOptions,
    ForceOptions,
    FsStatResult,
    IFileSystemModule,
    RecursiveOptions,
} from './IFileSystemModule';

export type StatResult = {
    name: string; // filename
    dir: boolean; // true if this is a directory
    size: number; // size of this file
    ctime: number; // timestamp in milliseconds of file creation
    mtime: number; // timestamp in milliseconds of file last modification
    atime: number; // timestamp in milliseconds of file last opening
};

/**
 * Common FS operations simplified
 */
export class FsHelper {
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
    async ls(sPath: string, options?: RecursiveOptions): Promise<string[]> {
        const { recursive = false } = options ?? {};
        const aFiles = await this.fs.readdir(sPath, {
            withFileTypes: true,
            recursive,
        });
        return aFiles.map((f) => path.join(f.parentPath, f.name));
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
}
