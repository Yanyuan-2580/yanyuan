#!/bin/bash
# ============================================================
# psyaihelp.xin — 服务器初始化脚本（全新服务器首次运行）
# 使用方法: bash scripts/server-setup.sh
# ============================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "================================================"
echo "  psyaihelp.xin — 服务器初始化"
echo "================================================"
echo -e "${NC}"

# ---- 1. 更新系统 ----
echo -e "${YELLOW}[1/6] 更新系统包...${NC}"
if command -v apt-get &> /dev/null; then
    apt-get update -y && apt-get upgrade -y
elif command -v yum &> /dev/null; then
    yum update -y
fi
echo -e "${GREEN}  ✓ 系统更新完成${NC}"

# ---- 2. 安装 Docker ----
echo -e "${YELLOW}[2/6] 安装 Docker...${NC}"
if command -v docker &> /dev/null; then
    echo "  ✓ Docker 已安装: $(docker --version)"
else
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}  ✓ Docker 安装完成${NC}"
fi

# ---- 3. 安装 Docker Compose ----
echo -e "${YELLOW}[3/6] 检查 Docker Compose...${NC}"
if docker compose version &> /dev/null; then
    echo "  ✓ Docker Compose 已就绪"
else
    echo -e "${RED}  请安装 Docker Compose 插件${NC}"
    exit 1
fi

# ---- 4. 配置防火墙 ----
echo -e "${YELLOW}[4/6] 配置防火墙...${NC}"

# 开放 80 (HTTP) 和 443 (HTTPS) 端口
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    ufw --force enable
    echo "  ✓ UFW 防火墙已配置 (80, 443, 22)"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --reload
    echo "  ✓ firewalld 已配置"
elif command -v iptables &> /dev/null; then
    iptables -A INPUT -p tcp --dport 80 -j ACCEPT
    iptables -A INPUT -p tcp --dport 443 -j ACCEPT
    echo "  ✓ iptables 已配置"
else
    echo -e "  ${YELLOW}⚠ 未检测到防火墙工具，请手动开放 80 和 443 端口${NC}"
fi

# ---- 5. 配置 DNS 检查 ----
echo -e "${YELLOW}[5/6] DNS 解析检查...${NC}"
DOMAIN="psyaihelp.xin"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ip.sb 2>/dev/null || echo "unknown")
if [ "$SERVER_IP" != "unknown" ]; then
    DOMAIN_IP=$(dig +short ${DOMAIN} 2>/dev/null || nslookup ${DOMAIN} 2>/dev/null | grep "Address" | tail -1 | awk '{print $2}')
    echo "  服务器 IP: $SERVER_IP"
    echo "  域名解析:  $DOMAIN_IP"
    if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
        echo -e "  ${GREEN}✓ DNS 解析正确${NC}"
    else
        echo -e "  ${YELLOW}⚠ DNS 解析可能不正确，请将 ${DOMAIN} 的 A 记录指向 ${SERVER_IP}${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠ 无法获取服务器 IP，请手动确认 DNS 配置${NC}"
fi

# ---- 6. 提示 ----
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✓ 服务器初始化完成!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "  下一步:"
echo "    1. 确保域名 psyaihelp.xin 的 DNS A 记录指向此服务器 IP"
echo "    2. 运行部署脚本: bash scripts/deploy.sh"
echo ""
