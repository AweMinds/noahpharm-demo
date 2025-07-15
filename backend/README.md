# 文件系统API后端服务

Python Flask后端服务，用于读取本地文件系统中的文件夹结构。

## 功能

- 📁 读取指定路径下的子文件夹
- 🔒 安全的路径访问控制
- 🌐 支持跨域请求
- 📊 健康检查接口
- 📋 批量获取所有区域的文件夹信息

## API接口

### 1. 健康检查
```
GET /api/health
```

### 2. 获取指定路径的子文件夹
```
GET /api/folders?path=E:\temp\氨氯地平缬沙坦氢氯噻嗪片-demo\CDE同类品种-临床备案公示平台试验信息
```

### 3. 检查路径是否存在
```
GET /api/check-path?path=E:\temp\氨氯地平缬沙坦氢氯噻嗪片-demo\说明书
```

### 4. 获取所有区域的文件夹信息
```
GET /api/folders/all
```

## 安装和运行

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 启动服务：
```bash
python app.py
```

3. 服务将在 `http://localhost:5000` 启动

## 安全特性

- 只允许访问预配置的基础路径
- 路径规范化防止路径遍历攻击
- 权限检查和错误处理
- 详细的日志记录

## 配置

在 `app.py` 中修改 `ALLOWED_BASE_PATHS` 来更改允许访问的路径：

```python
ALLOWED_BASE_PATHS = [
    'E:\\temp\\氨氯地平缬沙坦氢氯噻嗪片-demo'
]
``` 