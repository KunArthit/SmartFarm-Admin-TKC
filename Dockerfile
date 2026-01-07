FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY . .

# Install all dependencies (dev + prod) and fix rollup issue
RUN npm install --legacy-peer-deps && \
    npm install --no-save @rollup/rollup-linux-x64-musl

ENV PUBLIC_URL=/admin
ENV REACT_APP_BASE_PATH=/admin
ENV NODE_OPTIONS=--max-old-space-size=4096

RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]