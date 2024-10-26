# Step 1: Use an official Node.js runtime as a parent image
FROM node:16

# Step 2: Set the working directory inside the container
WORKDIR /comp490js

# Step 3: Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code to the container
COPY . .

# Step 6: Expose the application port (e.g., 3000 for Node.js apps)
EXPOSE 3000

# Step 7: Start the application
CMD ["npm", "run", "dev"]

