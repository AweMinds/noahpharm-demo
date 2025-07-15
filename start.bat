@echo off
echo 启动医学方案摘要协作平台...
echo.

echo 正在激活conda环境: python3.10-general
call conda activate python3.10-general
if errorlevel 1 (
  echo 错误：无法激活conda环境 python3.10-general
  echo 请确保：
  echo 1. conda已正确安装并添加到PATH
  echo 2. 环境名称 python3.10-general 存在
  pause
  exit /b 1
)
echo conda环境已激活
echo.

echo 正在安装Python依赖...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
  echo 错误：依赖安装失败
  pause
  exit /b 1
)
echo.

echo 启动Python后端服务...
start "Python Backend" cmd /k "conda activate python3.10-general && python app.py"
echo 后端服务已启动在 http://localhost:5000
echo.

cd ..
echo 启动React前端服务...
start "React Frontend" cmd /k "npm start"
echo 前端服务将启动在 http://localhost:3000
echo.

echo 两个服务都已启动，请等待浏览器自动打开
echo 如需停止服务，请关闭对应的命令行窗口
pause