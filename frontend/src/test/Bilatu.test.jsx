import { render, screen,waitFor  } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Bilatu from "../pages/Bilatu";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

jest.mock("axios");

beforeEach(() => {
  sessionStorage.setItem("userId", "mockUserId");
});

describe('Bilatu render', () => {
    test("Bilatu orriak objektu dana erakusten du pantailan.", () => {
    render(
        <MemoryRouter>
        <Bilatu />
        </MemoryRouter>
    );

    expect(screen.getByText("Search Book")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search for Books")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    });

    test("liburu baten izenburua bilatu eta pantaila renderizatu", async () => {
    const mockBook = {
        id: "123",
        volumeInfo: {
        title: "Test Book",
        imageLinks: { thumbnail: "http://img.com/test.jpg" },
        },
    };

    axios.get.mockResolvedValueOnce({ data: { items: [mockBook] } });

    render(<MemoryRouter><Bilatu /></MemoryRouter>);

    await userEvent.type(screen.getByPlaceholderText("Search for Books"), "test");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Test Book")).toBeInTheDocument();
    expect(screen.getByAltText("Test Book")).toHaveAttribute("src", "http://img.com/test.jpg");
    });
});

describe('Bilatu render', () => {

    test("Klik bihotzean eta arrazoiak erakutsi", async () => {
        const mockBook = {
            id: "123",
            volumeInfo: {
            title: "Test Book",
            imageLinks: { thumbnail: "http://img.com/test.jpg" },
            },
        };

        axios.get.mockResolvedValueOnce({ data: { items: [mockBook] } });

        render(<MemoryRouter><Bilatu /></MemoryRouter>);

        await userEvent.type(screen.getByPlaceholderText("Search for Books"), "test");
        await userEvent.click(screen.getByRole("button", { name: "Search" }));

        const likeButton = await screen.findByText("💚");
        await userEvent.click(likeButton);

        expect(screen.getByText("Want to read")).toBeInTheDocument();
        expect(screen.getByText("Read & Like")).toBeInTheDocument();
        expect(screen.getByText("Read & dislike")).toBeInTheDocument();
    });


    test("Liburua gehitu eta gehitzean alert agertu", async () => {
        const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
        
        const mockBook = {
            id: "123",
            volumeInfo: {
            title: "Test Book",
            authors: ["Author A"],
            imageLinks: { thumbnail: "http://img.com/test.jpg" },
            publishedDate: "2020",
            },
        };

        axios.get
            .mockResolvedValueOnce({ data: { items: [mockBook] } }) 
            .mockResolvedValueOnce({ data: { exists: false } });   

        axios.post.mockResolvedValueOnce({ data: { success: true } }); 

        render(<MemoryRouter><Bilatu /></MemoryRouter>);

        await userEvent.type(screen.getByPlaceholderText("Search for Books"), "test");
        await userEvent.click(screen.getByRole("button", { name: "Search" }));

        await userEvent.click(await screen.findByText("💚"));
        await userEvent.click(screen.getByText("Want to read"));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
            expect(alertMock).toHaveBeenCalledWith("Booak Add'.");
        });

        alertMock.mockRestore();
    });

    test("Liburua ez da gehitzen eta alerta agertu", async () => {
        const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

        const mockBook = {
            id: "123",
            volumeInfo: {
            title: "Test Book",
            authors: ["Author A"],
            imageLinks: { thumbnail: "http://img.com/test.jpg" },
            publishedDate: "2020",
            },
        };

        axios.get
            .mockResolvedValueOnce({ data: { items: [mockBook] } }) 
            .mockResolvedValueOnce({ data: { exists: true, status: "read_liked" } }); 

        render(<MemoryRouter><Bilatu /></MemoryRouter>);

        await userEvent.type(screen.getByPlaceholderText("Search for Books"), "test");
        await userEvent.click(screen.getByRole("button", { name: "Search" }));

        await userEvent.click(await screen.findByText("💚"));
        await userEvent.click(screen.getByText("Want to read"));

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
            "This book is already marked as read, it cannot be set to 'Want to read'."
            );
        });

        alertMock.mockRestore();
    });
});

afterEach(() => {
  jest.clearAllMocks();
});