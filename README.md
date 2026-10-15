# DPA Compass Frontend - Docker Deployment Package

## 1. Overview

This package contains the Docker deployment files for the DPA Compass React/Vite frontend.

The application is built using:

- React 19
- Vite 8
- Node.js 22
- Nginx
- Docker

`requirements.txt` is included as a human-readable dependency reference. It is NOT a Python requirements file and must not be installed with pip.

The actual Node dependencies are installed from:

- package.json
- package-lock.json

using:

    npm ci

---

## 2. Required Project Files

Place these Docker files in the root of the frontend project:

    package.json
    package-lock.json
    Dockerfile
    nginx.conf
    docker-compose.yml
    .dockerignore
    requirements.txt

The existing frontend source folders such as `src/` and `public/` must remain in the project.

---

## 3. Prerequisites

For Docker deployment, the deployment machine requires:

- Docker
- Docker Compose

Node.js is NOT required on the deployment machine.

---

## 4. Build the Docker Image

Open a terminal in the frontend project directory:

    cd dpa-compass-frontend

Build the image:

    docker compose build

Alternatively:

    docker build -t dpacompass-frontend .

---

## 5. Start the Frontend

Using Docker Compose:

    docker compose up -d

The frontend will be available at:

    http://localhost:3000

For a remote server:

    http://SERVER_IP:3000

---

## 6. Check Container Status

    docker ps

The expected container name is:

    dpacompass-frontend

---

## 7. View Logs

    docker logs dpacompass-frontend

For continuous logs:

    docker logs -f dpacompass-frontend

---

## 8. Stop the Frontend

    docker compose down

---

## 9. Restart the Frontend

    docker compose restart

---

## 10. Rebuild After Code Changes

Normal rebuild:

    docker compose down
    docker compose build
    docker compose up -d

Clean rebuild:

    docker compose down
    docker compose build --no-cache
    docker compose up -d

---

## 11. React Router Configuration

The included nginx.conf contains:

    try_files $uri $uri/ /index.html;

This is required so React Router routes continue to work after refreshing pages such as:

    /login
    /dashboard
    /audits
    /applications

---

## 12. Backend API Configuration

If the frontend uses a Vite environment variable for the Django backend, configure it before building the Docker image.

Example:

    API_BASE_URL=http://SERVER_IP:8000

Then the frontend can access it through:

    import.meta.env.API_BASE_URL

IMPORTANT:

Vite environment variables are embedded during the frontend build. They are not dynamically read by the browser when the container starts.

Therefore, if the backend URL changes between environments, rebuild the frontend image with the appropriate environment configuration.

---

## 13. WebSocket Configuration

If the application uses Django Channels/WebSockets, make sure the frontend WebSocket URL points to the deployed backend.

Example:

    ws://SERVER_IP:8000/ws/...

For HTTPS deployments, use:

    wss://SERVER_DOMAIN/ws/...

The backend must also allow the frontend origin and expose the WebSocket endpoint.

---

## 14. Troubleshooting

### Container is not running

Check:

    docker ps -a

Then inspect:

    docker logs dpacompass-frontend


### Port 3000 is already in use

Change the host port in docker-compose.yml:

    ports:
      - "3001:80"

Then access:

    http://localhost:3001


### React route gives 404 after refresh

Verify that nginx.conf contains:

    location / {
        try_files $uri $uri/ /index.html;
    }

Then rebuild the image.


### API requests fail

Check:

1. Backend is running.
2. Backend URL is correct.
3. Frontend was rebuilt after changing Vite environment variables.
4. Django CORS configuration allows the frontend origin.
5. Firewall/security-group rules allow the required backend port.


### WebSocket connection fails

Check:

1. Django Channels is running.
2. Redis is available if required by the backend.
3. WebSocket URL is correct.
4. The backend WebSocket route exists.
5. Production reverse-proxy configuration supports WebSocket upgrades.

---

## 15. Dependency Installation for Local Development

If Node.js is installed locally:

    npm ci

Start development server:

    npm run dev

Build production files:

    npm run build

Preview production build:

    npm run preview

Run lint:

    npm run lint

---

## 16. Important Note About requirements.txt

This project is NOT a Python application.

Do not run:

    pip install -r requirements.txt

For Node dependencies use:

    npm ci

The authoritative dependency files are:

    package.json
    package-lock.json

The requirements.txt file is provided only as a dependency/reference document for deployment documentation.
