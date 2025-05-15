# Image Hues

[![npm version](https://badge.fury.io/js/image-hues.svg)](https://www.npmjs.com/package/image-hues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/cairoramos7/image-hues)](https://github.com/cairoramos7/image-hues/issues)

**Image Hues** is a lightweight TypeScript library for extracting dominant colors and their contrast colors from images. It supports both raster images (e.g., PNG, JPEG) and SVG files, making it ideal for web developers building dynamic UI components, color palettes, or accessibility-focused designs.

**Note**: This package was previously published as `@cairoramos7/image-hues`. Use `image-hues` for new installations.

## Features

- Extracts the top dominant colors from an image.
- Generates contrast colors (black or white) based on luminance for accessibility.
- Supports sampling for performance optimization.
- Handles SVG images with fallback colors.
- TypeScript support with full type definitions.
- No external dependencies, works in modern browsers.

## Installation

Install the package via npm:

```bash
npm install image-hues

Usage
Basic Example
Extract the dominant colors and contrast colors from an image URL:
import { getImageDominantColors } from 'image-hues';

getImageDominantColors('https://example.com/image.jpg')
  .then(result => {
    console.log(result);
    // Example output:
    // {
    //   mainColors: ['#ff0000', '#00ff00', '#0000ff'],
    //   contrastColors: ['#ffffff', '#000000', '#ffffff']
    // }
  })
  .catch(error => console.error(error));

Custom Parameters
Specify the sample size and number of colors:
import { getImageDominantColors } from 'image-hues';

getImageDominantColors('https://example.com/image.jpg', 5, 5)
  .then(result => {
    console.log(result);
    // Returns 5 dominant colors with a sample size of 5
  })
  .catch(error => console.error(error));

Advanced Usage
Create a custom extractor instance for more control:
import { createDominantColorExtractor } from 'image-hues';

const extractor = createDominantColorExtractor();
extractor.extract('https://example.com/image.jpg', 10, 3)
  .then(result => {
    console.log(result);
  })
  .catch(error => console.error(error));

API
getImageDominantColors(imageUrl: string, sampleSize?: number, colorCount?: number)
Extracts dominant colors and their contrast colors from an image.
Parameters:

imageUrl: The URL of the image (e.g., PNG, JPEG, SVG).
sampleSize (optional, default: 10): Sampling rate for pixel analysis (higher values improve performance but may reduce accuracy).
colorCount (optional, default: 3): Number of dominant colors to return.

Returns: A Promise resolving to an object with:

mainColors: Array of hex color codes (e.g., ['#ff0000', '#00ff00']).
contrastColors: Array of contrast colors (e.g., ['#ffffff', '#000000']).

Throws: Errors for invalid images, failed loads, or canvas issues.
createDominantColorExtractor(): ColorExtractor
Creates a reusable ColorExtractor instance for custom processing.
Returns: An object with an extract method matching getImageDominantColors.
Requirements

Modern browser environment (supports Image and Canvas APIs).
ES2017+ for Object.entries (ensured via TypeScript configuration).

Installation Notes

Ensure images are accessible with CORS (crossOrigin="Anonymous" is set).
SVG support is limited to fallback colors due to canvas limitations.

Contributing
Contributions are welcome! Follow these steps:

Fork the repository: https://github.com/cairoramos7/image-hues.
Create a feature branch: git checkout -b feature/your-feature.
Commit changes: git commit -m "Add your feature".
Push to the branch: git push origin feature/your-feature.
Open a Pull Request.

Please read CONTRIBUTING.md for details and code of conduct.
Issues
Report bugs or suggest features at GitHub Issues.
License
This project is licensed under the MIT License. See LICENSE for details.
Author
Cairo Ramos @cairoramos7
Acknowledgments

Built with TypeScript for type safety and maintainability.
Inspired by color extraction libraries like color-thief and vibrant.js.

Happy color extracting! 🎨```
