import { ErrorPage } from "@/components/errors/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      title="Page not found"
      description="The page you are looking for does not exist or may have been moved."
      statusCode={404}
      statusLabel="Not Found"
      homeHref="/vi"
      variant="generic"
    />
  );
}
