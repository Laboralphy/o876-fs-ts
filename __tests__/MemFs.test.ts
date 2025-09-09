import { MemFs } from '../src/MemFs';
import path from 'node:path';
import { FsReadDirResult } from '../src/IFileSystemModule';

describe('mkdir', () => {
    it('should create a directory', async () => {
        const m = new MemFs();
        await m.mkdir('test-dir');
        expect(m.fileMap).toEqual(['./test-dir']);
    });
    it('should create nested directory', async () => {
        const m = new MemFs();
        await m.mkdir('test-dir');
        await m.mkdir('test-dir/other-dir');
        expect(m.fileMap).toEqual(['./test-dir', './test-dir/other-dir']);
    });
    it('should create more than one nested directory', async () => {
        const m = new MemFs();
        await m.mkdir('test-dir');
        await m.mkdir('test-dir/other-dir');
        await m.mkdir('test-dir12');
        await m.mkdir('test-dir12/other-dir');
        expect(m.fileMap).toEqual([
            './test-dir',
            './test-dir/other-dir',
            './test-dir12',
            './test-dir12/other-dir',
        ]);
    });
});

describe('readFile/writeFile', () => {
    it('should return "CONTENT" when writing "CONTENT" in a file', async () => {
        const m = new MemFs();
        await m.writeFile('test-file', 'CONTENT');
        const s = await m.readFile('test-file', { encoding: 'utf8' });
        expect(s).toBe('CONTENT');
    });
});

describe('readdir', () => {
    it('should return [] when reading root empty dir', async () => {
        const m = new MemFs();
        const aList = await m.readdir('.');
        expect(aList).toEqual([]);
    });
    it('should return [pom, pim, pam] when reading root dir', async () => {
        const m = new MemFs();
        m.mkdir('pom');
        m.mkdir('pim');
        m.mkdir('pam');
        m.mkdir('pim/poum', { recursive: true });
        m.mkdir('pim/pouf', { recursive: true });
        m.mkdir('pim/poush', { recursive: true });
        m.writeFile('pim/poush/test1', 'test');
        const aNames = (await m.readdir('.')).map((f) => path.join(f.parentPath, f.name));
        expect(aNames).toEqual(['pom', 'pim', 'pam']);
    });
    it('should return [pom, pim, pam, pim/poum, pim/pouf, pim/poush] when reading root dir', async () => {
        const m = new MemFs();
        m.mkdir('pom');
        m.mkdir('pim');
        m.mkdir('pam');
        m.mkdir('pim/poum', { recursive: true });
        m.mkdir('pim/pouf', { recursive: true });
        m.mkdir('pim/poush', { recursive: true });
        m.writeFile('pim/poush/test1', 'test');
        const aList = await m.readdir('.', { recursive: true, withFileTypes: true });
        expect(aList.map((f: FsReadDirResult) => path.join(f.parentPath, f.name))).toEqual([
            'pom',
            'pim',
            'pim/poum',
            'pim/pouf',
            'pim/poush',
            'pim/poush/test1',
            'pam',
        ]);
    });
});

describe('mv', () => {
    it('should rename file', async () => {
        const m = new MemFs();
        await m.mkdir('from');
        await m.mkdir('to');
        await m.writeFile('from/test.dat', 'test-ééé');
        expect(m.fileMap).toEqual(['./from', './from/test.dat', './to']);
        await m.rename('from/test.dat', 'from/rename-1.dat');
        expect(m.fileMap).toEqual(['./from', './from/rename-1.dat', './to']);
        const sContent = await m.readFile('from/rename-1.dat');
        expect(sContent.toString()).toBe('test-ééé');
    });
    it('should move file', async () => {
        const m = new MemFs();
        await m.mkdir('from');
        await m.mkdir('to');
        await m.writeFile('from/test.dat', 'test-ééé');
        expect(m.fileMap).toEqual(['./from', './from/test.dat', './to']);
        await m.rename('from/test.dat', 'to/rename-2.dat');
        expect(m.fileMap).toEqual(['./from', './to', './to/rename-2.dat']);
    });
});
