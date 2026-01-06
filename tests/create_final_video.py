#!/usr/bin/env python3
"""
Create a high-quality demo video from screenshots using imageio
"""

import os
import glob
from PIL import Image, ImageDraw, ImageFont
import imageio
import numpy as np

class FinalVideoCreator:
    def __init__(self, screenshot_dir="screenshots", output_file="agentpay_final_demo.mp4"):
        self.screenshot_dir = screenshot_dir
        self.output_file = output_file
        self.width = 1920
        self.height = 1080
        self.fps = 30
        
    def create_title_frame(self, title, subtitle="", bg_color=(20, 20, 40)):
        """Create a title card frame"""
        img = Image.new('RGB', (self.width, self.height), bg_color)
        draw = ImageDraw.Draw(img)
        
        # Try to use a nice font, fall back to default
        try:
            title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
            subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
        except:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
        
        # Draw title centered
        bbox = draw.textbbox((0, 0), title, font=title_font)
        title_width = bbox[2] - bbox[0]
        title_x = (self.width - title_width) // 2
        title_y = self.height // 2 - 80
        
        # Add gradient-like effect with multiple text renders
        draw.text((title_x, title_y), title, font=title_font, fill=(100, 200, 255))
        
        # Draw subtitle
        if subtitle:
            bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
            sub_width = bbox[2] - bbox[0]
            sub_x = (self.width - sub_width) // 2
            draw.text((sub_x, title_y + 100), subtitle, font=subtitle_font, fill=(180, 180, 200))
        
        return np.array(img)
    
    def load_screenshot(self, filepath):
        """Load and resize screenshot to target dimensions"""
        img = Image.open(filepath)
        img = img.resize((self.width, self.height), Image.LANCZOS)
        return np.array(img)
    
    def create_video(self):
        """Create the final demo video"""
        print("🎬 Creating AgentPay Demo Video...")
        
        # Define video scenes with durations (in seconds)
        scenes = []
        
        # Opening title
        scenes.append({
            'type': 'title',
            'title': 'AgentPay',
            'subtitle': 'Programmable Money for AI Agents',
            'duration': 3
        })
        
        # Find all screenshots
        screenshot_files = sorted(glob.glob(os.path.join(self.screenshot_dir, "*.png")))
        
        if not screenshot_files:
            print("❌ No screenshots found!")
            return None
        
        print(f"📷 Found {len(screenshot_files)} screenshots")
        
        # Map screenshots to scenes
        scene_info = {
            '01_homepage': ('Homepage', 'The main landing page showcasing AgentPay features'),
            '02_agents': ('AI Agents Hub', 'Browse and manage autonomous AI agents'),
            '03_marketplace': ('Marketplace', 'Discover and trade AI agent services'),
            '04_provider': ('Service Provider', 'Register and offer AI services'),
            '05_analytics': ('Analytics Dashboard', 'Track payments and agent activity'),
            '06_wallet': ('Wallet Integration', 'Connect your Web3 wallet'),
            '07_responsive': ('Responsive Design', 'Works seamlessly on all devices'),
            '08_scroll': ('Smart Scrolling', 'Smooth navigation experience'),
            '09_interactive': ('Interactive Demo', 'Try it yourself!'),
            '10_demo_complete': ('Demo Complete', 'Thank you for watching!')
        }
        
        for screenshot in screenshot_files:
            filename = os.path.basename(screenshot)
            name = filename.replace('.png', '')
            
            if name in scene_info:
                title, subtitle = scene_info[name]
            else:
                title = name.replace('_', ' ').title()
                subtitle = ''
            
            # Add title card for section
            scenes.append({
                'type': 'title',
                'title': title,
                'subtitle': subtitle,
                'duration': 1.5
            })
            
            # Add screenshot
            scenes.append({
                'type': 'screenshot',
                'file': screenshot,
                'duration': 3
            })
        
        # Closing title
        scenes.append({
            'type': 'title',
            'title': 'Thank You!',
            'subtitle': 'AgentPay - The Future of AI Payments',
            'duration': 3
        })
        
        # Create video with imageio
        print("🎥 Encoding video...")
        
        writer = imageio.get_writer(
            self.output_file,
            fps=self.fps,
            codec='libx264',
            quality=8,  # Higher quality
            pixelformat='yuv420p',
            macro_block_size=16
        )
        
        total_frames = 0
        for i, scene in enumerate(scenes):
            print(f"  Processing scene {i+1}/{len(scenes)}: {scene.get('title', scene.get('file', 'unknown'))}")
            
            if scene['type'] == 'title':
                frame = self.create_title_frame(scene['title'], scene.get('subtitle', ''))
            else:
                frame = self.load_screenshot(scene['file'])
            
            # Write frames for duration
            num_frames = int(scene['duration'] * self.fps)
            for _ in range(num_frames):
                writer.append_data(frame)
                total_frames += 1
        
        writer.close()
        
        duration = total_frames / self.fps
        print(f"✅ Video created: {self.output_file}")
        print(f"   Duration: {duration:.1f} seconds")
        print(f"   Resolution: {self.width}x{self.height}")
        print(f"   FPS: {self.fps}")
        
        return self.output_file


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    creator = FinalVideoCreator()
    video_file = creator.create_video()
    
    if video_file and os.path.exists(video_file):
        # Get file info
        size = os.path.getsize(video_file)
        print(f"\n📊 File size: {size / 1024 / 1024:.2f} MB")
        print(f"📁 Location: {os.path.abspath(video_file)}")
        print("\n🚀 Ready to upload to YouTube, Vimeo, or Youku for Devpost submission!")
