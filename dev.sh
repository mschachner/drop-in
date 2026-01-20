#!/bin/bash

# Drop In - Development Helper Script
# This script helps manage local development servers

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${NC}$1${NC}"
}

# Function to check if a port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to check if MongoDB is running
check_mongodb() {
    if mongosh --eval "db.version()" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check if MongoDB is installed
check_mongodb_installed() {
    if command -v mongod >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start MongoDB
start_mongodb() {
    if ! check_mongodb_installed; then
        print_error "MongoDB is not installed!"
        print_info ""
        print_info "To install MongoDB:"
        print_info "  macOS:  brew install mongodb-community"
        print_info "  Linux:  sudo apt-get install mongodb-org"
        print_info ""
        print_info "After installing, run this script again."
        exit 1
    fi

    if check_mongodb; then
        print_success "MongoDB is already running"
        return 0
    fi

    print_info "Starting MongoDB..."

    # Try to start as a service first (macOS with Homebrew)
    if command -v brew >/dev/null 2>&1; then
        if brew services start mongodb-community 2>/dev/null; then
            sleep 2
            if check_mongodb; then
                print_success "MongoDB started as service"
                return 0
            fi
        fi
    fi

    # Try systemctl (Linux)
    if command -v systemctl >/dev/null 2>&1; then
        if sudo systemctl start mongod 2>/dev/null; then
            sleep 2
            if check_mongodb; then
                print_success "MongoDB started via systemctl"
                return 0
            fi
        fi
    fi

    # Manual start as last resort
    print_warning "Starting MongoDB manually..."
    mkdir -p ~/data/db
    mongod --dbpath ~/data/db --fork --logpath ~/data/mongodb.log
    sleep 2

    if check_mongodb; then
        print_success "MongoDB started manually"
        return 0
    else
        print_error "Failed to start MongoDB"
        print_info "Try starting it manually: mongod --dbpath ~/data/db"
        exit 1
    fi
}

# Function to stop MongoDB
stop_mongodb() {
    print_info "Stopping MongoDB..."

    # Try Homebrew service
    if command -v brew >/dev/null 2>&1; then
        brew services stop mongodb-community 2>/dev/null && print_success "MongoDB stopped (Homebrew)" && return 0
    fi

    # Try systemctl
    if command -v systemctl >/dev/null 2>&1; then
        sudo systemctl stop mongod 2>/dev/null && print_success "MongoDB stopped (systemctl)" && return 0
    fi

    # Manual kill
    pkill -f mongod 2>/dev/null && print_success "MongoDB stopped (manual)" && return 0

    print_warning "MongoDB was not running"
}

# Function to check prerequisites
check_prereqs() {
    print_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js: $(node --version)"

    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm: $(npm --version)"

    # Check MongoDB
    if ! check_mongodb_installed; then
        print_error "MongoDB is not installed"
        print_info "Install it with: brew install mongodb-community (macOS)"
        exit 1
    fi
    print_success "MongoDB: installed"

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Backend dependencies not installed"
        print_info "Installing backend dependencies..."
        npm install
    fi

    if [ ! -d "client/node_modules" ]; then
        print_warning "Frontend dependencies not installed"
        print_info "Installing frontend dependencies..."
        (cd client && npm install)
    fi

    print_success "All prerequisites met!"
}

# Main commands
case "$1" in
    start)
        print_info "=== Starting Drop In Development Environment ==="
        check_prereqs
        start_mongodb

        print_info ""
        print_info "Starting development servers..."
        print_info "Backend will run on: http://localhost:3001"
        print_info "Frontend will run on: http://localhost:3000"
        print_info ""
        print_warning "Press Ctrl+C to stop both servers"
        print_info ""

        # Start backend in background
        npm run dev &
        BACKEND_PID=$!

        # Give backend time to start
        sleep 3

        # Start frontend
        (cd client && npm start) &
        FRONTEND_PID=$!

        # Wait for both processes
        wait $BACKEND_PID $FRONTEND_PID
        ;;

    stop)
        print_info "=== Stopping Drop In Development Environment ==="

        # Kill ports
        kill_port 3000
        kill_port 3001

        # Stop MongoDB
        stop_mongodb

        print_success "All services stopped"
        ;;

    restart)
        $0 stop
        sleep 2
        $0 start
        ;;

    status)
        print_info "=== Drop In Development Status ==="

        # Check MongoDB
        if check_mongodb; then
            print_success "MongoDB: Running"
        else
            print_error "MongoDB: Not running"
        fi

        # Check backend
        if check_port 3001; then
            print_success "Backend: Running on port 3001"
        else
            print_error "Backend: Not running"
        fi

        # Check frontend
        if check_port 3000; then
            print_success "Frontend: Running on port 3000"
        else
            print_error "Frontend: Not running"
        fi
        ;;

    clean)
        print_info "=== Cleaning Drop In Installation ==="

        # Stop everything first
        $0 stop

        print_warning "Removing node_modules and package-lock.json..."
        rm -rf node_modules package-lock.json
        rm -rf client/node_modules client/package-lock.json

        print_info "Reinstalling dependencies..."
        npm install
        (cd client && npm install)

        print_success "Clean install complete!"
        ;;

    mongodb)
        case "$2" in
            start)
                start_mongodb
                ;;
            stop)
                stop_mongodb
                ;;
            status)
                if check_mongodb; then
                    print_success "MongoDB is running"
                    mongosh --eval "db.version()"
                else
                    print_error "MongoDB is not running"
                fi
                ;;
            shell)
                print_info "Opening MongoDB shell..."
                mongosh
                ;;
            *)
                echo "Usage: $0 mongodb {start|stop|status|shell}"
                exit 1
                ;;
        esac
        ;;

    help|*)
        cat << EOF
Drop In Development Helper

Usage: $0 {start|stop|restart|status|clean|mongodb|help}

Commands:
  start       Start all services (MongoDB, backend, frontend)
  stop        Stop all services
  restart     Restart all services
  status      Check status of all services
  clean       Clean install (removes node_modules and reinstalls)
  mongodb     MongoDB management
    start       Start MongoDB
    stop        Stop MongoDB
    status      Check MongoDB status
    shell       Open MongoDB shell
  help        Show this help message

Examples:
  $0 start              # Start everything
  $0 stop               # Stop everything
  $0 status             # Check what's running
  $0 mongodb shell      # Open MongoDB shell

Quick Fix:
  If ports are stuck, run: $0 stop && $0 start

EOF
        exit 0
        ;;
esac

exit 0
