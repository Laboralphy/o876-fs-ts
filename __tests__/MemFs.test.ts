import { MemFs } from '../src/MemFs';

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
    it('should return [] when reading root empty dir', async () => {
        const m = new MemFs();
        m.mkdir('pom');
        m.mkdir('pim');
        m.mkdir('pam');
        m.mkdir('pim/poum', { recursive: true });
        m.mkdir('pim/pouf', { recursive: true });
        m.mkdir('pim/poush', { recursive: true });
        m.writeFile('pim/poush/test1', 'test');
        const aList = await m.readdir('.');
        const aNames = aList.map((f) => f.name);
        expect(aNames).toEqual(['pom', 'pim', 'pam']);
    });
});
