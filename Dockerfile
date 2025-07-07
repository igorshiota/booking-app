# Use official Node image (Debian-based)
FROM node:18

# Upgrade system packages, including zlib
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port 3000 (React dev server)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
