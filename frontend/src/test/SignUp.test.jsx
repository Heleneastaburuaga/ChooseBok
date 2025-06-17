import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; 
import SignUp from '../pages/Signup';
import axios from 'axios';
import Signup from '../pages/Signup';

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('SignUp render', () => {
  test('SignUp orriak objektu dana erakusten du pantailan.', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Repeat password')).toBeInTheDocument();
    expect(screen.getByLabelText('Name and last name')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/you have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });
});

jest.mock('axios');

describe('Erregistratu botoia ', () => {
    jest.clearAllMocks();

  test('Username existitzen da, errore mezua', async () => {
  axios.post.mockResolvedValue({
    data: {
      success: false,
      message: 'This name is already registered',
    },
  });

  render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/repeat password/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/name and last name/i), {
      target: { value: 'User User' },
    });
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: '22' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/this name is already registered/i)).toBeInTheDocument();
    });

    expect(mockedUsedNavigate).not.toHaveBeenCalled();
  });

  test('Pasahitzak desberdinak', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: false,
        message: 'different passwords',
      },
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'user' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: '12345' },
      });
      fireEvent.change(screen.getByLabelText(/repeat password/i), {
        target: { value: '1234' },
      });
      fireEvent.change(screen.getByLabelText(/name and last name/i), {
        target: { value: 'User User' },
      });
      fireEvent.change(screen.getByLabelText(/age/i), {
        target: { value: '22' },
      });
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText(/different passwords/i)).toBeInTheDocument();
      });

      expect(mockedUsedNavigate).not.toHaveBeenCalled();
    
  });

  test('SignUp zuzena', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        userId: 1,
      },
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/repeat password/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/name and last name/i), {
      target: { value: 'User User' },
    });
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: '22' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/signuptwo?username=user');
    });
  });
});

describe('Login lika', () => {
    jest.clearAllMocks();
 
  test('Login orrira aldatzen da', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    const registerLink = screen.getByRole('link', { name: /login/i });
    expect(registerLink).toBeInTheDocument();

    fireEvent.click(registerLink);

    expect(registerLink).toHaveAttribute('href', '/');
  });
});