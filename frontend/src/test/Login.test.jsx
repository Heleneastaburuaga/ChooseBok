import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; 
import Login from '../pages/Login';
import axios from 'axios';

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('Login render', () => {
  test('Login orriak objektu dana erakusten du pantailan.', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don’t you have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });
});

jest.mock('axios');


describe('Login botoia', () => {
    jest.clearAllMocks();

  test('Erabiltzailea existitzen da', async () => {
  axios.post.mockResolvedValue({
    data: {
      success: true,
      userId: '1',
    },
  });

  jest.spyOn(window.sessionStorage.__proto__, 'setItem');

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText('username'), {
    target: { value: 'user' },
  });
  fireEvent.change(screen.getByPlaceholderText('password'), {
    target: { value: '12345' },
  });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(sessionStorage.setItem).toHaveBeenCalledWith('userId', '1');
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/home');
  });
});

  test('Error erabiltzailea ez da existitzen', async () => {
  axios.post.mockResolvedValue({
    data: {
      success: false,
      message: "The user does not exist",
    },
  });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText('username'), {
    target: { value: 'userNotExist' },
  });
  fireEvent.change(screen.getByPlaceholderText('password'), {
    target: { value: '12345' },
  });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(screen.getByText(/The user does not exist/i)).toBeInTheDocument();
  });
  });

 test('Error pasahitza ez da zuzena', async () => {
  axios.post.mockResolvedValue({
    data: {
      success: false,
      message: "The password is incorrect",
    },
  });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'PasswordIncorrect' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/The password is incorrect/i)).toBeInTheDocument();
    });
  });
});

describe('SignUp linka', () => {
    jest.clearAllMocks();

  test('SignUp orrira aldatzen da', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();

    fireEvent.click(registerLink);

    expect(registerLink).toHaveAttribute('href', '/signup');
  });
});