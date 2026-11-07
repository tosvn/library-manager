import { getSql } from "@/db";

export type BookWithLoan = {
  id: string;
  title: string;
  year: number;
  authorName: string;
  memberName: string | null;
  dueOn: string | null;
};

export type LibraryMember = {
  id: string;
  name: string;
  phone: string | null;
};

export type TrashedBook = {
  id: string;
  title: string;
  year: number;
  authorName: string;
  deletedAt: string;
  expiresAt: string;
};

export async function getBooks() {
  const sql = getSql();
  return sql<BookWithLoan[]>`
    SELECT
      books.id::text AS id,
      books.title,
      books.year,
      authors.name AS "authorName",
      members.name AS "memberName",
      loans.due_on::text AS "dueOn"
    FROM books
    JOIN authors ON authors.id = books.author_id
    LEFT JOIN loans
      ON loans.book_id = books.id
      AND loans.returned_on IS NULL
    LEFT JOIN members ON members.id = loans.member_id
    WHERE books.deleted_at IS NULL
    ORDER BY books.title
  `;
}

export async function getMembers() {
  const sql = getSql();
  return sql<LibraryMember[]>`
    SELECT id::text AS id, name, phone
    FROM members
    ORDER BY name
  `;
}

export async function getTrashedBooks() {
  const sql = getSql();
  return sql<TrashedBook[]>`
    SELECT
      books.id::text AS id,
      books.title,
      books.year,
      authors.name AS "authorName",
      books.deleted_at::text AS "deletedAt",
      (books.deleted_at + INTERVAL '20 days')::text AS "expiresAt"
    FROM books
    JOIN authors ON authors.id = books.author_id
    WHERE books.deleted_at IS NOT NULL
      AND books.deleted_at > now() - INTERVAL '20 days'
    ORDER BY books.deleted_at DESC, books.title
  `;
}
