# 使用Bun官方镜像作为基础镜像
FROM oven/bun:1.2.4 as builder

# 设置工作目录
WORKDIR /app

# 复制package.json、bun.lock和工作区配置
COPY package.json bun.lock ./
COPY apps/llm-ops-api/package.json ./apps/llm-ops-api/
COPY packages/ ./packages/

# 安装依赖
RUN bun install

# 复制源代码
COPY tsconfig.json ./
COPY apps/llm-ops-api/ ./apps/llm-ops-api/

# 生产阶段
FROM oven/bun:1.2.4

WORKDIR /app

# 复制构建阶段的文件
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/apps/llm-ops-api ./apps/llm-ops-api
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口（根据应用需要调整）
EXPOSE 3000

# 设置工作目录到API项目
WORKDIR /app/apps/llm-ops-api

# 启动应用
CMD ["bun", "run", "src/index.ts"] 