#!/bin/sh
set -eu

mkdir -p /app/data
npx prisma db push --skip-generate

exec node node_modules/next/dist/bin/next start -H 0.0.0.0 -p "${PORT:-3000}"
