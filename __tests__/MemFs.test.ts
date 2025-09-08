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
