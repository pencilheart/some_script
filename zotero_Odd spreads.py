import os
import json

def update_or_create_zotero_reader_state(file_path, updates):
    """
    更新或创建 .zotero-reader-state 文件。
    如果文件存在，更新指定字段；如果文件不存在，创建新的文件。
    """
    data = {}
    
    # 如果文件存在，读取现有内容
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                data = json.load(file)
        except Exception as e:
            print(f"读取文件 {file_path} 时出错：{e}")
    
    # 更新字段
    data.update(updates)
    
    # 写入更新后的内容，保持横排格式
    try:
        with open(file_path, "w", encoding="utf-8") as file:
            json.dump(data, file, ensure_ascii=False, separators=(',', ':'))
        print(f"成功更新或创建文件：{file_path}")
    except Exception as e:
        print(f"写入文件 {file_path} 时出错：{e}")

def update_storage_subfolders(base_dir, updates):
    """
    遍历 storage 文件夹的子文件夹，更新或创建 .zotero-reader-state 文件。
    """
    for root, dirs, _ in os.walk(base_dir):
        if os.path.basename(root) == "storage":
            for sub_dir in dirs:
                target_folder = os.path.join(root, sub_dir)
                target_file = os.path.join(target_folder, ".zotero-reader-state")
                update_or_create_zotero_reader_state(target_file, updates)

if __name__ == "__main__":
    # 获取当前脚本所在的目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 定义需要更新的字段
    updates = {
        "scale": "auto",
        "scrollMode": 0,
        "spreadMode": 0
    }
    
    # 更新 storage 子文件夹的 .zotero-reader-state 文件
    update_storage_subfolders(current_dir, updates)