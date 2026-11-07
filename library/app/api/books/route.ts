import { connection } from "next/server";
import { getBooks } from "@/db/queries";

export async function GET() {
  await connection();

  try {
    const books = await getBooks();
    return Response.json(books);
  } catch (error) {
    console.error("Failed to fetch books for the API.", error);
    return Response.json(
      { error: "Books could not be loaded." },
      { status: 500 },
    );
  }
}