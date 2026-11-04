"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/db";

export type AddBookState = {
  message: string;
  status: "success" | "error" | null;
};

export async function addBook(
  _previousState: AddBookState,
  formData: FormData,
): Promise<AddBookState> {
  const titleValue = formData.get("title");
  const authorValue = formData.get("author");
  const yearValue = formData.get("year");
  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  const authorName =
    typeof authorValue === "string" ? authorValue.trim() : "";
  const yearText = typeof yearValue === "string" ? yearValue.trim() : "";

  if (!title) {
    return { status: "error", message: "Enter a book title." };
  }

  if (!authorName) {
    return { status: "error", message: "Enter an author." };
  }

  const year = Number(yearText);
  if (
    !/^\d+$/.test(yearText) ||
    !Number.isSafeInteger(year) ||
    year < 1 ||
    year > new Date().getFullYear()
  ) {
    return {
      status: "error",
      message: `Enter a valid year between 1 and ${new Date().getFullYear()}.`,
    };
  }

  try {
    await sql.begin(async (transaction) => {
      await transaction`
        SELECT pg_advisory_xact_lock(hashtextextended(lower(${authorName}), 0))
      `;

      const [existingAuthor] = await transaction<{ id: string }[]>`
        SELECT id::text AS id
        FROM authors
        WHERE lower(name) = lower(${authorName})
        LIMIT 1
      `;

      const [author] = existingAuthor
        ? [existingAuthor]
        : await transaction<{ id: string }[]>`
            INSERT INTO authors (name)
            VALUES (${authorName})
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id::text AS id
          `;

      await transaction`
        INSERT INTO books (title, year, author_id)
        VALUES (${title}, ${year}, ${author.id})
      `;
    });

    revalidatePath("/");
    return { status: "success", message: "Book added." };
  } catch (error) {
    console.error("Failed to add book.", error);
    return {
      status: "error",
      message: "The book could not be saved. Please try again.",
    };
  }
}
