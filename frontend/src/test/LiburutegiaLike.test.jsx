import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LiburutegiaLike from "../pages/LiburutegiaLike";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

beforeEach(() => {
  sessionStorage.setItem("userId", "mockUserId");
});
jest.mock("axios");

describe('LiburutegiaLike render', () => {
    test("LiburutegiLike orriak objektu dana erakusten du pantailan", async () => {
    const mockBooks = [
        { id: "1", title: "Book A", image: "http://img.com/a.jpg" },
        { id: "2", title: "Book B", image: "http://img.com/b.jpg" },
    ];

    axios.get.mockResolvedValueOnce({
        data: { success: true, books: mockBooks },
    });

    render(<MemoryRouter><LiburutegiaLike /></MemoryRouter>);

    expect(await screen.findByText("Book A")).toBeInTheDocument();
    expect(screen.getByText("Book B")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /read & like/i })).toBeInTheDocument();


    expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/user-books/user/mockUserId/books/want_to_read")
    );
    });
});


describe('LiburutegiaLike remove botoia', () => {
    test("Arrazoiak erakutsi liburuak kentzeko", async () => {
    const mockBooks = [{ id: "1", title: "Book A", image: "http://img.com/a.jpg" }];

    axios.get.mockResolvedValueOnce({
        data: { success: true, books: mockBooks },
    });

    render(<MemoryRouter><LiburutegiaLike /></MemoryRouter>);

    fireEvent.click(await screen.findByText("❌"));

    expect(screen.getByText("I'm not interested anymore.")).toBeInTheDocument();
    expect(screen.getByText("I read it and I liked it.")).toBeInTheDocument();
    expect(screen.getByText("I read it and I didn't like it.")).toBeInTheDocument();
    });

    test("Liburu bat liburutegitik kendu", async () => {
    const mockBooks = [{ id: "1", title: "Book A", image: "http://img.com/a.jpg" }];
    const updatedBooks = []; // lista después de eliminar

    axios.get.mockResolvedValueOnce({ data: { success: true, books: mockBooks } });
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({ data: { success: true, books: updatedBooks } });

    render(<MemoryRouter><LiburutegiaLike /></MemoryRouter>);

    fireEvent.click(await screen.findByText("❌"));
    fireEvent.click(screen.getByText("I'm not interested anymore."));

    await waitFor(() => {
        expect(screen.queryByText("Book A")).not.toBeInTheDocument();
    });

    expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/user-books/remove"),
        expect.objectContaining({
        userId: "mockUserId",
        bookId: "1",
        reason: "not_interested",
        })
    );
    });
});

describe('Like&read botoia', () => {
    test("Like & Read botoian klik egitean beste liburutegira mugitu", async () => {
    const mockBooks = [];
    axios.get.mockResolvedValueOnce({
        data: { success: true, books: mockBooks },
    });

    delete window.location;
    window.location = { href: "" };

    render(<MemoryRouter><LiburutegiaLike /></MemoryRouter>);

    const button = await screen.findByRole("button", { name: /read & like/i });

    fireEvent.click(button);

    expect(window.location.href).toBe("/liburutegiaRead");
    });
});
