import { sql } from "@/db";

export type BookWithLoan = {
  id: string;
  title: string;
  year: number;
  authorName: string;
  memberName: string | null;
  dueOn: string | null;
};

export async function getBooks() {
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
    ORDER BY books.title
  `;
}
