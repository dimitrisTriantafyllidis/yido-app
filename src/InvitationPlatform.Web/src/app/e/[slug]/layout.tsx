import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE}/api/v1/invitations/by-slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return { title: "Πρόσκληση | YIDO" };
    }

    const data = await res.json();
    const title = data?.event?.title ?? "Πρόσκληση";
    const description =
      data?.event?.description ??
      `Ψηφιακή πρόσκληση: ${title}`;
    const image = data?.event?.coverImageUrl ?? data?.media?.[0]?.url;

    return {
      title: `${title} | YIDO`,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        ...(image ? { images: [{ url: image }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return { title: "Πρόσκληση | YIDO" };
  }
}

export default function InvitationSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
