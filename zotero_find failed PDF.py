import os
import fitz  # PyMuPDF

def is_pdf_corrupt(filepath):
    """ 检查 PDF 是否损坏 """
    try:
        with fitz.open(filepath) as doc:
            doc.load_page(0)  # 尝试加载第一页
        return False
    except Exception:
        return True

def find_corrupt_pdfs_in_storage():
    """ 在当前 Python 目录的 storage 文件夹中查找损坏的 PDF """
    script_dir = os.path.dirname(os.path.abspath(__file__))  # 获取当前 Python 脚本所在目录
    storage_dir = os.path.join(script_dir, "storage")  # 只检查 storage 目录

    if not os.path.exists(storage_dir):
        print(f"目录 '{storage_dir}' 不存在！")
        return []

    corrupt_files = []
    for root, _, files in os.walk(storage_dir):
        for file in files:
            if file.lower().endswith(".pdf"):
                filepath = os.path.join(root, file)
                if is_pdf_corrupt(filepath):
                    corrupt_files.append(filepath)

    return corrupt_files

# 执行扫描
corrupt_pdfs = find_corrupt_pdfs_in_storage()

# 输出结果
if corrupt_pdfs:
    print("发现损坏的PDF文件：")
    for pdf in corrupt_pdfs:
        print(pdf)
else:
    print("未发现损坏的PDF文件。")