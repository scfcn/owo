import os
import json

def generate_artalk_emojis(base_url, emoji_folders, output_path='.json/artalk-emoji.json', origin=None):
    """
    生成 Artalk 表情包 JSON 文件
    
    参数:
        base_url: 基础 BASE URL
        emoji_folders: 包含表情包的文件夹列表
        output_path: 输出 JSON 文件的路径
        origin: 原始表情包数据，包含网址到名称的映射关系
    """
    result = []
    
    # 创建网址到名称的映射字典
    url_to_key_map = {}
    if origin:
        for group in origin:
            for item in group.get("items", []):
                if "val" in item and "key" in item:
                    # 去除可能存在的反引号
                    val = item["val"].replace("`", "").strip()
                    url_to_key_map[val] = item["key"]
    
    for folder in emoji_folders:
        if not os.path.isdir(folder):
            print(f"警告: {folder} 不是一个文件夹，已跳过")
            continue
        
        emoji_group = {
            "name": folder,
            "type": "image",
            "items": []
        }
        
        # 获取文件夹中的所有文件
        files = [f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f))]
        
        for file in files:
            # 获取文件名（不带扩展名）
            filename_without_ext = os.path.splitext(file)[0]
            
            # 构建完整URL
            full_url = f"{base_url}/{folder}/{file}"
            
            # 检查是否在原始数据中存在该URL，如果存在则使用原始key
            key = url_to_key_map.get(full_url, filename_without_ext)
            
            # 创建表情项
            emoji_item = {
                "key": key,
                "val": full_url
            }
            
            emoji_group["items"].append(emoji_item)
        
        if emoji_group["items"]:  # 只添加非空的表情组
            result.append(emoji_group)
    
    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 写入 JSON 文件
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"表情包 JSON 文件已生成: {output_path}")

if __name__ == "__main__":
    base_url = "https://cdn.jsdmirror.com/gh/scfcn/owo"
    folders = ["qingzhu", "liushen", "blobcat", "bilibili", "zhheo"]
    origin_json = ".json/artalk-emoji.json"
    output = ".json/artalk-emoji.json"
    
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
    
    generate_artalk_emojis(base_url, folders, output, origin_data)