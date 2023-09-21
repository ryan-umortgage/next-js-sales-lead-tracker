<p align="center">
    <h3 align="center">Umortgage Software Engineer Assessment</h3>
</p>

<p align="center">
Develop a streamlined web-based user management system. The system will allow administrators to perform basic create, read, update, and delete operations on sales records. The application should have both front-end and back-end components and should follow best practices for code organization.
</p>

<br/>

## Developing Locally

- This guide assumes you have Node and NPM installed and are familiar with their basic concepts

1. Clone the repo and switch to the dev branch

```bash
git clone https://github.com/ryan-umortgage/next-js-sales-lead-tracker.git
git fetch && git checkout feat/UMTG-123-SALES-LEAD-TRACKER
```

2. Install dependencies

```bash
cd next-js-sales-lead-tracker && npm ci
```

3. Add .env file from my email to the root directory. If you dont have access to the email you will need to setup your own vercel project and provide the following variables in a .env file. You can follow this guide from where the boilerplate that this project was initially cloned from: https://github.com/vercel/nextjs-postgres-auth-starter

```bash
POSTGRES_URL="xxx"
POSTGRES_PRISMA_URL="xxx"
POSTGRES_URL_NON_POOLING="xxx"
POSTGRES_USER="xxx"
POSTGRES_HOST="xxx"
POSTGRES_PASSWORD="xxx"
POSTGRES_DATABASE="xxx"
NEXTAUTH_SECRET="xxx"
```

4. Start project

```bash
npm run dev
```

5. Go to [http://localhost:3000](http://localhost:3000) with your browser to create an account and sign in.
