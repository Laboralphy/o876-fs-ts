import path from 'node:path';
import fs from 'fs/promises';
import { Stats as Stats } from 'fs';
import { Dirent, MakeDirectoryOptions, ObjectEncodingOptions, PathLike } from 'node:fs';

export type StatResult = {
    name: string; // filename
    dir: boolean; // true if this is a directory
    size: number; // size of this file
    ctime: number; // timestamp in milliseconds of file creation
    mtime: number; // timestamp in milliseconds of file last modification
    atime: number; // timestamp in milliseconds of file last opening
};

/**
 * Default .ls return type
 */
type LsSimpleResult = {
    name: string;
    dir: boolean;
};

type LsOptions = {
    stat?: boolean; // if true : return a StatResult instead of a LsSimpleResult
    recursive?: boolean;
};

// type ReadOptions = {
//     binary: boolean; // if true : the file content is treated as binary instead of utf-8
// };

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
            this.fs = fs;
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
     * @param lsOptions listing options
     */
    async ls(sPath: string, lsOptions: LsOptions = {}) {
        const { stat = false, recursive = false } = lsOptions;
        const aDirEnts = await fs.readdir(sPath, {
            withFileTypes: true,
            recursive,
        });
        const aFiles = [];
        for (const d of aDirEnts) {
            const dir = d.isDirectory();
            const sPathToFile = path.resolve(d.parentPath, d.name);
            const f = stat ? this.stat(sPathToFile) : sPathToFile;
        }
        /*
        if (lsOptions.stat) {
            return list.map((f) => ({
                name: f.name,
                dir: f.isDirectory(),
            }));
        } else {
            return Promise.all(list.map((f: Dirent) => f.name));
        }*/
    }

    /**
     * Remove the specified file,
     * If directory is specified, remove all files and folders recursively inside the specified directory
     * @param sFile location or file name to be removed
     */
    async rm(sFile: string): Promise<void> {
        const s = await this.stat(sFile);
        if (s) {
            if (s.dir) {
                // recursively rm all files
                const sPath = path.resolve(sFile, s.name);
                const aFiles = await this.ls(sPath);
                await Promise.all(aFiles.map((f) => this.rm(path.join(sPath, f.name))));
            }
            return fs.unlink(sFile);
        }
    }

    /**
     * Renames a file or directory
     * @param sOld {string} old file name
     * @param sNew {string} new file name
     */
    async mv(sOld: string, sNew: string): Promise<void> {
        return fs.rename(sOld, sNew);
    }
}
//
// /**
//  * read file content as utf8
//  */
// export async function read(
//     sFile: string,
//     options: ReadOptions = { binary: false }
// ): Promise<Buffer> {
//     return fs.readFile(
//         sFile,
//         options.binary
//             ? null
//             : {
//                   encoding: 'utf8',
//               }
//     );
// }
//
// /**
//  * writes a file
//  * @param sFile {string}
//  * @param data {string}
//  * @returns {Promise<unknown>}
//  */
// export async function write(sFile: string, data: string | Buffer): Promise<void> {
//     return fs.writeFile(
//         sFile,
//         data,
//         typeof data === 'string'
//             ? {
//                   encoding: 'utf8',
//               }
//             : null
//     );
// }
//
// export async function access(sFile: string, rights: string = ''): Promise<boolean> {
//     const nMode: number = rights
//         .toLowerCase()
//         .split('')
//         .map((r: string) => {
//             switch (r) {
//                 case 'r': {
//                     return fs.constants.R_OK;
//                 }
//
//                 case 'w': {
//                     return fs.constants.W_OK;
//                 }
//
//                 case 'x': {
//                     return fs.constants.X_OK;
//                 }
//
//                 default: {
//                     throw new Error('PromFS Access : does not compute : ' + r);
//                 }
//             }
//         })
//         .reduce((prev, curr) => prev | curr, 0);
//     await fs.access(sFile, nMode);
// }
//
// export async function tree(sPath) {
//     const aFiles = await ls(sPath);
//     const aEntries = [];
//     for (let i = 0, l = aFiles.length; i < l; ++i) {
//         const { name, dir } = aFiles[i];
//         if (dir) {
//             const sDirName = path.join(sPath, name);
//             const aSubList = await tree(sDirName);
//             aEntries.push(...aSubList.map((f) => path.join(name, f)));
//         } else {
//             aEntries.push(name);
//         }
//     }
//     return aEntries;
// }

const f = new FSHelper();
f.ls('../.idea').then((x) => console.log(x));
