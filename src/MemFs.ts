import {
    EncodingOptions,
    ForceOptions,
    FsReadDirResult,
    FsStatResult,
    IFileSystemModule,
    RecursiveOptions,
} from './IFileSystemModule';
import path from 'node:path';
import { MemObject } from './MemObject';

export class MemFs implements IFileSystemModule {
    private _root = new MemObject('.', true);

    get fileMap(): string[] {
        const getFileMap = (oNode: MemObject): string[] => {
            const aResult = [];
            if (oNode.isDirectory) {
                for (const child of oNode.getChildren()) {
                    aResult.push(child.fullname);
                    if (child.isDirectory) {
                        getFileMap(child).forEach((f) => {
                            aResult.push(f);
                        });
                    }
                }
            }
            return aResult;
        };
        return getFileMap(this._root).sort();
    }

    async mkdir(sPath: string, options?: RecursiveOptions): Promise<undefined> {
        sPath = path.normalize(sPath);
        const aParts = sPath.split('/');
        if (options && options.recursive) {
            let oCurrent: MemObject = this._root;
            for (const sCurrent of aParts) {
                if (!oCurrent.hasChild(sCurrent)) {
                    oCurrent.addChild(new MemObject(sCurrent, true));
                }
                oCurrent = oCurrent.getChild(sCurrent);
            }
        } else {
            const sLastPart = aParts.pop();
            if (sLastPart != undefined) {
                const oParent = this._root.lookup(aParts.join('/'));
                oParent.addChild(new MemObject(sLastPart, true));
            }
        }
    }

    async readFile(sPath: string, options?: EncodingOptions): Promise<Buffer | string> {
        const bString = options && options.encoding == 'utf8';
        sPath = path.normalize(sPath);
        const oFile = this._root.lookup(sPath);
        return bString ? oFile.content : Buffer.from(oFile.content);
    }

    async readdir(
        sPath: string,
        options?: RecursiveOptions & { withFileTypes: true }
    ): Promise<string[] | FsReadDirResult[]> {
        sPath = path.normalize(sPath);
        const bRecursive = options && options.recursive;
        const oLocation = this._root.lookup(sPath);
        const getChildrenOf = function (
            oNode: MemObject,
            sParentPath: string = ''
        ): FsReadDirResult[] {
            const aResult: FsReadDirResult[] = [];
            for (const k of oNode.children.values()) {
                aResult.push({
                    name: k.name,
                    parentPath: sParentPath == '' ? '.' : sParentPath,
                    isDirectory() {
                        return k.isDirectory;
                    },
                });
                if (k.isDirectory) {
                    aResult.push(...getChildrenOf(k, path.join(sParentPath, k.name)));
                }
            }
            return aResult;
        };
        if (bRecursive) {
            return getChildrenOf(this._root.lookup(sPath));
        } else {
            const aChildren = oLocation.getChildren();
            return aChildren.map(
                (f: MemObject): FsReadDirResult => ({
                    name: f.name,
                    parentPath: sPath == '' ? '.' : sPath,
                    isDirectory() {
                        return f.isDirectory;
                    },
                })
            );
        }
    }

    async rename(sOldPath: string, sNewPath: string): Promise<void> {
        sOldPath = path.normalize(sOldPath);
        sNewPath = path.normalize(sNewPath);
        const sBaseNewName = path.basename(sNewPath);
        const sDirNewName = path.dirname(sNewPath);
        const oLocation = this._root.lookup(sOldPath);
        const oParentLocation = oLocation.parent;
        // remove location from current location
        oParentLocation!.removeChild(oLocation);
        // rename child
        oLocation.name = sBaseNewName;
        // put renamed child to new location
        const oNewLocation = this._root.lookup(sDirNewName);
        oNewLocation.addChild(oLocation);
    }

    async rm(sPath: string, options?: RecursiveOptions & ForceOptions): Promise<void> {
        sPath = path.normalize(sPath);
        const recursive = options?.recursive ?? false;
        const force = options?.force ?? false;
        try {
            const oFile = this._root.lookup(sPath);
            const nOpt = (recursive ? 2 : 0) | (force ? 1 : 0);
            const removeFile = () => {
                oFile.parent?.removeChild(oFile);
            };
            const bHasChildren = oFile.isDirectory && oFile.children.size > 0;
            switch (nOpt) {
                // no force, no recursive
                case 0: {
                    // Should only delete file or empty folder
                    if (bHasChildren) {
                        throw new Error('cannot remove non-empty folder (use recursive)');
                    } else {
                        // Regular file or empty folder
                        removeFile();
                    }
                    break;
                }
                // FORCE only : do not throw error
                case 1: {
                    if (!bHasChildren) {
                        removeFile();
                    }
                    break;
                }
                // RECURSIVE only
                case 2: {
                    oFile.truncate();
                    break;
                }
                // FORCE & RECURSIVE
                case 3: {
                    oFile.truncate();
                    break;
                }
            }
        } catch (e) {
            if (recursive) {
                return;
            } else {
                throw e;
            }
        }
    }

    async stat(sPath: string): Promise<FsStatResult> {
        sPath = path.normalize(sPath);
        const oFile = this._root.lookup(sPath);
        return {
            size: oFile.size,
            atimeMs: oFile.atime,
            mtimeMs: oFile.mtime,
            birthtimeMs: oFile.ctime,
            isDirectory(): boolean {
                return oFile.isDirectory;
            },
        };
    }

    async writeFile(
        sPath: string,
        data: string | Buffer,
        options?: EncodingOptions
    ): Promise<void> {
        sPath = path.normalize(sPath);
        try {
            const oFile = this._root.lookup(sPath);
            oFile.content = data.toString();
            return;
        } catch {}
        const bString = options && options.encoding == 'utf8';
        const sFileName = path.basename(sPath);
        const sDirName = path.dirname(sPath);
        const oFileFolder = this._root.lookup(sDirName);
        const oNewFile = new MemObject(sFileName, false);
        oNewFile.content = bString && typeof data == 'string' ? data : data.toString();
        oFileFolder.addChild(oNewFile);
    }
}
