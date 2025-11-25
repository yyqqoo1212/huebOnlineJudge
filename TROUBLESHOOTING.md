# 前端访问后端问题排查指南

## 问题：注册时出现"网络请求失败，请检查网络后重试。"

### 可能的原因和解决方案

#### 1. 检查后端服务是否运行

**在服务器上检查：**
```bash
# 检查 Gunicorn 服务状态
sudo systemctl status huebRE

# 检查 Nginx 服务状态
sudo systemctl status nginx

# 检查端口是否监听
sudo netstat -tlnp | grep 8000  # Gunicorn
sudo netstat -tlnp | grep 80    # Nginx
```

**如果服务未运行：**
```bash
# 启动 Gunicorn
sudo systemctl start huebRE

# 启动 Nginx
sudo systemctl start nginx
```

#### 2. 检查 API 地址配置

**前端配置位置：**
- `.env.development` 或 `.env.production`
- `src/utils/constants.js`（默认值）

**当前配置应该是：**
```env
VUE_APP_API_BASE_URL=http://101.42.172.229/api
```

**验证方法：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签，应该能看到实际的 API 地址
3. 或者在 Network 标签中查看请求的 URL

#### 3. 测试后端连接

**在浏览器中直接访问：**
```
http://101.42.172.229/api/users/
```

**使用 curl 测试（在命令行）：**
```bash
# Windows PowerShell
curl http://101.42.172.229/api/users/

# 或者使用 Invoke-WebRequest
Invoke-WebRequest -Uri http://101.42.172.229/api/users/
```

**如果无法访问，可能的原因：**
- 防火墙未开放 80 端口
- Nginx 配置错误
- 后端服务未运行

#### 4. 检查 CORS 配置

**后端 CORS 配置（`huebRE/settings.py`）：**
```python
CORS_ALLOW_ALL_ORIGINS = True  # 应该为 True
CORS_ALLOW_CREDENTIALS = True
```

**检查方法：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签
3. 如果看到 CORS 相关错误，说明 CORS 配置有问题

**常见 CORS 错误：**
```
Access to XMLHttpRequest at 'http://101.42.172.229/api/users/register' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

#### 5. 检查防火墙

**在服务器上检查防火墙：**
```bash
# 查看防火墙状态
sudo ufw status

# 如果防火墙开启，确保开放 80 端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # 如果使用 HTTPS
```

**云服务器安全组：**
- 登录云服务器控制台
- 检查安全组规则
- 确保开放 80 端口（HTTP）和 443 端口（HTTPS）

#### 6. 检查 Nginx 配置

**查看 Nginx 错误日志：**
```bash
sudo tail -f /var/log/nginx/huebRE_error.log
```

**测试 Nginx 配置：**
```bash
sudo nginx -t
```

**检查 Nginx 配置是否正确：**
- 文件位置：`/etc/nginx/sites-available/huebRE`
- 确保 `proxy_pass` 指向 `http://127.0.0.1:8000`
- 确保 `server_name` 包含服务器 IP 或域名

#### 7. 检查后端日志

**查看 Gunicorn 日志：**
```bash
sudo journalctl -u huebRE -f
```

**查看 Django 日志（如果有配置）：**
```bash
# 通常在项目目录下
tail -f /opt/huebRE/logs/*.log
```

#### 8. 浏览器控制台调试

**打开浏览器开发者工具（F12），检查：**

1. **Console 标签：**
   - 查看是否有 JavaScript 错误
   - 查看网络请求的详细信息

2. **Network 标签：**
   - 查看注册请求的状态
   - 查看请求的 URL 是否正确
   - 查看响应状态码和内容
   - 如果请求显示为红色，点击查看详细信息

3. **常见状态码：**
   - `200` - 成功
   - `400` - 请求参数错误
   - `401` - 未授权
   - `403` - 禁止访问（可能是 CORS）
   - `404` - 接口不存在
   - `500` - 服务器错误
   - `(failed)` - 网络连接失败

#### 9. 快速测试脚本

创建一个测试文件 `test-api.html`：

```html
<!DOCTYPE html>
<html>
<head>
    <title>API 测试</title>
</head>
<body>
    <h1>API 连接测试</h1>
    <button onclick="testAPI()">测试 API</button>
    <pre id="result"></pre>
    
    <script>
        async function testAPI() {
            const result = document.getElementById('result');
            result.textContent = '测试中...';
            
            try {
                const response = await fetch('http://101.42.172.229/api/users/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.text();
                result.textContent = `状态码: ${response.status}\n响应: ${data}`;
            } catch (error) {
                result.textContent = `错误: ${error.message}`;
            }
        }
    </script>
</body>
</html>
```

在浏览器中打开这个文件，点击按钮测试 API 连接。

#### 10. 常见问题解决

**问题 1：请求超时**
- 检查网络连接
- 增加超时时间（在 `src/utils/request.js` 中修改 `timeout` 值）

**问题 2：CORS 错误**
- 确保后端 `CORS_ALLOW_ALL_ORIGINS = True`
- 检查 Nginx 是否添加了 CORS 头

**问题 3：502 Bad Gateway**
- Gunicorn 服务未运行
- Gunicorn 配置错误
- 端口冲突

**问题 4：404 Not Found**
- API 路径不正确
- Nginx 配置错误
- Django URL 配置错误

## 调试步骤总结

1. ✅ 检查后端服务是否运行
2. ✅ 检查 API 地址配置
3. ✅ 测试后端连接（浏览器或 curl）
4. ✅ 检查浏览器控制台错误
5. ✅ 检查防火墙和安全组
6. ✅ 查看后端日志
7. ✅ 查看 Nginx 日志

## 获取帮助

如果以上步骤都无法解决问题，请提供以下信息：

1. 浏览器控制台的完整错误信息
2. 后端日志（Gunicorn 和 Nginx）
3. 网络请求的详细信息（从浏览器 Network 标签）
4. 服务器配置信息（IP、端口等）

