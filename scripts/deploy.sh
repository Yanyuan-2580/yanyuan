#!/bin/bash
# ============================================================
# psyaihelp.xin — 一键部署脚本
# 使用方法: bash scripts/deploy.sh
# ============================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOMAIN="psyaihelp.xin"

echo -e "${BLUE}"
echo "================================================"
echo "  psyaihelp.xin — 生产环境部署"
echo "================================================"
echo -e "${NC}"

# ---- 1. 检查前置条件 ----
echo -e "${YELLOW}[1/5] 检查前置条件...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装!${NC}"
    echo "请先安装 Docker: curl -fsSL https://get.docker.com | bash"
    exit 1
fi
echo "  ✓ Docker: $(docker --version)"

if ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装!${NC}"
    echo "请确保 Docker Compose 插件已安装"
    exit 1
fi
echo "  ✓ Docker Compose: $(docker compose version)"

# ---- 2. 配置环境变量 ----
echo -e "${YELLOW}[2/5] 配置环境变量...${NC}"

if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo "  ✓ 已从 .env.production 创建 .env 文件"
        echo -e "  ${YELLOW}⚠ 请检查 .env 中的敏感信息 (API Key等)${NC}"
    else
        echo -e "${RED}错误: .env.production 文件不存在!${NC}"
        exit 1
    fi
else
    echo "  ✓ .env 文件已存在"
fi

# ---- 3. 拉取最新代码 (如果是从 git 部署) ----
echo -e "${YELLOW}[3/5] 准备构建...${NC}"

if [ -d ".git" ]; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    echo "  当前分支: ${BRANCH}"
fi

# ---- 4. 构建 & 启动 ----
echo -e "${YELLOW}[4/5] 构建 Docker 镜像并启动服务...${NC}"
echo "  这可能需要几分钟，请耐心等待..."

docker compose down --remove-orphans 2>/dev/null || true

if docker compose build --no-cache; then
    echo -e "  ${GREEN}✓ 镜像构建完成${NC}"
else
    echo -e "${RED}错误: 镜像构建失败!${NC}"
    exit 1
fi

if docker compose up -d; then
    echo -e "  ${GREEN}✓ 容器启动完成${NC}"
else
    echo -e "${RED}错误: 容器启动失败!${NC}"
    exit 1
fi

# ---- 5. 等待服务就绪 ----
echo -e "${YELLOW}[5/5] 等待服务就绪...${NC}"

# Wait for containers to be healthy
echo "  等待 MySQL 就绪..."
for i in $(seq 1 30); do
    if docker compose ps mysql | grep -q "healthy"; then
        echo "  ✓ MySQL 就绪"
        break
    fi
    sleep 2
done

echo "  等待 MongoDB 就绪..."
for i in $(seq 1 30); do
    if docker compose ps mongodb | grep -q "healthy"; then
        echo "  ✓ MongoDB 就绪"
        break
    fi
    sleep 2
done

echo "  等待 Server 就绪..."
sleep 10
for i in $(seq 1 24); do
    if curl -sf http://localhost:3000/api/v1 > /dev/null 2>&1; then
        echo "  ✓ Server 就绪"
        break
    fi
    sleep 5
done

# ---- 完成 ----
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  🎉 部署完成!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "  访问地址:"
echo -e "    ${BLUE}用户端:  https://${DOMAIN}${NC}"
echo -e "    ${BLUE}管理端:  https://${DOMAIN}/admin${NC}"
echo -e "    ${BLUE}API:     https://${DOMAIN}/api/v1${NC}"
echo ""
echo -e "  管理命令:"
echo -e "    ${YELLOW}查看日志:  docker compose logs -f${NC}"
echo -e "    ${YELLOW}查看状态:  docker compose ps${NC}"
echo -e "    ${YELLOW}重启服务:  docker compose restart${NC}"
echo -e "    ${YELLOW}停止服务:  docker compose down${NC}"
echo ""
echo -e "  ${YELLOW}⚠ SSL 证书将自动申请，首次可能需要 30-60 秒${NC}"
echo -e "  ${YELLOW}⚠ 请确保域名 ${DOMAIN} 的 DNS 已解析到此服务器 IP${NC}"
echo ""
