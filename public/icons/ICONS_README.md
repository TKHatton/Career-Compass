# PWA Icons

This folder should contain the PWA app icons referenced in `/public/manifest.json`.

## Required Icons:

- `icon-192.png` - 192x192px
- `icon-512.png` - 512x512px

## How to Create Icons:

### Option 1: Use a Favicon Generator
1. Go to https://realfavicongenerator.net/ or https://www.favicon-generator.org/
2. Upload your logo/image
3. Download the generated icons
4. Place `icon-192.png` and `icon-512.png` in this folder

### Option 2: Create Manually
Use any image editor (Figma, Canva, Photoshop) to create:
- A 192x192px PNG with your logo
- A 512x512px PNG with your logo

### Temporary: Remove Icon References

Until you add icons, you can comment out the icon references in `/public/manifest.json` to stop the 404 errors.

## Brand Colors (for reference):
- Sand Rose: #dfcfc5
- Mist Teal: #c5d4d2
- Sage Gray: #adb9b1
- Clay Rose: #c4a092
