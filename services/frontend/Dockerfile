FROM node:20-alpine AS base
WORKDIR /app
EXPOSE 3000

FROM base AS development
ENV NODE_ENV=development
COPY package.json ./
RUN npm ci
COPY . .
USER node
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

FROM base AS build
COPY package.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
