#!/bin/bash

# Load environment variables from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo ".env file not found! Exiting."
    exit 1
fi

# PostgreSQL configuration
POSTGRES_DB=demodb
DB_PORT=5432
CONTAINER_NAME=demo-postgres
POSTGRES_VERSION=16
PGDATA_VOLUME="pgdata"

# Function to start the container
start_db() {
    CONTAINER_NAME=$CONTAINER_NAME-$PGDATA_VOLUME
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
        echo "Container $CONTAINER_NAME already exists. Starting it..."
        docker start $CONTAINER_NAME
    else
        echo "Running new PostgreSQL container $CONTAINER_NAME with volume $PGDATA_VOLUME..."
        docker run -d \
            --name $CONTAINER_NAME \
            -e POSTGRES_DB=$POSTGRES_DB \
            -e POSTGRES_USER=$POSTGRES_USER \
            -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
            -p $DB_PORT:5432 \
            -v $PGDATA_VOLUME:/var/lib/postgresql/data \
            postgres:$POSTGRES_VERSION
    fi
    echo "PostgreSQL is running on port $DB_PORT"
}

# Function to stop the container
stop_db() {
    CONTAINER_NAME=$CONTAINER_NAME-$PGDATA_VOLUME
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        echo "Stopping container $CONTAINER_NAME..."
        docker stop $CONTAINER_NAME
    else
        echo "Container $CONTAINER_NAME is not running."
    fi
}

while [[ $# -gt 0 ]]; do
    case "$1" in
    --volume)
        PGDATA_VOLUME="$2"
        shift 2
        ;;
    --startdb | --stopdb)
        CMD="$1"
        shift
        ;;
    *)
        shift
        ;;
    esac
done

# Parse command-line arguments
case "$CMD" in
--startdb)
    start_db
    ;;
--stopdb)
    stop_db
    ;;
*)
    echo "Usage: $0 --startdb [--volume VOLUME] | --stopdb"
    exit 1
    ;;
esac
