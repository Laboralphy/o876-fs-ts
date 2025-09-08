export class MemObject {
    private static idCounter: number = 0;
    private readonly _children: Map<string, MemObject> | undefined;
    private _name: string;
    private readonly _id: number;
    private _parent: MemObject | null = null;
    private _content: string;
    private _ctime: number;
    private _atime: number;
    private _mtime: number;

    constructor(name: string, bFolder: boolean) {
        const d = Date.now();
        this._id = ++MemObject.idCounter;
        this._name = name;
        this._ctime = d;
        this._mtime = d;
        this._atime = d;
        if (bFolder) {
            this._children = new Map<string, MemObject>();
        }
        this._content = '';
    }

    get size(): number {
        return this.content.length;
    }

    get ctime(): number {
        return this._ctime;
    }

    get mtime(): number {
        return this._mtime;
    }

    get atime(): number {
        return this._atime;
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
        if (this.isDirectory) {
            throw new Error('illegal : cannot set content to a folder');
        }
        this._content = data;
        this._mtime = Date.now();
    }

    get content(): string {
        if (this.isDirectory) {
            throw new Error('illegal : cannot get content from a folder');
        }
        this._atime = Date.now();
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
        if (sPath == '.') {
            return this;
        }
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
