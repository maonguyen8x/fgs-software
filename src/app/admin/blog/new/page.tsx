import { BlogForm } from "@/components/admin/BlogForm";

export default function NewBlogPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">New Blog Post</h1>
      <BlogForm />
    </div>
  );
}
