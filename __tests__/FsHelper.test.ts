import {
    FsReadDirResult,
    FsStatResult,
    IFileSystemModule,
    ReadDirOptions,
    RecursiveOptions,
} from '../src/IFileSystemModule';
import { FsHelper } from '../src/FsHelper';

const baseMock = {
    readdir: jest.fn().mockResolvedValue([]),
    mkdir: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('')),
    stat: jest.fn().mockResolvedValue(undefined),
    rename: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    rm: jest.fn().mockResolvedValue(undefined),
};

describe('FS', function () {
    const mockFS: jest.Mocked<IFileSystemModule> = baseMock;

    it('should instanciate', function () {
        expect(new FsHelper()).toBeInstanceOf(FsHelper);
    });

    it('should inject a mock properly', function () {
        expect(new FsHelper(mockFS)).toBeInstanceOf(FsHelper);
    });

    it('should return [] when calling readdir', async function () {
        const fs = new FsHelper(mockFS);
        expect(fs.ls('x')).resolves.toEqual([]);
    });
});

describe('stat', function () {
    it('should return a StatResult of a file', async function () {
        const mockFS: jest.Mocked<IFileSystemModule> = {
            ...baseMock,
            stat: jest.fn().mockResolvedValue({
                isDirectory() {
                    return false;
                },
                size: 64,
                birthtimeMs: 1000,
                mtimeMs: 1000,
                atimeMs: 1000,
            }),
        };
        const fs = new FsHelper(mockFS);
        const s = await fs.stat('file');
        expect(s).toEqual({
            name: 'file',
            dir: false,
            size: 64,
            ctime: 1000,
            mtime: 1000,
            atime: 1000,
        });
    });
    it('should return a StatResult of a fomter', async function () {
        const mockFS: jest.Mocked<IFileSystemModule> = {
            ...baseMock,
            stat: jest.fn().mockResolvedValue({
                isDirectory() {
                    return true;
                },
                size: 0,
                birthtimeMs: 1000,
                mtimeMs: 1000,
                atimeMs: 1000,
            }),
        };
        const fs = new FsHelper(mockFS);
        const s = await fs.stat('folder');
        expect(s).toEqual({
            name: 'folder',
            dir: true,
            size: 0,
            ctime: 1000,
            mtime: 1000,
            atime: 1000,
        });
    });
});

describe('mkdir', function () {
    it('should call mkdir with recursive option', async function () {
        const aLog: string[] = [];
        const mockFS: jest.Mocked<IFileSystemModule> = {
            ...baseMock,
            mkdir: jest.fn((sFolder: string, options?: RecursiveOptions) => {
                aLog.push('mkdir ' + sFolder + (options && options.recursive ? ' recursive' : ''));
                return Promise.resolve(undefined);
            }),
        };
        const fs = new FsHelper(mockFS);
        await fs.mkdir('test/alpha/beta');
        expect(aLog.pop()).toEqual('mkdir test/alpha/beta recursive');
    });
});

describe('exists', function () {
    const mockFS: jest.Mocked<IFileSystemModule> = {
        ...baseMock,
        stat: jest.fn((sFile: string) => {
            if (sFile == 'present.dat') {
                const r: FsStatResult = {
                    atimeMs: 0,
                    size: 0,
                    birthtimeMs: 0,
                    mtimeMs: 0,
                    isDirectory(): boolean {
                        return false;
                    },
                };
                return Promise.resolve(r);
            } else {
                return Promise.reject(new Error('file not found'));
            }
        }),
    };
    it('should return true when file is "present.dat" and false when not', async function () {
        const fs = new FsHelper(mockFS);
        expect(fs.exists('present.dat')).resolves.toBe(true);
        expect(fs.exists('not-present.dat')).resolves.toBe(false);
    });
    it('should return false when file has invalid name', async function () {
        const fs = new FsHelper(mockFS);
        expect(fs.exists('')).resolves.toBe(false);
    });
});

describe('ls', function () {
    const mockFS: jest.Mocked<IFileSystemModule> = {
        ...baseMock,
        readdir: jest.fn(
            (
                sPath: string,
                options?: RecursiveOptions & { withFileTypes?: true }
            ): Promise<FsReadDirResult[]> => {
                const bRecursive = options && options.recursive;
                if (sPath == 'empty') {
                    return Promise.resolve([]);
                }
                if (sPath == 'simple') {
                    const a1: FsReadDirResult = {
                        name: 'a1',
                        parentPath: '',
                        isDirectory(): boolean {
                            return true;
                        },
                    };
                    const a2: FsReadDirResult = {
                        name: 'a2',
                        parentPath: 'a1',
                        isDirectory(): boolean {
                            return false;
                        },
                    };
                    if (bRecursive) {
                        return Promise.resolve([a1, a2]);
                    } else {
                        return Promise.resolve([a1]);
                    }
                } else {
                    return Promise.reject(new Error('path ' + sPath + ' not found'));
                }
            }
        ),
    };

    it('should return []', function () {
        const fs = new FsHelper(mockFS);
        expect(fs.ls('empty')).resolves.toEqual([]);
    });
    it('should return ["a1"]', function () {
        const fs = new FsHelper(mockFS);
        expect(fs.ls('simple')).resolves.toEqual(['a1']);
    });
    it('should return ["a1", "a1/a2"]', async function () {
        const fs = new FsHelper(mockFS);
        expect(await fs.ls('simple', { recursive: true })).toEqual(['a1', 'a1/a2']);
    });
});
