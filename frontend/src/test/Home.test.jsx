import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../pages/Home";
import axios from "axios";
import { fetchBookDetails } from "../api/googleBooks";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");
jest.mock("../api/googleBooks");

beforeEach(() => {
  sessionStorage.setItem("userId", "mockUserId");
});

describe('Home render', () => {
    test("Home orriak objektu dana erakusten du pantailan.", async () => {
    const mockBooks = ["BookAdb"];
    const mockInfo = {
        title: "BookAdb",
        image: "http://example.com/book.jpg",
        authors: ["Author A"],
        publishedDate: "2025",
        description: "A book that ...",
        categories: ["Fiction"],
    };

    axios.post.mockResolvedValueOnce({
        data: { success: true, books: mockBooks },
    });

    fetchBookDetails.mockResolvedValueOnce(mockInfo);

    render(
        <MemoryRouter>
        <Home />
        </MemoryRouter>
    );

    expect(await screen.findByText("BookAdb")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", mockInfo.image);
    expect(screen.getByText("➕")).toBeInTheDocument();
    expect(screen.getByText("❌")).toBeInTheDocument();
    expect(screen.getByText("💚")).toBeInTheDocument();
    });
});

describe('Home botoiak klikatu', () => {
    test("klikatu botoia want to read", async () => {
    const books = ["BookOne", "BookTwo"];
    const bookInfo1 = {
        title: "BookOne",
        image: "http://example.com/book1.jpg",
        authors: ["Author A"],
        publishedDate: "2025",
        description: "A book that ...",
        categories: ["Fiction"],
    };

    const bookInfo2 = {
        title: "BookTwo",
        image: "http://example.com/book2.jpg",
        authors: ["Author B"],
        publishedDate: "2024",
        description: "A book taht...",
        categories: ["Drama"],
    };

    axios.post.mockResolvedValueOnce({ data: { success: true, books } });
    fetchBookDetails
        .mockResolvedValueOnce(bookInfo1) 
        .mockResolvedValueOnce(bookInfo2); 

    render(
        <MemoryRouter>
        <Home />
        </MemoryRouter>
    );

    expect(await screen.findByText("BookOne")).toBeInTheDocument();

    fireEvent.click(screen.getByText("💚"));

    await waitFor(() => {
        expect(screen.getByText("BookTwo")).toBeInTheDocument();
    });
    expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/user-books"),
        expect.objectContaining({
        userId: "mockUserId",
        bookData: expect.objectContaining({
            title: "BookOne",
            author: ["Author A"],
            publishedDate: "2025",
            description: "A book that ...",
            genre: ["Fiction"],
            image: "http://example.com/book1.jpg",
        }),
        status: "want_to_read",
        })
    );
    });
});

describe("Home modal info", () => {
  test("Klik egin eta dena odno renderizatu eta x klikatzean kentzea", async () => {
    const mockBooks = ["BookAdb"];
    const mockInfo = {
      title: "BookAdb",
      image: "http://example.com/book.jpg",
      authors: ["Author A"],
      publishedDate: "2025",
      description: "A book that ...",
      categories: ["Fiction"],
    };

    axios.post.mockResolvedValueOnce({
      data: { success: true, books: mockBooks },
    });

    fetchBookDetails.mockResolvedValueOnce(mockInfo);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(await screen.findByText("BookAdb")).toBeInTheDocument();

    fireEvent.click(screen.getByText("➕"));

    const authorParagraph = screen.getByText('Author:').closest('p');
    expect(authorParagraph).toHaveTextContent('Author: Author A');
    const yearParagraph = screen.getByText('Year of publication:').closest('p');
    expect(yearParagraph).toHaveTextContent('Year of publication: 2025');
    const genre = screen.getByText('Genre:').closest('p');
    expect(genre).toHaveTextContent('Genre: Fiction');
    const descriptionParagraph = screen.getByText('Description:').closest('p');
    expect(descriptionParagraph).toHaveTextContent("Description: A book that ...");

    fireEvent.click(screen.getByText("✖"));

    await waitFor(() => {
      expect(screen.queryByText("Author: Author A")).not.toBeInTheDocument();
    });
  });
});