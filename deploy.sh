# shellcheck disable=SC1090
source ~/.nvm/nvm.sh &&
nvm use 20 &&
cd ./projects/alwaysReelsBot &&
git pull origin main &&
yarn &&
npx prisma migrate deploy &&
yarn build