import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Menu from "../components/Menu";
import { MemoryRouter } from "react-router-dom";

describe("Menu render", () => {
  beforeEach(() => {
    sessionStorage.setItem("userId", "mockUserId");
    delete window.location;
    window.location = { href: "", pathname: "/home" };
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test("Menu botoia agertzen da", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Menu />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });

  test("DropDown botoia ondo, eta home agertu homen ez badago erabiltzailea ", () => {
    render(
      <MemoryRouter initialEntries={["/findBook"]}>
        <Menu />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(button);

    expect(screen.getByText("🏠 Home")).toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.queryByText("🏠 Home")).not.toBeInTheDocument();
  });

  test("Es du erakusten dagoen tokia menuan", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Menu />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /menu/i }));
    expect(screen.queryByText("🏠 Home")).not.toBeInTheDocument();
  });

  test("Location aldatu klik egitean aukera batean", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Menu />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /menu/i }));

    const findBookButton = screen.getByText("🔍 Find Book");
    fireEvent.click(findBookButton);

    expect(window.location.href).toBe("/findBook");
  });

  test("LogOut egin, eta remove userId", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Menu />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /menu/i }));

    const logoutButton = screen.getByText("🚪 Sign out");
    fireEvent.click(logoutButton);

    expect(sessionStorage.getItem("userId")).toBeNull();
    expect(window.location.href).toBe("/");
  });
});
