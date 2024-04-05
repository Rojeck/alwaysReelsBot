git pull origin main &&
yarn &&
npx prisma migrate deploy &&
yarn build