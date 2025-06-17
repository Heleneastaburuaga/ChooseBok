import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Datuak from "../pages/Datuak";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");

beforeEach(() => {
  sessionStorage.setItem("userId", "mockUserId");
});

afterEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
});

describe('Bilatu render', () => {
  test("Datuak orriak objektu dana erakusten du pantailan.", async () => {
    const mockStats = {
      totalWantToRead: 3,
      totalRead: 5,
      totalReadLiked: 2,
      genresReadBreakdown: {
        Fantasy: 4,
        Romance: 3,
        Thriller: 2,
        SciFi: 1,
        Mystery: 1,
      },
      mostReadAuthor: "Taylor Jenkins Reid",
      totalSwipes: 50,
      likesCount: 10,
      swipeSuccessRate: 0.4,
    };

    axios.get.mockResolvedValueOnce({ data: mockStats });

    render(
      <MemoryRouter>
        <Datuak />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.queryByText(/Loading statistics.../i)).not.toBeInTheDocument()
    );

    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Reading Progress")).toBeInTheDocument();
    expect(screen.getByText("Most read genre")).toBeInTheDocument();
    expect(screen.getByText("Favorite Author")).toBeInTheDocument();
    expect(screen.getByText("Swipe Stats")).toBeInTheDocument();
    expect(screen.getByText("Taylor Jenkins Reid")).toBeInTheDocument();

    Object.keys(mockStats.genresReadBreakdown).forEach((genre) => {
      expect(screen.getByText(genre)).toBeInTheDocument();
    });

    expect(screen.getByText(mockStats.totalSwipes.toString())).toBeInTheDocument();
    expect(screen.getByText(mockStats.likesCount.toString())).toBeInTheDocument();
    expect(screen.getByText("40.0%")).toBeInTheDocument(); 
    expect(screen.getByText("5.0 swipes")).toBeInTheDocument();
  });

  test("Datuak orriak ez du estadistikak kargatu, erabiltzailea ez dagoelako logeatuta ", () => {
    sessionStorage.removeItem("userId");

    render(
      <MemoryRouter>
        <Datuak />
      </MemoryRouter>
    );

    expect(screen.getByText("You are not logged in.")).toBeInTheDocument();
  });
});
