# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.11.1

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /usr/src/app

################################################################################
# Create a stage for installing production dependecies.
FROM base as deps

# Install python3 for node-gyp.
RUN apk add --no-cache \
    # python & gyp build tools
    python3 make g++ py-setuptools \
    pkgconfig \
    # canvas dependencies
    pixman-dev cairo-dev pango-dev

# Install production-only dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM deps as build

# Download devlopment dependencies for build stage
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN yarn run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Add cairo and pango at running stage
RUN apk add cairo pango

# Use production node environment by default.
ENV NODE_ENV production

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Run the application.
CMD yarn start
