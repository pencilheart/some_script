# 需要安装依赖：pip3 install pillow numpy
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import numpy as np
import os

def crop_white(image_path, output_path, threshold=240):
    img = Image.open(image_path).convert("RGB")
    img_np = np.array(img)
    mask = np.all(img_np < threshold, axis=-1)
    coords = np.argwhere(mask)

    if coords.size > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0) + 1
        cropped_img = img.crop((x_min, y_min, x_max, y_max))
        cropped_img.save(output_path)

def batch_crop_images(input_folder, output_folder, threshold=240, max_workers=4):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    files = sorted(f for f in os.listdir(input_folder) if f.endswith((".jpg", ".jpeg")))
    tasks = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        for filename in files:
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)
            tasks.append(executor.submit(crop_white, input_path, output_path, threshold))

        for future in tasks:
            future.result()  # 等待所有任务完成

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    input_folder = os.path.join(current_dir, '1')
    output_folder = os.path.join(current_dir, '2')
    batch_crop_images(input_folder, output_folder, max_workers=8)
    print("裁剪完成！")
