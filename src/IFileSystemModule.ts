export type RecursiveOptions = {
    recursive?: boolean;
};

export type ForceOptions = {
    force?: boolean;
};

export type BinaryOptions = {
    binary?: boolean;
};

export type EncodingOptions = {
    encoding?: string;
};

export type ReadDirOptions = {
    withFileTypes: true;
} & RecursiveOptions;

export interface FsStatResult {
    isDirectory(): boolean;
    size: number;
    birthtimeMs: number;
    mtimeMs: number;
    atimeMs: number;
}

export interface FsReadDirResult {
    isDirectory(): boolean;
    name: string;
    parentPath: string;
}

export interface IFileSystemModule {
    stat(sPath: string): Promise<FsStatResult>;
    mkdir(sPath: string, options?: RecursiveOptions): Promise<void>;
    readdir(sPath: string, options?: ReadDirOptions): Promise<FsReadDirResult[]>;
    rename(sOldPath: string, sNewPath: string): Promise<void>;
    writeFile(sPath: string, data: string | Buffer, options?: EncodingOptions): Promise<void>;
    readFile(sPath: string, options?: EncodingOptions): Promise<Buffer | string>;
    rm(sPath: string, options?: RecursiveOptions & ForceOptions): Promise<void>;
}
