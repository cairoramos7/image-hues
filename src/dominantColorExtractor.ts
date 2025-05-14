// src/dominantColorExtractor.ts

// Interfaces for SOLID compliance
interface ImageLoader {
    load(url: string): Promise<HTMLImageElement>;
}

interface ColorExtractor {
    extract(imageUrl: string, sampleSize: number, colorCount: number): Promise<{ mainColors: string[], contrastColors: string[] }>;
}

interface ContrastCalculator {
    calculate(hex: string): string;
}

interface ImageProcessor {
    process(image: HTMLImageElement, sampleSize: number, colorCount: number): Promise<string[]>;
}

// Default Image Loader
class DefaultImageLoader implements ImageLoader {
    async load(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Error loading the image'));
            img.src = url;
        });
    }
}

// Contrast Color Calculator
class LuminanceContrastCalculator implements ContrastCalculator {
    calculate(hex: string): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5 ? '#ffffff' : '#000000';
    }
}

// Raster Image Processor
class RasterImageProcessor implements ImageProcessor {
    constructor(private canvasFactory: () => HTMLCanvasElement = () => document.createElement('canvas')) { }

    async process(image: HTMLImageElement, sampleSize: number, colorCount: number): Promise<string[]> {
        if (image.width === 0 || image.height === 0) {
            throw new Error('Image with invalid dimensions');
        }

        const canvas = this.canvasFactory();
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not obtain canvas context');
        }

        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorMap: Record<string, number> = {};

        for (let i = 0; i < imageData.length; i += 4 * sampleSize) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            if (a < 128) continue;

            const quantizedR = Math.round(r / 10) * 10;
            const quantizedG = Math.round(g / 10) * 10;
            const quantizedB = Math.round(b / 10) * 10;
            const hex = `#${((1 << 24) + (quantizedR << 16) + (quantizedG << 8) + quantizedB).toString(16).slice(1)}`;
            colorMap[hex] = (colorMap[hex] || 0) + 1;
        }

        const isColorExtreme = (hex: string): boolean => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.9 || luminance < 0.1;
        };

        let sortedColors = Object.entries(colorMap)
            .filter(([color]) => !isColorExtreme(color))
            .sort((a, b) => b[1] - a[1])
            .map(([color]) => color)
            .slice(0, colorCount);

        if (sortedColors.length === 0) {
            sortedColors = Object.entries(colorMap)
                .sort((a, b) => b[1] - a[1])
                .map(([color]) => color)
                .slice(0, colorCount);
        }

        return sortedColors;
    }
}

// SVG Image Processor
class SvgImageProcessor implements ImageProcessor {
    async process(_image: HTMLImageElement, _sampleSize: number, colorCount: number): Promise<string[]> {
        return ['#000000', '#333333', '#666666'].slice(0, colorCount);
    }
}

// Main Color Extractor Service
class DominantColorExtractor implements ColorExtractor {
    constructor(
        private imageLoader: ImageLoader,
        private contrastCalculator: ContrastCalculator,
        private rasterProcessor: ImageProcessor,
        private svgProcessor: ImageProcessor
    ) { }

    async extract(imageUrl: string, sampleSize: number = 10, colorCount: number = 3): Promise<{ mainColors: string[], contrastColors: string[] }> {
        const validSampleSize = Math.max(1, sampleSize);
        const validColorCount = Math.max(1, colorCount);

        const image = await this.imageLoader.load(imageUrl);
        const isSvg = imageUrl.toLowerCase().endsWith('.svg') || imageUrl.toLowerCase().includes('svg');
        const processor = isSvg ? this.svgProcessor : this.rasterProcessor;

        const mainColors = await processor.process(image, validSampleSize, validColorCount);
        const contrastColors = mainColors.map(color => this.contrastCalculator.calculate(color));

        return { mainColors, contrastColors };
    }
}

// Factory function to create the extractor with default dependencies
export const createDominantColorExtractor = (): ColorExtractor => {
    const imageLoader = new DefaultImageLoader();
    const contrastCalculator = new LuminanceContrastCalculator();
    const rasterProcessor = new RasterImageProcessor();
    const svgProcessor = new SvgImageProcessor();
    return new DominantColorExtractor(imageLoader, contrastCalculator, rasterProcessor, svgProcessor);
};

// Exported function for easy use
export const getImageDominantColors = async (
    imageUrl: string,
    sampleSize: number = 10,
    colorCount: number = 3
): Promise<{ mainColors: string[], contrastColors: string[] }> => {
    const extractor = createDominantColorExtractor();
    return extractor.extract(imageUrl, sampleSize, colorCount);
};