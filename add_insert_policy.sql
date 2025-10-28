-- Allow anyone to insert posts (for content generation)
create policy "Anyone can insert posts" on public.posts
  for insert with check (true);

-- Allow anyone to insert comments (for AI bot comments)
create policy "Anyone can insert comments" on public.comments
  for insert with check (true);

