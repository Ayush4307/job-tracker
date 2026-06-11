# Job Tracker

A full-stack job application tracking app built with React, TypeScript, Supabase, and Tailwind CSS.

🔗 **Live Demo:** [job-tracker-ayush.vercel.app](https://job-tracker-ayush.vercel.app)

## 🌟 Features

- **Authentication:** Secure user signup and login using Supabase Auth.
- **Dashboard Analytics:** Track your success rate and interview rate at a glance.
- **Advanced Sorting:** Sort applications by Date (Newest/Oldest) or Company Name (A-Z).
- **Export to CSV:** Download all of your job applications with one click.
- **CRUD Operations:** Add, edit, and delete job applications with status tracking.
- **Search & Filter:** Find specific companies or filter by application status easily.
- **Clear Filters Utility:** One-click clear for search and filter states.
- 🔒 Row Level Security — users only see their own data
- 📱 Fully responsive design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Deployment | Vercel |

## Getting Started

1. Clone the repo
```bash
git clone https://github.com/Ayush4307/job-tracker.git
cd job-tracker
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the dev server
```bash
npm run dev
```

## Database Schema

```sql
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status text default 'Applied',
  date_applied date not null,
  notes text,
  created_at timestamp default now()
);
```

## Security

Row Level Security is enabled — every user can only access their own data:

```sql
create policy "select_own" on applications
for select using (auth.uid() = user_id);
```

## Author

**Ayush Singh Pawar**
- GitHub: [@Ayush4307](https://github.com/Ayush4307)
- LinkedIn: [Ayush Singh Pawar](https://www.linkedin.com)
