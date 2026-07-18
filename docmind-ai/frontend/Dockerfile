FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173

# Runs the Vite dev server inside the container so Docker Compose gives
# hot-reload during development. A separate production build stage (static
# build + nginx) is added when we containerize for deployment, not needed
# for local development in this milestone.
CMD ["npm", "run", "dev", "--", "--host"]
