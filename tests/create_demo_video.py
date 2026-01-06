"""
Create a demo video from Selenium screenshots
This script creates a video by capturing screenshots during the test and combining them
"""

import os
import time
import cv2
import numpy as np
from datetime import datetime
from PIL import Image

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


class DemoVideoCreator:
    """Creates a demo video by capturing browser screenshots"""
    
    BASE_URL = "http://localhost:3000"
    
    def __init__(self):
        self.driver = None
        self.frames = []
        self.frame_duration = 2  # seconds per frame in video
        self.fps = 30
        
    def setup(self):
        """Initialize Chrome WebDriver"""
        options = Options()
        options.add_argument("--start-maximized")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-notifications")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.driver.set_window_size(1920, 1080)
        print("🚀 Browser initialized")
        
    def teardown(self):
        """Clean up"""
        if self.driver:
            self.driver.quit()
        print("🏁 Browser closed")
        
    def capture_frame(self, description: str):
        """Capture current browser view as a frame"""
        # Get screenshot as PNG
        screenshot = self.driver.get_screenshot_as_png()
        
        # Convert to numpy array
        nparr = np.frombuffer(screenshot, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Add text overlay with description
        font = cv2.FONT_HERSHEY_SIMPLEX
        # Add semi-transparent background for text
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, frame.shape[0] - 80), (frame.shape[1], frame.shape[0]), (0, 0, 0), -1)
        frame = cv2.addWeighted(overlay, 0.7, frame, 0.3, 0)
        
        # Add description text
        cv2.putText(frame, description, (20, frame.shape[0] - 30), 
                    font, 1.0, (255, 255, 255), 2, cv2.LINE_AA)
        
        # Add AgentPay branding
        cv2.putText(frame, "AgentPay Demo - MNEE Hackathon 2026", 
                    (frame.shape[1] - 500, 40), font, 0.8, (0, 255, 128), 2, cv2.LINE_AA)
        
        self.frames.append((frame, description))
        print(f"📸 Captured: {description}")
        
    def add_title_frame(self, title: str, subtitle: str = ""):
        """Add a title card frame"""
        frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
        
        # Dark gradient background
        for i in range(1080):
            frame[i, :] = [int(7 + i * 0.02), int(3 + i * 0.01), int(3)]
        
        font = cv2.FONT_HERSHEY_SIMPLEX
        
        # Title
        text_size = cv2.getTextSize(title, font, 2.0, 3)[0]
        text_x = (1920 - text_size[0]) // 2
        cv2.putText(frame, title, (text_x, 450), font, 2.0, (52, 211, 153), 3, cv2.LINE_AA)
        
        # Subtitle
        if subtitle:
            sub_size = cv2.getTextSize(subtitle, font, 1.0, 2)[0]
            sub_x = (1920 - sub_size[0]) // 2
            cv2.putText(frame, subtitle, (sub_x, 550), font, 1.0, (200, 200, 200), 2, cv2.LINE_AA)
        
        # Hackathon info
        info = "MNEE Hackathon 2026 - Programmable Money for Agents"
        info_size = cv2.getTextSize(info, font, 0.8, 2)[0]
        info_x = (1920 - info_size[0]) // 2
        cv2.putText(frame, info, (info_x, 900), font, 0.8, (150, 150, 150), 2, cv2.LINE_AA)
        
        self.frames.append((frame, title))
        print(f"🎬 Added title: {title}")
        
    def create_video(self, output_path: str):
        """Create video from captured frames"""
        if not self.frames:
            print("❌ No frames to create video")
            return
        
        # Use AVI format first, then convert to MP4
        temp_path = output_path.replace('.mp4', '.avi')
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        height, width = self.frames[0][0].shape[:2]
        writer = cv2.VideoWriter(temp_path, fourcc, self.fps, (width, height))
        
        # Write each frame multiple times for duration
        frames_per_scene = self.fps * self.frame_duration
        
        for frame, description in self.frames:
            for _ in range(frames_per_scene):
                writer.write(frame)
                
        writer.release()
        
        # Convert AVI to MP4 using ffmpeg
        import subprocess
        try:
            subprocess.run([
                'ffmpeg', '-y', '-i', temp_path, 
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
                output_path
            ], check=True, capture_output=True)
            os.remove(temp_path)  # Remove temp AVI file
            print(f"✅ Video saved: {output_path}")
        except Exception as e:
            print(f"⚠️ FFmpeg conversion failed, keeping AVI: {e}")
            os.rename(temp_path, output_path)
        
        # Get video stats
        cap = cv2.VideoCapture(output_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0
        cap.release()
        
        print(f"📊 Duration: {duration:.1f} seconds, {len(self.frames)} scenes")
        
    def run_demo(self):
        """Run through the app and capture demo"""
        
        # Title frame
        self.add_title_frame("AgentPay", "Autonomous AI Payments with MNEE Stablecoin")
        
        # Introduction frame
        self.add_title_frame("The Problem", "How do AI agents pay for services autonomously?")
        
        # Homepage
        self.driver.get(self.BASE_URL)
        time.sleep(2)
        self.capture_frame("Homepage - AI Payment Infrastructure Dashboard")
        
        # Scroll to show features
        self.driver.execute_script("window.scrollTo(0, 400);")
        time.sleep(1)
        self.capture_frame("How It Works - 4-Step Process")
        
        # Scroll to features
        self.driver.execute_script("window.scrollTo(0, 800);")
        time.sleep(1)
        self.capture_frame("Built for AI-First Commerce")
        
        # Agents page
        self.driver.get(f"{self.BASE_URL}/agents")
        time.sleep(2)
        self.capture_frame("Agent Management - Create & Fund AI Agents")
        
        # Marketplace
        self.driver.get(f"{self.BASE_URL}/marketplace")
        time.sleep(2)
        self.capture_frame("Service Marketplace - AI-Accessible APIs")
        
        # Scroll marketplace
        self.driver.execute_script("window.scrollTo(0, 400);")
        time.sleep(1)
        self.capture_frame("Browse Services - Weather, Analytics, AI Models")
        
        # Provider page
        self.driver.get(f"{self.BASE_URL}/provider")
        time.sleep(2)
        self.capture_frame("Become a Provider - Register Your API")
        
        # Analytics
        self.driver.get(f"{self.BASE_URL}/analytics")
        time.sleep(2)
        self.capture_frame("Analytics Dashboard - Track Agent Spending")
        
        # Scroll analytics
        self.driver.execute_script("window.scrollTo(0, 300);")
        time.sleep(1)
        self.capture_frame("Spending Trends & Transaction History")
        
        # Back to home for finale
        self.driver.get(self.BASE_URL)
        time.sleep(1)
        self.capture_frame("AgentPay - The Future of Agent Payments")
        
        # Closing frame
        self.add_title_frame("Thank You!", "AgentPay - Enabling the Agentic Economy")
        
        # Tech stack frame
        self.add_title_frame("Built With", "Next.js 15 | Solidity | MNEE Stablecoin | wagmi")


def main():
    """Main function"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_path = os.path.join(base_dir, f"agentpay_demo_{timestamp}.mp4")
    
    print("\n" + "="*60)
    print("🎬 AGENTPAY DEMO VIDEO CREATOR")
    print("="*60 + "\n")
    
    creator = DemoVideoCreator()
    
    try:
        creator.setup()
        time.sleep(1)
        creator.run_demo()
        creator.create_video(video_path)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        creator.teardown()
        
    print("\n" + "="*60)
    print("✅ DEMO VIDEO COMPLETE")
    print(f"📹 Video: {video_path}")
    print("="*60 + "\n")
    
    return video_path


if __name__ == "__main__":
    main()
