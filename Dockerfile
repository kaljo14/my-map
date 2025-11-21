# Build Stage
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Force relative paths for production build so Nginx can handle the proxying
ENV VITE_API_BASE_URL=/api/places
ENV VITE_TILE_SERVER_URL=/api/tiles

RUN npm run build

# Production Stage
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the template to the templates directory
# Nginx will automatically run envsubst on files in this directory and output to /etc/nginx/conf.d/
# Copy the template to the templates directory
# Nginx will automatically run envsubst on files in this directory and output to /etc/nginx/conf.d/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
