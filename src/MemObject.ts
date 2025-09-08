import { FsStatResult } from './IFileSystemModule';

export class MemObject {
    private static idCounter: number = 0;
    private readonly _children: Map<string, MemObject> | undefined;
    private _name: string;
    private readonly _id: number;
    private readonly _fsStat: FsStatResult;
    private _parent: MemObject | null = null;
    private _content: string;

    constructor(name: string, bFolder: boolean) {
        const d = Date.now();
        this._id = ++MemObject.idCounter;
        this._name = name;
        this._fsStat = {
            size: 0,
            birthtimeMs: d,
            mtimeMs: d,
            atimeMs: d,
            isDirectory(): boolean {
                return bFolder;
            },
        };
        if (bFolder) {
            this._children = new Map<string, MemObject>();
        }
        this._content = '';
    }

    get fsStat(): FsStatResult {
        return this._fsStat;
    }

    get isDirectory(): boolean {
        return this._children != undefined;
    }

    get id(): number {
        return this._id;
    }

    set name(value: string) {
        this._name = value;
    }

    get name(): string {
        return this._name;
    }

    set parent(p: MemObject | null) {
        this._parent = p;
    }

    get parent(): MemObject | null {
        return this._parent;
    }

    set content(data: string) {
        if (this._fsStat.isDirectory()) {
            throw new Error('illegal : cannot set content to a folder');
        }
        this._content = data;
        this._fsStat.size = data.length;
        this._fsStat.mtimeMs = Date.now();
    }

    get content(): string {
        if (this._fsStat.isDirectory()) {
            throw new Error('illegal : cannot get content from a folder');
        }
        this._fsStat.atimeMs = Date.now();
        return this._content;
    }

    get children(): Map<string, MemObject> {
        if (this._children != undefined) {
            return this._children;
        } else {
            throw new Error('illegal : not a directory');
        }
    }

    getChildren(): MemObject[] {
        return [...this.children.values()];
    }

    addChild(child: MemObject) {
        child.parent = this;
        this.children.set(child.name, child);
    }

    hasChild(name: string): boolean {
        return this.children.has(name);
    }

    getChild(name: string): MemObject {
        const oChild = this.children.get(name);
        if (!oChild) {
            throw new Error(`file not found ${name}`);
        }
        return oChild;
    }

    removeChild(child: MemObject) {
        this.children.delete(child.name);
        child.parent = null;
    }

    lookup(sPath: string): MemObject {
        const aPath = sPath.split('/');
        const sSearch = aPath.shift() ?? '';
        if (sSearch != '') {
            const oChild = this.getChild(sSearch);
            return aPath.length > 0 ? oChild.lookup(aPath.join('/')) : oChild;
        } else {
            return this;
        }
    }

    get path(): string {
        const aPath = [];
        let oCurrent: MemObject | null = this.parent;
        while (oCurrent) {
            aPath.unshift(oCurrent.name);
            oCurrent = oCurrent.parent;
        }
        return aPath.join('/');
    }

    get fullname(): string {
        return this.path ? this.path + '/' + this.name : this.name;
    }

    /**
     * Removes all children at any depth
     */
    truncate() {
        if (this.isDirectory) {
            for (const child of this.getChildren()) {
                child.truncate();
                this.removeChild(child);
            }
        }
    }
}
