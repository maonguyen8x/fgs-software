import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlogForm } from "@/components/admin/BlogForm";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Blog Post</h1>
      <BlogForm initial={post} />
    </div>
  );
}
