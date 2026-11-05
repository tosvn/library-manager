"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/db";

export type AddBookState = {
  message: string;
  status: "success" | "error" | null;
};

export type AddMemberState = {
  message: string;
  status: "success" | "error" | null;
};

export type LoanActionState = {
  message: string;
  status: "success" | "error" | null;
};

export type TrashActionState = {
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

export async function addMember(
  _previousState: AddMemberState,
  formData: FormData,
): Promise<AddMemberState> {
  const nameValue = formData.get("name");
  const phoneValue = formData.get("phone");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const phone = typeof phoneValue === "string" ? phoneValue.trim() : "";

  if (!name) {
    return { status: "error", message: "Enter a member name." };
  }

  try {
    await sql`
      INSERT INTO members (name, phone)
      VALUES (${name}, ${phone || null})
    `;

    revalidatePath("/members");
    return { status: "success", message: "Member added." };
  } catch (error) {
    console.error("Failed to add member.", error);
    return {
      status: "error",
      message: "The member could not be saved. Please try again.",
    };
  }
}

export async function lendBook(
  _previousState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const bookIdValue = formData.get("bookId");
  const memberIdValue = formData.get("memberId");
  const bookId = typeof bookIdValue === "string" ? bookIdValue.trim() : "";
  const memberId =
    typeof memberIdValue === "string" ? memberIdValue.trim() : "";

  if (!/^\d+$/.test(bookId) || !/^\d+$/.test(memberId)) {
    return { status: "error", message: "Choose a valid book and member." };
  }

  let result: "lent" | "missing-book" | "missing-member" | "already-loaned";
  try {
    result = await sql.begin(async (transaction) => {
      const [book] = await transaction<{ id: string }[]>`
        SELECT id::text AS id
        FROM books
        WHERE id::text = ${bookId}
          AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!book) {
        return "missing-book";
      }

      const [member] = await transaction<{ id: string }[]>`
        SELECT id::text AS id
        FROM members
        WHERE id::text = ${memberId}
      `;
      if (!member) {
        return "missing-member";
      }

      const [activeLoan] = await transaction<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT 1
          FROM loans
          WHERE book_id = ${book.id}
            AND returned_on IS NULL
        ) AS exists
      `;
      if (activeLoan.exists) {
        return "already-loaned";
      }

      await transaction`
        INSERT INTO loans (book_id, member_id, borrowed_on, due_on)
        VALUES (${book.id}, ${member.id}, CURRENT_DATE, CURRENT_DATE + 14)
      `;
      return "lent";
    });
  } catch (error) {
    console.error("Failed to lend book.", error);
    return {
      status: "error",
      message: "The book could not be lent. Please try again.",
    };
  }

  if (result === "missing-book") {
    return { status: "error", message: "This book could not be found." };
  }
  if (result === "missing-member") {
    return { status: "error", message: "This member could not be found." };
  }
  if (result === "already-loaned") {
    return { status: "error", message: "This book is already on loan." };
  }

  revalidatePath("/");
  return { status: "success", message: "Book lent." };
}

export async function returnBook(
  _previousState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const bookIdValue = formData.get("bookId");
  const bookId = typeof bookIdValue === "string" ? bookIdValue.trim() : "";

  if (!/^\d+$/.test(bookId)) {
    return { status: "error", message: "This book could not be found." };
  }

  let result: "returned" | "missing-book" | "not-on-loan";
  try {
    result = await sql.begin(async (transaction) => {
      const [book] = await transaction<{ id: string }[]>`
        SELECT id::text AS id
        FROM books
        WHERE id::text = ${bookId}
          AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!book) {
        return "missing-book";
      }

      const [activeLoan] = await transaction<{ id: string }[]>`
        SELECT id::text AS id
        FROM loans
        WHERE book_id = ${book.id}
          AND returned_on IS NULL
        FOR UPDATE
      `;
      if (!activeLoan) {
        return "not-on-loan";
      }

      await transaction`
        UPDATE loans
        SET returned_on = CURRENT_DATE
        WHERE id::text = ${activeLoan.id}
      `;
      return "returned";
    });
  } catch (error) {
    console.error("Failed to return book.", error);
    return {
      status: "error",
      message: "The book could not be returned. Please try again.",
    };
  }

  if (result === "missing-book") {
    return { status: "error", message: "This book could not be found." };
  }
  if (result === "not-on-loan") {
    return { status: "error", message: "This book is not currently on loan." };
  }

  revalidatePath("/");
  return { status: "success", message: "Book returned. It is now available." };
}

export async function updateBook(
  _previousState: AddBookState,
  formData: FormData,
): Promise<AddBookState> {
  const idValue = formData.get("id");
  const titleValue = formData.get("title");
  const authorValue = formData.get("author");
  const yearValue = formData.get("year");
  const id = typeof idValue === "string" ? idValue.trim() : "";
  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  const authorName =
    typeof authorValue === "string" ? authorValue.trim() : "";
  const yearText = typeof yearValue === "string" ? yearValue.trim() : "";
  const year = Number(yearText);

  if (!/^\d+$/.test(id) || !title || !authorName) {
    return {
      status: "error",
      message: !title
        ? "Enter a book title."
        : !authorName
          ? "Enter an author."
          : "This book could not be found.",
    };
  }

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

  let updated: boolean;
  try {
    updated = await sql.begin(async (transaction) => {
      const [book] = await transaction<{ id: string }[]>`
        SELECT id::text AS id
        FROM books
        WHERE id::text = ${id}
          AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!book) {
        return false;
      }

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
        UPDATE books
        SET title = ${title}, year = ${year}, author_id = ${author.id}
        WHERE id::text = ${id}
      `;
      return true;
    });
  } catch (error) {
    console.error("Failed to update book.", error);
    return {
      status: "error",
      message: "The book could not be updated. Please try again.",
    };
  }

  if (!updated) {
    return { status: "error", message: "This book could not be found." };
  }

  revalidatePath("/");
  return { status: "success", message: "Book updated." };
}

export async function deleteBook(
  _previousState: AddBookState,
  formData: FormData,
): Promise<AddBookState> {
  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue.trim() : "";
  if (!/^\d+$/.test(id)) {
    return { status: "error", message: "This book could not be found." };
  }

  let result: "trashed" | "missing" | "on-loan";
  try {
    result = await sql.begin(async (transaction) => {
      const [book] = await transaction<{ id: string }[]>`
        SELECT id::text AS id
        FROM books
        WHERE id::text = ${id}
          AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!book) {
        return "missing";
      }

      const [activeLoan] = await transaction<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT 1
          FROM loans
          WHERE book_id = ${book.id}
            AND returned_on IS NULL
        ) AS exists
      `;
      if (activeLoan.exists) {
        return "on-loan";
      }

      await transaction`
        UPDATE books
        SET deleted_at = now()
        WHERE id::text = ${id}
      `;
      return "trashed";
    });

  } catch (error) {
    console.error("Failed to delete book.", error);
    return {
      status: "error",
      message: "The book could not be deleted. Please try again.",
    };
  }

  if (result === "on-loan") {
    return {
      status: "error",
      message: "This book is on loan. Record its return before deleting it.",
    };
  }
  if (result === "missing") {
    return { status: "error", message: "This book could not be found." };
  }

  revalidatePath("/");
  revalidatePath("/trash");
  redirect("/trash?notice=book-moved");
}

export async function restoreBook(
  _previousState: TrashActionState,
  formData: FormData,
): Promise<TrashActionState> {
  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue.trim() : "";
  if (!/^\d+$/.test(id)) {
    return { status: "error", message: "This book could not be found." };
  }

  let result: "restored" | "expired" | "missing";
  try {
    result = await sql.begin(async (transaction) => {
      const [book] = await transaction<{ id: string; expired: boolean }[]>`
        SELECT
          id::text AS id,
          deleted_at + INTERVAL '20 days' <= now() AS expired
        FROM books
        WHERE id::text = ${id}
          AND deleted_at IS NOT NULL
        FOR UPDATE
      `;
      if (!book) {
        return "missing";
      }

      if (book.expired) {
        await transaction`DELETE FROM books WHERE id::text = ${id}`;
        return "expired";
      }

      await transaction`
        UPDATE books
        SET deleted_at = NULL
        WHERE id::text = ${id}
      `;
      return "restored";
    });
  } catch (error) {
    console.error("Failed to restore book.", error);
    return {
      status: "error",
      message: "The book could not be restored. Please try again.",
    };
  }

  if (result === "missing") {
    return { status: "error", message: "This book could not be found in Trash." };
  }
  if (result === "expired") {
    revalidatePath("/trash");
    return {
      status: "error",
      message: "The 20-day retention period has expired; this book was permanently deleted.",
    };
  }

  revalidatePath("/");
  revalidatePath("/trash");
  redirect("/trash?notice=book-restored");
}

export async function emptyTrash() {
  try {
    await sql`DELETE FROM books WHERE deleted_at IS NOT NULL`;
  } catch (error) {
    console.error("Failed to empty Trash.", error);
    redirect("/trash?notice=empty-failed");
  }

  revalidatePath("/");
  revalidatePath("/trash");
  redirect("/trash?notice=trash-emptied");
}
