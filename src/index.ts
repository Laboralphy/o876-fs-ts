import path from 'node:path';
import fs from 'fs/promises';

type StatResultDates = {
    created: number;
    modified: number;
    accessed: number;
};

export type StatResult = {
    name: string;
    dir: boolean;
    size: number;
    dates: StatResultDates;
};

/**
 * Returns a structure describe the specified file
 * @param sFile a filename
 */
export async function stat(sFile: string): Promise<StatResult | undefined> {
    try {
        const st = await fs.stat(sFile);
        const pp = path.parse(sFile);
        return {
            name: pp.base,
            dir: st.isDirectory(),
            size: st.size,
            dates: {
                created: Math.floor(st.birthtimeMs / 1000),
                modified: Math.floor(st.mtimeMs / 1000),
                accessed: Math.floor(st.atimeMs / 1000),
            },
        };
    } catch {
        return undefined;
    }
}

/**
 * Creates a new directory.
 * Recursively creates all parent directory that don't exist
 * @param sPath
 */
export async function mkdir(sPath: string): Promise<void> {
    const sParent = path.dirname(sPath);
    if (!(await stat(sParent))) {
        await mkdir(sParent);
    }
    if (!(await stat(sPath))) {
        return mkdir(sPath);
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
