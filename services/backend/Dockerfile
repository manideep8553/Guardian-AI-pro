FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini
EXPOSE 5000

FROM base AS development
ENV NODE_ENV=development
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
USER node
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "dev"]

FROM base AS build
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --only=production
COPY --from=build /app/dist ./dist
USER node
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
