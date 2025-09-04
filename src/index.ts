import path from 'node:path';
import fs from 'fs/promises';
import { Stats as Stats } from 'fs';
import { Dirent, MakeDirectoryOptions, ObjectEncodingOptions, PathLike } from 'node:fs';

type StatResult = {
    name: string; // filename
    dir: boolean; // true if this is a directory
    size: number; // size of this file
    ctime: number; // timestamp in milliseconds of file creation
    mtime: number; // timestamp in milliseconds of file last modification
    atime: number; // timestamp in milliseconds of file last opening
};

type RecursiveOptions = {
    recursive?: boolean;
};

type BinaryOptions = {
    binary?: boolean;
};

interface IFileSystemModule {
    stat(sFile: PathLike): Promise<Stats>;
    mkdir(sFile: PathLike, options: MakeDirectoryOptions): Promise<string | undefined>;
    readdir(
        sLocation: PathLike,
        options: ObjectEncodingOptions & {
            withFileTypes: true;
            recursive?: boolean | undefined;
        }
    ): Promise<Dirent[]>;
    rename(sOldPath: PathLike, sNewPath: PathLike): Promise<void>;
    unlink(sPath: PathLike): Promise<void>;
    writeFile(sFile: PathLike, data: string | Buffer, options: ObjectEncodingOptions | undefined): Promise<void>
    readFile(sFile: PathLike, options?: ObjectEncodingOptions): Promise<Buffer>
    access(sFile: PathLike, nMode?: number): Promise<void>
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
     * @param sFile a filename
     */
    async stat(sFile: string): Promise<StatResult> {
        const st: Stats = await this.fs.stat(sFile);
        const pp = path.parse(sFile);
        return {
            name: pp.base,
            dir: st.isDirectory(),
            size: st.size,
            ctime: Math.floor(st.birthtimeMs),
            mtime: Math.floor(st.mtimeMs),
            atime: Math.floor(st.atimeMs),
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
     * @param sFile
     */
    async exists(sFile: string): Promise<boolean> {
        try {
            await this.stat(sFile);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Returns true if the specified resource is a directory
     * @param sFile
     */
    async isDirectory(sFile: string): Promise<boolean> {
        const oStat = await this.stat(sFile);
        return oStat?.dir ?? false;
    }

    /**
     * List all files in specified directory
     * @param sPath location to be listed
     * @param options listing options
     */
    async ls(sPath: string, options: RecursiveOptions = {}): Promise<string[]> {
        const { recursive = false } = options;
        const aDirEnts = await fs.readdir(sPath, {
            withFileTypes: true,
            recursive,
        });
        const aFiles = [];
        for (const d of aDirEnts) {
            const sEntryPath = path.join(d.parentPath, d.name)
            if (recursive && d.isDirectory()) {
                const aSubFolderFiles = await this.ls(sEntryPath, options);
                for (const sf of aSubFolderFiles) {
                    aFiles.push(sf);
                }
            } else {
                aFiles.push(sEntryPath);
            }
        }
        return aFiles
    }

    lsr(sPath: string): Promise<string[]> {
        return this.ls(sPath, { recursive: true })
    }

    /**
     * Remove the specified file,
     * If directory is specified, remove all files and folders recursively inside the specified directory
     * @param sFile location or file name to be removed
     * @param options
     */
    async rm(sFile: string, options: RecursiveOptions): Promise<void> {
        const s = await this.stat(sFile);
        console.log('rm', sFile)
        if (s.dir && options.recursive) {
            // recursively rm all files
            const sPath = path.resolve(sFile, s.name);
            console.log(sFile, s.name, sPath)
            const aFiles = await this.ls(sPath);
            await Promise.all(aFiles.map((f) =>
                this.rm(path.join(sPath, f), options)));
        } else {
            console.log('rm', sFile)
            // return fs.unlink(sFile);
        }
    }

    async rmr(sPath: string): Promise<void> {
        return this.rm(sPath, { recursive: true });
    }

    /**
     * Renames a file or directory
     * @param sOld {string} old file name
     * @param sNew {string} new file name
     */
    async mv(sOld: string, sNew: string): Promise<void> {
        return fs.rename(sOld, sNew);
    }

    /**
     * writes a file
     * @param sFile {string}
     * @param data {string}
     * @returns {Promise<unknown>}
     */
    async write(sFile: string, data: string | Buffer): Promise<void> {
        return this.fs.writeFile(
            sFile,
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
        sFile: string,
        options: BinaryOptions = { binary: false }
    ): Promise<string | Buffer> {
        const opts: ObjectEncodingOptions | undefined = options.binary
            ? undefined
            : { encoding: 'utf8' }
        const data = await this.fs.readFile(sFile, opts);
        return options.binary
            ? data
            : data.toString();
    }

    /**
     * Attempt to access specified file or directory
     * Throws an Error if unreachable
     * @param sFile
     * @param rights
     */
    async access(sFile: string, rights: string = ''): Promise<void> {
        const nMode: number = rights == ''
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
                            throw new Error(`expected parameters : a string of 'r', 'w', and 'x'`);
                        }
                    }
                })
                .reduce((prev, curr) => prev | curr, 0);
        await this.fs.access(sFile, nMode);
    }
}
