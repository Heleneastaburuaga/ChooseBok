import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LiburutegiaRead from "../pages/LiburutegiaRead";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");

beforeEach(() => {
  sessionStorage.setItem("userId", "mockUserId");
});

describe('LiburutegiaRead render', () => {
    test("LiburutegiRead orriak objektu dana erakusten du pantailan", async () => {
        const mockBooks = [
        { id: "1", title: "Libro A", image: "http://img.com/a.jpg" },
        { id: "2", title: "Libro B", image: "http://img.com/b.jpg" },
    ];

    axios.get.mockResolvedValueOnce({
        data: { success: true, books: mockBooks },
    });

    render(<MemoryRouter><LiburutegiaRead /></MemoryRouter>);

    expect(await screen.findByText("Libro A")).toBeInTheDocument();
    expect(screen.getByText("Libro B")).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/user-books/user/mockUserId/books/read_liked")
    );
    });
});

describe('Want to read botoia', () => {
    test("Want to read botoian klik egitean beste liburutegira mugitu", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, books: [] } });

    // Mock de window.location.href
    delete window.location;
    window.location = { href: "" };

    render(<MemoryRouter><LiburutegiaRead /></MemoryRouter>);

    const button = await screen.findByRole("button", { name: /want to read/i });
    fireEvent.click(button);

    expect(window.location.href).toBe("/liburutegiaLike");
    });
});

