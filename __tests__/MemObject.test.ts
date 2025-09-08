import { MemObject } from '../src/MemObject';

describe('MemObject.id', () => {
    it('should have an id greater than 0', () => {
        const m = new MemObject('test', false);
        expect(m.id).toBeGreaterThan(0);
    });
});

describe('MemObject.isDirectory', () => {
    it('should return true when memobjet is constructed as folder', () => {
        const m = new MemObject('test', true);
        expect(m.isDirectory).toBeTruthy();
    });
});

describe('MemObject.name', () => {
    it('should return "myFile" when MemObject is constructed with name = myFile', () => {
        const m = new MemObject('myFile', true);
        expect(m.name).toBe('myFile');
    });
});

describe('MemObject.content', () => {
    it('should return "myContent" when content is set to "myContent"', () => {
        const m = new MemObject('myFile', false);
        m.content = 'myContent';
        expect(m.content).toBe('myContent');
    });

    it('should throw an error when attempting to set content on folder', () => {
        const m = new MemObject('myFolder', true);
        expect(() => {
            m.content = 'new content';
        }).toThrow(new Error('illegal : cannot set content to a folder'));
    });

    it('should throw an error when attempting to get content from a folder', () => {
        const m = new MemObject('myFolder', true);
        expect(() => m.content).toThrow(new Error('illegal : cannot get content from a folder'));
    });
});

describe('MemObject.children', () => {
    it('should have children Map when is folder', () => {
        const m = new MemObject('myFolder', true);
        expect(m.children).toBeInstanceOf(Map);
    });
    it('should not have children Map when not folder', () => {
        const m = new MemObject('myFile', false);
        expect(() => m.children).toThrow(new Error('illegal : not a directory'));
    });
});

describe('managing children', () => {
    it('should not be able to add children on a non-folder', () => {
        const m = new MemObject('myFile', false);
        const m2 = new MemObject('myFile2', false);
        expect(() => m.addChild(m2)).toThrow(new Error('illegal : not a directory'));
    });
    it('should be able to add children on a folder', () => {
        const m = new MemObject('myFolder', true);
        const m2 = new MemObject('myFile2', false);
        expect(() => m.addChild(m2)).not.toThrow(new Error('illegal : not a directory'));
        expect(m.getChildren().length).toBe(1);
        expect(m.getChild('myFile2')).toBeInstanceOf(MemObject);
        expect(m2.parent).toBe(m);
    });
    it('should be able to remove existing child', () => {
        const m = new MemObject('myFolder', true);
        const m2 = new MemObject('myFile2', false);
        m.addChild(m2);
        m.removeChild(m2);
        expect(m.parent).toBeNull();
        expect(m.hasChild('myFile2')).toBeFalsy();
    });
});

describe('lookup', () => {
    it('should return m23', function () {
        const root = new MemObject('/', true);
        const m1 = new MemObject('m1', false);
        const m2 = new MemObject('m2', true);
        const m3 = new MemObject('m3', true);
        const m21 = new MemObject('m21', false);
        const m22 = new MemObject('m22', false);
        const m23 = new MemObject('m23', false);
        const m24 = new MemObject('m24', false);
        const m31 = new MemObject('m31', false);
        const m32 = new MemObject('m32', false);

        root.addChild(m1);
        root.addChild(m2);
        root.addChild(m3);

        m2.addChild(m21);
        m2.addChild(m22);
        m2.addChild(m23);
        m2.addChild(m24);

        m3.addChild(m31);
        m3.addChild(m32);

        expect(root.lookup('m2/m23')).toBe(m23);
        expect(root.lookup('')).toBe(root);
    });
});

describe('truncate', () => {
    it('should remove all children', function () {
        const root = new MemObject('/', true);
        const m1 = new MemObject('m1', false);
        const m2 = new MemObject('m2', true);
        const m3 = new MemObject('m3', true);
        const m21 = new MemObject('m21', false);
        const m22 = new MemObject('m22', false);
        const m23 = new MemObject('m23', false);
        const m24 = new MemObject('m24', false);
        const m31 = new MemObject('m31', false);
        const m32 = new MemObject('m32', false);

        root.addChild(m1);
        root.addChild(m2);
        root.addChild(m3);

        m2.addChild(m21);
        m2.addChild(m22);
        m2.addChild(m23);
        m2.addChild(m24);

        m3.addChild(m31);
        m3.addChild(m32);

        expect(root.children.size).toBe(3);
        expect(m2.children.size).toBe(4);
        expect(m3.children.size).toBe(2);
        root.truncate();
        expect(root.children.size).toBe(0);
        expect(m2.children.size).toBe(0);
        expect(m3.children.size).toBe(0);
    });
});
