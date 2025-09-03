import path from 'node:path';
import fs from 'fs/promises';
import FS_ERRORS from './fs-errors';

export type StatResult = {
    name: string; // filename
    dir: boolean; // true if this is a directory
    size: number; // size of this file
    ctime: number; // timestamp in seconds of file creation
    mtime: number; // timestamp of file last modification
    atime: number; // timestamp of file last opening
};

/**
 * Returns a structure describe the specified file
 * @param sFile a filename
 */
async function stat(sFile: string): Promise<StatResult | undefined> {
    const st = await fs.stat(sFile);
    const pp = path.parse(sFile);
    return {
        name: pp.base,
        dir: st.isDirectory(),
        size: st.size,
        ctime: Math.floor(st.birthtimeMs / 1000),
        mtime: Math.floor(st.mtimeMs / 1000),
        atime: Math.floor(st.atimeMs / 1000),
    };
}

async function exists(sFile: string): Promise<boolean> {
    try {
        await stat(sFile);
        return true;
    } catch {
        return false;
    }
}

async function isDirectory(sFile: string): Promise<boolean> {
    const oStat = await stat(sFile);
    return oStat?.dir ?? false;
}

/**
 * Creates a new directory.
 * Recursively creates all parent directory that don't exist
 * @param sPath
 */
export async function mkdir(sPath: string): Promise<void> {
    if (await stat(sPath)) {
        return fs.mkdir(sPath, { recursive: true });
    } else {
    }
}

async function ls(sPath: string) {
    const list = await fs.readdir(sPath, {
        withFileTypes: true,
    });
    return list.map((f) => ({
        name: f.name,
        dir: f.isDirectory(),
    }));
}

/**
 * Deletes a file
 * @param sFile {string} file to delete
 */
export async function rm(sFile: string): Promise<void> {
    const s = await stat(sFile);
    if (s) {
        if (s.dir) {
            // recursively rm all files
            // const aFiles =
        } else {
            return fs.unlink(sFile);
        }
    }
}
