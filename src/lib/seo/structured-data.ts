import { SITE } from "@/constants/site";
import type { PublicReviewItem } from "@/components/review/review-list";
import type { TeacherPublicProfile } from "@/lib/teacher/profile";

/** Organization スキーマ */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    logo: `${SITE.url}/favicon.ico`,
  };
}

/** WebSite スキーマ（サイト内検索付き） */
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "ja",
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/teachers?keyword={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** パンくずリスト スキーマ */
export function buildBreadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };
}

/** 先生プロフィール Person スキーマ */
export function buildPersonJsonLd(teacher: TeacherPublicProfile) {
  const categories = teacher.categories.map((c) => c.category.name).join("、");
  const description =
    teacher.catchphrase ||
    teacher.bio?.slice(0, 160) ||
    `${teacher.displayName}先生のプロフィール`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: teacher.displayName,
    url: `${SITE.url}/teachers/${teacher.slug}`,
    description,
    jobTitle: categories ? `${categories}の先生` : "先生",
  };

  if (teacher.profileImageUrl) {
    schema.image = teacher.profileImageUrl;
  }

  if (teacher.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: teacher.ratingAverage,
      reviewCount: teacher.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/** 個別 Review スキーマ（承認済みレビュー） */
export function buildReviewJsonLd(
  teacher: TeacherPublicProfile,
  reviews: PublicReviewItem[],
) {
  return reviews.slice(0, 5).map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Person",
      name: teacher.displayName,
      url: `${SITE.url}/teachers/${teacher.slug}`,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    name: review.title,
    reviewBody: review.comment,
    datePublished: review.createdAt.toISOString(),
    author: {
      "@type": "Person",
      name: review.student.studentProfile?.displayName ?? "生徒",
    },
  }));
}
