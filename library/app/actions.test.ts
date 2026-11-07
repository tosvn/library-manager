import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queryHandler: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
  sql: Object.assign(vi.fn(), { begin: vi.fn() }),
}));

vi.mock("@/db", () => ({ getSql: () => mocks.sql }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import {
  addBook,
  deleteBook,
  lendBook,
  restoreBook,
  returnBook,
  type AddBookState,
  type LoanActionState,
  type TrashActionState,
} from "./actions";

const emptyAddBookState: AddBookState = { message: "", status: null };
const emptyLoanState: LoanActionState = { message: "", status: null };
const emptyTrashState: TrashActionState = { message: "", status: null };

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

function setQueryHandler(
  handler: (query: string, values: unknown[]) => unknown,
) {
  mocks.queryHandler.mockImplementation((query: string, values: unknown[]) =>
    handler(query.toLowerCase(), values),
  );
  mocks.sql.mockImplementation(
    (strings: TemplateStringsArray, ...values: unknown[]) =>
      mocks.queryHandler(strings.join(" "), values),
  );
  mocks.sql.begin.mockImplementation(
    (callback: (transaction: typeof mocks.sql) => unknown) => callback(mocks.sql),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  setQueryHandler(() => []);
});

describe("book actions", () => {
  it("reports all invalid add-book fields without touching the database", async () => {
    const state = await addBook(
      emptyAddBookState,
      formData({ title: " ", author: "", year: "3000" }),
    );

    expect(state.status).toBe("error");
    expect(state.fieldErrors).toMatchObject({
      title: "Enter a book title.",
      author: "Enter an author.",
    });
    expect(state.fieldErrors?.year).toMatch(/Enter a whole year/);
    expect(mocks.queryHandler).not.toHaveBeenCalled();
  });

  it("adds a valid book using the existing author", async () => {
    setQueryHandler((query) => {
      if (query.includes("from authors")) return [{ id: "7" }];
      return [];
    });

    const state = await addBook(
      emptyAddBookState,
      formData({ title: " The Hobbit ", author: " J.R.R. Tolkien ", year: "1937" }),
    );

    expect(state).toEqual({ status: "success", message: "Book added." });
    expect(mocks.queryHandler).toHaveBeenCalledTimes(3);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("adds a valid book and creates its author when needed", async () => {
    setQueryHandler((query) => {
      if (query.includes("from authors")) return [];
      if (query.includes("insert into authors")) return [{ id: "7" }];
      return [];
    });

    const state = await addBook(
      emptyAddBookState,
      formData({ title: "The Hobbit", author: "J.R.R. Tolkien", year: "1937" }),
    );

    expect(state).toEqual({ status: "success", message: "Book added." });
    expect(mocks.queryHandler).toHaveBeenCalledTimes(4);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("lends an available book to an existing member", async () => {
    setQueryHandler((query) => {
      if (query.includes("from books")) return [{ id: "1" }];
      if (query.includes("from members")) return [{ id: "2", name: "Alex Morgan" }];
      if (query.includes("select exists")) return [{ exists: false }];
      return [];
    });

    const state = await lendBook(
      emptyLoanState,
      formData({ bookId: "1", memberId: "2", dueOn: "2030-06-15" }),
    );

    expect(state).toEqual({
      status: "success",
      message: "Lent to Alex Morgan. Due date: June 15, 2030.",
    });
    expect(mocks.queryHandler).toHaveBeenCalledTimes(4);
    expect(
      mocks.queryHandler.mock.calls.some(
        ([query, values]) =>
          query.toLowerCase().includes("insert into loans") &&
          values.includes("2030-06-15"),
      ),
    ).toBe(true);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("requires a valid, non-past due date before lending", async () => {
    const missingDueDate = await lendBook(
      emptyLoanState,
      formData({ bookId: "1", memberId: "2" }),
    );
    const pastDueDate = await lendBook(
      emptyLoanState,
      formData({ bookId: "1", memberId: "2", dueOn: "2000-01-01" }),
    );

    expect(missingDueDate).toEqual({ status: "error", message: "Choose a valid due date." });
    expect(pastDueDate).toEqual({ status: "error", message: "Due date cannot be in the past." });
    expect(mocks.queryHandler).not.toHaveBeenCalled();
  });

  it("does not lend a book that already has an active loan", async () => {
    setQueryHandler((query) => {
      if (query.includes("from books")) return [{ id: "1" }];
      if (query.includes("from members")) return [{ id: "2" }];
      if (query.includes("select exists")) return [{ exists: true }];
      return [];
    });

    const state = await lendBook(
      emptyLoanState,
      formData({ bookId: "1", memberId: "2", dueOn: "2030-06-15" }),
    );

    expect(state).toEqual({ status: "error", message: "This book is already on loan." });
    expect(mocks.queryHandler).toHaveBeenCalledTimes(3);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("returns an active loan", async () => {
    setQueryHandler((query) => {
      if (query.includes("from books")) return [{ id: "1" }];
      if (query.includes("from loans")) return [{ id: "9" }];
      return [];
    });

    const state = await returnBook(emptyLoanState, formData({ bookId: "1" }));

    expect(state).toEqual({
      status: "success",
      message: "Book returned. It is now available.",
    });
    expect(mocks.queryHandler).toHaveBeenCalledTimes(3);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("blocks deleting a book that is on loan", async () => {
    setQueryHandler((query) => {
      if (query.includes("from books")) return [{ id: "1" }];
      if (query.includes("select exists")) return [{ exists: true }];
      return [];
    });

    const state = await deleteBook(emptyAddBookState, formData({ id: "1" }));

    expect(state).toEqual({
      status: "error",
      message: "This book is on loan. Record its return before deleting it.",
    });
    expect(mocks.queryHandler).toHaveBeenCalledTimes(2);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("moves an available book to Trash without redirecting away from the collection", async () => {
    setQueryHandler((query) => {
      if (query.includes("from books")) return [{ id: "1" }];
      if (query.includes("select exists")) return [{ exists: false }];
      return [];
    });

    const state = await deleteBook(emptyAddBookState, formData({ id: "1" }));

    expect(state).toEqual({ status: "success", message: "Book moved to Trash." });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/trash");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("restores a book from Trash and returns to the Trash page", async () => {
    setQueryHandler((query) => {
      if (query.includes("from books")) return [{ id: "1", expired: false }];
      return [];
    });
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`);
    });

    await expect(
      restoreBook(emptyTrashState, formData({ id: "1" })),
    ).rejects.toThrow("NEXT_REDIRECT:/trash?notice=book-restored");

    expect(mocks.queryHandler).toHaveBeenCalledTimes(2);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/trash");
    expect(mocks.redirect).toHaveBeenCalledWith("/trash?notice=book-restored");
  });
});
