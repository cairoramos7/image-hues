import { getImageDominantColors, createDominantColorExtractor } from '../dominantColorExtractor';

// Mock the Image class to simulate image loading
class MockImage {
    width = 2;
    height = 2;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    crossOrigin = 'Anonymous';
    src = '';
    constructor() {
        // Use setTimeout with zero delay to ensure onload fires asynchronously
        setTimeout(() => {
            if (this.src.includes('invalid')) {
                this.onerror?.();
            } else {
                this.onload?.();
            }
        }, 0);
    }
}

// Mock Image globally
jest.spyOn(global, 'Image').mockImplementation(() => new MockImage() as any);

// Mock canvas context to return predefined pixel data
const mockGetImageData = jest.fn(() => ({
    data: new Uint8ClampedArray([
        255, 0, 0, 255, // Red pixel
        0, 255, 0, 255, // Green pixel
        0, 0, 255, 255, // Blue pixel
        255, 255, 255, 255, // White pixel
    ]),
}));
jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    getImageData: mockGetImageData,
    drawImage: jest.fn(),
} as any);

describe('Image Hues', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getImageDominantColors extracts dominant colors and contrast colors', async () => {
        const result = await getImageDominantColors('https://example.com/image.jpg', 2, 2);
        expect(result).toEqual({
            mainColors: expect.arrayContaining(['#040000', '#000104']),
            contrastColors: expect.arrayContaining(['#ffffff']),
        });
        expect(mockGetImageData).toHaveBeenCalled();
    }, 10000); // Increased timeout to 10s

    test('createDominantColorExtractor works with custom extraction', async () => {
        const extractor = createDominantColorExtractor();
        const result = await extractor.extract('https://example.com/image.jpg', 2, 2);
        expect(result).toEqual({
            mainColors: expect.arrayContaining(['#040000', '#000104']),
            contrastColors: expect.arrayContaining(['#ffffff']),
        });
        expect(mockGetImageData).toHaveBeenCalled();
    }, 10000);

    test('handles SVG images with fallback colors', async () => {
        const result = await getImageDominantColors('https://example.com/image.svg', 2, 2);
        expect(result.mainColors).toHaveLength(2);
        expect(result.contrastColors).toHaveLength(2);
    }, 10000);

    test('throws error for invalid image URL', async () => {
        await expect(getImageDominantColors('https://invalid.com/image.jpg')).rejects.toThrow(
            'Error loading the image',
        );
    }, 10000);
});