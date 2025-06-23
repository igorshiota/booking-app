# Use official Node image
FROM node:18

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
