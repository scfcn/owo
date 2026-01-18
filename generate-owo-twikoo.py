import os
import json

def generate_twikoo_emojis(base_url, emoji_folders, output_path='.json/twikoo-emojis.json', origin=None):
    """
    生成 Twikoo 表情包 JSON 文件
    
    参数:
        base_url: 基础 URL
        emoji_folders: 包含表情包的文件夹列表
        output_path: 输出 JSON 文件的路径
        origin: 原始表情包数据，包含网址到名称的映射关系
    """
    result = {}
    
    # 创建网址到名称的映射字典
    url_to_text_map = {}
    if origin:
        for category, data in origin.items():
            if "container" in data:
                for item in data["container"]:
                    if "icon" in item and "text" in item:
                        # 从 icon 中提取 URL
                        import re
                        url_match = re.search(r"src=['\"]([^'\"]+)['\"]", item["icon"])
                        if url_match:
                            url = url_match.group(1).replace("`", "").strip()
                            url_to_text_map[url] = item["text"]
    
    for folder in emoji_folders:
        if not os.path.isdir(folder):
            print(f"警告: {folder} 不是一个文件夹，已跳过")
            continue
        
        # 为每个文件夹创建一个类别
        category_name = folder
        # 可以根据文件夹名称自定义类别显示名称
        display_names = {
            "qingzhu": "青竹君",
            "blobcat": "可爱猫",
            "bilibili": "小电视",
            "liushen": "清羽酱",
            "zhheo": "张洪Heo",
        }
        
        category_display_name = display_names.get(folder, folder)
        
        emoji_category = {
            "type": "image",
            "container": []
        }
        
        # 获取文件夹中的所有文件
        files = [f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f))]
        
        for file in files:
            # 获取文件名（不带扩展名）
            filename_without_ext = os.path.splitext(file)[0]
            
            # 构建完整URL
            full_url = f"{base_url}/{folder}/{file}"
            
            # 检查是否在原始数据中存在该URL，如果存在则使用原始text
            text = url_to_text_map.get(full_url, f"{filename_without_ext}")
            
            # 创建表情项
            emoji_item = {
                "text": text,
                "icon": f"<img src='{full_url}'>"
            }
            
            emoji_category["container"].append(emoji_item)
        
        if emoji_category["container"]:  # 只添加非空的表情组
            result[category_display_name] = emoji_category
    
    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 写入 JSON 文件
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"Twikoo 表情包 JSON 文件已生成: {output_path}")

if __name__ == "__main__":
    base_url = "https://owo.69b94fb6.er.aliyun-esa.net"
    folders = ["qingzhu", "liushen", "blobcat", "bilibili", "zhheo"]
    origin_json = ".json/twikoo.json"
    output = ".json/twikoo-emoji.json"
    
    # 加载原始表情包数据（如果存在）
    origin_data = None
    try:
        with open(origin_json, 'r', encoding='utf-8') as f:
            origin_data = json.load(f)
        print(f"已加载原始表情包数据: {origin_json}")
    except FileNotFoundError:
        print(f"未找到原始表情包数据文件: {origin_json}")
    except json.JSONDecodeError:
        print(f"原始表情包数据文件格式错误: {origin_json}")
    
    generate_twikoo_emojis(base_url, folders, output, origin_data)