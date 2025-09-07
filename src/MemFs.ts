import { FsStatResult, IFileSystemModule, RecursiveOptions } from './index';
import path from 'node:path';

type MemFsEntry = {
    id: number;
    parentId: number;
    fsStat: FsStatResult;
    content: string;
};

function _true() {
    return true;
}

function _false() {
    return false;
}

class MemObject {
    private children: Map<string, MemObject> = new Map<string, MemObject>();
    private name: string;
    private id: number;
    private parentId: number;
    private fsStat: FsStatResult;
    private _content: string

    constructor (name: string, id: number, parentId: number, bFolder) {
        const d = Date.now();
        this.id = id;
        this.parentId = parentId;
        this.name = name;
        this.fsStat = {
            size: 0,
            birthtimeMs: d,
            mtimeMs: d,
            atimeMs: d,
            isDirectory():boolean { return bFolder }
        }
        this._content = ''
    }

    set content (data: string) {
        this._content = data;
        this.fsStat.size = data.length
    }

    get content () : string {
        return this._content
    }

    addChild (child: MemObject) {
        if (this.fsStat.isDirectory()) {

        } else {
            throw new Error(`illegal : not a folder`)
        }
    }
}

class MemFs implements IFileSystemModule {
    private files: Map<string, MemFsEntry> = new Map<string, MemFsEntry>();

    async access(sPath: string, nMode?: number): Promise<void> {
        sPath = path.normalize(sPath);
        if (!this.files.has(sPath)) {
            throw new Error(`file not found ${sPath}`);
        }
    }

    mkdir(sPath: string, options: RecursiveOptions): Promise<string | undefined> {
        sPath = path.normalize(sPath);
        const aParts = sPath.split('/');
        let sCurrent = ''
        for (const sPart of aParts) {
            sCurrent = path.join(sCurrent, sPart)
            if ()
        }
        if (options.recursive) {
            const sParentPath = path.basename(sPath);
            if (sParentPath != '.') {
                if (!this._exists(sParentPath)) {

                }
            } else {

            }
        }
        if (!this.files.has(sPath)) {
            const d = Date.now();
            this.files.set(sPath, {
                content: '',
                fsStat: {
                    size: 0,
                    mtimeMs: d,
                    atimeMs: d,
                    birthtimeMs: d,
                    isDirectory: _true,
                },
            });
        }
        return Promise.resolve(undefined);
    }

    readFile(sPath: string, options?: EncodingOptions): Promise<Buffer> {
        return Promise.resolve(undefined);
    }

    readdir(sLocation: string, options: ReadDirOptions): Promise<FsReadDirResult[]> {
        return Promise.resolve([]);
    }

    rename(sOldPath: string, sNewPath: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    rm(sPath: string, options?: RecursiveOptions & ForceOptions): Promise<void> {
        return Promise.resolve(undefined);
    }

    async _exists(sPath: string) {
        try {
            await this.stat(sPath);
            return true;
        } catch {
            return false;
        }
    }

    async stat(sPath: string): Promise<FsStatResult> {
        sPath = path.normalize(sPath);
        const r: MemFsEntry | undefined = this.files.get(sPath);
        if (r) {
            return r.fsStat;
        } else {
            throw new Error(`file not found ${sPath}`);
        }
    }

    unlink(sPath: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    writeFile(
        sPath: string,
        data: string | Buffer,
        options: EncodingOptions | undefined
    ): Promise<void> {
        return Promise.resolve(undefined);
    }
}
