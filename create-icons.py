#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw

def create_icon(size):
    """Create a medical-themed icon with the given size"""
    # Create a new image with blue background
    img = Image.new('RGB', (size, size), color='#2c5aa0')
    draw = ImageDraw.Draw(img)
    
    # Calculate cross dimensions
    cross_width = int(size * 0.2)
    cross_height = int(size * 0.6)
    center = size // 2
    
    # Draw medical cross in white
    # Vertical part
    vertical_left = center - cross_width // 2
    vertical_top = int(size * 0.2)
    vertical_right = center + cross_width // 2
    vertical_bottom = vertical_top + cross_height
    draw.rectangle([vertical_left, vertical_top, vertical_right, vertical_bottom], fill='white')
    
    # Horizontal part
    horizontal_left = int(size * 0.2)
    horizontal_top = center - cross_width // 2
    horizontal_right = horizontal_left + cross_height
    horizontal_bottom = center + cross_width // 2
    draw.rectangle([horizontal_left, horizontal_top, horizontal_right, horizontal_bottom], fill='white')
    
    return img

def main():
    # Create icons directory if it doesn't exist
    if not os.path.exists('icons'):
        os.makedirs('icons')
    
    # Icon sizes needed for PWA
    sizes = [16, 32, 96, 152, 192, 512]
    
    for size in sizes:
        try:
            icon = create_icon(size)
            filename = f'icons/icon-{size}x{size}.png'
            icon.save(filename)
            print(f'Created {filename}')
        except Exception as e:
            print(f'Error creating icon {size}x{size}: {e}')

if __name__ == '__main__':
    main() 