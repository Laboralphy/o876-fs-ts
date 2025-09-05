import {
    EncodingOptions,
    FsReadDirResult,
    FsStatResult,
    IFileSystemModule,
    RecursiveOptions,
} from '../src';
import { FSHelper } from '../src';

describe('FSMock', function () {
    it('should instanciate', function () {
        expect(new FSHelper()).toBeInstanceOf(FSHelper);
    });

    it('should inject a mock properly', function () {
        const mockFs: IFileSystemModule = {};
        expect(new FSHelper(mockFs)).toBeInstanceOf(FSHelper);
    });
});
