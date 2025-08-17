#!/bin/bash

echo "正在启动股票小工具..."
echo ""
echo "请确保已安装Node.js"
echo "如果没有安装，请访问: https://nodejs.org/"
echo ""
read -p "按回车键继续..."

echo ""
echo "正在安装依赖..."
npm install

echo ""
echo "正在启动项目..."
npm start
